# SlotSwapper Setup Guide

This guide will help you set up and run SlotSwapper locally.

## Prerequisites

1. **Node.js** (v18 or higher)

   - Download from [nodejs.org](https://nodejs.org/)
   - Verify: `node --version`

2. **MongoDB** (v6 or higher)

   - Download from [mongodb.com](https://www.mongodb.com/try/download/community)
   - Or use Docker: `docker run --name mongodb -p 27017:27017 -d mongo:7`

3. **npm** (comes with Node.js)
   - Verify: `npm --version`

## Step-by-Step Setup

### 1. Database Setup

MongoDB will automatically create the database on first connection. Just ensure MongoDB is running:

- **Local MongoDB**: Start MongoDB service (varies by OS)
- **Docker**: `docker run --name mongodb -p 27017:27017 -d mongo:7`
- The database `slotswapper` will be created automatically when the backend connects

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create .env file
# Windows (PowerShell):
copy .env.example .env

# Mac/Linux:
cp .env.example .env

# Edit .env file with your database credentials:
# DATABASE_URL="mongodb://localhost:27017/slotswapper"
# JWT_SECRET="your-secret-key-change-in-production-min-32-characters"
# PORT=5000
# NODE_ENV=development

# Start backend server (development mode with auto-reload)
npm run dev
```

The backend should now be running on `http://localhost:5000`

### 3. Frontend Setup

Open a new terminal window:

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The frontend should now be running on `http://localhost:3000`

### 4. Access the Application

1. Open your browser and go to `http://localhost:3000`
2. Sign up for a new account
3. Create some calendar events
4. Mark events as "Swappable"
5. Browse the marketplace
6. Request swaps with other users!

## Docker Setup (Alternative)

If you prefer using Docker:

```bash
# Start MongoDB and Backend
docker-compose up -d

# View logs
docker-compose logs -f backend
```

Then set up the frontend manually (step 3 above).

## Troubleshooting

### Database Connection Issues

- Ensure MongoDB is running
- Check your DATABASE_URL in `.env` matches your MongoDB connection string
- Verify MongoDB is accessible: `mongosh` or `mongo` command
- For Docker: Check MongoDB container is running: `docker ps`

### Port Already in Use

- Backend (5000): Change `PORT` in `backend/.env`
- Frontend (3000): Change port in `frontend/vite.config.js`

### MongoDB Issues

- Ensure MongoDB service is running
- For Docker: Restart MongoDB container: `docker restart mongodb`
- The database schema is managed by Mongoose models - no migrations needed
- If you need to reset data, you can drop the database: `mongosh` then `use slotswapper` and `db.dropDatabase()`

### Frontend Build Errors

- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- Check that all dependencies are installed correctly

## Testing the Application

1. **Create two user accounts** (use different emails)
2. **User 1**: Create events and mark some as "Swappable"
3. **User 2**: Browse marketplace, see User 1's swappable slots
4. **User 2**: Request a swap
5. **User 1**: Check Requests page, accept the swap
6. **Verify**: Both users should now own each other's slots

## Production Deployment

See the main README.md for deployment instructions to Render/Heroku (backend) and Vercel/Netlify (frontend).
