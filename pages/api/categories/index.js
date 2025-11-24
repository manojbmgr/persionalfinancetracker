const getPool = require('../../../lib/db');
const { authenticateRequest } = require('../../../lib/middleware');

export default async function handler(req, res) {
  const auth = authenticateRequest(req);
  if (auth.error) {
    return res.status(auth.status).json({ error: auth.error });
  }

  const pool = getPool();

  if (req.method === 'GET') {
    try {
      // Get all categories for this user (all categories belong to the user)
      const [categories] = await pool.execute(
        'SELECT * FROM categories WHERE user_id = ? ORDER BY name ASC',
        [auth.user.userId]
      );

      res.json({ categories });
    } catch (error) {
      console.error('Get categories error:', error);
      res.status(500).json({ error: 'Server error fetching categories' });
    }
  } else if (req.method === 'POST') {
    try {
      const { name } = req.body;

      if (!name || name.trim() === '') {
        return res.status(400).json({ error: 'Category name is required' });
      }

      const categoryName = name.trim();

      // Check if category already exists for this user or as default
      const [existing] = await pool.execute(
        'SELECT id FROM categories WHERE name = ? AND (user_id = ? OR user_id IS NULL)',
        [categoryName, auth.user.userId]
      );

      if (existing.length > 0) {
        return res.status(400).json({ error: 'Category already exists' });
      }

      // Create new custom category for this user
      const [result] = await pool.execute(
        'INSERT INTO categories (user_id, name) VALUES (?, ?)',
        [auth.user.userId, categoryName]
      );

      const [newCategory] = await pool.execute(
        'SELECT * FROM categories WHERE id = ?',
        [result.insertId]
      );

      res.status(201).json({
        message: 'Category created successfully',
        category: newCategory[0]
      });
    } catch (error) {
      console.error('Create category error:', error);
      res.status(500).json({ error: 'Server error creating category' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}

