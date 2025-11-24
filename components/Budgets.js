import React, { useState } from 'react';
import { categoriesAPI } from '../utils/api';
import {
  Container,
  Grid,
  Paper,
  Typography,
  TextField,
  Button,
  LinearProgress,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { useFinance } from '../contexts/FinanceContext';
import { toast } from 'react-toastify';

const Budgets = () => {
  const { state, setBudget, renameCategory, deleteBudget, loadData } = useFinance();
  const [budgetDialogOpen, setBudgetDialogOpen] = useState(false);
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [budgetAmount, setBudgetAmount] = useState('');
  const [newCategoryName, setNewCategoryName] = useState('');
  const [renameCategoryName, setRenameCategoryName] = useState('');
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [menuCategory, setMenuCategory] = useState('');

  // Get all categories from database
  const categoryNames = (state.categories || []).map(cat => cat.name);
  
  // Combine: categories from database + any budgets that might not be in categories yet (for backward compatibility)
  const allCategories = [
    ...categoryNames,
    ...Object.keys(state.budgets || {}).filter(
      (cat) => !categoryNames.includes(cat)
    ),
  ];

  const handleOpenBudgetDialog = (category) => {
    setSelectedCategory(category);
    setBudgetAmount(state.budgets[category] || '');
    setBudgetDialogOpen(true);
  };

  const handleCloseBudgetDialog = () => {
    setBudgetDialogOpen(false);
    setSelectedCategory('');
    setBudgetAmount('');
  };

  const handleOpenCategoryDialog = () => {
    setNewCategoryName('');
    setCategoryDialogOpen(true);
  };

  const handleCloseCategoryDialog = () => {
    setCategoryDialogOpen(false);
    setNewCategoryName('');
  };

  const handleOpenRenameDialog = (category) => {
    setSelectedCategory(category);
    setRenameCategoryName(category);
    setRenameDialogOpen(true);
    setMenuAnchor(null);
  };

  const handleCloseRenameDialog = () => {
    setRenameDialogOpen(false);
    setSelectedCategory('');
    setRenameCategoryName('');
  };

  const handleMenuOpen = (event, category) => {
    setMenuAnchor(event.currentTarget);
    setMenuCategory(category);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
    setMenuCategory('');
  };

  const handleBudgetSubmit = async (e) => {
    e.preventDefault();
    const amount = parseFloat(budgetAmount);
    if (isNaN(amount) || amount < 0) {
      toast.error('Budget amount must be a non-negative number');
      return;
    }
    try {
      await setBudget(selectedCategory, amount);
      handleCloseBudgetDialog();
    } catch (error) {
      // Error is handled in context
    }
  };

  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    const trimmedName = newCategoryName.trim();
    if (!trimmedName) {
      toast.error('Category name cannot be empty');
      return;
    }
    if (allCategories.includes(trimmedName)) {
      toast.error('Category already exists');
      return;
    }
    try {
      // Create category in database using categories API
      await categoriesAPI.create(trimmedName);
      // Reload data to get the new category
      await loadData();
      handleCloseCategoryDialog();
      // Open budget dialog to set initial amount
      setSelectedCategory(trimmedName);
      setBudgetAmount('');
      setBudgetDialogOpen(true);
    } catch (error) {
      toast.error(error.message || 'Failed to create category');
    }
  };

  const handleRenameSubmit = async (e) => {
    e.preventDefault();
    const trimmedName = renameCategoryName.trim();
    if (!trimmedName) {
      toast.error('Category name cannot be empty');
      return;
    }
    if (trimmedName === selectedCategory) {
      handleCloseRenameDialog();
      return;
    }
    if (allCategories.includes(trimmedName)) {
      toast.error('Category name already exists');
      return;
    }
    try {
      await renameCategory(selectedCategory, trimmedName);
      handleCloseRenameDialog();
    } catch (error) {
      // Error is handled in context
    }
  };

  const handleDelete = async () => {
    if (
      window.confirm(
        `Are you sure you want to delete the category "${menuCategory}"? This will delete the category and its budget, but will not delete related transactions.`
      )
    ) {
      try {
        await categoriesAPI.deleteByName(menuCategory);
        await loadData();
        handleMenuClose();
        toast.success(`Category "${menuCategory}" deleted successfully!`);
      } catch (error) {
        toast.error(error.message || 'Failed to delete category');
      }
    }
  };

  const calculateProgress = (category) => {
    const budget = state.budgets[category] || 0;
    if (budget === 0) return 0;

    const spent = state.transactions
      .filter(
        (t) =>
          t.type === 'expense' &&
          t.category === category &&
          new Date(t.date).getMonth() === new Date().getMonth() &&
          new Date(t.date).getFullYear() === new Date().getFullYear()
      )
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);

    return (spent / budget) * 100;
  };

  const getProgressColor = (progress) => {
    if (progress >= 100) return 'error';
    if (progress >= 80) return 'warning';
    return 'success';
  };

  if (!state.user) {
    return null;
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Budgets</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenCategoryDialog}
        >
          Add Category
        </Button>
      </Box>

      <Grid container spacing={3}>
        {allCategories.map((category) => {
          const progress = calculateProgress(category);
          const budget = state.budgets[category] || 0;
          const spent = state.transactions
            .filter(
              (t) =>
                t.type === 'expense' &&
                t.category === category &&
                new Date(t.date).getMonth() === new Date().getMonth() &&
                new Date(t.date).getFullYear() === new Date().getFullYear()
            )
            .reduce((sum, t) => sum + parseFloat(t.amount), 0);

          return (
            <Grid size={{ xs: 12, md: 4 }} key={category} sx={{ display: 'flex' }}>
              <Paper sx={{ p: 2, width: '100%', minHeight: 180, display: 'flex', flexDirection: 'column' }}>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 2,
                  }}
                >
                  <Typography variant="h6">{category}</Typography>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => handleOpenBudgetDialog(category)}
                    >
                      {budget ? 'Edit Budget' : 'Set Budget'}
                    </Button>
                    <IconButton
                      size="small"
                      onClick={(e) => handleMenuOpen(e, category)}
                    >
                      <MoreVertIcon />
                    </IconButton>
                  </Box>
                </Box>
                <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      Budget: {state.user.currency}
                      {parseFloat(budget).toFixed(2)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      Spent: {state.user.currency}
                      {spent.toFixed(2)}
                    </Typography>
                  </Box>
                  <Box sx={{ mt: 2 }}>
                    <LinearProgress
                      variant="determinate"
                      value={Math.min(progress, 100)}
                      color={getProgressColor(progress)}
                      sx={{ height: 10, borderRadius: 5 }}
                    />
                    {progress >= 100 && (
                      <Typography color="error" sx={{ mt: 1 }}>
                        Budget exceeded!
                      </Typography>
                    )}
                  </Box>
                </Box>
              </Paper>
            </Grid>
          );
        })}
      </Grid>

      {/* Budget Amount Dialog */}
      <Dialog open={budgetDialogOpen} onClose={handleCloseBudgetDialog}>
        <DialogTitle>
          {selectedCategory ? `Set Budget for ${selectedCategory}` : 'Set Budget'}
        </DialogTitle>
        <form onSubmit={handleBudgetSubmit}>
          <DialogContent>
            <TextField
              fullWidth
              label="Budget Amount"
              type="number"
              value={budgetAmount}
              onChange={(e) => setBudgetAmount(e.target.value)}
              sx={{ mb: 2 }}
              required
              InputProps={{
                startAdornment: state.user.currency,
              }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseBudgetDialog}>Cancel</Button>
            <Button type="submit" variant="contained">
              Save
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Add Category Dialog */}
      <Dialog open={categoryDialogOpen} onClose={handleCloseCategoryDialog}>
        <DialogTitle>Add New Category</DialogTitle>
        <form onSubmit={handleCategorySubmit}>
          <DialogContent>
            <TextField
              fullWidth
              label="Category Name"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              sx={{ mb: 2 }}
              required
              autoFocus
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseCategoryDialog}>Cancel</Button>
            <Button type="submit" variant="contained">
              Add
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Rename Category Dialog */}
      <Dialog open={renameDialogOpen} onClose={handleCloseRenameDialog}>
        <DialogTitle>Rename Category</DialogTitle>
        <form onSubmit={handleRenameSubmit}>
          <DialogContent>
            <TextField
              fullWidth
              label="New Category Name"
              value={renameCategoryName}
              onChange={(e) => setRenameCategoryName(e.target.value)}
              sx={{ mb: 2 }}
              required
              autoFocus
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseRenameDialog}>Cancel</Button>
            <Button type="submit" variant="contained">
              Rename
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Category Menu */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => handleOpenRenameDialog(menuCategory)}>
          <EditIcon sx={{ mr: 1 }} /> Rename Category
        </MenuItem>
        <MenuItem onClick={handleDelete}>
          <DeleteIcon sx={{ mr: 1 }} /> Delete Category
        </MenuItem>
      </Menu>
    </Container>
  );
};

export default Budgets;
