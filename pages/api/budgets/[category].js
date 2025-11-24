const getPool = require('../../../lib/db');
const { authenticateRequest } = require('../../../lib/middleware');

export default async function handler(req, res) {
  const auth = authenticateRequest(req);
  if (auth.error) {
    return res.status(auth.status).json({ error: auth.error });
  }

  const pool = getPool();
  const category = decodeURIComponent(req.query.category || '');

  if (req.method === 'GET') {
    try {
      const [budgets] = await pool.execute(
        'SELECT * FROM budgets WHERE user_id = ? AND category = ?',
        [auth.user.userId, category]
      );

      if (budgets.length === 0) {
        return res.status(404).json({ error: 'Budget not found' });
      }

      res.json({ budget: budgets[0] });
    } catch (error) {
      console.error('Get budget error:', error);
      res.status(500).json({ error: 'Server error fetching budget' });
    }
  } else if (req.method === 'PUT') {
    try {
      const { newCategory } = req.body;

      if (!newCategory || newCategory.trim() === '') {
        return res.status(400).json({ error: 'New category name is required' });
      }

      const newCategoryName = newCategory.trim();

      // Check if new category name already exists in categories table
      const [existingCategory] = await pool.execute(
        'SELECT id FROM categories WHERE name = ?',
        [newCategoryName]
      );

      // Check if new category name already exists in budgets
      const [existingBudget] = await pool.execute(
        'SELECT id FROM budgets WHERE user_id = ? AND category = ?',
        [auth.user.userId, newCategoryName]
      );

      // Check if new category name already exists in transactions
      const [existingTransaction] = await pool.execute(
        'SELECT id FROM transactions WHERE user_id = ? AND category = ? LIMIT 1',
        [auth.user.userId, newCategoryName]
      );

      if (existingCategory.length > 0 || existingBudget.length > 0 || existingTransaction.length > 0) {
        return res.status(400).json({ error: 'Category name already exists' });
      }

      // Check if old category exists in budgets
      const [oldBudget] = await pool.execute(
        'SELECT id FROM budgets WHERE user_id = ? AND category = ?',
        [auth.user.userId, category]
      );

      // Handle category rename in categories table
      let categoriesUpdated = 0;
      
      // Check if category exists for this user
      const [categoryInTable] = await pool.execute(
        'SELECT * FROM categories WHERE name = ? AND user_id = ?',
        [category, auth.user.userId]
      );

      // Check if new category name already exists for this user
      const [newCategoryInTable] = await pool.execute(
        'SELECT * FROM categories WHERE name = ? AND user_id = ?',
        [newCategoryName, auth.user.userId]
      );

      // If category exists for this user, update it
      if (categoryInTable.length > 0) {
        // It's the user's category - UPDATE it directly in the categories table (rename)
        const [updateResult] = await pool.execute(
          'UPDATE categories SET name = ? WHERE name = ? AND user_id = ?',
          [newCategoryName, category, auth.user.userId]
        );
        categoriesUpdated = updateResult.affectedRows;
        
        // If update didn't affect any rows, something went wrong
        if (categoriesUpdated === 0) {
          console.error(`Failed to update category: ${category} to ${newCategoryName}`);
        }
      } else {
        // Category doesn't exist in categories table for this user
        // Check if there are any transactions using this category
        const [oldTransactions] = await pool.execute(
          'SELECT id FROM transactions WHERE user_id = ? AND category = ? LIMIT 1',
          [auth.user.userId, category]
        );
        
        // Only create new category if:
        // 1. The category has been used (has budgets or transactions)
        // 2. The new category name doesn't already exist for this user
        if ((oldBudget.length > 0 || oldTransactions.length > 0) && newCategoryInTable.length === 0) {
          try {
            await pool.execute(
              'INSERT INTO categories (user_id, name) VALUES (?, ?)',
              [auth.user.userId, newCategoryName]
            );
            categoriesUpdated = 1;
          } catch (insertError) {
            // Category might already exist, ignore error
            console.error('Error creating new category:', insertError);
          }
        }
      }

      // Update category name in budgets table if it exists
      let budgetsUpdated = 0;
      if (oldBudget.length > 0) {
        const [budgetUpdateResult] = await pool.execute(
          'UPDATE budgets SET category = ? WHERE user_id = ? AND category = ?',
          [newCategoryName, auth.user.userId, category]
        );
        budgetsUpdated = budgetUpdateResult.affectedRows;
      } else {
        // If category doesn't have a budget entry yet, create one with the new name and 0 amount
        // This ensures the rename is persisted in the database
        try {
          await pool.execute(
            'INSERT INTO budgets (user_id, category, amount) VALUES (?, ?, ?)',
            [auth.user.userId, newCategoryName, 0]
          );
          budgetsUpdated = 1;
        } catch (insertError) {
          // Budget might already exist, ignore error
        }
      }

      // Update all transactions with the old category name to the new category name
      const [updateResult] = await pool.execute(
        'UPDATE transactions SET category = ? WHERE user_id = ? AND category = ?',
        [newCategoryName, auth.user.userId, category]
      );

      const transactionsUpdated = updateResult.affectedRows;

      res.json({ 
        message: 'Category renamed successfully',
        categoriesUpdated: categoriesUpdated,
        budgetsUpdated: budgetsUpdated,
        transactionsUpdated: transactionsUpdated
      });
    } catch (error) {
      console.error('Update category error:', error);
      res.status(500).json({ error: 'Server error updating category' });
    }
  } else if (req.method === 'DELETE') {
    try {
      // Validate user_id
      if (!auth.user || !auth.user.userId) {
        return res.status(401).json({ error: 'User authentication required' });
      }

      // Delete the budget entry if it exists
      // Categories can exist independently - we don't delete them here
      const [result] = await pool.execute(
        'DELETE FROM budgets WHERE user_id = ? AND category = ?',
        [auth.user.userId, category]
      );

      res.json({ 
        message: 'Budget deleted successfully',
        deleted: result.affectedRows > 0
      });
    } catch (error) {
      console.error('Delete budget error:', error);
      res.status(500).json({ error: 'Server error deleting budget' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}

