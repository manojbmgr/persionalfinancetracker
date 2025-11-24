import React, { useState } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  TextField,
  Button,
  MenuItem,
  Box,
} from '@mui/material';
import { useFinance } from '../contexts/FinanceContext';

const currencies = [
  { symbol: '₹', name: 'Indian Rupee' },
  { symbol: '$', name: 'US Dollar' },
  { symbol: '€', name: 'Euro' },
  { symbol: '£', name: 'British Pound' },
  { symbol: '¥', name: 'Japanese Yen' },
];

const Profile = () => {
  const { state, updateUser } = useFinance();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: state.user?.name || '',
    email: state.user?.email || '',
    currency: state.user?.currency || '₹',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateUser(formData);
      setIsEditing(false);
    } catch (error) {
      // Error is handled in context
    }
  };

  const calculateLifetimeStats = () => {
    const totalExpenses = state.transactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);

    const totalIncome = state.transactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);

    return {
      totalExpenses,
      totalSavings: totalIncome - totalExpenses,
    };
  };

  if (!state.user) {
    return null;
  }

  const stats = calculateLifetimeStats();

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
              <Typography variant="h5">Profile</Typography>
              <Button
                variant={isEditing ? 'outlined' : 'contained'}
                onClick={() => setIsEditing(!isEditing)}
              >
                {isEditing ? 'Cancel' : 'Edit Profile'}
              </Button>
            </Box>

            {isEditing ? (
              <form onSubmit={handleSubmit}>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12 }}>
                    <TextField
                      fullWidth
                      label="Name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <TextField
                      fullWidth
                      label="Email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <TextField
                      select
                      fullWidth
                      label="Default Currency"
                      name="currency"
                      value={formData.currency}
                      onChange={handleChange}
                      required
                    >
                      {currencies.map((currency) => (
                        <MenuItem key={currency.symbol} value={currency.symbol}>
                          {currency.symbol} - {currency.name}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <Button type="submit" variant="contained">
                      Save Changes
                    </Button>
                  </Grid>
                </Grid>
              </form>
            ) : (
              <Grid container spacing={2}>
                <Grid size={{ xs: 12 }}>
                  <Typography variant="subtitle1" color="text.secondary">
                    Name
                  </Typography>
                  <Typography variant="body1">{state.user.name}</Typography>
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <Typography variant="subtitle1" color="text.secondary">
                    Email
                  </Typography>
                  <Typography variant="body1">{state.user.email}</Typography>
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <Typography variant="subtitle1" color="text.secondary">
                    Default Currency
                  </Typography>
                  <Typography variant="body1">{state.user.currency}</Typography>
                </Grid>
              </Grid>
            )}
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Lifetime Statistics
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle1" color="text.secondary">
                Total Expenses
              </Typography>
              <Typography variant="h4" color="error">
                {state.user.currency}
                {stats.totalExpenses.toFixed(2)}
              </Typography>
            </Box>
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle1" color="text.secondary">
                Total Savings
              </Typography>
              <Typography
                variant="h4"
                color={stats.totalSavings >= 0 ? 'success.main' : 'error.main'}
              >
                {state.user.currency}
                {stats.totalSavings.toFixed(2)}
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Profile;

