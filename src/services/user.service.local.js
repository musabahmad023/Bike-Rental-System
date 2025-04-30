// Local User Service for AdminPanel (localStorage version)
const UserServiceLocal = {
  getAllUsers: () => {
    return JSON.parse(localStorage.getItem('bikeRentalUsers') || '[]');
  },
  deleteUser: (userIdOrEmail) => {
    let users = JSON.parse(localStorage.getItem('bikeRentalUsers') || '[]');
    users = users.filter(u => u.id !== userIdOrEmail && u.email !== userIdOrEmail);
    localStorage.setItem('bikeRentalUsers', JSON.stringify(users));
    // Also log out the user if they're currently logged in
    const current = JSON.parse(localStorage.getItem('user') || 'null');
    if (current && (current.id === userIdOrEmail || current.email === userIdOrEmail)) {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    }
  },
  // Helper: get active/total rentals for a user
  getUserRentalStats: (userIdOrEmail) => {
    const rentals = JSON.parse(localStorage.getItem('bikeRentalHistory') || '[]');
    const userRentals = rentals.filter(r => (
      (r.userId && (r.userId === userIdOrEmail)) ||
      (r.userEmail && (r.userEmail === userIdOrEmail))
    ));
    return {
      active: userRentals.filter(r => r.status === 'active').length,
      total: userRentals.length
    };
  }
};

export default UserServiceLocal;
