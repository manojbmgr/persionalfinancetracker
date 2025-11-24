const bcrypt = require('bcryptjs');
const getPool = require('../../../lib/db');
const { signToken } = require('../../../lib/auth');

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { name, email, password, currency } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const pool = getPool();

    // Check if user already exists
    const [existingUsers] = await pool.execute(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user
    const [result] = await pool.execute(
      'INSERT INTO users (name, email, password, currency) VALUES (?, ?, ?, ?)',
      [name, email, hashedPassword, currency || '₹']
    );

    const userId = result.insertId;

    // Create default categories for the new user
    const defaultCategories = [
      'Food',
      'Transportation',
      'Housing',
      'Utilities',
      'Entertainment',
      'Healthcare',
      'Education',
      'Shopping',
      'Other',
      'Salary',
      'Freelance',
      'Investments'
    ];

    // Insert default categories for this user
    for (const categoryName of defaultCategories) {
      try {
        await pool.execute(
          'INSERT INTO categories (user_id, name) VALUES (?, ?)',
          [userId, categoryName]
        );
      } catch (insertError) {
        // Category might already exist (shouldn't happen for new user, but handle gracefully)
        console.error(`Error creating default category ${categoryName}:`, insertError);
      }
    }

    // Generate token
    const token = signToken({ userId, email });

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: result.insertId,
        name,
        email,
        currency: currency || '₹'
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Server error during registration' });
  }
}

