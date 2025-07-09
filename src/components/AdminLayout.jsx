import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Drawer,
  IconButton,
  Typography,
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  Menu,
  MenuItem
} from '@mui/material';
import { Routes, Route, useNavigate } from 'react-router-dom';

import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import MoneyIcon from '@mui/icons-material/AttachMoney';
import BuildIcon from '@mui/icons-material/Build';
import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';

import Services from '../pages/Services';
import Order from '../pages/Order';
import Enquries from '../pages/Enquries';
import Dashboard from '../pages/Dashboard';
import Expenses from '../pages/Expenses';

const drawerWidth = 240;

const AdminLayout = () => {
  const [open, setOpen] = useState(false);
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const navigate = useNavigate();

  const handleAvatarClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleOpenProfile = () => {
    setProfileDialogOpen(true);
    handleCloseMenu();
  };

  const handleLogout = () => {
    handleCloseMenu();
    alert('Logged out!');
    // Add logout logic here
  };

  const toggleFullscreen = () => {
    const elem = document.documentElement;
    if (!isFullscreen) {
      if (elem.requestFullscreen) {
        elem.requestFullscreen();
      } else if (elem.webkitRequestFullscreen) {
        elem.webkitRequestFullscreen();
      } else if (elem.msRequestFullscreen) {
        elem.msRequestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }
    }
    setIsFullscreen(!isFullscreen);
  };

  const menuItems = [
    { text: 'Dashboard', path: '/dashboard', icon: <DashboardIcon /> },
    { text: 'Orders', path: '/orders', icon: <ShoppingCartIcon /> },
    { text: 'Expenses', path: '/expenses', icon: <MoneyIcon /> },
    { text: 'Services', path: '/services', icon: <BuildIcon /> },
    { text: 'Enquiries', path: '/enquiries', icon: <QuestionAnswerIcon /> },
  ];

  return (
    <>
      {/* Top AppBar */}
      <AppBar position="fixed" sx={{ backgroundColor: '#1e1e1e' }}>
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Box display="flex" alignItems="center">
            <IconButton color="inherit" onClick={() => setOpen(true)} sx={{ mr: 2 }}>
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" noWrap>
              Photo Studio CRM
            </Typography>
          </Box>

          <Box display="flex" alignItems="center" gap={1}>
            <IconButton
              onClick={toggleFullscreen}
              sx={{ display: { xs: 'none', md: 'inline-flex' }, color: '#fff' }}
            >
              {isFullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
            </IconButton>
            <IconButton onClick={handleAvatarClick}>
              <Avatar sx={{ bgcolor: '#2d2d2d', color: '#ffffff', fontWeight: 'bold' }}>
                S
              </Avatar>
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleCloseMenu}
            >
              <MenuItem onClick={handleOpenProfile}>Profile</MenuItem>
              <MenuItem onClick={handleLogout}>Logout</MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Side Drawer */}
      <Drawer
        anchor="left"
        open={open}
        onClose={() => setOpen(false)}
        sx={{
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            backgroundColor: '#121212',
            color: '#fff',
          },
        }}
      >
        <Box sx={{ p: 2, display: 'flex' }}>
          <IconButton onClick={() => setOpen(false)} sx={{ color: '#fff' }}>
            <CloseIcon />
          </IconButton>
        </Box>

        <Divider sx={{ backgroundColor: '#333' }} />

        <List>
          {menuItems.map((item, index) => (
            <ListItem key={index} disablePadding>
              <ListItemButton
                onClick={() => {
                  navigate(item.path);
                  setOpen(false);
                }}
              >
                <ListItemIcon sx={{ color: '#fff' }}>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Drawer>

      {/* Page Content */}
      <Box component="main" sx={{ mt: 8, p: 3 }}>
        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/orders" element={<Order />} />
          <Route path="/expenses" element={<Expenses />} />
          <Route path="/services" element={<Services />} />
          <Route path="/enquiries" element={<Enquries />} />
        </Routes>
      </Box>

      {/* Profile Dialog */}
      <Dialog
        open={profileDialogOpen}
        onClose={() => setProfileDialogOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Studio Profile</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2}>
            <Typography variant="body1">
              <strong>Studio Name:</strong> Pixel Lens Studio
            </Typography>
            <Typography variant="body1">
              <strong>Email:</strong> studio@example.com
            </Typography>
            <Typography variant="body1">
              <strong>Role:</strong> Admin
            </Typography>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setProfileDialogOpen(false)} color="inherit">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default AdminLayout;
