import React, { useEffect, useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, MenuItem, Select, InputLabel, FormControl, Grid, Typography, IconButton, Box, Chip
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import axios from 'axios';

const defaultService = { service: '', date: '', qty: 1, days: 1, salePrice: 0, total: 0 };

const EditOrderForm = ({ open, onClose, onOrderUpdated, orderId }) => {
  const [servicesList, setServicesList] = useState([]);
  const [form, setForm] = useState({
    eventDate: '',
    venue: '',
    services: [{ ...defaultService }],
    tax: 0,
    discount: 0,
    advanceAmount: 0,
    status: 'pending',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [orderData, setOrderData] = useState(null);
  const [initialForm, setInitialForm] = useState(null);

  // Fetch services and order data
  useEffect(() => {
    const fetchData = async () => {
      if (!open || !orderId) return;
      
      try {
        const token = localStorage.getItem('token');
        
        // Fetch services
        const servRes = await axios.get('http://localhost:3000/api/service/allservices', { 
          headers: { Authorization: `Bearer ${token}` } 
        });
        setServicesList(servRes.data.data || []);

        // Fetch order data
        const orderRes = await axios.post('http://localhost:3000/api/order/orderbyid', 
          { _id: orderId },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        const order = orderRes.data.order;
        const services = orderRes.data.services || [];
        
        setOrderData(orderRes.data);
        const newForm = {
          eventDate: order.eventDate ? new Date(order.eventDate).toISOString().split('T')[0] : '',
          venue: order.venue || '',
          services: services.length > 0 ? services.map(s => ({
            service: s.service?._id || s.service || '',
            date: s.date ? new Date(s.date).toISOString().split('T')[0] : '',
            qty: s.qty || 1,
            days: s.days || 1,
            salePrice: s.salePrice || 0,
            total: s.total || 0
          })) : [{ ...defaultService }],
          tax: order.tax || 0,
          discount: order.discount || 0,
          advanceAmount: order.advanceAmount || 0,
          status: order.status || 'pending',
        };
        setForm(newForm);
        setInitialForm(newForm);
      } catch (err) {
        setError(err.response?.data?.message || err.message || 'Failed to load data');
        console.error('Data fetch error:', err);
      }
    };
    
    fetchData();
  }, [open, orderId]);

  // Calculate totals
  const subtotal = form.services.reduce((sum, s) => sum + (Number(s.total) || 0), 0);
  const taxAmount = subtotal * (Number(form.tax) / 100);
  const finalTotal = subtotal + taxAmount - Number(form.discount || 0);
  const dueAmount = finalTotal - Number(form.advanceAmount || 0);

  // Handle form changes
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleServiceChange = (idx, field, value) => {
    const updated = form.services.map((s, i) => {
      if (i === idx) {
        const newService = { ...s, [field]: value };
        if (field === 'qty' || field === 'salePrice') {
          newService.total = Number(newService.qty) * Number(newService.salePrice);
        }
        return newService;
      }
      return s;
    });
    setForm({ ...form, services: updated });
  };

  const addService = () => {
    setForm({ ...form, services: [...form.services, { ...defaultService }] });
  };

  const removeService = (idx) => {
    if (form.services.length > 1) {
      setForm({ ...form, services: form.services.filter((_, i) => i !== idx) });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      // Only send changed fields
      let payload = { _id: orderId };
      if (initialForm) {
        Object.keys(form).forEach(key => {
          if (key === 'services') {
            // Compare services arrays (shallow)
            if (JSON.stringify(form.services) !== JSON.stringify(initialForm.services)) {
              payload.services = form.services.map(s => ({
                ...s,
                qty: Number(s.qty),
                days: Number(s.days),
                salePrice: Number(s.salePrice),
                total: Number(s.total)
              }));
            }
          } else if (form[key] !== initialForm[key]) {
            payload[key] = form[key];
          }
        });
      } else {
        // Fallback: send all fields if initialForm is not set
        payload = {
          _id: orderId,
          ...form,
          services: form.services.map(s => ({
            ...s,
            qty: Number(s.qty),
            days: Number(s.days),
            salePrice: Number(s.salePrice),
            total: Number(s.total)
          })),
          tax: Number(form.tax),
          discount: Number(form.discount),
          advanceAmount: Number(form.advanceAmount),
        };
      }
      
      await axios.patch('http://localhost:3000/api/order/updateorder', payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (onOrderUpdated) onOrderUpdated();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update order');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'approved': return 'info';
      case 'completed': return 'success';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        Edit Order
        {orderData && (
          <Box sx={{ mt: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Invoice: {orderData.order?.invoiceNumber}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Customer: {orderData.snapshot?.name}
            </Typography>
          </Box>
        )}
      </DialogTitle>
      
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Grid container spacing={2}>
            {/* Event Details */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Event Date"
                type="date"
                name="eventDate"
                value={form.eventDate}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Venue"
                name="venue"
                value={form.venue}
                onChange={handleChange}
                required
              />
            </Grid>

            {/* Status */}
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  label="Status"
                >
                  <MenuItem value="pending">
                    <Chip label="Pending" color="warning" size="small" />
                  </MenuItem>
                  <MenuItem value="approved">
                    <Chip label="Approved" color="info" size="small" />
                  </MenuItem>
                  <MenuItem value="completed">
                    <Chip label="Completed" color="success" size="small" />
                  </MenuItem>
                  <MenuItem value="cancelled">
                    <Chip label="Cancelled" color="error" size="small" />
                  </MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Services Section */}
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Services</Typography>
                <Button
                  startIcon={<AddIcon />}
                  onClick={addService}
                  variant="outlined"
                  size="small"
                >
                  Add Service
                </Button>
              </Box>
              
              {form.services.map((service, idx) => (
                <Box key={idx} sx={{ border: 1, borderColor: 'divider', p: 2, mb: 2, borderRadius: 1 }}>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} md={3}>
                      <FormControl fullWidth>
                        <InputLabel>Service</InputLabel>
                        <Select
                          value={service.service}
                          onChange={(e) => handleServiceChange(idx, 'service', e.target.value)}
                          label="Service"
                        >
                          {servicesList.map((s) => (
                            <MenuItem key={s._id} value={s._id}>
                              {s.name}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    
                    <Grid item xs={12} md={2}>
                      <TextField
                        fullWidth
                        label="Date"
                        type="date"
                        value={service.date}
                        onChange={(e) => handleServiceChange(idx, 'date', e.target.value)}
                        InputLabelProps={{ shrink: true }}
                      />
                    </Grid>
                    
                    <Grid item xs={6} md={1}>
                      <TextField
                        fullWidth
                        label="Qty"
                        type="number"
                        value={service.qty}
                        onChange={(e) => handleServiceChange(idx, 'qty', e.target.value)}
                        inputProps={{ min: 1 }}
                      />
                    </Grid>
                    
                    <Grid item xs={6} md={1}>
                      <TextField
                        fullWidth
                        label="Days"
                        type="number"
                        value={service.days}
                        onChange={(e) => handleServiceChange(idx, 'days', e.target.value)}
                        inputProps={{ min: 1 }}
                      />
                    </Grid>
                    
                    <Grid item xs={6} md={2}>
                      <TextField
                        fullWidth
                        label="Rate (₹)"
                        type="number"
                        value={service.salePrice}
                        onChange={(e) => handleServiceChange(idx, 'salePrice', e.target.value)}
                        inputProps={{ min: 0 }}
                      />
                    </Grid>
                    
                    <Grid item xs={6} md={2}>
                      <TextField
                        fullWidth
                        label="Total (₹)"
                        type="number"
                        value={service.total}
                        InputProps={{ readOnly: true }}
                      />
                    </Grid>
                    
                    <Grid item xs={12} md={1}>
                      <IconButton
                        onClick={() => removeService(idx)}
                        disabled={form.services.length === 1}
                        color="error"
                      >
                        <RemoveIcon />
                      </IconButton>
                    </Grid>
                  </Grid>
                </Box>
              ))}
            </Grid>

            {/* Financial Summary */}
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mb: 2 }}>Financial Summary</Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={3}>
                  <TextField
                    fullWidth
                    label="Subtotal (₹)"
                    type="number"
                    value={subtotal}
                    InputProps={{ readOnly: true }}
                  />
                </Grid>
                
                <Grid item xs={12} md={3}>
                  <TextField
                    fullWidth
                    label="Tax (%)"
                    type="number"
                    name="tax"
                    value={form.tax}
                    onChange={handleChange}
                    inputProps={{ min: 0, max: 100 }}
                  />
                </Grid>
                
                <Grid item xs={12} md={3}>
                  <TextField
                    fullWidth
                    label="Discount (₹)"
                    type="number"
                    name="discount"
                    value={form.discount}
                    onChange={handleChange}
                    inputProps={{ min: 0 }}
                  />
                </Grid>
                
                <Grid item xs={12} md={3}>
                  <TextField
                    fullWidth
                    label="Advance (₹)"
                    type="number"
                    name="advanceAmount"
                    value={form.advanceAmount}
                    onChange={handleChange}
                    inputProps={{ min: 0 }}
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Final Total (₹)"
                    type="number"
                    value={finalTotal}
                    InputProps={{ readOnly: true }}
                    sx={{ '& .MuiInputBase-input': { fontWeight: 'bold', color: 'primary.main' } }}
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Due Amount (₹)"
                    type="number"
                    value={dueAmount}
                    InputProps={{ readOnly: true }}
                    sx={{ '& .MuiInputBase-input': { fontWeight: 'bold', color: 'error.main' } }}
                  />
                </Grid>
              </Grid>
            </Grid>
          </Grid>
          
          {error && (
            <Typography color="error" sx={{ mt: 2 }}>
              {error}
            </Typography>
          )}
        </DialogContent>
        
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button 
            type="submit" 
            variant="contained" 
            disabled={loading}
          >
            {loading ? 'Updating...' : 'Update Order'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default EditOrderForm; 