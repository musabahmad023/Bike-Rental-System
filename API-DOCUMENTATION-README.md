# Bike Rental System API Documentation

This repository contains comprehensive API documentation and frontend integration guides for the Bike Rental System.

## Documentation Overview

The API documentation and frontend integration resources consist of:

1. **Swagger API Documentation**: Interactive API documentation available at `/api-docs` when the server is running
2. **Postman Collection**: Ready-to-use API collection for testing endpoints
3. **Frontend Connection Guide**: Detailed guide on integrating the API with React components

## Getting Started

### Accessing Swagger Documentation

1. Start the server by running:
   ```
   npm start
   ```
2. Open your browser and navigate to:
   ```
   http://localhost:5000/api-docs
   ```

### Using the Postman Collection

1. Import the `BikeRental-API.postman_collection.json` file into Postman
2. Set up your environment variables:
   - `baseUrl`: Your API base URL (default: `http://localhost:5000`)
   - `token`: Your JWT authentication token (obtained after login)
   - `userId`, `bikeId`, `bookingId`, `methodId`: IDs for specific resources

### Frontend Integration

The frontend connection guide is split into four parts:

1. **Part 1**: API service setup and authentication
2. **Part 2**: Service modules and BikeCard component integration
3. **Part 3**: BikeCatalog and UserDashboard component integration
4. **Part 4**: AdminPanel component and form examples

## API Endpoints

The API includes the following main categories:

### Authentication
- Register: `POST /api/auth/register`
- Login: `POST /api/auth/login`
- Logout: `POST /api/auth/logout`

### Bikes
- Get all bikes: `GET /api/bikes`
- Get bike by ID: `GET /api/bikes/:id`
- Create bike: `POST /api/bikes` (Admin)
- Update bike: `PUT /api/bikes/:id` (Admin)
- Delete bike: `DELETE /api/bikes/:id` (Admin)

### Bookings
- Check availability: `GET /api/bookings/check-availability`
- Create booking: `POST /api/bookings`
- Get user bookings: `GET /api/bookings`
- Get booking by ID: `GET /api/bookings/:id`
- Update booking status: `PUT /api/bookings/:id/status`
- Update payment status: `PUT /api/bookings/:id/payment` (Admin)
- Get all bookings: `GET /api/bookings/admin` (Admin)

### Profile
- Get current profile: `GET /api/profile`
- Update profile: `PUT /api/profile`
- Change password: `PUT /api/profile/password`
- Add payment method: `PUT /api/profile/payment-methods`
- Delete payment method: `DELETE /api/profile/payment-methods/:id`

### Users (Admin)
- Get all users: `GET /api/users`
- Get user statistics: `GET /api/users/stats`
- Get user by ID: `GET /api/users/:id`
- Update user: `PUT /api/users/:id`
- Delete user: `DELETE /api/users/:id`

## Frontend Components

The frontend connection guide provides integration examples for the following components:

1. **BikeCard**: Displays individual bike details
2. **BikeCatalog**: Shows all available bikes with filtering
3. **UserDashboard**: Displays user profile and rental history
4. **AdminPanel**: Provides bike inventory and user management

## Security

The API uses JWT-based authentication to secure endpoints. All authenticated routes require a valid token in the Authorization header:

```
Authorization: Bearer YOUR_JWT_TOKEN
```

## Error Handling

The API returns appropriate HTTP status codes and error messages:

- 200: Success
- 201: Resource created
- 400: Bad request
- 401: Unauthorized
- 403: Forbidden
- 404: Not found
- 500: Server error

## Next Steps

1. Review the Swagger documentation for detailed endpoint specifications
2. Test API endpoints using the Postman collection
3. Integrate the API with your frontend using the connection guide
4. Implement proper error handling and loading states in your components
