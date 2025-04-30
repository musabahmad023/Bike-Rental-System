import Booking from '../models/Booking.js';
import Bike from '../models/Bike.js';

/**
 * Service to handle scheduled tasks for booking management
 */
class BookingService {
  /**
   * Update booking and bike statuses based on current date
   * This should be run on a schedule (e.g., every hour)
   */
  static async updateBookingStatuses() {
    try {
      console.log('Running scheduled booking status update');
      const now = new Date();
      
      // Find bookings that should be activated (confirmed bookings with startDate in the past)
      const bookingsToActivate = await Booking.find({
        status: 'confirmed',
        startDate: { $lte: now }
      });
      
      console.log(`Found ${bookingsToActivate.length} bookings to activate`);
      
      // Update each booking and bike status
      for (const booking of bookingsToActivate) {
        booking.status = 'active';
        await booking.save();
        
        // Update bike status to rented
        const bike = await Bike.findById(booking.bike);
        if (bike) {
          bike.availability.status = 'rented';
          await bike.save();
          console.log(`Activated booking ${booking._id} and updated bike ${bike._id} status to rented`);
        }
      }
      
      // Find bookings that should be completed (active bookings with endDate in the past)
      const bookingsToComplete = await Booking.find({
        status: 'active',
        endDate: { $lte: now }
      });
      
      console.log(`Found ${bookingsToComplete.length} bookings to complete`);
      
      // Update each booking and bike status
      for (const booking of bookingsToComplete) {
        booking.status = 'completed';
        await booking.save();
        
        // Update bike status to available
        const bike = await Bike.findById(booking.bike);
        if (bike) {
          bike.availability.status = 'available';
          await bike.save();
          console.log(`Completed booking ${booking._id} and updated bike ${bike._id} status to available`);
        }
      }
      
      return {
        activated: bookingsToActivate.length,
        completed: bookingsToComplete.length
      };
    } catch (error) {
      console.error('Error updating booking statuses:', error);
      throw error;
    }
  }
  
  /**
   * Check for and handle expired pending bookings
   * This should be run on a schedule (e.g., every hour)
   */
  static async handleExpiredPendingBookings() {
    try {
      console.log('Running expired pending bookings check');
      const now = new Date();
      
      // Find pending bookings that are older than 30 minutes and haven't been paid
      const thirtyMinutesAgo = new Date(now.getTime() - 30 * 60 * 1000);
      
      const expiredBookings = await Booking.find({
        status: 'pending',
        paymentStatus: 'pending',
        createdAt: { $lte: thirtyMinutesAgo }
      });
      
      console.log(`Found ${expiredBookings.length} expired pending bookings`);
      
      // Cancel each expired booking and update bike status
      for (const booking of expiredBookings) {
        booking.status = 'cancelled';
        booking.cancellationReason = 'Expired - payment not received within 30 minutes';
        booking.cancellationDate = now;
        await booking.save();
        
        // Update bike status to available
        const bike = await Bike.findById(booking.bike);
        if (bike && bike.availability.status === 'reserved') {
          bike.availability.status = 'available';
          await bike.save();
          console.log(`Cancelled expired booking ${booking._id} and updated bike ${bike._id} status to available`);
        }
      }
      
      return {
        cancelled: expiredBookings.length
      };
    } catch (error) {
      console.error('Error handling expired bookings:', error);
      throw error;
    }
  }
  
  /**
   * Send booking reminders for upcoming bookings
   * This should be run on a schedule (e.g., daily)
   */
  static async sendBookingReminders() {
    try {
      console.log('Sending booking reminders');
      const now = new Date();
      
      // Find confirmed bookings starting in the next 24 hours
      const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      
      const upcomingBookings = await Booking.find({
        status: 'confirmed',
        startDate: { $gte: now, $lte: tomorrow }
      }).populate('user', 'name email').populate('bike', 'name');
      
      console.log(`Found ${upcomingBookings.length} upcoming bookings for reminders`);
      
      // In a real application, you would send emails here
      // For now, we'll just log the reminders
      for (const booking of upcomingBookings) {
        console.log(`REMINDER: Booking ${booking._id} for ${booking.user.name} (${booking.user.email}) starts in less than 24 hours. Bike: ${booking.bike.name}, Start time: ${booking.startDate}`);
        
        // In a real application:
        // await sendEmail({
        //   to: booking.user.email,
        //   subject: 'Your bike rental starts soon',
        //   text: `Your booking for ${booking.bike.name} starts on ${booking.startDate}`
        // });
      }
      
      return {
        remindersSent: upcomingBookings.length
      };
    } catch (error) {
      console.error('Error sending booking reminders:', error);
      throw error;
    }
  }
  
  /**
   * Check bike availability for given dates
   */
  static async checkBikeAvailability(bikeId, startDate, endDate) {
    try {
      // Convert to Date objects
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      // Check if bike exists
      const bike = await Bike.findById(bikeId);
      if (!bike) {
        return {
          available: false,
          message: 'Bike not found'
        };
      }
      
      // Check if bike is available (not in maintenance or reserved)
      if (bike.availability.status !== 'available') {
        return {
          available: false,
          message: `Bike is currently ${bike.availability.status}`
        };
      }
      
      // Check for overlapping bookings
      const overlappingBookings = await Booking.find({
        bike: bikeId,
        status: { $in: ['pending', 'confirmed', 'active'] },
        $or: [
          // Start date falls within an existing booking
          { startDate: { $lte: end }, endDate: { $gte: start } }
        ]
      });
      
      if (overlappingBookings.length > 0) {
        return {
          available: false,
          message: 'Bike is not available for the selected dates',
          conflicts: overlappingBookings.map(booking => ({
            startDate: booking.startDate,
            endDate: booking.endDate
          }))
        };
      }
      
      // Calculate rental duration and price
      const diffMs = Math.abs(end - start);
      const diffHours = Math.ceil(diffMs / (1000 * 60 * 60));
      
      let price = 0;
      if (diffHours <= 24) {
        // Use hourly rate for bookings under 24 hours
        price = diffHours * bike.pricing.hourlyRate;
      } else {
        // Use daily rate for bookings over 24 hours
        const days = Math.ceil(diffHours / 24);
        price = days * bike.pricing.dailyRate;
      }
      
      return {
        available: true,
        message: 'Bike is available for the selected dates',
        pricing: {
          hours: diffHours,
          totalPrice: price,
          deposit: bike.pricing.deposit,
          hourlyRate: bike.pricing.hourlyRate,
          dailyRate: bike.pricing.dailyRate
        }
      };
    } catch (error) {
      console.error('Error checking bike availability:', error);
      throw error;
    }
  }
}

export default BookingService;
