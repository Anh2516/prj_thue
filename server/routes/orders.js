const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { auth, adminAuth } = require('../middleware/auth');

// Get user orders
router.get('/my-orders', auth, async (req, res) => {
  try {
    const [orders] = await db.query(
      'SELECT o.*, p.game_name, p.account_level, p.account_info FROM orders o JOIN products p ON o.product_id = p.id WHERE o.user_id = ? ORDER BY o.created_at DESC',
      [req.user.id]
    );
    
    // Only include account_info if order is completed
    const ordersWithAccountInfo = orders.map(order => {
      if (order.status !== 'completed') {
        // Remove account_info for non-completed orders
        order.account_info = null;
      } else {
        // Ensure account_info is included for completed orders
        // If account_info is null or empty, keep it as is
      }
      return order;
    });
    
    res.json(ordersWithAccountInfo);
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create order
router.post('/', auth, async (req, res) => {
  try {
    const { product_id, payment_method } = req.body;

    if (!product_id) {
      return res.status(400).json({ message: 'Please provide product ID' });
    }

    // Get product
    const [products] = await db.query('SELECT * FROM products WHERE id = ?', [product_id]);
    
    if (products.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const product = products[0];

    if (product.status !== 'available') {
      return res.status(400).json({ message: 'Product is not available' });
    }

    // Check payment method
    const paymentMethod = payment_method || 'wallet';
    let orderStatus = 'pending';

    // If payment method is wallet, check balance and deduct
    if (paymentMethod === 'wallet') {
      const [users] = await db.query('SELECT balance FROM users WHERE id = ?', [req.user.id]);
      
      if (users.length === 0) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      const userBalance = parseFloat(users[0].balance) || 0;
      const productPrice = parseFloat(product.price);
      
      if (userBalance < productPrice) {
        return res.status(400).json({ 
          message: `Số dư không đủ. Số dư hiện tại: ${userBalance.toLocaleString('vi-VN')} ₫, cần: ${productPrice.toLocaleString('vi-VN')} ₫` 
        });
      }
      
      // Deduct balance
      const newBalance = userBalance - productPrice;
      await db.query('UPDATE users SET balance = ? WHERE id = ?', [newBalance, req.user.id]);
      
      // Set order status to completed if paid with wallet
      orderStatus = 'completed';
    }

    // Create order
    const [result] = await db.query(
      'INSERT INTO orders (user_id, product_id, total_price, payment_method, status) VALUES (?, ?, ?, ?, ?)',
      [req.user.id, product_id, product.price, paymentMethod, orderStatus]
    );

    // Update product status
    await db.query('UPDATE products SET status = ? WHERE id = ?', ['sold', product_id]);

    const [newOrder] = await db.query(
      'SELECT o.*, p.game_name, p.account_level FROM orders o JOIN products p ON o.product_id = p.id WHERE o.id = ?',
      [result.insertId]
    );

    res.status(201).json(newOrder[0]);
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all orders (Admin only)
router.get('/all', adminAuth, async (req, res) => {
  try {
    const [orders] = await db.query(
      'SELECT o.*, p.game_name, p.account_level, u.username, u.email FROM orders o JOIN products p ON o.product_id = p.id JOIN users u ON o.user_id = u.id ORDER BY o.created_at DESC'
    );
    res.json(orders);
  } catch (error) {
    console.error('Get all orders error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update order status (Admin only)
router.put('/:id/status', adminAuth, async (req, res) => {
  try {
    const { status } = req.body;

    await db.query('UPDATE orders SET status = ? WHERE id = ?', [status, req.params.id]);

    const [updatedOrder] = await db.query(
      'SELECT o.*, p.game_name, p.account_level, u.username, u.email FROM orders o JOIN products p ON o.product_id = p.id JOIN users u ON o.user_id = u.id WHERE o.id = ?',
      [req.params.id]
    );

    res.json(updatedOrder[0]);
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

