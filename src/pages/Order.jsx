import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Stack,
  RadioGroup,
  FormControlLabel,
  Radio
} from '@mui/material';

const Order = () => {
  const [openForm, setOpenForm] = useState(false);
  const [openUpdate, setOpenUpdate] = useState(null);
  const [filterStatus, setFilterStatus] = useState('All');
  const [newOrder, setNewOrder] = useState({
    client: '',
    date: '',
    amount: '',
    status: '',
  });

  const [orders, setOrders] = useState([
    { id: 1, client: 'Aniket Dhangar', date: '2025-07-07', amount: '₹3,200', status: 'Completed' },
    { id: 2, client: 'Jay Jadhav', date: '2025-07-06', amount: '₹5,000', status: 'Pending' },
    { id: 3, client: 'Tejashu Saner', date: '2025-07-05', amount: '₹2,500', status: 'In Progress' },
    { id: 4, client: 'Madhura Patil', date: '2025-07-04', amount: '₹4,800', status: 'Rejected' },
  ]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed': return 'success';
      case 'Pending': return 'warning';
      case 'In Progress': return 'info';
      case 'Rejected': return 'error';
      default: return 'default';
    }
  };

  const handleInputChange = (e) => {
    setNewOrder({ ...newOrder, [e.target.name]: e.target.value });
  };

  const handleSubmit = () => {
    const newId = orders.length + 1;
    setOrders([...orders, { id: newId, ...newOrder }]);
    setOpenForm(false);
    setNewOrder({ client: '', date: '', amount: '', status: '' });
  };

  const handleUpdateStatus = () => {
    setOrders((prev) =>
      prev.map((order) =>
        order.id === openUpdate.id ? { ...order, status: openUpdate.status } : order
      )
    );
    setOpenUpdate(null);
  };

  const filteredOrders =
    filterStatus === 'All'
      ? orders
      : orders.filter((order) => order.status === filterStatus);

  return (
    <Box sx={{ backgroundColor: '#fff', p: 3 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" fontWeight="bold" color="text.primary">
          Orders Overview
        </Typography>
        <Button variant="contained" color="primary" onClick={() => setOpenForm(true)}>
          + New Order
        </Button>
      </Box>

      {/* Status Filters */}
      <Stack direction="row" spacing={1} mb={2} flexWrap="wrap">
        {['All', 'Pending', 'Completed', 'In Progress', 'Rejected'].map((status) => (
          <Button
            key={status}
            onClick={() => setFilterStatus(status)}
            sx={{
              textTransform: 'none',
              borderRadius: '20px',
              paddingX: 2,
              paddingY: 0.5,
              fontWeight: filterStatus === status ? 'bold' : 'normal',
              backgroundColor: filterStatus === status ? '#1976d2' : '#f5f5f5',
              color: filterStatus === status ? '#fff' : '#333',
              '&:hover': {
                backgroundColor: filterStatus === status ? '#1565c0' : '#e0e0e0',
              },
              boxShadow: filterStatus === status ? 2 : 0,
            }}
            variant="contained"
          >
            {status}
          </Button>
        ))}
      </Stack>

      {/* Scrollable Orders Table */}
      <Paper elevation={3} sx={{ height: 450, p: 0, overflow: 'hidden' }}>
        <Box sx={{ overflow: 'auto', height: '100%' }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>Order ID</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Client</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Date</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Amount</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredOrders.map((order) => (
                <TableRow key={order.id} hover>
                  <TableCell>{order.id}</TableCell>
                  <TableCell>{order.client}</TableCell>
                  <TableCell>{order.date}</TableCell>
                  <TableCell>{order.amount}</TableCell>
                  <TableCell>
                    <Chip
                      label={order.status}
                      color={getStatusColor(order.status)}
                      variant="outlined"
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => setOpenUpdate({ id: order.id, status: order.status })}
                      sx={{
                        textTransform: 'none',
                        fontWeight: 500,
                        borderRadius: '8px',
                        paddingX: 2,
                        paddingY: 0.5,
                        color: '#1976d2',
                        borderColor: '#1976d2',
                        '&:hover': {
                          backgroundColor: '#e3f2fd',
                          borderColor: '#1565c0',
                        },
                      }}
                    >
                      Update Status
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      </Paper>

      {/* Add Order Dialog */}
      <Dialog open={openForm} onClose={() => setOpenForm(false)} fullWidth maxWidth="sm">
        <DialogTitle>Add New Order</DialogTitle>
        <DialogContent>
          <TextField name="client" label="Client" fullWidth margin="dense" value={newOrder.client} onChange={handleInputChange} />
          <TextField name="date" type="date" label="Date" fullWidth margin="dense" value={newOrder.date} onChange={handleInputChange} InputLabelProps={{ shrink: true }} />
          <TextField name="amount" label="Amount" fullWidth margin="dense" value={newOrder.amount} onChange={handleInputChange} />
          <TextField name="status" label="Status" fullWidth margin="dense" value={newOrder.status} onChange={handleInputChange} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenForm(false)} color="secondary">Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">Add Order</Button>
        </DialogActions>
      </Dialog>

      {/* Update Status Dialog */}
      <Dialog open={!!openUpdate} onClose={() => setOpenUpdate(null)} fullWidth maxWidth="xs">
        <DialogTitle>Update Status</DialogTitle>
        <DialogContent>
          <RadioGroup
            value={openUpdate?.status || ''}
            onChange={(e) =>
              setOpenUpdate((prev) => ({ ...prev, status: e.target.value }))
            }
          >
            <FormControlLabel value="Pending" control={<Radio />} label="Pending" />
            <FormControlLabel value="Completed" control={<Radio />} label="Completed" />
            <FormControlLabel value="In Progress" control={<Radio />} label="In Progress" />
            <FormControlLabel value="Rejected" control={<Radio />} label="Rejected" />
          </RadioGroup>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenUpdate(null)} color="secondary">Cancel</Button>
          <Button onClick={handleUpdateStatus} variant="contained" color="primary">Update</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Order;
