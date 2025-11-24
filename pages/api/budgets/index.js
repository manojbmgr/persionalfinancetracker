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
      const [budgets] = await pool.execute(
        'SELECT * FROM budgets WHERE user_id = ? ORDER BY category',
        [auth.user.userId]
      );

      // Convert to object format for easier frontend use
      const budgetsObj = {};
      budgets.forEach(budget => {
        budgetsObj[budget.category] = parseFloat(budget.amount);
      });

      res.json({ budgets: budgetsObj });
    } catch (error) {
      console.error('Get budgets error:', error);
      res.status(500).json({ error: 'Server error fetching budgets' });
    }
  } else if (req.method === 'POST') {
    try {
      const { category, amount } = req.body;

      // Validation
      if (!category || amount === undefined) {
        return res.status(400).json({ error: 'Category and amount are required' });
      }

      if (isNaN(amount) || amount < 0) {
        return res.status(400).json({ error: 'Amount must be a non-negative number' });
      }

      // Check if budget exists
      const [existing] = await pool.execute(
        'SELECT id FROM budgets WHERE user_id = ? AND category = ?',
        [auth.user.userId, category]
      );

      if (existing.length > 0) {
        // Update existing budget
        await pool.execute(
          'UPDATE budgets SET amount = ? WHERE id = ?',
          [amount, existing[0].id]
        );

        const [updated] = await pool.execute(
          'SELECT * FROM budgets WHERE id = ?',
          [existing[0].id]
        );

        return res.json({
          message: 'Budget updated successfully',
          budget: updated[0]
        });
      } else {
        // Create new budget
        const [result] = await pool.execute(
          'INSERT INTO budgets (user_id, category, amount) VALUES (?, ?, ?)',
          [auth.user.userId, category, amount]
        );

        const [newBudget] = await pool.execute(
          'SELECT * FROM budgets WHERE id = ?',
          [result.insertId]
        );

        return res.status(201).json({
          message: 'Budget created successfully',
          budget: newBudget[0]
        });
      }
    } catch (error) {
      console.error('Create/Update budget error:', error);
      res.status(500).json({ error: 'Server error saving budget' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}

