import BookingService from '../services/booking.service.js';

/**
 * Initialize scheduled tasks for the application
 */
export const initScheduler = () => {
  console.log('Initializing scheduler for booking tasks');
  
  // Schedule booking status updates to run every hour
  setInterval(async () => {
    try {
      console.log('Running scheduled booking status update');
      const result = await BookingService.updateBookingStatuses();
      console.log(`Booking status update completed: ${result.activated} activated, ${result.completed} completed`);
    } catch (error) {
      console.error('Error in scheduled booking status update:', error);
    }
  }, 60 * 60 * 1000); // Every hour
  
  // Schedule expired booking handler to run every 15 minutes
  setInterval(async () => {
    try {
      console.log('Running expired booking handler');
      const result = await BookingService.handleExpiredPendingBookings();
      console.log(`Expired booking handler completed: ${result.cancelled} cancelled`);
    } catch (error) {
      console.error('Error in expired booking handler:', error);
    }
  }, 15 * 60 * 1000); // Every 15 minutes
  
  // Schedule booking reminders to run once a day at midnight
  const scheduleDaily = () => {
    const now = new Date();
    const night = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + 1, // tomorrow
      0, 0, 0 // midnight
    );
    const timeToMidnight = night.getTime() - now.getTime();
    
    setTimeout(async () => {
      try {
        console.log('Running daily booking reminders');
        const result = await BookingService.sendBookingReminders();
        console.log(`Booking reminders sent: ${result.remindersSent}`);
      } catch (error) {
        console.error('Error in booking reminders:', error);
      }
      
      // Schedule the next run
      scheduleDaily();
    }, timeToMidnight);
  };
  
  // Start the daily scheduler
  scheduleDaily();
  
  // Run all tasks once at startup to handle any missed events during downtime
  (async () => {
    try {
      console.log('Running initial booking tasks at startup');
      await BookingService.updateBookingStatuses();
      await BookingService.handleExpiredPendingBookings();
      await BookingService.sendBookingReminders();
      console.log('Initial booking tasks completed');
    } catch (error) {
      console.error('Error in initial booking tasks:', error);
    }
  })();
};
