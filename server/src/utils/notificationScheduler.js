import cron from 'node-cron';
import Order from '../models/orderSchema.js';
import Customer from '../models/customerSchema.js';
import emailSender from './emailSender.js';
// import smsSender from './smsSender.js';

const REMINDER_DAYS = [7, 5, 2, 1];

// Runs every day at 8am
cron.schedule('0 8 * * *', async () => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (const daysBefore of REMINDER_DAYS) {
      const targetDate = new Date(today);
      targetDate.setDate(today.getDate() + daysBefore);
      const nextDay = new Date(targetDate);
      nextDay.setDate(targetDate.getDate() + 1);

      // Find orders with eventDate == targetDate
      const orders = await Order.find({
        eventDate: { $gte: targetDate, $lt: nextDay }
      }).populate('customer');

      for (const order of orders) {
        const customer = order.customer;
        if (!customer?.email) continue;
        const eventDateStr = new Date(order.eventDate).toLocaleDateString();
        const subject = `Reminder: Your event is in ${daysBefore} day(s)`;
        const message = `Hi ${customer.name},\n\nThis is a reminder that your event is scheduled for ${eventDateStr}.\nThere are ${daysBefore} day(s) left.\n\nThank you!`;
        try {
          await emailSender(customer.email, subject, message);
          console.log(`Email sent to ${customer.email} for event on ${eventDateStr} (${daysBefore} days left)`);
        } catch (err) {
          console.error(`Failed to send email to ${customer.email}:`, err.message);
        }
      }
    }
  } catch (err) {
    console.error('Notification scheduler error:', err.message);
  }
}); 