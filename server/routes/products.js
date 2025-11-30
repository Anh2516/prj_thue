const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { auth, adminAuth } = require('../middleware/auth');

// Get all products (only available for non-admin, all for admin)
router.get('/', async (req, res) => {
  try {
    // Check if user is admin
    const token = req.header('Authorization')?.replace('Bearer ', '');
    let isAdmin = false;
    
    if (token) {
      try {
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_secret_key_here');
        isAdmin = decoded.role === 'admin';
      } catch (e) {
        // Token invalid or no token
      }
    }
    
    // Admin can see all products, regular users only see available
    let query = 'SELECT * FROM products';
    let params = [];
    
    if (!isAdmin) {
      query += ' WHERE status = ?';
      params.push('available');
    }
    
    query += ' ORDER BY created_at DESC';
    
    const [products] = await db.query(query, params);
    
    const productsWithImages = products.map(product => {
      if (product.images) {
        try {
          product.images = JSON.parse(product.images);
        } catch (e) {
          product.images = [];
        }
      } else {
        product.images = [];
      }
      // Ensure featured_image is included (can be null)
      if (!product.hasOwnProperty('featured_image')) {
        product.featured_image = null;
      }
      // Remove account_info if not admin
      if (!isAdmin) {
        delete product.account_info;
      }
      return product;
    });
    res.json(productsWithImages);
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single product
router.get('/:id', async (req, res) => {
  try {
    const [products] = await db.query('SELECT * FROM products WHERE id = ?', [req.params.id]);
    
    if (products.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    const product = products[0];
    // Parse images JSON if exists
    if (product.images) {
      try {
        product.images = JSON.parse(product.images);
      } catch (e) {
        product.images = [];
      }
    } else {
      product.images = [];
    }
    
    // Ensure featured_image is included (can be null)
    if (!product.hasOwnProperty('featured_image')) {
      product.featured_image = null;
    }
    
    // Remove account_info if user is not admin
    // Check if user is admin from token (if provided)
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (token) {
      try {
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_secret_key_here');
        if (decoded.role !== 'admin') {
          delete product.account_info;
        }
      } catch (e) {
        // If token invalid or no token, remove account_info
        delete product.account_info;
      }
    } else {
      // No token, remove account_info
      delete product.account_info;
    }
    
    res.json(product);
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create product (Admin only)
router.post('/', adminAuth, async (req, res) => {
  try {
    console.log('Create product request:', req.body);
    console.log('User:', req.user);
    const { game_name, account_level, price, description, account_info, featured_image, images } = req.body;

    // Validation
    if (!game_name || game_name.trim() === '') {
      return res.status(400).json({ message: 'Vui lòng nhập tên game' });
    }

    if (!price) {
      return res.status(400).json({ message: 'Vui lòng nhập giá' });
    }

    // Convert price to number
    const priceNum = typeof price === 'string' ? parseFloat(price) : Number(price);
    if (isNaN(priceNum) || priceNum <= 0) {
      return res.status(400).json({ message: 'Giá phải là số dương hợp lệ' });
    }

    // Parse images array to JSON string
    let imagesJson = null;
    if (images && Array.isArray(images) && images.length > 0) {
      const filteredImages = images.filter(img => img && typeof img === 'string' && img.trim() !== '');
      if (filteredImages.length > 0) {
        imagesJson = JSON.stringify(filteredImages);
      }
    }

    // Prepare values
    const gameNameValue = game_name.trim();
    const accountLevelValue = account_level ? account_level.trim() : '';
    const descriptionValue = description ? description.trim() : '';
    const accountInfoValue = account_info ? account_info.trim() : '';
    const featuredImageValue = featured_image && featured_image.trim() ? featured_image.trim() : null;

    const [result] = await db.query(
      'INSERT INTO products (game_name, account_level, price, description, account_info, featured_image, images, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [gameNameValue, accountLevelValue, priceNum, descriptionValue, accountInfoValue, featuredImageValue, imagesJson, 'available']
    );

    const [newProducts] = await db.query('SELECT * FROM products WHERE id = ?', [result.insertId]);
    
    if (newProducts.length === 0) {
      return res.status(500).json({ message: 'Không thể tạo sản phẩm' });
    }

    const newProduct = newProducts[0];
    
    // Parse images JSON if exists
    if (newProduct.images) {
      try {
        newProduct.images = JSON.parse(newProduct.images);
      } catch (e) {
        newProduct.images = [];
      }
    } else {
      newProduct.images = [];
    }
    
    res.status(201).json(newProduct);
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
});

// Update product (Admin only)
router.put('/:id', adminAuth, async (req, res) => {
  try {
    console.log('Update product request:', req.params.id, req.body);
    console.log('User:', req.user);
    const { game_name, account_level, price, description, account_info, featured_image, status, images } = req.body;

    // Validation
    if (!game_name || !price) {
      return res.status(400).json({ message: 'Please provide game name and price' });
    }

    // Convert price to number if it's a string
    const priceNum = typeof price === 'string' ? parseFloat(price) : price;
    if (isNaN(priceNum) || priceNum <= 0) {
      return res.status(400).json({ message: 'Price must be a valid positive number' });
    }

    // Parse images array to JSON string
    let imagesJson = null;
    if (images && Array.isArray(images) && images.length > 0) {
      const filteredImages = images.filter(img => img && typeof img === 'string' && img.trim() !== '');
      if (filteredImages.length > 0) {
        imagesJson = JSON.stringify(filteredImages);
      }
    }

    // Prepare values safely
    const gameNameValue = game_name ? game_name.trim() : '';
    const accountLevelValue = account_level ? account_level.trim() : '';
    const descriptionValue = description ? description.trim() : '';
    const accountInfoValue = account_info ? account_info.trim() : '';
    const featuredImageValue = featured_image && featured_image.trim() ? featured_image.trim() : null;
    const statusValue = status || 'available';

    // Update product
    await db.query(
      'UPDATE products SET game_name = ?, account_level = ?, price = ?, description = ?, account_info = ?, featured_image = ?, images = ?, status = ? WHERE id = ?',
      [
        gameNameValue, 
        accountLevelValue, 
        priceNum, 
        descriptionValue, 
        accountInfoValue, 
        featuredImageValue,
        imagesJson, 
        statusValue, 
        req.params.id
      ]
    );

    // Get updated product
    const [updatedProducts] = await db.query('SELECT * FROM products WHERE id = ?', [req.params.id]);
    
    if (updatedProducts.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const updatedProduct = updatedProducts[0];
    
    // Parse images JSON if exists
    if (updatedProduct.images) {
      try {
        updatedProduct.images = JSON.parse(updatedProduct.images);
      } catch (e) {
        updatedProduct.images = [];
      }
    } else {
      updatedProduct.images = [];
    }
    
    res.json(updatedProduct);
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
});

// Delete product (Admin only)
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    await db.query('DELETE FROM products WHERE id = ?', [req.params.id]);
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

