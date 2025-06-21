import React, { useState } from 'react';
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
} from '@mui/material';
import { useFinance } from '../context/FinanceContext';
import { toast } from 'react-toastify';

const categories = [
  'Food',
  'Transportation',
  'Housing',
  'Utilities',
  'Entertainment',
  'Healthcare',
  'Education',
  'Shopping',
  'Other',
];

const Budgets = () => {
  const { state, setBudget } = useFinance();
  const [open, setOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [budgetAmount, setBudgetAmount] = useState('');

  const handleOpen = (category) => {
    setSelectedCategory(category);
    setBudgetAmount(state.budgets[category] || '');
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedCategory('');
    setBudgetAmount('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (budgetAmount <= 0) {
      toast.error('Budget amount must be greater than 0');
      return;
    }
    setBudget(selectedCategory, parseFloat(budgetAmount));
    handleClose();
  };

  const calculateProgress = (category) => {
    const budget = state.budgets[category] || 0;
    if (budget === 0) return 0;

    const spent = state.transactions
      .filter(
        (t) =>
          t.type === 'expense' &&
          t.category === category &&
          new Date(t.date).getMonth() === new Date().getMonth()
      )
      .reduce((sum, t) => sum + t.amount, 0);

    return (spent / budget) * 100;
  };

  const getProgressColor = (progress) => {
    if (progress >= 100) return 'error';
    if (progress >= 80) return 'warning';
    return 'success';
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        {categories.map((category) => {
          const progress = calculateProgress(category);
          const budget = state.budgets[category] || 0;
          const spent = state.transactions
            .filter(
              (t) =>
                t.type === 'expense' &&
                t.category === category &&
                new Date(t.date).getMonth() === new Date().getMonth()
            )
            .reduce((sum, t) => sum + t.amount, 0);

          return (
            <Grid item size={{ xs: 12, md: 6 }} key={category}>
              <Paper sx={{ p: 2 }}>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 2,
                  }}
                >
                  <Typography variant="h6">{category}</Typography>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => handleOpen(category)}
                  >
                    {budget ? 'Edit Budget' : 'Set Budget'}
                  </Button>
                </Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Budget: {state.user.currency}
                  {budget.toFixed(2)}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Spent: {state.user.currency}
                  {spent.toFixed(2)}
                </Typography>
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
              </Paper>
            </Grid>
          );
        })}
      </Grid>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>
          {selectedCategory ? `Set Budget for ${selectedCategory}` : 'Set Budget'}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <TextField
              fullWidth
              label="Budget Amount"
              type="number"
              value={budgetAmount}
              onChange={(e) => setBudgetAmount(e.target.value)}
              margin="normal"
              required
              InputProps={{
                startAdornment: state.user.currency,
              }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button type="submit" variant="contained" color="primary">
              Save
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Container>
  );
};

export default Budgets; 