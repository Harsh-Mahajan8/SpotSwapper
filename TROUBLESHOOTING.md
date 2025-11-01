# Troubleshooting Guide - Marketplace & Swap Requests

## How to Test the Flow

### Step 1: Create Test Users
1. **User A**: Sign up with email `userA@test.com`
2. **User B**: Sign up with email `userB@test.com`
3. Or use two different browsers/incognito windows

### Step 2: Create Events and Mark as Swappable
1. **User A**:
   - Go to Dashboard
   - Create event: "Meeting A" (any date/time)
   - Click "Mark Swappable" → Status becomes SWAPPABLE

2. **User B**:
   - Go to Dashboard
   - Create event: "Meeting B" (any date/time)
   - Click "Mark Swappable" → Status becomes SWAPPABLE

### Step 3: Test Marketplace
1. **User A** logs in:
   - Go to Marketplace page
   - Should see "Meeting B" by User B (if User B marked it as swappable)
   - Should NOT see "Meeting A" (their own slot)

### Step 4: Create Swap Request
1. **User A**:
   - In Marketplace, select:
     - "Your Swappable Slot": "Meeting A"
     - "Their Slot": "Meeting B by User B"
   - Click "Request Swap"
   - Should show success message
   - Both slots should now be SWAP_PENDING (not visible in marketplace)

### Step 5: View Requests
1. **User A**:
   - Go to Requests page → "Outgoing Requests" tab
   - Should see swap request with status PENDING

2. **User B**:
   - Go to Requests page → "Incoming Requests" tab
   - Should see swap request from User A

### Step 6: Accept/Reject Swap
1. **User B** (responder):
   - In "Incoming Requests", click "Accept"
   - Confirm the action
   - **Result**:
     - "Meeting A" → Now owned by User B
     - "Meeting B" → Now owned by User A
     - Both slots status: BUSY
     - Request status: ACCEPTED

2. **OR User B clicks "Reject"**:
   - **Result**:
     - "Meeting A" → Back to SWAPPABLE (User A)
     - "Meeting B" → Back to SWAPPABLE (User B)
     - Request status: REJECTED

### Step 7: Verify Swap
1. **User A**:
   - Go to Dashboard
   - Should see "Meeting B" in their calendar (previously owned by User B)

2. **User B**:
   - Go to Dashboard
   - Should see "Meeting A" in their calendar (previously owned by User A)

## Common Issues & Solutions

### Issue: Marketplace shows no slots
**Possible causes**:
1. No other users have marked slots as SWAPPABLE
2. Backend not running
3. Authentication token expired

**Solutions**:
- Check browser console for errors
- Verify backend server is running on port 5000
- Check Network tab in DevTools to see API responses
- Make sure you have at least 2 users with swappable slots

### Issue: "Both slots must be SWAPPABLE" error
**Cause**: One or both slots are not in SWAPPABLE status

**Solutions**:
- Go to Dashboard
- Check slot status badges
- Mark slots as "Swappable" if they're "Busy"
- Slots in "SWAP_PENDING" cannot be used (wait for request to be resolved)

### Issue: Swap request not appearing
**Possible causes**:
1. Query not refreshing
2. Request creation failed silently

**Solutions**:
- Check browser console for errors
- Refresh the page
- Check Network tab to see if POST /api/swap-request succeeded
- Look for console.log messages in browser console

### Issue: Accept/Reject not working
**Possible causes**:
1. Wrong user trying to respond (only responder can accept/reject)
2. Request already processed
3. Authentication issue

**Solutions**:
- Make sure you're logged in as the user who received the request
- Check that request status is still PENDING
- Verify token is valid (try logging out and back in)

## Debugging Tips

### Frontend Console
Open browser DevTools (F12) and check:
- Console tab for errors and log messages
- Network tab to see API requests/responses
- Application tab → Local Storage to verify token exists

### Backend Console
Check backend terminal for:
- `[GET /swappable-slots]` - Shows how many slots found
- `[POST /swap-request]` - Shows swap request creation
- `[POST /swap-response/:id]` - Shows accept/reject actions

### Test API Endpoints Directly
Use Postman or curl to test:

```bash
# Get swappable slots (replace TOKEN with your JWT)
curl -H "Authorization: Bearer TOKEN" http://localhost:5000/api/swappable-slots

# Create swap request
curl -X POST \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"mySlotId": "SLOT_ID_1", "theirSlotId": "SLOT_ID_2"}' \
  http://localhost:5000/api/swap-request
```

## Expected API Responses

### GET /api/swappable-slots
```json
[
  {
    "id": "...",
    "title": "Meeting",
    "startTime": "2024-01-15T10:00:00Z",
    "endTime": "2024-01-15T11:00:00Z",
    "status": "SWAPPABLE",
    "userId": "...",
    "user": {
      "id": "...",
      "name": "User Name",
      "email": "user@example.com"
    }
  }
]
```

### POST /api/swap-request
**Request**:
```json
{
  "mySlotId": "slot_id_1",
  "theirSlotId": "slot_id_2"
}
```

**Success Response (201)**:
```json
{
  "id": "request_id",
  "requesterId": "...",
  "responderId": "...",
  "requesterSlotId": "...",
  "responderSlotId": "...",
  "status": "PENDING",
  "requesterSlot": {...},
  "responderSlot": {...},
  "requester": {...},
  "responder": {...}
}
```

### POST /api/swap-response/:id
**Request**:
```json
{
  "action": "accept"  // or "reject"
}
```

**Success Response (200)**: Same format as swap-request response with updated status

## Verification Checklist

✅ Backend server running on port 5000
✅ Frontend server running on port 3000
✅ MongoDB connected
✅ User authenticated (token in localStorage)
✅ At least 2 users created
✅ Both users have events marked as SWAPPABLE
✅ Marketplace shows other users' slots (not own slots)
✅ Swap request creates successfully
✅ Requests page shows incoming/outgoing requests
✅ Accept/Reject buttons work
✅ After accept, slots ownership transfers correctly
✅ After reject, slots return to SWAPPABLE

