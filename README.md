# SlotSwapper - P2P Time-Slot Scheduling Application

SlotSwapper is a full-stack peer-to-peer time-slot scheduling application where users can mark calendar slots as swappable and exchange them with other users.

## 🏗️ Architecture

### Backend

- **Stack**: Node.js + Express
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **API**: RESTful API

### Frontend

- **Stack**: React + JavaScript
- **Build Tool**: Vite
- **UI**: Tailwind CSS + shadcn/ui components
- **State Management**: React Query (TanStack Query)
- **Routing**: React Router

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- MongoDB 6+ (or use Docker)
- Docker (optional, for containerized setup)

### Local Development Setup

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

The backend will run on `http://localhost:5000`

#### 2. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

The frontend will run on `http://localhost:3000`

### Docker Setup

```bash
# Start all services (PostgreSQL + Backend)
docker-compose up -d

# Run migrations
docker-compose exec backend npx prisma migrate deploy

# View logs
docker-compose logs -f backend
```

The backend will be available at `http://localhost:5000`

## 📋 API Documentation

### Authentication Endpoints

#### POST `/api/auth/signup`

Create a new user account.

**Request Body:**

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**

```json
{
  "token": "jwt_token_here",
  "user": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

#### POST `/api/auth/login`

Authenticate user and get JWT token.

**Request Body:**

```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:** Same as signup response.

### Events Endpoints

All event endpoints require JWT authentication (Bearer token in Authorization header).

#### GET `/api/events`

Get all events for the logged-in user.

**Response:**

```json
[
  {
    "id": "uuid",
    "title": "Meeting",
    "startTime": "2024-01-15T10:00:00Z",
    "endTime": "2024-01-15T11:00:00Z",
    "status": "BUSY",
    "userId": "uuid",
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
]
```

#### POST `/api/events`

Create a new event.

**Request Body:**

```json
{
  "title": "Meeting",
  "startTime": "2024-01-15T10:00:00Z",
  "endTime": "2024-01-15T11:00:00Z",
  "status": "BUSY"
}
```

**Status values**: `BUSY`, `SWAPPABLE`, `SWAP_PENDING`

#### PUT `/api/events/:id`

Update an existing event (must be the owner).

### Swap Request Endpoints

#### GET `/api/swappable-slots`

Get all swappable slots from other users.

#### POST `/api/swap-request`

Create a new swap request.

**Request Body:**

```json
{
  "mySlotId": "uuid",
  "theirSlotId": "uuid"
}
```

**Logic:**

- Both slots must be `SWAPPABLE`
- Both slots will be marked as `SWAP_PENDING`
- Creates a `PENDING` swap request

#### POST `/api/swap-response/:id`

Accept or reject a swap request.

**Request Body:**

```json
{
  "action": "accept" // or "reject"
}
```

**Accept Logic:**

- Swaps the `userId` of both slots
- Sets both slots to `BUSY`
- Updates request status to `ACCEPTED`

**Reject Logic:**

- Reverts both slots to `SWAPPABLE`
- Updates request status to `REJECTED`

#### GET `/api/requests/incoming`

Get incoming swap requests (where current user is the responder).

#### GET `/api/requests/outgoing`

Get outgoing swap requests (where current user is the requester).

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

## 📁 Project Structure

```
slotswapper/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── database.js
│   │   ├── middleware/
│   │   │   └── auth.js
│   │   ├── routes/
│   │   │   ├── auth.js
│   │   │   ├── events.js
│   │   │   └── swapRequests.js
│   │   └── server.js
│   ├── prisma/
│   │   └── schema.prisma
│   ├── package.json
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/
│   │   │   └── ProtectedRoute.tsx
│   │   ├── hooks/
│   │   │   ├── useAuth.ts
│   │   │   ├── useEvents.ts
│   │   │   └── useSwapRequests.ts
│   │   ├── lib/
│   │   │   ├── api.ts
│   │   │   ├── auth.ts
│   │   │   └── utils.ts
│   │   ├── pages/
│   │   │   ├── Login.tsx
│   │   │   ├── Signup.tsx
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Marketplace.tsx
│   │   │   └── Requests.tsx
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   └── vite.config.ts
├── docker-compose.yml
└── README.md
```

## 🧪 Testing

### Manual Testing Flow

1. **Create accounts**: Sign up two different users
2. **Create events**: Each user creates events on their dashboard
3. **Mark as swappable**: Mark some events as swappable
4. **Browse marketplace**: View swappable slots from other users
5. **Create swap request**: Request to swap slots
6. **Respond to request**: Accept or reject the swap request
7. **Verify swap**: Check that slot ownership has transferred

## 🚢 Deployment

### Backend (Render/Heroku)

1. Set environment variables in your hosting platform
2. Run `npx prisma migrate deploy` after deployment
3. Ensure PostgreSQL is accessible from your host

### Frontend (Vercel/Netlify)

1. Update API base URL in `frontend/src/lib/api.ts` to your backend URL
2. Build: `npm run build`
3. Deploy the `dist` folder

## 📝 Design Decisions

1. **Mongoose ODM**: Chosen for MongoDB integration and schema validation
2. **React Query**: For automatic cache management and optimistic updates
3. **JWT Authentication**: Stateless, scalable authentication
4. **Status-based workflow**: Clear state management for swap lifecycle
5. **Transaction-based swaps**: Ensures data consistency during slot exchanges

## 🐛 Known Limitations & Future Enhancements

### Current Limitations

- No real-time notifications (WebSocket/Socket.io)
- No email notifications
- No conflict detection for overlapping slots
- No cancellation of swap requests

### Future Enhancements

- WebSocket integration for real-time updates
- Email notifications for swap requests
- Calendar view with visual timeline
- Search and filter in marketplace
- Slot conflict detection
- Swap request cancellation
- Unit and integration tests
- Rate limiting for API endpoints

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is open source and available under the MIT License.

## 👨‍💻 Author

Built as a full-stack demonstration project for SlotSwapper.
