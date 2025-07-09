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
  Chip
} from '@mui/material';

const Enquries = () => {
  const [open, setOpen] = useState(false);
  const [newEnquiry, setNewEnquiry] = useState({
    name: '',
    contact: '',
    service: '',
    status: 'New',
  });

  const [enquiries, setEnquiries] = useState([
    { id: 1, name: 'Aayesha Shaikh', contact: '9876543210', service: 'Wedding Shoot', status: 'Follow Up' },
    { id: 2, name: 'Jay Patil', contact: '9822334455', service: 'Product Photography', status: 'Booked' },
  ]);

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setNewEnquiry({ name: '', contact: '', service: '', status: 'New' });
  };

  const handleChange = (e) => {
    setNewEnquiry({ ...newEnquiry, [e.target.name]: e.target.value });
  };

  const handleAddEnquiry = () => {
    const id = enquiries.length + 1;
    setEnquiries([...enquiries, { id, ...newEnquiry }]);
    handleClose();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Booked':
        return 'success';
      case 'Follow Up':
        return 'info';
      case 'New':
        return 'warning';
      default:
        return 'default';
    }
  };

  return (
    <Box sx={{ backgroundColor: '#fff', minHeight: '100vh', p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" fontWeight="bold">
           Enquiries Overview
        </Typography>
        <Button variant="contained" color="primary" onClick={handleOpen}>
           Add Enquiry
        </Button>
      </Box>

      <Paper elevation={3} sx={{ p: 3 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>ID</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Name</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Contact</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Service</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {enquiries.map((enquiry) => (
              <TableRow key={enquiry.id} hover>
                <TableCell>{enquiry.id}</TableCell>
                <TableCell>{enquiry.name}</TableCell>
                <TableCell>{enquiry.contact}</TableCell>
                <TableCell>{enquiry.service}</TableCell>
                <TableCell>
                  <Chip
                    label={enquiry.status}
                    color={getStatusColor(enquiry.status)}
                    size="small"
                    variant="outlined"
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>

      {/* Enquiry Form Dialog */}
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle>Add New Enquiry</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            margin="normal"
            label="Name"
            name="name"
            value={newEnquiry.name}
            onChange={handleChange}
          />
          <TextField
            fullWidth
            margin="normal"
            label="Contact"
            name="contact"
            value={newEnquiry.contact}
            onChange={handleChange}
          />
          <TextField
            fullWidth
            margin="normal"
            label="Service Required"
            name="service"
            value={newEnquiry.service}
            onChange={handleChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="inherit">Cancel</Button>
          <Button onClick={handleAddEnquiry} variant="contained">Add</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Enquries;
