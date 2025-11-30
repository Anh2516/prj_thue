const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const { auth } = require('../middleware/auth');

// Register
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Please provide all fields' });
    }

    // Check if user exists
    const [existingUser] = await db.query(
      'SELECT * FROM users WHERE email = ? OR username = ?',
      [email, username]
    );

    if (existingUser.length > 0) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Generate unique customer code
    const crypto = require('crypto');
    let customerCode;
    let codeExists = true;
    
    while (codeExists) {
      customerCode = crypto.randomBytes(4).toString('hex').toUpperCase();
      const [existing] = await db.query('SELECT id FROM users WHERE customer_code = ?', [customerCode]);
      codeExists = existing.length > 0;
    }

    // Create user
    const [result] = await db.query(
      'INSERT INTO users (username, email, password, role, customer_code) VALUES (?, ?, ?, ?, ?)',
      [username, email, hashedPassword, 'user', customerCode]
    );

    const token = jwt.sign(
      { id: result.insertId, username, email, role: 'user' },
      process.env.JWT_SECRET || 'your_secret_key_here',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      token,
      user: {
        id: result.insertId,
        username,
        email,
        role: 'user',
        balance: 0,
        customer_code: customerCode
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    // Find user
    const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);

    if (users.length === 0) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const user = users[0];

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'your_secret_key_here',
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        balance: user.balance || 0,
        customer_code: user.customer_code
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Verify token and get user info
router.get('/me', auth, async (req, res) => {
  try {
    // Get user from database to ensure we have latest info
    const [users] = await db.query('SELECT id, username, email, role, balance, customer_code FROM users WHERE id = ?', [req.user.id]);
    
    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const user = users[0];
    res.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        balance: user.balance || 0,
        customer_code: user.customer_code
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

