import api from './api';

const ProfileService = {
  getProfile: () => 
    api.get('/profile'),
  
  updateProfile: (profileData) => 
    api.put('/profile', profileData),
  
  changePassword: (currentPassword, newPassword) => 
    api.put('/profile/password', { currentPassword, newPassword }),
  
  addPaymentMethod: (paymentData) => 
    api.put('/profile/payment-methods', paymentData),
  
  deletePaymentMethod: (methodId) => 
    api.delete(`/profile/payment-methods/${methodId}`)
};

export default ProfileService;
