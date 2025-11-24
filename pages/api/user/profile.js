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
      const [users] = await pool.execute(
        'SELECT id, name, email, currency FROM users WHERE id = ?',
        [auth.user.userId]
      );

      if (users.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json({ user: users[0] });
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({ error: 'Server error fetching profile' });
    }
  } else if (req.method === 'PUT') {
    try {
      const { name, email, currency } = req.body;

      // Check if email is being changed and if it's already taken
      if (email) {
        const [existing] = await pool.execute(
          'SELECT id FROM users WHERE email = ? AND id != ?',
          [email, auth.user.userId]
        );

        if (existing.length > 0) {
          return res.status(400).json({ error: 'Email already in use' });
        }
      }

      // Build update query dynamically
      const updates = [];
      const values = [];

      if (name) {
        updates.push('name = ?');
        values.push(name);
      }
      if (email) {
        updates.push('email = ?');
        values.push(email);
      }
      if (currency) {
        updates.push('currency = ?');
        values.push(currency);
      }

      if (updates.length === 0) {
        return res.status(400).json({ error: 'No fields to update' });
      }

      values.push(auth.user.userId);

      await pool.execute(
        `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
        values
      );

      const [updated] = await pool.execute(
        'SELECT id, name, email, currency FROM users WHERE id = ?',
        [auth.user.userId]
      );

      res.json({
        message: 'Profile updated successfully',
        user: updated[0]
      });
    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({ error: 'Server error updating profile' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}

