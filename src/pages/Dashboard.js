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
} from 'recharts';
import { useFinance } from '../context/FinanceContext';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

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
        <Grid item xs={12}>
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
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
            <Typography color="text.secondary" gutterBottom>
              Total Income
            </Typography>
            <Typography variant="h4">
              {state.user.currency}
              {totalIncome.toFixed(2)}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
            <Typography color="text.secondary" gutterBottom>
              Total Expenses
            </Typography>
            <Typography variant="h4">
              {state.user.currency}
              {totalExpenses.toFixed(2)}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
            <Typography color="text.secondary" gutterBottom>
              Remaining Budget
            </Typography>
            <Typography variant="h4">
              {state.user.currency}
              {remainingBudget.toFixed(2)}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
            <Typography color="text.secondary" gutterBottom>
              Savings
            </Typography>
            <Typography variant="h4">
              {state.user.currency}
              {savings.toFixed(2)}
            </Typography>
          </Paper>
        </Grid>
        {/* Today's Expenses */}
        <Grid item xs={12}>
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
        <Grid container spacing={1}>
          {/* Charts */}
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Monthly Spending Trend
              </Typography>
              <BarChart
                width={700}
                height={300}
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
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Category-wise Expenses
              </Typography>
              <PieChart width={300} height={300}>
                <Pie
                  data={pieChartData}
                  cx={150}
                  cy={150}
                  labelLine={false}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                >
                  {pieChartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </Paper>
          </Grid>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard; 