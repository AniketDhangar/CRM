import React, { useEffect, useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, MenuItem, Select, InputLabel, FormControl, Grid, Typography, IconButton, Box
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import axios from 'axios';

const defaultService = { service: '', date: '', qty: 1, days: 1, salePrice: 0, total: 0 };

const AddOrderForm = ({ open, onClose, onOrderAdded }) => {
  const [servicesList, setServicesList] = useState([]);
  const [form, setForm] = useState({
    customer: { name: '', mobile: '', email: '', address: '', city: '' },
    eventDate: '',
    venue: '',
    services: [ { ...defaultService } ],
    tax: 0,
    discount: 0,
    advanceAmount: 0,
    status: 'pending',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch services
  useEffect(() => {
    const fetchServices = async () => {
      if (!open) return;
      try {
        const token = localStorage.getItem('token');
        const servRes = await axios.get('http://localhost:3000/api/service/allservices', { 
          headers: { Authorization: `Bearer ${token}` } 
        });
        setServicesList(servRes.data.data || []);
      } catch (err) {
        setError(err.response?.data?.message || err.message || 'Failed to load services');
        console.error('Service fetch error:', err);
      }
    };
    fetchServices();
  }, [open]);

  // Calculate totals
  const subtotal = form.services.reduce((sum, s) => sum + (Number(s.total) || 0), 0);
  const taxAmount = subtotal * (Number(form.tax) / 100);
  const finalTotal = subtotal + taxAmount - Number(form.discount || 0);
  const dueAmount = finalTotal - Number(form.advanceAmount || 0);

  // Handle form changes
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  const handleCustomerField = (e) => {
    setForm({ ...form, customer: { ...form.customer, [e.target.name]: e.target.value } });
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
    setForm({ ...form, services: [ ...form.services, { ...defaultService } ] });
  };
  const removeService = (idx) => {
    if (form.services.length > 1) {
      setForm({ ...form, services: form.services.filter((_, i) => i !== idx) });
    }
  };

  // On submit: create customer, then order
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      // 1. Create customer
      const customerPayload = { ...form.customer };
      const customerRes = await axios.post('http://localhost:3000/api/customer/addcustomer', customerPayload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const customerId = customerRes.data.customer._id;
      // 2. Create order with new customerId
      const orderPayload = {
        customerId,
        eventDate: form.eventDate,
        venue: form.venue,
        services: form.services.map(s => ({
          service: s.service,
          date: s.date,
          qty: Number(s.qty),
          days: Number(s.days),
          salePrice: Number(s.salePrice),
          total: Number(s.qty) * Number(s.salePrice)
        })),
        tax: Number(form.tax),
        discount: Number(form.discount),
        advanceAmount: Number(form.advanceAmount),
        status: form.status,
      };
      await axios.post('http://localhost:3000/api/order/addorder', orderPayload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (onOrderAdded) onOrderAdded();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Add New Order</DialogTitle>
      <DialogContent dividers>
        {error && <Typography color="error" mb={2}>{error}</Typography>}
        <form onSubmit={handleSubmit} id="add-order-form">
          <Grid container spacing={2}>
            {/* Customer fields */}
            <Grid item xs={12} sm={4}>
              <TextField name="name" label="Customer Name" value={form.customer.name} onChange={handleCustomerField} fullWidth required />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField name="mobile" label="Mobile" value={form.customer.mobile} onChange={handleCustomerField} fullWidth required />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField name="email" label="Email" value={form.customer.email} onChange={handleCustomerField} fullWidth />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField name="city" label="City" value={form.customer.city} onChange={handleCustomerField} fullWidth />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField name="address" label="Address" value={form.customer.address} onChange={handleCustomerField} fullWidth />
            </Grid>
            {/* Order fields */}
            <Grid item xs={12} sm={6}>
              <TextField
                name="eventDate"
                label="Event Date"
                type="date"
                value={form.eventDate}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="venue"
                label="Venue"
                value={form.venue}
                onChange={handleChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="status"
                label="Status"
                select
                value={form.status}
                onChange={handleChange}
                fullWidth
              >
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="approved">Approved</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
                <MenuItem value="cancelled">Cancelled</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle1" fontWeight="bold" mb={1}>Services</Typography>
              {form.services.map((s, idx) => (
                <Grid container spacing={1} key={idx} alignItems="center" mb={1}>
                  <Grid item xs={12} sm={3}>
                    <FormControl fullWidth required>
                      <InputLabel>Service</InputLabel>
                      <Select
                        value={s.service}
                        label="Service"
                        onChange={e => handleServiceChange(idx, 'service', e.target.value)}
                      >
                        {servicesList.map(serv => (
                          <MenuItem key={serv._id} value={serv._id}>{serv.name}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={2}>
                    <TextField
                      label="Date"
                      type="date"
                      value={s.date}
                      onChange={e => handleServiceChange(idx, 'date', e.target.value)}
                      InputLabelProps={{ shrink: true }}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12} sm={1}>
                    <TextField
                      label="Qty"
                      type="number"
                      value={s.qty}
                      onChange={e => handleServiceChange(idx, 'qty', e.target.value)}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12} sm={1}>
                    <TextField
                      label="Days"
                      type="number"
                      value={s.days}
                      onChange={e => handleServiceChange(idx, 'days', e.target.value)}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12} sm={2}>
                    <TextField
                      label="Sale Price"
                      type="number"
                      value={s.salePrice}
                      onChange={e => handleServiceChange(idx, 'salePrice', e.target.value)}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12} sm={2}>
                    <TextField
                      label="Total"
                      value={Number(s.qty) * Number(s.salePrice) || 0}
                      InputProps={{ readOnly: true }}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12} sm={1}>
                    <IconButton onClick={() => removeService(idx)} disabled={form.services.length === 1} color="error">
                      <RemoveIcon />
                    </IconButton>
                  </Grid>
                </Grid>
              ))}
              <Button startIcon={<AddIcon />} onClick={addService} sx={{ mt: 1 }}>Add Service</Button>
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                name="tax"
                label="Tax (%)"
                type="number"
                value={form.tax}
                onChange={handleChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                name="discount"
                label="Discount (₹)"
                type="number"
                value={form.discount}
                onChange={handleChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                name="advanceAmount"
                label="Advance (₹)"
                type="number"
                value={form.advanceAmount}
                onChange={handleChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                label="Due (₹)"
                value={dueAmount}
                InputProps={{ readOnly: true }}
                fullWidth
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="body2" color="text.secondary">
                Subtotal: ₹{subtotal} &nbsp; | &nbsp; Tax: ₹{taxAmount} &nbsp; | &nbsp; Final Total: ₹{finalTotal}
              </Typography>
            </Grid>
          </Grid>
        </form>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary">Cancel</Button>
        <Button type="submit" form="add-order-form" variant="contained" color="primary" disabled={loading}>
          {loading ? 'Adding...' : 'Add Order'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddOrderForm; 