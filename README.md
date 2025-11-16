# SlotSwapper - P2P Time-Slot Scheduling Application

SlotSwapper is a full-stack peer-to-peer time-slot scheduling application where users can mark calendar slots as swappable and exchange them with other users.
## Deployed Link - https://spot-swapper.vercel.app/dashboard
## 🏗️ Architecture

### Backend

- **Stack**: Node.js + Express
- **Database**: MongoDB
- **Authentication**: JWT (JSON Web Tokens)
- **API**: RESTful API

### Frontend

- **Stack**: React + JavaScript
- **Build Tool**: Vite
- **UI**: Tailwind CSS + shadcn/ui components
- **State Management**: React Query (TanStack Query)
- **Routing**: React Router

#### 1. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your database credentials:
# DATABASE_URL="mongodb://localhost:27017/slotswapper"
# JWT_SECRET="your-secret-key-change-in-production"
# PORT=5000

# Start the backend server (development mode)
npm run dev
```
#### 2. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```
## 🎯 Features

### Core Features

- ✅ User authentication (JWT)
- ✅ Calendar event management
- ✅ Mark slots as swappable
- ✅ Browse marketplace of swappable slots
- ✅ Create swap requests
- ✅ Accept/reject swap requests
- ✅ Automatic slot ownership transfer on acceptance
- ✅ Status management (BUSY, SWAPPABLE, SWAP_PENDING)

### Frontend Pages

1. **Sign Up / Log In**: Authentication pages
2. **Dashboard**: View and manage personal events, create new slots
3. **Marketplace**: Browse and request swaps with other users' slots
4. **Requests**: View incoming and outgoing swap requests, respond to requests

## 🔐 Security Features

- Passwords are hashed using bcrypt
- JWT tokens expire after 7 days
- Protected routes on frontend and backend
- Authorization checks ensure users can only modify their own events
- Input validation on all endpoints
