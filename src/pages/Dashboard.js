import React, { useState } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  TextField,
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer
} from 'recharts';
import { useFinance } from '../context/FinanceContext';
const COLORS = ['#4CAF50', '#F44336', '#FF9800', '#2196F3', '#9C27B0', '#607D8B', '#795548', '#E91E63', '#00BCD4', '#8BC34A', '#FFC107', '#3F51B5'];
function getFirstDayOfCurrentMonth() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}-01`;
}
const Dashboard = () => {
  const { state } = useFinance();
  const [dateRange, setDateRange] = useState({
    start: getFirstDayOfCurrentMonth(),
    end: new Date().toISOString().split('T')[0],
  });
  console.log(dateRange);
  const filteredTransactions = state.transactions.filter(
    (t) => t.date >= dateRange.start && t.date <= dateRange.end
  );
  const totalIncome = filteredTransactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = filteredTransactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
  const remainingBudget = Object.entries(state.budgets).reduce(
    (sum, [category, budget]) => {
      const spent = filteredTransactions
        .filter((t) => t.type === 'expense' && t.category === category)
        .reduce((sum, t) => sum + t.amount, 0);
      return sum + (budget - spent);
    },
    0
  );
  const savings = totalIncome - totalExpenses;
  const monthlyData = filteredTransactions.reduce((acc, t) => {
    const month = new Date(t.date).toLocaleString('default', { month: 'short' });
    if (!acc[month]) {
      acc[month] = { income: 0, expenses: 0 };
    }
    if (t.type === 'income') {
      acc[month].income += t.amount;
    } else {
      acc[month].expenses += t.amount;
    }
    return acc;
  }, {});
  const monthlyChartData = Object.entries(monthlyData).map(([month, data]) => ({
    month,
    ...data,
  }));
  const categoryData = filteredTransactions
    .filter((t) => t.type === 'expense')
    .reduce((acc, t) => {
      if (!acc[t.category]) {
        acc[t.category] = 0;
      }
      acc[t.category] += t.amount;
      return acc;
    }, {});
  const pieChartData = Object.entries(categoryData).map(([name, value]) => ({
    name,
    value,
  }));
  const todayExpenses = filteredTransactions.filter(
    (t) =>
      t.type === 'expense' &&
      t.date === new Date().toISOString().split('T')[0]
  );
  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        {/* Date Range Filter */}
        <Grid item size={{ xs: 12 }}>
          <Paper sx={{ p: 2, display: 'flex', gap: 2 }}>
            <TextField
              type="date"
              label="Start Date"
              value={dateRange.start}
              onChange={(e) =>
                setDateRange({ ...dateRange, start: e.target.value })
              }
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              type="date"
              label="End Date"
              value={dateRange.end}
              onChange={(e) =>
                setDateRange({ ...dateRange, end: e.target.value })
              }
              InputLabelProps={{ shrink: true }}
            />
          </Paper>
        </Grid>
        {/* Summary Cards */}
        {[
          { label: 'Total Income', value: totalIncome },
          { label: 'Total Expenses', value: totalExpenses },
          { label: 'Remaining Budget', value: remainingBudget },
          { label: 'Savings', value: savings },
        ].map((item, index) => (
          <Grid item size={{ xs: 12, sm: 6, md: 3 }} key={index}>
            <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
              <Typography color="text.secondary" gutterBottom>
                {item.label}
              </Typography>
              <Typography variant="h4">
                {state.user.currency}
                {item.value.toFixed(2)}
              </Typography>
            </Paper>
          </Grid>
        ))}
        {/* Today's Expenses */}
        <Grid item size={{ xs: 12 }}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Today's Expenses
            </Typography>
            {todayExpenses.length > 0 ? (
              todayExpenses.map((expense) => (
                <Box
                  key={expense.id}
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    mb: 1,
                    p: 1,
                    backgroundColor: 'background.default',
                    borderRadius: 1,
                  }}
                >
                  <Typography>{expense.category}</Typography>
                  <Typography>{expense.note}</Typography>
                  <Typography>
                    {state.user.currency}
                    {expense.amount.toFixed(2)}
                  </Typography>
                </Box>
              ))
            ) : (
              <Typography color="text.secondary">
                No expenses recorded for today
              </Typography>
            )}
          </Paper>
        </Grid>
        {/* Charts */}
        <Grid container spacing={1} sx={{ width: '100%' }}>
          <Grid item size={{ xs: 12, md: 8, lg: 6 }}> {/* ✅ Fixed syntax */}
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Monthly Spending Trend
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={monthlyChartData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="income" fill="#4CAF50" name="Income" />
                  <Bar dataKey="expenses" fill="#F44336" name="Expenses" />
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
          <Grid item size={{ xs: 12, md: 4, lg: 6 }}> {/* ✅ Fixed syntax */}
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Category-wise Expenses
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius="80%"
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
        </Grid>
      </Grid>
    </Container>
  );
};
export default Dashboard;
