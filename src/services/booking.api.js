import api from './api';

const BookingService = {
  checkAvailability: (bikeId, startDate, endDate) => 
    api.get('/bookings/check-availability', { 
      params: { bikeId, startDate, endDate } 
    }),
  
  createBooking: (bookingData) => 
    api.post('/bookings', bookingData),
  
  getUserBookings: (params = {}) => 
    api.get('/bookings', { params }),
  
  getBookingById: (id) => 
    api.get(`/bookings/${id}`),
  
  updateBookingStatus: (id, statusData) => 
    api.put(`/bookings/${id}/status`, statusData),
  
  // Admin functions
  getAllBookings: (params = {}) => 
    api.get('/bookings/admin', { params }),
  
  updatePaymentStatus: (id, paymentData) => 
    api.put(`/bookings/${id}/payment`, paymentData)
};

export default BookingService;
