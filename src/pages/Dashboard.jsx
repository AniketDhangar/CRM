import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Avatar,
} from '@mui/material';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';

import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import MoneyIcon from '@mui/icons-material/AttachMoney';
import BuildIcon from '@mui/icons-material/Build';
import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import axios from 'axios';

// Stats section
// Remove hardcoded stats
// const stats = [
//   { label: 'Total Orders', value: 120, icon: <ShoppingCartIcon />, color: '#1976d2' },
//   { label: 'Revenue', value: '₹1,25,000', icon: <MoneyIcon />, color: '#2e7d32' },
//   { label: 'Services Offered', value: 15, icon: <BuildIcon />, color: '#ed6c02' },
//   { label: 'New Enquiries', value: 23, icon: <QuestionAnswerIcon />, color: '#d81b60' },
// ];

// Booked orders (events)
const bookedOrders = [
  { title: 'Order - Jay Jadhav', date: '2025-07-06' },
  { title: 'Order - Aniket Dhangar', date: '2025-07-07' },
  { title: 'Order - Tejashu Saner', date: '2025-07-05' },
];

const Dashboard = () => {
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const token = localStorage.getItem('token'); // Get JWT token from localStorage
        const res = await axios.get('http://localhost:3000/api/revenue/reports', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setAnalytics(res.data);
      } catch (err) {
        setError('Failed to load analytics');
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();

    // Fetch orders for calendar
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem('token');
        // Fetch a large number of orders for the calendar (adjust limit as needed)
        const res = await axios.get('http://localhost:3000/api/order/allorders?page=1&limit=100', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const events = (res.data.orders || []).map(order => ({
          title: `${order.customerSnapshot?.name || 'Order'} (${order.invoiceNumber})`,
          date: order.eventDate,
          backgroundColor: '#e53935',
          borderColor: '#c62828',
          textColor: '#fff',
        }));
        setCalendarEvents(events);
      } catch (err) {
        // Optionally handle error
      }
    };
    fetchOrders();
  }, []);

  const handleDateClick = (info) => {
    alert(`You clicked on ${info.dateStr}. Here you can open a booking form.`);
  };

  // Helper: Format month labels
  const formatMonth = (item) => {
    if (!item || !item._id) return '';
    const { year, month } = item._id;
    return `${month}/${year}`;
  };

  // Colors for pie chart
  const pieColors = ['#1976d2', '#2e7d32', '#ed6c02', '#d81b60', '#6a1b9a', '#00838f', '#fbc02d'];

  return (
    <Box sx={{ backgroundColor: '#fff', minHeight: '100vh', p: 3 }}>
      {/* Header */}
      <Typography variant="h5" fontWeight="bold" mb={3} color="text.primary">
        Welcome to Photo Studio CRM Dashboard
      </Typography>

      {/* Stats Cards (from backend) */}
      <Grid container spacing={3} mb={3}>
        {loading ? (
          <Grid item xs={12}><Typography>Loading stats...</Typography></Grid>
        ) : error ? (
          <Grid item xs={12}><Typography color="error">{error}</Typography></Grid>
        ) : analytics ? (
          <>
            <Grid item xs={12} sm={6} md={3}>
              <Paper elevation={3} sx={{ p: 2, display: 'flex', alignItems: 'center', backgroundColor: '#fafafa', borderRadius: 2, borderLeft: '4px solid #1976d2' }}>
                <Avatar sx={{ bgcolor: '#1976d2', mr: 2 }}><ShoppingCartIcon /></Avatar>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Total Orders</Typography>
                  <Typography variant="h6" fontWeight="bold" color="text.primary">{analytics.totalOrders}</Typography>
                </Box>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Paper elevation={3} sx={{ p: 2, display: 'flex', alignItems: 'center', backgroundColor: '#fafafa', borderRadius: 2, borderLeft: '4px solid #2e7d32' }}>
                <Avatar sx={{ bgcolor: '#2e7d32', mr: 2 }}><MoneyIcon /></Avatar>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Revenue</Typography>
                  <Typography variant="h6" fontWeight="bold" color="text.primary">₹{analytics.totalRevenue}</Typography>
                </Box>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Paper elevation={3} sx={{ p: 2, display: 'flex', alignItems: 'center', backgroundColor: '#fafafa', borderRadius: 2, borderLeft: '4px solid #ed6c02' }}>
                <Avatar sx={{ bgcolor: '#ed6c02', mr: 2 }}><BuildIcon /></Avatar>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Services Offered</Typography>
                  <Typography variant="h6" fontWeight="bold" color="text.primary">{analytics.totalServices}</Typography>
                </Box>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Paper elevation={3} sx={{ p: 2, display: 'flex', alignItems: 'center', backgroundColor: '#fafafa', borderRadius: 2, borderLeft: '4px solid #d81b60' }}>
                <Avatar sx={{ bgcolor: '#d81b60', mr: 2 }}><QuestionAnswerIcon /></Avatar>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">New Enquiries</Typography>
                  <Typography variant="h6" fontWeight="bold" color="text.primary">N/A</Typography>
                </Box>
              </Paper>
            </Grid>
          </>
        ) : null}
      </Grid>

      {/* Analytics Section */}
      <Box mt={4} mb={4}>
        <Typography variant="h6" fontWeight="bold" mb={2} color="text.primary">
          Analytics Overview
        </Typography>
        {loading ? (
          <Typography>Loading analytics...</Typography>
        ) : error ? (
          <Typography color="error">{error}</Typography>
        ) : analytics ? (
          <Grid container spacing={3}>
            {/* Revenue per Month Bar Chart */}
            <Grid item xs={12} md={6}>
              <Paper elevation={3} sx={{ p: 2 }}>
                <Typography variant="subtitle1" fontWeight="bold" mb={2}>Revenue per Month</Typography>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={Array.isArray(analytics.revenuePerMonth) ? analytics.revenuePerMonth : []}>
                    <XAxis dataKey={formatMonth} tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip formatter={(v) => `₹${v}`} labelFormatter={(_, p) => formatMonth(p && p[0] && p[0].payload)} />
                    <Bar dataKey="totalRevenue" fill="#1976d2" name="Revenue" />
                  </BarChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>
            {/* New Customers per Month Bar Chart */}
            <Grid item xs={12} md={6}>
              <Paper elevation={3} sx={{ p: 2 }}>
                <Typography variant="subtitle1" fontWeight="bold" mb={2}>New Customers per Month</Typography>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={Array.isArray(analytics.newCustomersPerMonth) ? analytics.newCustomersPerMonth : []}>
                    <XAxis dataKey={formatMonth} tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip labelFormatter={(_, p) => formatMonth(p && p[0] && p[0].payload)} />
                    <Bar dataKey="count" fill="#2e7d32" name="New Customers" />
                  </BarChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>
            {/* Service Breakdown Pie Chart */}
            <Grid item xs={12} md={6}>
              <Paper elevation={3} sx={{ p: 2 }}>
                <Typography variant="subtitle1" fontWeight="bold" mb={2}>Service Revenue Breakdown</Typography>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={Array.isArray(analytics.serviceBreakdown) ? analytics.serviceBreakdown : []}
                      dataKey="totalRevenue"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label={({ name }) => name}
                    >
                      {(Array.isArray(analytics.serviceBreakdown) ? analytics.serviceBreakdown : []).map((entry, idx) => (
                        <Cell key={`cell-${idx}`} fill={pieColors[idx % pieColors.length]} />
                      ))}
                    </Pie>
                    <Legend />
                    <Tooltip formatter={(v) => `₹${v}`} />
                  </PieChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>
          </Grid>
        ) : null}
      </Box>

      {/* Calendar Section */}
      <Paper elevation={3} sx={{ p: 2 }}>
        <Typography variant="h6" fontWeight="bold" mb={2}>
          Booking Calendar
        </Typography>
        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          height="auto"
          events={calendarEvents}
          dateClick={handleDateClick}
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,dayGridWeek',
          }}
          dayMaxEventRows={3}
          eventContent={(arg) => (
            <Box
              sx={{
                backgroundColor: arg.event.backgroundColor,
                color: arg.event.textColor,
                px: 0.5,
                py: 0.2,
                borderRadius: '4px',
                fontSize: '12px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {arg.event.title}
            </Box>
          )}
          dayCellContent={(e) => (
            <div style={{ padding: '4px', fontWeight: 'bold', fontSize: '13px' }}>
              {e.dayNumberText}
            </div>
          )}
        />
      </Paper>
    </Box>
  );
};

export default Dashboard;
