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
      const { startDate, endDate, type, category } = req.query;
      let query = 'SELECT * FROM transactions WHERE user_id = ?';
      const params = [auth.user.userId];

      if (startDate) {
        query += ' AND date >= ?';
        params.push(startDate);
      }
      if (endDate) {
        query += ' AND date <= ?';
        params.push(endDate);
      }
      if (type) {
        query += ' AND type = ?';
        params.push(type);
      }
      if (category) {
        query += ' AND category = ?';
        params.push(category);
      }

      query += ' ORDER BY date DESC, created_at DESC';

      const [transactions] = await pool.execute(query, params);
      res.json({ transactions });
    } catch (error) {
      console.error('Get transactions error:', error);
      res.status(500).json({ error: 'Server error fetching transactions' });
    }
  } else if (req.method === 'POST') {
    try {
      const { type, amount, category, date, note } = req.body;

      // Validation
      if (!type || !amount || !category || !date) {
        return res.status(400).json({ error: 'Type, amount, category, and date are required' });
      }

      if (type !== 'income' && type !== 'expense') {
        return res.status(400).json({ error: 'Type must be either income or expense' });
      }

      if (isNaN(amount) || amount <= 0) {
        return res.status(400).json({ error: 'Amount must be a positive number' });
      }

      const [result] = await pool.execute(
        'INSERT INTO transactions (user_id, type, amount, category, date, note) VALUES (?, ?, ?, ?, ?, ?)',
        [auth.user.userId, type, amount, category, date, note || null]
      );

      const [newTransaction] = await pool.execute(
        'SELECT * FROM transactions WHERE id = ?',
        [result.insertId]
      );

      res.status(201).json({
        message: 'Transaction created successfully',
        transaction: newTransaction[0]
      });
    } catch (error) {
      console.error('Create transaction error:', error);
      res.status(500).json({ error: 'Server error creating transaction' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}

