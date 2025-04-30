# MongoDB Atlas Setup Guide

Follow these steps to set up a MongoDB Atlas cluster for your Bike Rental application:

1. **Create a MongoDB Atlas Account**:
   - Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register)
   - Sign up for a free account

2. **Create a New Cluster**:
   - Click "Build a Database"
   - Select the free tier option (M0)
   - Choose a cloud provider (AWS, Google Cloud, or Azure) and a region closest to your users
   - Click "Create Cluster"

3. **Set Up Database Access**:
   - In the left sidebar, click "Database Access"
   - Click "Add New Database User"
   - Create a username and password (save these securely)
   - Set privileges to "Read and Write to Any Database"
   - Click "Add User"

4. **Set Up Network Access**:
   - In the left sidebar, click "Network Access"
   - Click "Add IP Address"
   - For development, you can click "Allow Access from Anywhere" (0.0.0.0/0)
   - For production, add specific IP addresses
   - Click "Confirm"

5. **Get Your Connection String**:
   - Once your cluster is created, click "Connect"
   - Select "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database user's password
   - Replace `<dbname>` with "bikerental"

Your connection string should look like:
```
mongodb+srv://username:<password>@cluster0.xxxxx.mongodb.net/bikerental?retryWrites=true&w=majority
```

This connection string will be used in your environment variables for both local development and Render deployment.
