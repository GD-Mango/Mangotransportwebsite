# Feature Implementation Plan: Back-Dated Booking Entries

## Objective
Allow admin users (e.g., `owner` role) to create booking entries with a custom, back-dated date instead of the default current date.

## User Review Required
> [!IMPORTANT]
> - Do you want this feature restricted **only** to the `owner` role, or should `booking_clerk` or `depot_manager` also have access to backdate?        
Ans. Only Owner role
> - Should there be a limit on how far back a booking can be dated (e.g., only within the current season)?
Ans. Only within the current season.    

## Proposed Changes

### Database Changes
No major schema changes are required if `created_at` or `booking_date` is already a timestamp field. However, need to ensure Row Level Security (RLS) in Supabase or the stored procedure `create_booking` does not override a provided `created_at` value with `now()` and allows explicit insertion of the date.

### API (`src/app/utils/api.ts`)
#### [MODIFY] `api.ts`
- Update `bookingsApi.create(bookingData)` to accept an optional `override_date` or `created_at` parameter.
- Ensure the payload sent to the backend includes this date if provided.

### UI Components (`src/app/components/NewBooking.tsx`)
#### [MODIFY] `NewBooking.tsx`
- Conditionally render a Date Picker input in "Step 1: Depot, Payment & Delivery" if the `userRole` corresponds to an admin.
- Set the default component state to `today`.
- Append the selected `bookingDate` to the `bookingData` state object before submitting.

### Sync Engine (`src/app/utils/syncEngine.ts`)
#### [MODIFY] `syncEngine.ts`
- Ensure that the offline sync queue preserves the selected `bookingDate` instead of resetting to the sync execution timestamp when the connectivity is restored.

## Verification Plan
1. Log in as an admin (`owner`).
2. Verify the Date Picker is visible in New Booking.
3. Select a date 3 days in the past and submit the booking.
4. Verify in the UI (Dashboard/Receipts) and Database that the `created_at` reflects the back-dated date, not the current date.
