import React from 'react';
import { Box } from '@mui/material';
import { Routes, Route } from 'react-router-dom';
import Dashboard from '../pages/Dashboard';
import Order from '../pages/Order';
import Expenses from '../pages/Expenses';
import Services from '../pages/Services';
import Enquries from '../pages/Enquries';

const MainContent = () => {
  return (
    <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/order" element={<Order />} />
        <Route path="/expenses" element={<Expenses />} />
        <Route path="/services" element={<Services />} />
        <Route path="/enquires" element={<Enquries />} />
    
      </Routes>
    </Box>
  );
};

export default MainContent;
