import React, { useEffect, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  IconButton,
  Tooltip,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  Chip,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import PrintIcon from '@mui/icons-material/Print';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import axios from 'axios';
import AddOrderForm from '../components/AddOrderForm';
import EditOrderForm from '../components/EditOrderForm';

const Order = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [rowCount, setRowCount] = useState(0);
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [printLoading, setPrintLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [deleteDialog, setDeleteDialog] = useState({ open: false, orderId: null, orderNumber: '' });

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

      // Use backend data directly, all fields are already present and formatted
      setOrders(res.data.orders.map(order => {
        const serviceNames = Array.isArray(order.servicesRaw) && order.servicesRaw.length > 0
          ? order.servicesRaw.map(s => {
            if (s.service && typeof s.service === 'object' && s.service.name) return s.service.name;
            if (typeof s.service === 'string') return `ID: ${s.service}`;
            if (s.name) return s.name;
            return 'Unknown';
          })
          : [];
        // Debug: log each order's financial fields
        console.log('Order row:', {
          id: order.id,
          tax: order.tax,
          discount: order.discount,
          finalTotal: order.finalTotal,
          advanceAmount: order.advanceAmount,
          dueAmount: order.dueAmount
        });
        return {
          ...order,
          serviceNames
        };
      }));
      setRowCount(res.data.totalCount);
      console.log('Fetched orders:', res.data.orders);
    } catch (err) {
      setError('Failed to load orders');
      console.error('Fetch orders error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [page, pageSize]);

  // Print functions
  const handlePrint = async (orderId, type = 'invoice') => {
    setPrintLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `http://localhost:3000/api/pdf/order/${orderId}/pdf?type=${type}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          responseType: 'blob',
        }
      );

      // Create blob URL and download
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${type}-${orderId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      setSnackbar({
        open: true,
        message: `${type.charAt(0).toUpperCase() + type.slice(1)} downloaded successfully!`,
        severity: 'success'
      });
    } catch (error) {
      console.error('Print error:', error);
      setSnackbar({
        open: true,
        message: 'Failed to generate PDF',
        severity: 'error'
      });
    } finally {
      setPrintLoading(false);
    }
  };

  // Quick print invoice
  const handleQuickPrint = async (orderId) => {
    setPrintLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `http://localhost:3000/api/pdf/order/${orderId}/pdf?type=invoice`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          responseType: 'blob',
        }
      );

      // Open PDF in new window for printing
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const newWindow = window.open(url, '_blank');

      if (newWindow) {
        newWindow.onload = () => {
          newWindow.print();
        };
      }

      setSnackbar({
        open: true,
        message: 'Invoice opened for printing!',
        severity: 'success'
      });
    } catch (error) {
      console.error('Print error:', error);
      setSnackbar({
        open: true,
        message: 'Failed to open invoice for printing',
        severity: 'error'
      });
    } finally {
      setPrintLoading(false);
    }
  };

  // Delete order
  const handleDeleteOrder = async (orderId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete('http://localhost:3000/api/order/deleteorder', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        data: { _id: orderId }
      });

      setSnackbar({
        open: true,
        message: 'Order deleted successfully!',
        severity: 'success'
      });

      // Refresh the orders list
      fetchOrders();
    } catch (error) {
      console.error('Delete error:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Failed to delete order',
        severity: 'error'
      });
    } finally {
      setDeleteDialog({ open: false, orderId: null, orderNumber: '' });
    }
  };

  // Open delete confirmation dialog
  const openDeleteDialog = (orderId, orderNumber) => {
    setDeleteDialog({ open: true, orderId, orderNumber });
  };

  // Close delete confirmation dialog
  const closeDeleteDialog = () => {
    setDeleteDialog({ open: false, orderId: null, orderNumber: '' });
  };

  // Handle edit order
  const handleEditOrder = (orderId) => {
    setSelectedOrderId(orderId);
    setEditOpen(true);
  };

  // Handle order updated
  const handleOrderUpdated = () => {
    fetchOrders();
    setSnackbar({
      open: true,
      message: 'Order updated successfully!',
      severity: 'success'
    });
  };

  // Get status chip color
  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'approved': return 'info';
      case 'completed': return 'success';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const columns = [
    { field: 'serial', headerName: 'S.No.', width: 80, sortable: false, filterable: false, renderCell: (params) => (params.rowIndex != null ? params.rowIndex + 1 : (orders.findIndex(o => o.id === params.row.id) + 1)) },
    { field: 'invoiceNumber', headerName: 'Invoice #', width: 120 },
    { field: 'client', headerName: 'Client Name', width: 160 },
    { field: 'clientMobile', headerName: 'Client Mobile', width: 140 },
    { field: 'eventDate', headerName: 'Event Date', width: 120 },
    { field: 'venue', headerName: 'Venue', width: 140 },
    // Remove the 'Services' column. Show service count as a Chip in the Service Names column.
    {
      field: 'serviceName',
      headerName: 'Service Names',
      width: 240,
      // Use renderCell to show names and count chip
      renderCell: (params) => {
        const serviceNames = params.row && Array.isArray(params.row.serviceNames) ? params.row.serviceNames : [];
        return (
          <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', width: '100%' }}>
            <span style={{ whiteSpace: 'normal', wordBreak: 'break-word', flex: 1 }}>
              {serviceNames.join(', ')}
            </span>
            <Chip
              label={serviceNames.length}
              color="primary"
              size="small"
              sx={{ ml: 1, mt: 0.5 }}
            />
          </Box>
        );
      },
    },
    { field: 'tax', headerName: 'Tax (%)', width: 100, renderCell: (params) => <span>{params.row.tax != null ? `${params.row.tax}%` : '0%'}</span> },
    { field: 'discount', headerName: 'Discount (₹)', width: 120, renderCell: (params) => <span>₹{params.row.discount != null ? params.row.discount : 0}</span> },
    { field: 'finalTotal', headerName: 'Final Total (₹)', width: 140, renderCell: (params) => <span>₹{params.row.finalTotal != null ? params.row.finalTotal : 0}</span> },
    { field: 'advanceAmount', headerName: 'Advance (₹)', width: 120, renderCell: (params) => <span>₹{params.row.advanceAmount != null ? params.row.advanceAmount : 0}</span> },
    { field: 'dueAmount', headerName: 'Due (₹)', width: 120, renderCell: (params) => <span>₹{params.row.dueAmount != null ? params.row.dueAmount : 0}</span> },
    {
      field: 'status',
      headerName: 'Status',
      width: 120,
      renderCell: (params) => (
        <Chip
          label={(params.value || 'pending').charAt(0).toUpperCase() + (params.value || 'pending').slice(1)}
          color={getStatusColor(params.value || 'pending')}
          size="small"
        />
      )
    },
    { field: 'createdAt', headerName: 'Created At', width: 160 },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 180,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Quick Print Invoice">
            <IconButton
              size="small"
              onClick={() => handleQuickPrint(params.row.id)}
              disabled={printLoading}
              color="primary"
            >
              <PrintIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Edit Order">
            <IconButton
              size="small"
              onClick={() => handleEditOrder(params.row.id)}
              disabled={printLoading}
              color="secondary"
            >
              <EditIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete Order">
            <IconButton
              size="small"
              onClick={() => openDeleteDialog(params.row.id, params.row.invoiceNumber)}
              disabled={printLoading}
              color="error"
            >
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
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

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog.open}
        onClose={closeDeleteDialog}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title">
          Confirm Delete Order
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            Are you sure you want to delete order <strong>{deleteDialog.orderNumber}</strong>?
            This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDeleteDialog} color="primary">
            Cancel
          </Button>
          <Button
            onClick={() => handleDeleteOrder(deleteDialog.orderId)}
            color="error"
            variant="contained"
            autoFocus
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>

      <AddOrderForm open={addOpen} onClose={() => setAddOpen(false)} onOrderAdded={fetchOrders} />
      <EditOrderForm
        open={editOpen}
        onClose={() => setEditOpen(false)}
        onOrderUpdated={handleOrderUpdated}
        orderId={selectedOrderId}
      />
    </Box>
  );
};

export default Order;
