import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
} from '@mui/material';

const Expenses = () => {
  const [open, setOpen] = useState(false);
  const [newExpense, setNewExpense] = useState({
    title: '',
    category: '',
    amount: '',
    date: '',
    status: 'Pending',
  });

  // Default: current month and year
  const today = new Date();
  const [filterMonth, setFilterMonth] = useState(today.getMonth() + 1); // Jan = 0
  const [filterYear, setFilterYear] = useState(today.getFullYear());

  const [expenses, setExpenses] = useState([
    { id: 1, title: 'Camera Maintenance', category: 'Equipment', amount: '₹1,200', date: '2025-07-05', status: 'Paid' },
    { id: 2, title: 'Studio Rent', category: 'Operational', amount: '₹10,000', date: '2025-07-01', status: 'Pending' },
    { id: 3, title: 'Transport', category: 'Logistics', amount: '₹800', date: '2025-07-03', status: 'Paid' },
    { id: 4, title: 'Software Subscription', category: 'Tools', amount: '₹1,500', date: '2025-07-06', status: 'Pending' },
  ]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Paid': return 'success';
      case 'Pending': return 'warning';
      default: return 'default';
    }
  };

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setNewExpense({ title: '', category: '', amount: '', date: '', status: 'Pending' });
  };

  const handleChange = (e) => {
    setNewExpense({ ...newExpense, [e.target.name]: e.target.value });
  };

  const handleAddExpense = () => {
    const id = expenses.length + 1;
    setExpenses([...expenses, { id, ...newExpense }]);
    handleClose();
  };

  const filteredExpenses = expenses.filter((expense) => {
    const d = new Date(expense.date);
    return (
      d.getMonth() + 1 === Number(filterMonth) &&
      d.getFullYear() === Number(filterYear)
    );
  });

  return (
    <Box sx={{ backgroundColor: '#fff', minHeight: '100vh', p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" fontWeight="bold" color="text.primary">
          Expenses Overview
        </Typography>
        <Button variant="contained" color="primary" onClick={handleOpen}>
          Add Expense
        </Button>
      </Box>

      {/* Filter Section */}
      <Box display="flex" gap={2} mb={2}>
        <TextField
          select
          label="Month"
          value={filterMonth}
          onChange={(e) => setFilterMonth(e.target.value)}
        >
          {Array.from({ length: 12 }, (_, i) => (
            <MenuItem key={i + 1} value={i + 1}>
              {new Date(0, i).toLocaleString('default', { month: 'long' })}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          select
          label="Year"
          value={filterYear}
          onChange={(e) => setFilterYear(e.target.value)}
        >
          {[2024, 2025, 2026].map((year) => (
            <MenuItem key={year} value={year}>
              {year}
            </MenuItem>
          ))}
        </TextField>
      </Box>

      {/* Table */}
      <Paper elevation={3} sx={{ p: 3 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>Expense ID</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Title</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Category</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Amount</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Date</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredExpenses.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  No expenses for selected month and year
                </TableCell>
              </TableRow>
            ) : (
              filteredExpenses.map((expense) => (
                <TableRow key={expense.id} hover>
                  <TableCell>{expense.id}</TableCell>
                  <TableCell>{expense.title}</TableCell>
                  <TableCell>{expense.category}</TableCell>
                  <TableCell>{expense.amount}</TableCell>
                  <TableCell>{expense.date}</TableCell>
                  <TableCell>
                    <Chip
                      label={expense.status}
                      color={getStatusColor(expense.status)}
                      variant="outlined"
                      size="small"
                    />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Paper>

      {/* Dialog */}
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle>Add New Expense</DialogTitle>
        <DialogContent>
          <TextField fullWidth label="Title" name="title" value={newExpense.title} onChange={handleChange} margin="normal" />
          <TextField fullWidth label="Category" name="category" value={newExpense.category} onChange={handleChange} margin="normal" />
          <TextField fullWidth label="Amount" name="amount" value={newExpense.amount} onChange={handleChange} margin="normal" />
          <TextField
            fullWidth
            type="date"
            label="Date"
            name="date"
            value={newExpense.date}
            onChange={handleChange}
            margin="normal"
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            select
            fullWidth
            label="Status"
            name="status"
            value={newExpense.status}
            onChange={handleChange}
            margin="normal"
          >
            <MenuItem value="Pending">Pending</MenuItem>
            <MenuItem value="Paid">Paid</MenuItem>
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="inherit">Cancel</Button>
          <Button onClick={handleAddExpense} variant="contained">Add</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Expenses;
