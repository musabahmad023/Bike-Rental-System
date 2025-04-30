// Mock Bike Service using localStorage
const BikeService = {
  // Initialize the bike data in localStorage if it doesn't exist
  initialize: () => {
    // Check if bike data already exists
    if (!localStorage.getItem('bikeRentalBikes')) {
      // Initial bike data
      const initialBikes = [
        {
          id: 1,
          name: 'Mountain Explorer X3',
          type: 'Mountain',
          pricePerHour: 15,
          pricePerDay: 45,
          description: 'Rugged mountain bike with front suspension, perfect for trail riding and off-road adventures.',
          available: true,
          rating: 4.8,
          image: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
          totalRentals: 12,
          maintenanceStatus: 'Good',
          lastMaintenance: '2023-10-15'
        },
        {
          id: 2,
          name: 'City Cruiser Deluxe',
          type: 'City',
          pricePerHour: 10,
          pricePerDay: 35,
          description: 'Comfortable city bike with upright riding position, perfect for urban exploration and commuting.',
          available: true,
          rating: 4.5,
          image: 'https://images.unsplash.com/photo-1571068316344-75bc76f77890?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
          totalRentals: 24,
          maintenanceStatus: 'Good',
          lastMaintenance: '2023-11-05'
        },
        {
          id: 3,
          name: 'Road Master Pro',
          type: 'Road',
          pricePerHour: 14.99,
          pricePerDay: 59.99,
          description: 'Lightweight road bike designed for speed and long-distance rides on paved roads.',
          available: true,
          rating: 4.8,
          image: 'https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
          totalRentals: 37,
          maintenanceStatus: 'Good',
          lastMaintenance: '2023-08-20'
        },
        {
          id: 4,
          name: 'Electric City Rider',
          type: 'Electric',
          pricePerHour: 25,
          pricePerDay: 75,
          description: 'Powerful electric bike with pedal assist, perfect for effortless city exploration.',
          available: true,
          rating: 4.7,
          image: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
          totalRentals: 31,
          maintenanceStatus: 'Good',
          lastMaintenance: '2023-10-25'
        },
        {
          id: 5,
          name: 'Kids Adventure Mini',
          type: 'Kids',
          pricePerHour: 8,
          pricePerDay: 25,
          description: 'Fun and safe bike designed for children, perfect for family outings.',
          available: true,
          rating: 4.6,
          image: 'https://images.unsplash.com/photo-1511994298241-608e28f14fde?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
          totalRentals: 42,
          maintenanceStatus: 'Good',
          lastMaintenance: '2023-10-10'
        },
        {
          id: 6,
          name: 'Tandem Explorer',
          type: 'Specialty',
          pricePerHour: 30,
          pricePerDay: 90,
          description: 'Two-person tandem bike, perfect for couples and shared adventures.',
          available: true,
          rating: 4.4,
          image: 'https://images.unsplash.com/photo-1511994298241-608e28f14fde?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
          totalRentals: 16,
          maintenanceStatus: 'Good',
          lastMaintenance: '2023-09-30'
        }
      ];
      
      localStorage.setItem('bikeRentalBikes', JSON.stringify(initialBikes));
    }
    
    // Ensure bike availability status is consistent with rental data
    BikeService.syncAvailabilityWithRentals();
  },
  
  // Sync bike availability with rental data
  syncAvailabilityWithRentals: () => {
    const bikes = JSON.parse(localStorage.getItem('bikeRentalBikes') || '[]');
    const rentalHistory = JSON.parse(localStorage.getItem('bikeRentalHistory') || '[]');
    
    // Get active rentals
    const activeRentals = rentalHistory.filter(rental => rental.status === 'active');
    
    // Set all bikes as available by default
    const updatedBikes = bikes.map(bike => ({
      ...bike,
      available: true,
      currentRenter: null,
      rentalStartDate: null
    }));
    
    // Mark bikes as unavailable if they have an active rental
    activeRentals.forEach(rental => {
      const bikeIndex = updatedBikes.findIndex(bike => bike.id === rental.bikeId);
      if (bikeIndex !== -1) {
        updatedBikes[bikeIndex] = {
          ...updatedBikes[bikeIndex],
          available: false,
          currentRenter: rental.userId,
          rentalStartDate: rental.startDate
        };
      }
    });
    
    localStorage.setItem('bikeRentalBikes', JSON.stringify(updatedBikes));
    
    return updatedBikes;
  },
  
  // Get all bikes
  getAllBikes: () => {
    BikeService.initialize(); // Ensure bikes are initialized
    const bikes = JSON.parse(localStorage.getItem('bikeRentalBikes') || '[]');
    return bikes;
  },
  
  // Get a specific bike by ID
  getBikeById: (id) => {
    const bikes = BikeService.getAllBikes();
    return bikes.find(bike => bike.id === id) || null;
  },
  
  // Add a new bike
  createBike: (bikeData) => {
    const bikes = BikeService.getAllBikes();
    
    // Generate a new ID
    const newId = bikes.length > 0 ? Math.max(...bikes.map(b => b.id)) + 1 : 1;
    
    const newBike = {
      ...bikeData,
      id: newId,
      totalRentals: 0,
      rating: 0,
      maintenanceStatus: bikeData.maintenanceStatus || 'Good',
      lastMaintenance: bikeData.lastMaintenance || new Date().toISOString().split('T')[0]
    };
    
    bikes.push(newBike);
    localStorage.setItem('bikeRentalBikes', JSON.stringify(bikes));
    
    return newBike;
  },
  
  // Update an existing bike
  updateBike: (id, bikeData) => {
    const bikes = BikeService.getAllBikes();
    const index = bikes.findIndex(bike => bike.id === id);
    
    if (index === -1) {
      throw new Error(`Bike with ID ${id} not found`);
    }
    
    // Update the bike with new data
    const updatedBike = {
      ...bikes[index],
      ...bikeData
    };
    
    bikes[index] = updatedBike;
    localStorage.setItem('bikeRentalBikes', JSON.stringify(bikes));
    
    return updatedBike;
  },
  
  // Delete a bike
  deleteBike: (id) => {
    const bikes = BikeService.getAllBikes();
    const filteredBikes = bikes.filter(bike => bike.id !== id);
    
    if (filteredBikes.length === bikes.length) {
      throw new Error(`Bike with ID ${id} not found`);
    }
    
    localStorage.setItem('bikeRentalBikes', JSON.stringify(filteredBikes));
    return true;
  },
  
  // Rent a bike (mark as unavailable and increment total rentals)
  rentBike: (id, userId) => {
    console.log('BikeService.rentBike called with:', { id, userId });
    
    if (!userId) {
      console.error('No userId provided to rentBike');
      throw new Error('User ID is required to rent a bike');
    }
    
    const bikes = BikeService.getAllBikes();
    const index = bikes.findIndex(bike => bike.id === id);
    
    if (index === -1) {
      console.error(`Bike with ID ${id} not found`);
      throw new Error(`Bike with ID ${id} not found`);
    }
    
    if (!bikes[index].available) {
      console.error(`Bike "${bikes[index].name}" is not available for rent`);
      throw new Error(`Bike "${bikes[index].name}" is not available for rent`);
    }
    
    // Update bike status
    bikes[index] = {
      ...bikes[index],
      available: false,
      totalRentals: (bikes[index].totalRentals || 0) + 1,
      currentRenter: userId,
      rentalStartDate: new Date().toISOString()
    };
    
    console.log('Updated bike status:', bikes[index]);
    localStorage.setItem('bikeRentalBikes', JSON.stringify(bikes));
    
    // Create rental record
    const rentalId = `RNT-${Date.now()}`;
    const rental = {
      id: rentalId,
      bikeId: id,
      bikeName: bikes[index].name,
      userId: userId,
      userEmail: userId.includes('@') ? userId : null, // Store email if it looks like one
      startDate: new Date().toISOString(),
      cost: {
        hourly: bikes[index].pricePerHour,
        daily: bikes[index].pricePerDay
      },
      status: 'active'
    };
    
    // Store rental in history
    const rentalHistory = JSON.parse(localStorage.getItem('bikeRentalHistory') || '[]');
    rentalHistory.push(rental);
    console.log('Adding rental to history:', rental);
    localStorage.setItem('bikeRentalHistory', JSON.stringify(rentalHistory));
    
    return bikes[index];
  },
  
  // Return a bike (mark as available and update rental history)
  returnBike: (rentalId) => {
    const rentalHistory = JSON.parse(localStorage.getItem('bikeRentalHistory') || '[]');
    const rentalIndex = rentalHistory.findIndex(rental => rental.id === rentalId);
    
    if (rentalIndex === -1) {
      throw new Error(`Rental with ID ${rentalId} not found`);
    }
    
    const rental = rentalHistory[rentalIndex];
    const bikeId = rental.bikeId;
    
    const bikes = BikeService.getAllBikes();
    const bikeIndex = bikes.findIndex(bike => bike.id === bikeId);
    
    if (bikeIndex === -1) {
      throw new Error(`Bike with ID ${bikeId} not found`);
    }
    
    // Update rental history
    rentalHistory[rentalIndex] = {
      ...rental,
      endDate: new Date().toISOString(),
      status: 'completed'
    };
    
    localStorage.setItem('bikeRentalHistory', JSON.stringify(rentalHistory));
    
    // Update bike status
    bikes[bikeIndex] = {
      ...bikes[bikeIndex],
      available: true,
      currentRenter: null,
    };
    
    localStorage.setItem('bikeRentalBikes', JSON.stringify(bikes));
    
    // Trigger an event to notify components about the change
    window.dispatchEvent(new CustomEvent('bikeRentalUpdated'));
    
    return bikes[bikeIndex];
  },
  
  // Toggle bike availability (for admin use)
  toggleAvailability: (id) => {
    const bikes = BikeService.getAllBikes();
    const index = bikes.findIndex(bike => bike.id === id);
    
    if (index === -1) {
      throw new Error(`Bike with ID ${id} not found`);
    }
    
    // Get rental data to check if this bike has active rentals
    const rentalHistory = JSON.parse(localStorage.getItem('bikeRentalHistory') || '[]');
    const activeRental = rentalHistory.find(
      rental => rental.bikeId === id && rental.status === 'active'
    );
    
    // If bike has active rental and admin is trying to make it available
    if (activeRental && !bikes[index].available) {
      console.log('Returning bike with active rental:', activeRental);
      // Return the bike first to close out the rental using the rental ID
      BikeService.returnBike(activeRental.id);
      
      // Dispatch event to notify components
      window.dispatchEvent(new CustomEvent('bikeRentalUpdated'));
      
      return BikeService.getBikeById(id); // Return updated bike
    }
    
    // If bike doesn't have active rental, simply toggle the availability
    if (!activeRental) {
      bikes[index] = {
        ...bikes[index],
        available: !bikes[index].available
      };
      
      localStorage.setItem('bikeRentalBikes', JSON.stringify(bikes));
      
      // Dispatch event to notify components
      window.dispatchEvent(new CustomEvent('bikeRentalUpdated'));
    }
    
    return bikes[index];
  },
  
  // Get rental history for a specific user
  getUserRentalHistory: (userId) => {
    const rentalHistory = JSON.parse(localStorage.getItem('bikeRentalHistory') || '[]');
    
    // If userId looks like an email address, filter by it
    if (typeof userId === 'string' && userId.includes('@')) {
      return rentalHistory.filter(rental => 
        rental.userId === userId || rental.userEmail === userId
      );
    }
    
    // Otherwise filter by userId
    return rentalHistory.filter(rental => rental.userId === userId);
  },
  
  // Get all rentals (for admin)
  getAllRentals: () => {
    return JSON.parse(localStorage.getItem('bikeRentalHistory') || '[]');
  }
};

// Initialize when the service is first loaded
BikeService.initialize();

export default BikeService;
