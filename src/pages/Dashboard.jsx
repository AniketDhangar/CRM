import React, { useState } from 'react';
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

// Stats section
const stats = [
  { label: 'Total Orders', value: 120, icon: <ShoppingCartIcon />, color: '#1976d2' },
  { label: 'Revenue', value: '₹1,25,000', icon: <MoneyIcon />, color: '#2e7d32' },
  { label: 'Services Offered', value: 15, icon: <BuildIcon />, color: '#ed6c02' },
  { label: 'New Enquiries', value: 23, icon: <QuestionAnswerIcon />, color: '#d81b60' },
];

// Booked orders (events)
const bookedOrders = [
  { title: 'Order - Jay Jadhav', date: '2025-07-06' },
  { title: 'Order - Aniket Dhangar', date: '2025-07-07' },
  { title: 'Order - Tejashu Saner', date: '2025-07-05' },
];

const Dashboard = () => {
  const [events] = useState(
    bookedOrders.map(order => ({
      title: order.title,
      date: order.date,
      backgroundColor: '#e53935',
      borderColor: '#c62828',
      textColor: '#fff',
    }))
  );

  const handleDateClick = (info) => {
    alert(`You clicked on ${info.dateStr}. Here you can open a booking form.`);
  };

  return (
    <Box sx={{ backgroundColor: '#fff', minHeight: '100vh', p: 3 }}>
      {/* Header */}
      <Typography variant="h5" fontWeight="bold" mb={3} color="text.primary">
        Welcome to Photo Studio CRM Dashboard
      </Typography>

      {/* Stats Cards */}
      <Grid container spacing={3} mb={3}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Paper
              elevation={3}
              sx={{
                p: 2,
                display: 'flex',
                alignItems: 'center',
                backgroundColor: '#fafafa',
                borderRadius: 2,
                borderLeft: `4px solid ${stat.color}`,
              }}
            >
              <Avatar sx={{ bgcolor: stat.color, mr: 2 }}>
                {stat.icon}
              </Avatar>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  {stat.label}
                </Typography>
                <Typography variant="h6" fontWeight="bold" color="text.primary">
                  {stat.value}
                </Typography>
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Calendar Section */}
      <Paper elevation={3} sx={{ p: 2 }}>
        <Typography variant="h6" fontWeight="bold" mb={2}>
          Booking Calendar
        </Typography>
        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          height="auto"
          events={events}
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
