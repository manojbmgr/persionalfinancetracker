const getPool = require('../../../lib/db');
const { authenticateRequest } = require('../../../lib/middleware');

export default async function handler(req, res) {
  const auth = authenticateRequest(req);
  if (auth.error) {
    return res.status(auth.status).json({ error: auth.error });
  }

  const pool = getPool();
  const { id } = req.query;

  if (req.method === 'GET') {
    try {
      const [transactions] = await pool.execute(
        'SELECT * FROM transactions WHERE id = ? AND user_id = ?',
        [id, auth.user.userId]
      );

      if (transactions.length === 0) {
        return res.status(404).json({ error: 'Transaction not found' });
      }

      res.json({ transaction: transactions[0] });
    } catch (error) {
      console.error('Get transaction error:', error);
      res.status(500).json({ error: 'Server error fetching transaction' });
    }
  } else if (req.method === 'PUT') {
    try {
      const { type, amount, category, date, note } = req.body;

      // Check if transaction exists and belongs to user
      const [existing] = await pool.execute(
        'SELECT * FROM transactions WHERE id = ? AND user_id = ?',
        [id, auth.user.userId]
      );

      if (existing.length === 0) {
        return res.status(404).json({ error: 'Transaction not found' });
      }

      // Validation
      if (type && type !== 'income' && type !== 'expense') {
        return res.status(400).json({ error: 'Type must be either income or expense' });
      }

      if (amount && (isNaN(amount) || amount <= 0)) {
        return res.status(400).json({ error: 'Amount must be a positive number' });
      }

      await pool.execute(
        'UPDATE transactions SET type = ?, amount = ?, category = ?, date = ?, note = ? WHERE id = ? AND user_id = ?',
        [
          type || existing[0].type,
          amount || existing[0].amount,
          category || existing[0].category,
          date || existing[0].date,
          note !== undefined ? note : existing[0].note,
          id,
          auth.user.userId
        ]
      );

      const [updated] = await pool.execute(
        'SELECT * FROM transactions WHERE id = ?',
        [id]
      );

      res.json({
        message: 'Transaction updated successfully',
        transaction: updated[0]
      });
    } catch (error) {
      console.error('Update transaction error:', error);
      res.status(500).json({ error: 'Server error updating transaction' });
    }
  } else if (req.method === 'DELETE') {
    try {
      const [result] = await pool.execute(
        'DELETE FROM transactions WHERE id = ? AND user_id = ?',
        [id, auth.user.userId]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Transaction not found' });
      }

      res.json({ message: 'Transaction deleted successfully' });
    } catch (error) {
      console.error('Delete transaction error:', error);
      res.status(500).json({ error: 'Server error deleting transaction' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}

