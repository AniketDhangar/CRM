import React, { useEffect, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import axios from 'axios';
import AddOrderForm from '../components/AddOrderForm';

const Order = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [rowCount, setRowCount] = useState(0);
  const [addOpen, setAddOpen] = useState(false);

  // Move fetchOrders outside useEffect
  const fetchOrders = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`http://localhost:3000/api/order/allorders?page=${page + 1}&limit=${pageSize}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setOrders(res.data.orders.map((order) => ({
        id: order._id,
        invoiceNumber: order.invoiceNumber,
        client: order.customerSnapshot?.name || 'N/A',
        clientMobile: order.customerSnapshot?.mobile || 'N/A',
        eventDate: order.eventDate ? new Date(order.eventDate).toLocaleDateString() : '',
        venue: order.venue || 'N/A',
        services: Array.isArray(order.services) ? order.services.map(s => s.service).join(', ') : '',
        tax: order.tax,
        discount: order.discount,
        finalTotal: order.finalTotal,
        advanceAmount: order.advanceAmount,
        dueAmount: order.dueAmount,
        status: order.status,
        createdAt: order.createdAt ? new Date(order.createdAt).toLocaleString() : '',
      })));
      setRowCount(res.data.totalCount);
    } catch (err) {
      setError('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [page, pageSize]);

  const columns = [
    { field: 'invoiceNumber', headerName: 'Invoice #', width: 120 },
    { field: 'client', headerName: 'Client Name', width: 160 },
    { field: 'clientMobile', headerName: 'Client Mobile', width: 140 },
    { field: 'eventDate', headerName: 'Event Date', width: 120 },
    { field: 'venue', headerName: 'Venue', width: 140 },
    { field: 'services', headerName: 'Services', width: 180 },
    { field: 'tax', headerName: 'Tax', width: 80 },
    { field: 'discount', headerName: 'Discount', width: 100 },
    { field: 'finalTotal', headerName: 'Final Total', width: 120, valueFormatter: ({ value }) => `₹${value}` },
    { field: 'advanceAmount', headerName: 'Advance', width: 100, valueFormatter: ({ value }) => `₹${value}` },
    { field: 'dueAmount', headerName: 'Due', width: 100, valueFormatter: ({ value }) => `₹${value}` },
    { field: 'status', headerName: 'Status', width: 120 },
    { field: 'createdAt', headerName: 'Created At', width: 160 },
  ];

  return (
    <Box sx={{ backgroundColor: '#fff', p: 3 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" fontWeight="bold" color="text.primary">
          Orders Overview
        </Typography>
        <Button variant="contained" color="primary" onClick={() => setAddOpen(true)}>
          + New Order
        </Button>
      </Box>
      {/* Orders DataGrid */}
      <Paper elevation={3} sx={{ height: 500, p: 2 }}>
        <DataGrid
          rows={orders}
          columns={columns}
          loading={loading}
          error={error}
          page={page}
          pageSize={pageSize}
          rowCount={rowCount}
          pagination
          paginationMode="server"
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
          rowsPerPageOptions={[5, 10, 20, 50]}
          disableSelectionOnClick
          sx={{ backgroundColor: '#fff' }}
        />
        {error && <Typography color="error" mt={2}>{error}</Typography>}
      </Paper>
      <AddOrderForm open={addOpen} onClose={() => setAddOpen(false)} onOrderAdded={fetchOrders} />
    </Box>
  );
};

export default Order;
