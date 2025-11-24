const getPool = require('../../../lib/db');
const { authenticateRequest } = require('../../../lib/middleware');

export default async function handler(req, res) {
  const auth = authenticateRequest(req);
  if (auth.error) {
    return res.status(auth.status).json({ error: auth.error });
  }

  const pool = getPool();
  const { id } = req.query;
  
  // Check if this is a delete-by-name request (id will be the category name)
  const isDeleteByName = req.method === 'DELETE' && isNaN(parseInt(id));

  if (req.method === 'PUT') {
    try {
      const { name } = req.body;

      if (!name || name.trim() === '') {
        return res.status(400).json({ error: 'Category name is required' });
      }

      // Check if category exists
      const [existing] = await pool.execute(
        'SELECT * FROM categories WHERE id = ?',
        [id]
      );

      if (existing.length === 0) {
        return res.status(404).json({ error: 'Category not found' });
      }

      // Ensure user can only modify their own categories
      if (existing[0].user_id !== auth.user.userId) {
        return res.status(403).json({ error: 'Not authorized to modify this category' });
      }

      // Check if new name already exists for this user
      const [nameExists] = await pool.execute(
        'SELECT id FROM categories WHERE name = ? AND id != ? AND user_id = ?',
        [name.trim(), id, auth.user.userId]
      );

      if (nameExists.length > 0) {
        return res.status(400).json({ error: 'Category name already exists' });
      }

      // Update category name
      await pool.execute(
        'UPDATE categories SET name = ? WHERE id = ?',
        [name.trim(), id]
      );

      const [updated] = await pool.execute(
        'SELECT * FROM categories WHERE id = ?',
        [id]
      );

      res.json({
        message: 'Category updated successfully',
        category: updated[0]
      });
    } catch (error) {
      console.error('Update category error:', error);
      res.status(500).json({ error: 'Server error updating category' });
    }
  } else if (req.method === 'DELETE') {
    try {
      // Handle delete by name (when id is actually a category name string)
      if (isDeleteByName) {
        const categoryName = decodeURIComponent(id);
        
        // Check if category exists for this user
        const [existing] = await pool.execute(
          'SELECT * FROM categories WHERE name = ? AND user_id = ?',
          [categoryName, auth.user.userId]
        );

        if (existing.length === 0) {
          return res.status(404).json({ error: 'Category not found' });
        }

        // Check if category is used in transactions for this user
        const [usedInTransactions] = await pool.execute(
          'SELECT id FROM transactions WHERE user_id = ? AND category = ? LIMIT 1',
          [auth.user.userId, categoryName]
        );

        if (usedInTransactions.length > 0) {
          return res.status(400).json({ 
            error: 'Cannot delete category that is used in transactions' 
          });
        }

        // Note: Budgets are never deleted - they remain in the database
        // Only delete the category entry
        await pool.execute(
          'DELETE FROM categories WHERE name = ? AND user_id = ?',
          [categoryName, auth.user.userId]
        );

        return res.json({ message: 'Category deleted successfully' });
      }
      
      // Handle delete by ID (numeric)
      // Check if category exists
      const [existing] = await pool.execute(
        'SELECT * FROM categories WHERE id = ?',
        [id]
      );

      if (existing.length === 0) {
        return res.status(404).json({ error: 'Category not found' });
      }

      // Ensure user can only delete their own categories
      if (existing[0].user_id !== auth.user.userId) {
        return res.status(403).json({ error: 'Not authorized to delete this category' });
      }

      // Check if category is used in transactions for this user
      const [usedInTransactions] = await pool.execute(
        'SELECT id FROM transactions WHERE user_id = ? AND category = ? LIMIT 1',
        [auth.user.userId, existing[0].name]
      );

      if (usedInTransactions.length > 0) {
        return res.status(400).json({ 
          error: 'Cannot delete category that is used in transactions' 
        });
      }

      // Note: Budgets are never deleted - they remain in the database
      // Only delete the category entry
      await pool.execute(
        'DELETE FROM categories WHERE id = ?',
        [id]
      );

      res.json({ message: 'Category deleted successfully' });
    } catch (error) {
      console.error('Delete category error:', error);
      res.status(500).json({ error: 'Server error deleting category' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}

