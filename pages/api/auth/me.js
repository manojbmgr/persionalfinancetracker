const getPool = require('../../../lib/db');
const { getTokenFromRequest, getTokenFromCookie, verifyToken } = require('../../../lib/auth');

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const token = getTokenFromRequest(req) || getTokenFromCookie(req);

    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    const pool = getPool();
    const [users] = await pool.execute(
      'SELECT id, name, email, currency FROM users WHERE id = ?',
      [decoded.userId]
    );

    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user: users[0] });
  } catch (error) {
    console.error('Auth check error:', error);
    res.status(500).json({ error: 'Server error' });
  }
}

