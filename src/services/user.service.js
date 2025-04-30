import api from './api';

const UserService = {
  getAllUsers: (params = {}) => 
    api.get('/users', { params }),
  
  getUserStats: () => 
    api.get('/users/stats'),
  
  getUserById: (id) => 
    api.get(`/users/${id}`),
  
  updateUser: (id, userData) => 
    api.put(`/users/${id}`, userData),
  
  deleteUser: (id) => 
    api.delete(`/users/${id}`)
};

export default UserService;
