# Deployment Guide: Bike Rental System

This guide will walk you through deploying the Bike Rental System on Render with MongoDB Atlas as the database.

## Part 1: MongoDB Atlas Setup

Follow the instructions in the `mongodb-atlas-setup.md` file to create your MongoDB Atlas cluster and get your connection string.

## Part 2: Backend Deployment on Render

### 1. Create a Render Account

- Go to [Render](https://render.com/) and sign up for an account
- Verify your email address

### 2. Connect Your GitHub Repository

- In the Render dashboard, click "New +"
- Select "Web Service"
- Connect your GitHub account
- Select your Bike Rental repository

### 3. Configure the Web Service

- **Name**: `bike-rental-api` (or your preferred name)
- **Environment**: `Node`
- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Plan**: Free (or select a paid plan for production)

### 4. Set Environment Variables

Add the following environment variables:

- `NODE_ENV`: `production`
- `PORT`: `10000` (Render will automatically set the correct port)
- `MONGODB_URI`: Your MongoDB Atlas connection string
- `JWT_SECRET`: A secure random string for JWT token signing
- `CORS_ORIGIN`: The URL of your frontend application (e.g., `https://bike-rental-frontend.onrender.com`)

### 5. Deploy the Service

- Click "Create Web Service"
- Wait for the deployment to complete (this may take a few minutes)
- Once deployed, your API will be available at `https://bike-rental-api.onrender.com`

## Part 3: Frontend Deployment on Render

### 1. Update API Base URL

Before deploying the frontend, update the API base URL in your frontend code:

```javascript
// src/services/api.js
const API_URL = process.env.NODE_ENV === 'production' 
  ? 'https://bike-rental-api.onrender.com/api'
  : 'http://localhost:5000/api';
```

### 2. Create a New Static Site on Render

- In the Render dashboard, click "New +"
- Select "Static Site"
- Connect your GitHub repository

### 3. Configure the Static Site

- **Name**: `bike-rental-frontend` (or your preferred name)
- **Build Command**: `npm run build`
- **Publish Directory**: `dist` (or your build output directory)
- **Environment Variables**:
  - `VITE_API_URL`: `https://bike-rental-api.onrender.com/api` (adjust if you named your API differently)

### 4. Deploy the Static Site

- Click "Create Static Site"
- Wait for the deployment to complete
- Once deployed, your frontend will be available at `https://bike-rental-frontend.onrender.com`

## Part 4: Testing the Deployment

1. Visit your frontend URL (`https://bike-rental-frontend.onrender.com`)
2. Test user registration and login
3. Verify that bikes can be viewed and booked
4. Test the admin panel functionality

## Part 5: Troubleshooting

### Backend Issues

- Check Render logs for any errors
- Verify that environment variables are set correctly
- Test the API directly using Postman or the Swagger documentation at `https://bike-rental-api.onrender.com/api-docs`

### Frontend Issues

- Check browser console for any errors
- Verify that the API URL is correctly set
- Check CORS settings in the backend

### Database Issues

- Verify that the MongoDB Atlas connection string is correct
- Check that the IP whitelist in MongoDB Atlas includes Render's IPs (or is set to allow access from anywhere)
- Check the database connection logs in the backend

## Part 6: Monitoring and Maintenance

- Set up uptime monitoring for your application
- Regularly backup your MongoDB Atlas database
- Keep your dependencies updated
- Monitor application logs for errors

## Conclusion

Your Bike Rental System is now deployed and accessible online. The backend API is running on Render with MongoDB Atlas as the database, and the frontend is served as a static site on Render.

For any issues or questions, refer to the [Render Documentation](https://render.com/docs) or the [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/).
