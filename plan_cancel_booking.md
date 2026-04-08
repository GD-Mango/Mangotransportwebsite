# Feature Implementation Plan: Cancel Booking Receipt

## Objective
Provide functionality to gracefully cancel a booking receipt for scenarios such as a customer backing out of the booking. This should record the cancellation without hard-deleting the record from the database to retain history.

## User Review Required
> [!IMPORTANT]
> - Should only the "Admin / Owner" have the ability to cancel bookings, or can depot managers do it as well before dispatch?
Ans. Only Admin/Owner can cancel bookings.
> - When a receipt is cancelled, should the receipt number be reserved/burned, or should it be freed for subsequent bookings? (Usually, it is retained for audit trails).
Ans. It is retained for audit trails.


## Proposed Changes

### Backend API & Database (`src/app/utils/api.ts`)
#### [MODIFY] `api.ts`
- Implement a `bookingsApi.cancel(bookingId)` function that updates the `current_status` of the existing booking record to `"cancelled"`.
- Ensure related receiver statuses are also appropriately tagged or cascade mapped to a terminal cancelled state if necessary.

### Sync Engine / Offline Support (`src/app/utils/syncEngine.ts`)
#### [MODIFY] `syncEngine.ts`
- Define a new operation `CANCEL_BOOKING` in the sync queue logic.
- Ensure that if a user cancels a booking while offline, it is queued and synchronized with the Supabase database upon gaining connection.

### UI Components (`src/app/components/AllReceipts.tsx` & Dashboard)
#### [MODIFY] `AllReceipts.tsx` / `RecentBookings`
- Add a "Cancel" action next to "Edit" on lists rendering valid bookings.
- When clicked, dispatch a confirmation dialog: "Are you sure you want to cancel this booking? This action cannot be undone."
- Visually mark the listed item as "Cancelled" (e.g., using a distinct grey or red badge and strikethrough text for prices).
- Prevent any edits to a cancelled booking.

## Verification Plan
1. Access the `AllReceipts` or Dashboard tab as a valid privileged user.
2. Ensure a regular valid booking has a "Cancel" button.
3. Click "Cancel" and approve the confirmation dialog.
4. Verify the row reflects "Cancelled" formatting in the list, and any monetary values are decoupled from daily totals.
5. Verify the cancellation state successfully propagates to the Database (via `api.ts`).
