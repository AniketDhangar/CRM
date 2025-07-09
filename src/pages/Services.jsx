import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem
} from '@mui/material';

const Services = () => {
  const [open, setOpen] = useState(false);

  const [newService, setNewService] = useState({
    title: '',
    category: '',
    price: ''
  });

  const [services, setServices] = useState([
    { id: 1, title: 'Wedding Photography', category: 'Event', price: '₹15,000' },
    { id: 2, title: 'Product Shoot', category: 'Commercial', price: '₹5,000' },
    { id: 3, title: 'Passport Photo', category: 'Studio', price: '₹200' }
  ]);

  const serviceOptions = [
    'Maternity Photoshoot',
    'New Born Baby Photoshoot',
    'Kids Photoshoot',
    'Family Photoshoot',
    'Wedding Photography',
    'Product Shoot',
    'Passport Photo'
  ];

  const categoryOptions = [
    'Event',
    'Commercial',
    'Studio',
    'Outdoor',
    'Baby',
    'Family',
    'Others'
  ];

  const handleOpen = () => setOpen(true);

  const handleClose = () => {
    setOpen(false);
    setNewService({ title: '', category: '', price: '' });
  };

  const handleChange = (e) => {
    setNewService({ ...newService, [e.target.name]: e.target.value });
  };

  const handleAddService = () => {
    const id = services.length + 1;
    if (!newService.title || !newService.category || !newService.price) return; // Avoid empty fields
    setServices([...services, { id, ...newService }]);
    handleClose();
  };

  return (
    <Box sx={{ backgroundColor: '#fff', minHeight: '100vh', p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" fontWeight="bold">
          Services Overview
        </Typography>
        <Button variant="contained" color="primary" onClick={handleOpen}>
          Add Service
        </Button>
      </Box>

      <Paper elevation={3} sx={{ p: 3 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>Service ID</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Title</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Category</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Price</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {services.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  No services added yet.
                </TableCell>
              </TableRow>
            ) : (
              services.map((service) => (
                <TableRow key={service.id}>
                  <TableCell>{service.id}</TableCell>
                  <TableCell>{service.title}</TableCell>
                  <TableCell>{service.category}</TableCell>
                  <TableCell>{service.price}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Paper>

      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle>Add New Service</DialogTitle>
        <DialogContent>
          <TextField
            select
            label="Service Title"
            name="title"
            fullWidth
            margin="normal"
            value={newService.title}
            onChange={handleChange}
          >
            {serviceOptions.map((option, index) => (
              <MenuItem key={index} value={option}>
                {option}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            select
            label="Category"
            name="category"
            fullWidth
            margin="normal"
            value={newService.category}
            onChange={handleChange}
          >
            {categoryOptions.map((option, index) => (
              <MenuItem key={index} value={option}>
                {option}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            label="Price"
            name="price"
            fullWidth
            margin="normal"
            value={newService.price}
            onChange={handleChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleAddService} variant="contained">
            Add
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Services;
