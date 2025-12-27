# Offline Support Testing Guide

This guide provides step-by-step instructions for testing the offline-first functionality.

## Prerequisites

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Open browser DevTools (F12 or Ctrl+Shift+I)

3. Navigate to the Network tab for simulating offline mode

---

## Test Scenarios

### 1. Offline Booking Creation

**Steps:**
1. Log in to the application
2. Navigate to "New Booking"
3. Fill in partial booking data (sender name, phone)
4. Open DevTools → Network tab → Check "Offline" checkbox
5. Complete the booking form and click "Create Booking"

**Expected Results:**
- ✅ Alert shows "Booking Saved Locally" with temporary reference (PENDING-XXXXXXXX)
- ✅ Orange offline indicator appears at top of screen
- ✅ Booking confirmation step shows pending status with hourglass icon

**Verification:**
```javascript
// In browser console:
JSON.parse(localStorage.getItem('mango-sync-queue'))
// Should show pendingOperations with type: "CREATE_BOOKING"
```

---

### 2. Sync on Reconnection

**Steps:**
1. Complete Test 1 (have pending booking)
2. Uncheck "Offline" in DevTools Network tab
3. Wait 5 seconds (or refresh page)

**Expected Results:**
- ✅ Console logs: "[SyncEngine] Back online, processing queue"
- ✅ Console logs: "[SyncEngine] Operation xxx completed successfully"
- ✅ Offline indicator disappears
- ✅ localStorage sync queue is cleared

---

### 3. Draft Recovery (Booking)

**Steps:**
1. Navigate to "New Booking"
2. Fill in some fields (sender name, phone, select depot)
3. Wait 2 seconds (for auto-save)
4. Close the browser tab
5. Reopen the app and navigate to "New Booking"

**Expected Results:**
- ✅ Blue prompt appears: "Resume Previous Booking?"
- ✅ Clicking "Resume Booking" restores the form data
- ✅ Clicking "Start Fresh" clears the draft

**Verification:**
```javascript
// Check draft storage:
JSON.parse(localStorage.getItem('mango-booking-draft'))
```

---

### 4. Draft Expiry (24 hours)

**Steps:**
1. Create a draft (fill partial booking form)
2. Modify localStorage to set old timestamp:
   ```javascript
   const store = JSON.parse(localStorage.getItem('mango-booking-draft'));
   store.state.lastSavedAt = new Date(Date.now() - 25*60*60*1000).toISOString();
   localStorage.setItem('mango-booking-draft', JSON.stringify(store));
   ```
3. Refresh and navigate to "New Booking"

**Expected Results:**
- ✅ No draft recovery prompt appears
- ✅ Fresh form is shown

---

### 5. Offline Delivery Marking

**Steps:**
1. Ensure there's a booking with status "in_transit"
2. Navigate to "Trips & Deliveries" → "Deliveries" tab
3. Go offline (Network tab → "Offline")
4. Click "Mark Delivered" on a booking

**Expected Results:**
- ✅ Button changes to "📤 Mark (Offline)"
- ✅ Status immediately changes to "✓ Delivered (syncing...)"
- ✅ Yellow "Pending sync" indicator appears
- ✅ Operation added to sync queue

---

### 6. Failed Sync with Retry

**Steps:**
1. Start with pending operations
2. Use DevTools to block specific API:
   - Network tab → Right-click → "Block request URL" → add `*/bookings*`
3. Go online
4. Observe retry behavior

**Expected Results:**
- ✅ Console shows retry with backoff: "will retry in 1000ms"
- ✅ Retries increase: 1s → 2s → 4s → 8s → up to 30s
- ✅ After 5 retries, status changes to "failed"
- ✅ Offline indicator shows "X failed" with retry button

---

### 7. Multiple Pending Operations

**Steps:**
1. Go offline
2. Create 3 bookings in sequence
3. Go online

**Expected Results:**
- ✅ All 3 bookings sync in order (FIFO)
- ✅ Console shows each completing
- ✅ All temporary references removed from queue

---

### 8. Trip Creation Offline

**Steps:**
1. Navigate to "Create Trip"
2. Fill in driver details and select bookings
3. Go offline
4. Submit trip

**Expected Results:**
- ✅ Alert: "Trip saved offline! Reference: TRIP-XXXXXXXX"
- ✅ Form clears
- ✅ Operation in sync queue with type "CREATE_TRIP"

---

### 9. Browser Refresh with Pending Ops

**Steps:**
1. Create offline operation (don't sync)
2. Refresh browser (F5)
3. Check sync queue

**Expected Results:**
- ✅ Pending operations survive refresh
- ✅ Offline indicator shows pending count
- ✅ Sync resumes when online

---

### 10. Conflict Detection (Simulated)

> Note: This requires simulating a 409 response or version mismatch

**Steps:**
1. Have pending UPDATE_BOOKING operation
2. Modify API to return 409 or "conflict" message
3. Go online and sync

**Expected Results:**
- ✅ Conflict modal appears
- ✅ Shows "Your Changes" vs "Server Version"
- ✅ Three options: Keep Mine, Use Server, Discard
- ✅ Resolution clears conflict from queue

---

## Quick Console Commands

```javascript
// View sync queue
JSON.parse(localStorage.getItem('mango-sync-queue'))

// Clear sync queue (for testing)
localStorage.removeItem('mango-sync-queue')

// View booking draft
JSON.parse(localStorage.getItem('mango-booking-draft'))

// View trip draft
JSON.parse(localStorage.getItem('mango-trip-draft'))

// Force process queue (when online)
window.dispatchEvent(new Event('online'))
```

---

## Checklist Summary

| # | Test | Status |
|---|------|--------|
| 1 | Offline Booking Creation | ☐ |
| 2 | Sync on Reconnection | ☐ |
| 3 | Draft Recovery | ☐ |
| 4 | Draft Expiry | ☐ |
| 5 | Offline Delivery Marking | ☐ |
| 6 | Failed Sync with Retry | ☐ |
| 7 | Multiple Pending Ops | ☐ |
| 8 | Trip Creation Offline | ☐ |
| 9 | Browser Refresh | ☐ |
| 10 | Conflict Detection | ☐ |

---

## Troubleshooting

### Operations stuck in "syncing"
- Check if sync engine is running: Look for console logs
- Force restart: Refresh browser

### Draft not saving
- Check localStorage quota
- Verify form has meaningful data (debounce waits 1s)

### Conflicts not showing
- Conflicts only appear for UPDATE operations with 409/version mismatch
- CREATE operations don't conflict

### Sync not triggering
- Ensure `startSyncEngine()` called in App.tsx
- Check online status: `navigator.onLine`
