import React, { useState } from 'react';
import {
  Container,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  IconButton,
  Grid,
  Box,
  Typography,
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, FilterList as FilterIcon } from '@mui/icons-material';
import { useFinance } from '../contexts/FinanceContext';
import { toast } from 'react-toastify';

const Transactions = () => {
  const { state, addTransaction, updateTransaction, deleteTransaction } =
    useFinance();
  
  // Get categories from database (fallback to empty array if not loaded yet)
  const categories = (state.categories || []).map(cat => cat.name);
  const [open, setOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    type: '',
    category: '',
  });
  const [formData, setFormData] = useState({
    type: 'expense',
    amount: '',
    category: '',
    date: new Date().toISOString().split('T')[0],
    note: '',
  });

  // Filter transactions based on selected criteria
  const filteredTransactions = state.transactions.filter((transaction) => {
    const matchesStartDate = !filters.startDate || transaction.date >= filters.startDate;
    const matchesEndDate = !filters.endDate || transaction.date <= filters.endDate;
    const matchesType = !filters.type || transaction.type === filters.type;
    const matchesCategory = !filters.category || transaction.category === filters.category;
    
    return matchesStartDate && matchesEndDate && matchesType && matchesCategory;
  });

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const clearFilters = () => {
    setFilters({
      startDate: '',
      endDate: '',
      type: '',
      category: '',
    });
  };

  const hasActiveFilters = filters.startDate || filters.endDate || filters.type || filters.category;

  const handleOpen = (transaction = null) => {
    if (transaction) {
      setEditingTransaction(transaction);
      setFormData({
        type: transaction.type,
        amount: transaction.amount,
        category: transaction.category,
        date: transaction.date,
        note: transaction.note || '',
      });
    } else {
      setEditingTransaction(null);
      setFormData({
        type: 'expense',
        amount: '',
        category: '',
        date: new Date().toISOString().split('T')[0],
        note: '',
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingTransaction(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const transaction = {
      ...formData,
      amount: parseFloat(formData.amount),
    };

    // Check if expense exceeds budget
    if (transaction.type === 'expense') {
      const budget = state.budgets[transaction.category] || 0;
      if (budget > 0 && transaction.amount > budget) {
        toast.error('Expense exceeds the set budget for this category!');
        return;
      }
    }

    try {
      if (editingTransaction) {
        await updateTransaction({ ...transaction, id: editingTransaction.id });
      } else {
        await addTransaction(transaction);
      }
      handleClose();
    } catch (error) {
      // Error is handled in context
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      try {
        await deleteTransaction(id);
      } catch (error) {
        // Error is handled in context
      }
    }
  };

  if (!state.user) {
    return null;
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Button
          variant="contained"
          onClick={() => handleOpen()}
        >
          Add Transaction
        </Button>
        <Typography variant="body2" color="text.secondary">
          Showing {filteredTransactions.length} of {state.transactions.length} transactions
        </Typography>
      </Box>

      {/* Filter Section */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <FilterIcon sx={{ mr: 1 }} />
          <Typography variant="h6">Filters</Typography>
        </Box>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <TextField
              fullWidth
              label="Start Date"
              name="startDate"
              type="date"
              value={filters.startDate}
              onChange={handleFilterChange}
              sx={{ 
                width: '100%',
                minWidth: '200px'
              }}
              slotProps={{ inputLabel: { shrink: true } }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <TextField
              fullWidth
              label="End Date"
              name="endDate"
              type="date"
              value={filters.endDate}
              onChange={handleFilterChange}
              sx={{ 
                width: '100%',
                minWidth: '200px'
              }}
              slotProps={{ inputLabel: { shrink: true } }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <TextField
              select
              fullWidth
              label="Type"
              name="type"
              value={filters.type}
              onChange={handleFilterChange}
              sx={{ 
                width: '100%',
                minWidth: '200px'
              }}
            >
              <MenuItem value="">All Types</MenuItem>
              <MenuItem value="income">Income</MenuItem>
              <MenuItem value="expense">Expense</MenuItem>
            </TextField>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <TextField
              select
              fullWidth
              label="Category"
              name="category"
              value={filters.category}
              onChange={handleFilterChange}
              sx={{ 
                width: '100%',
                minWidth: '200px'
              }}
            >
              <MenuItem value="">All Categories</MenuItem>
              {categories.map((category) => (
                <MenuItem key={category} value={category}>
                  {category}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
        </Grid>
        {hasActiveFilters && (
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
            <Button variant="outlined" onClick={clearFilters}>
              Clear Filters
            </Button>
          </Box>
        )}
      </Paper>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Type</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Note</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredTransactions.map((transaction) => (
              <TableRow key={transaction.id}>
                <TableCell
                  sx={{
                    color: transaction.type === 'income' ? 'success.main' : 'error.main',
                  }}
                >
                  {transaction.type}
                </TableCell>
                <TableCell>
                  {state.user.currency}
                  {parseFloat(transaction.amount).toFixed(2)}
                </TableCell>
                <TableCell>{transaction.category}</TableCell>
                <TableCell>{transaction.date}</TableCell>
                <TableCell>{transaction.note || ''}</TableCell>
                <TableCell>
                  <IconButton
                    onClick={() => handleOpen(transaction)}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    color="error"
                    onClick={() => handleDelete(transaction.id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>
          {editingTransaction ? 'Edit Transaction' : 'Add Transaction'}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <TextField
              select
              fullWidth
              label="Type"
              name="type"
              value={formData.type}
              onChange={handleChange}
              sx={{ mb: 2, minWidth: '300px' }}
            >
              <MenuItem value="income">Income</MenuItem>
              <MenuItem value="expense">Expense</MenuItem>
            </TextField>
            <TextField
              fullWidth
              label="Amount"
              name="amount"
              type="number"
              value={formData.amount}
              onChange={handleChange}
              sx={{ mb: 2, minWidth: '300px' }}
              required
            />
            <TextField
              select
              fullWidth
              label="Category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              sx={{ mb: 2, minWidth: '300px' }}
              required
            >
              {categories.map((category) => (
                <MenuItem key={category} value={category}>
                  {category}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              fullWidth
              label="Date"
              name="date"
              type="date"
              value={formData.date}
              onChange={handleChange}
              sx={{ mb: 2, minWidth: '300px' }}
              required
              slotProps={{ inputLabel: { shrink: true } }}
            />
            <TextField
              fullWidth
              label="Note"
              name="note"
              value={formData.note}
              onChange={handleChange}
              sx={{ mb: 2, minWidth: '300px' }}
              multiline
              rows={2}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button type="submit" variant="contained">
              {editingTransaction ? 'Update' : 'Add'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Container>
  );
};

export default Transactions;

