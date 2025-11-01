# SlotSwapper - Website Flow & Pages Documentation

## 🎯 Overview

SlotSwapper is a Peer-to-Peer (P2P) Time-Slot Scheduling Application where users can create calendar events, mark them as swappable, and exchange time slots with other users.

---

## 📱 Application Structure

### **Frontend (React + Vite)**

- **Framework**: React with React Router for navigation
- **UI Library**: Tailwind CSS + shadcn/ui components
- **State Management**: TanStack Query (React Query)
- **Authentication**: JWT tokens stored in localStorage

### **Backend (Node.js + Express)**

- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **API**: RESTful API

---

## 🔄 User Flow & Navigation

```
┌─────────────────────────────────────────────────────────────┐
│                    APPLICATION ENTRY POINT                   │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
            ┌───────────────────────────────┐
            │   Is User Authenticated?       │
            └───────────────────────────────┘
                    │              │
          NO        │              │        YES
                    ▼              ▼
        ┌──────────────────┐  ┌─────────────────┐
        │  LOGIN/SIGNUP    │  │   DASHBOARD    │
        │     PAGES        │  │  (Main App)    │
        └──────────────────┘  └─────────────────┘
```

---

## 📄 Pages & Their Functionality

### 1. **Login Page** (`/login`)

**Purpose**: User authentication to access the application

**Features**:

- Email and password input fields
- Link to Signup page
- **Auto-redirect**: If user is already authenticated, redirects to `/dashboard`
- Validates credentials against backend
- Stores JWT token and user data in localStorage on success
- Redirects to Dashboard after successful login

**User Actions**:

1. Enter email and password
2. Click "Login" button
3. On success → Redirected to Dashboard
4. On failure → Error message displayed

**Backend Endpoint**: `POST /api/auth/login`

---

### 2. **Signup Page** (`/signup`)

**Purpose**: New user registration

**Features**:

- Name, email, and password input fields
- Link to Login page
- **Auto-redirect**: If user is already authenticated, redirects to `/dashboard`
- Validates input (minimum password length, valid email)
- Creates new user account
- Automatically logs in user after signup
- Redirects to Dashboard after successful signup

**User Actions**:

1. Enter name, email, and password
2. Click "Sign Up" button
3. On success → Auto-login and redirect to Dashboard
4. On failure → Error message displayed

**Backend Endpoint**: `POST /api/auth/signup`

---

### 3. **Dashboard Page** (`/dashboard`) 🔒 Protected

**Purpose**: View and manage personal calendar events

**Key Features**:

- **View All Events**: Displays all user's calendar events in card grid
- **Create New Event**: Form to create new calendar slots
- **Toggle Status**: Mark events as "BUSY" or "SWAPPABLE"
- **Event Details**: Shows title, start time, end time, and status

**Event Status Types**:

- 🟢 **BUSY**: Regular event (not available for swap)
- 🟡 **SWAPPABLE**: Available for swapping with other users
- 🟠 **SWAP_PENDING**: Currently in a swap request (cannot be modified)

**User Actions**:

1. Click "New Event" button → Opens creation form
2. Fill form: Title, Start Time, End Time, Status
3. Click "Create" → Event added to calendar
4. Click "Mark Swappable" → Changes status to SWAPPABLE
5. Click "Mark Busy" → Changes status back to BUSY
6. Events with SWAP_PENDING status cannot be toggled

**Backend Endpoints**:

- `GET /api/events` - Fetch user's events
- `POST /api/events` - Create new event
- `PUT /api/events/:id` - Update event status

**Navigation**:

- Sidebar: "My Calendar" (active when on Dashboard)
- Quick Access: "New Event" button in sidebar

---

### 4. **Marketplace Page** (`/marketplace`) 🔒 Protected

**Purpose**: Browse available swappable slots from other users and request swaps

**Key Features**:

- **Browse Available Slots**: View all swappable slots from other users
- **Swap Request Form**: Select your slot and their slot to create swap request
- **Slot Information**: Shows slot title, owner name, and time range
- **Real-time Updates**: Shows only slots with status "SWAPPABLE"

**User Actions**:

1. View marketplace of available slots
2. Select one of your own swappable slots (dropdown)
3. Select a slot from marketplace you want (dropdown)
4. Click "Request Swap" button
5. System creates swap request and marks both slots as SWAP_PENDING
6. Redirect to Requests page to see pending requests

**Important Notes**:

- Only your slots with status "SWAPPABLE" appear in "Your Slot" dropdown
- You cannot swap your own slots
- Both slots must be SWAPPABLE to create request
- After request creation, both slots become SWAP_PENDING

**Backend Endpoints**:

- `GET /api/swappable-slots` - Get all swappable slots from other users
- `POST /api/swap-request` - Create swap request

**Navigation**:

- Sidebar: "Marketplace" icon (Shopping Cart)

---

### 5. **Requests Page** (`/requests`) 🔒 Protected

**Purpose**: Manage swap requests (incoming and outgoing)

**Key Features**:

- **Two Tabs**:
  - **Incoming Requests**: Requests sent TO you (you are responder)
  - **Outgoing Requests**: Requests sent BY you (you are requester)
- **Request Details**: Shows both slots involved in swap
- **Action Buttons**: Accept/Reject for incoming requests
- **Status Display**: Shows PENDING, ACCEPTED, or REJECTED status

**User Actions - Incoming Requests**:

1. View requests where others want to swap with your slots
2. See requester's slot and your slot that would be swapped
3. Click "Accept" → Swaps ownership of both slots, both become BUSY
4. Click "Reject" → Returns both slots to SWAPPABLE status
5. Request status updates to ACCEPTED or REJECTED

**User Actions - Outgoing Requests**:

1. View requests you've sent to other users
2. See your slot and their slot
3. Monitor status (PENDING, ACCEPTED, or REJECTED)
4. Wait for responder to accept/reject

**Swap Acceptance Flow**:

- Your slot → Transferred to other user
- Their slot → Transferred to you
- Both slots → Status changes to BUSY
- Request → Status changes to ACCEPTED

**Swap Rejection Flow**:

- Your slot → Returns to SWAPPABLE
- Their slot → Returns to SWAPPABLE
- Request → Status changes to REJECTED

**Backend Endpoints**:

- `GET /api/requests/incoming` - Get incoming requests
- `GET /api/requests/outgoing` - Get outgoing requests
- `POST /api/swap-response/:id` - Accept or reject request

**Navigation**:

- Sidebar: "Swapping Requests" icon (Message Square)

---

## 🧭 Navigation Components

### **Sidebar** (Desktop - Hidden on Mobile)

**Location**: Left side of authenticated pages

**Navigation Items**:

1. **My Calendar** → `/dashboard`
2. **Marketplace** → `/marketplace`
3. **Swapping Requests** → `/requests`
4. **New Event** → `/new-event` (Dashboard with form pre-opened)

**User Profile Section** (Bottom of Sidebar):

- User avatar (initials with colored background)
- User name and email
- Logout button

### **Topbar** (Mobile Only)

**Location**: Top of screen (visible only on mobile)

**Features**:

- SlotSwapper logo/brand
- User name (if logged in) OR Login button (if not logged in)

---

## 🔐 Authentication Flow

```
┌─────────────────────────────────────────┐
│  1. User visits website                 │
│     → Checks localStorage for token      │
└─────────────────────────────────────────┘
                  │
        ┌─────────┴─────────┐
        │                   │
   HAS TOKEN           NO TOKEN
        │                   │
        ▼                   ▼
┌──────────────┐    ┌──────────────┐
│ Access      │    │ Redirect to  │
│ Protected   │    │ /login       │
│ Routes      │    │              │
└──────────────┘    └──────────────┘
```

**Protected Routes**:

- `/dashboard`
- `/marketplace`
- `/requests`
- `/new-event`

**Public Routes**:

- `/login`
- `/signup`

**Authentication Check**:

- **Frontend**: `ProtectedRoute` component checks `auth.isAuthenticated()`
- **Backend**: JWT token required in `Authorization: Bearer <token>` header
- **Token Expiry**: 7 days

---

## 🔄 Complete User Journey Example

### Scenario: User wants to swap a time slot

1. **Registration/Login**

   - User visits website → Redirected to `/login`
   - User creates account (`/signup`) OR logs in
   - Redirected to `/dashboard`

2. **Create Calendar Events**

   - On Dashboard, clicks "New Event"
   - Creates event: "Team Meeting" (10:00 AM - 11:00 AM)
   - Status: BUSY (default)
   - Creates another event: "Lunch Break" (12:00 PM - 1:00 PM)

3. **Mark Slot as Swappable**

   - Clicks "Mark Swappable" on "Lunch Break" event
   - Status changes to SWAPPABLE
   - This slot is now visible in marketplace for other users

4. **Browse Marketplace**

   - Navigates to `/marketplace`
   - Views available slots from other users
   - Finds interesting slot: "Coffee Chat" by User B (2:00 PM - 3:00 PM)

5. **Create Swap Request**

   - Selects "Lunch Break" (their slot) from dropdown
   - Selects "Coffee Chat" (other user's slot) from dropdown
   - Clicks "Request Swap"
   - Both slots become SWAP_PENDING
   - Swap request created

6. **Request Management**

   - Navigates to `/requests`
   - Sees request in "Outgoing Requests" tab
   - Status: PENDING (waiting for User B to respond)

7. **Other User Responds** (User B's perspective)

   - User B logs in and goes to `/requests`
   - Sees request in "Incoming Requests" tab
   - User B clicks "Accept"
   - **Swap Completed**:
     - User A's "Lunch Break" → Now owned by User B
     - User B's "Coffee Chat" → Now owned by User A
     - Both slots status: BUSY

8. **Verify Swap**
   - User A returns to Dashboard
   - Sees "Coffee Chat" in their calendar (previously owned by User B)
   - "Lunch Break" is gone (transferred to User B)

---

## 📊 Data Models

### **Event (Calendar Slot)**

- `id`: Unique identifier
- `title`: Event name
- `startTime`: Start datetime
- `endTime`: End datetime
- `status`: BUSY | SWAPPABLE | SWAP_PENDING
- `userId`: Owner's user ID
- `createdAt`, `updatedAt`: Timestamps

### **SwapRequest**

- `id`: Unique identifier
- `requesterId`: User who initiated swap
- `responderId`: User who receives request
- `requesterSlotId`: Slot from requester
- `responderSlotId`: Slot from responder
- `status`: PENDING | ACCEPTED | REJECTED
- `createdAt`, `updatedAt`: Timestamps

### **User**

- `id`: Unique identifier
- `name`: Full name
- `email`: Email address (unique)
- `password`: Hashed password
- `createdAt`, `updatedAt`: Timestamps

---

## 🎨 UI/UX Features

### **Responsive Design**

- Desktop: Full sidebar navigation
- Mobile: Topbar with collapsible navigation

### **Visual Indicators**

- Status badges: Color-coded (Green=Swappable, Yellow=Pending, Gray=Busy)
- Active route highlighting in sidebar
- Loading states for async operations
- Error messages with clear feedback

### **User Experience**

- Auto-redirect if already authenticated
- Protected routes redirect to login
- Real-time data updates via React Query
- Optimistic UI updates
- Form validation with helpful error messages

---

## 🔧 Technical Flow

### **API Request Flow**

```
Frontend Component
    ↓
React Hook (useEvents, useSwapRequests, etc.)
    ↓
API Client (axios with interceptors)
    ↓
Adds JWT Token to Header
    ↓
Backend Middleware (authenticate)
    ↓
Validates JWT Token
    ↓
Route Handler
    ↓
Database Operation (MongoDB)
    ↓
Response back to Frontend
    ↓
React Query Cache Update
    ↓
UI Re-renders
```

### **Error Handling**

- **401 Unauthorized**: Auto-logout and redirect to login
- **400 Bad Request**: Display validation errors
- **500 Server Error**: Display generic error message
- **Network Errors**: Retry logic via React Query

---

## 🚀 Key Features Summary

✅ **User Authentication**: Secure JWT-based login/signup  
✅ **Event Management**: Create, view, and manage calendar events  
✅ **Slot Status System**: BUSY, SWAPPABLE, SWAP_PENDING states  
✅ **Marketplace**: Browse available slots from other users  
✅ **Swap Requests**: Create and manage swap requests  
✅ **Automatic Transfer**: Slot ownership swaps on acceptance  
✅ **Real-time Updates**: React Query for cache management  
✅ **Protected Routes**: Secure access to authenticated pages  
✅ **Responsive UI**: Works on desktop and mobile devices

---

## 📝 Notes

- **Tokens**: JWT tokens stored in localStorage (expire after 7 days)
- **Database**: MongoDB Atlas cloud database
- **CORS**: Enabled for frontend-backend communication
- **Validation**: Input validation on both frontend and backend
- **Security**: Passwords hashed with bcrypt, routes protected with middleware

This documentation provides a complete overview of how SlotSwapper works from a user perspective and technical implementation!


