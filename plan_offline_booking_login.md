# Feature Implementation Plan: Offline Booking & Login

## Objective
Enable users to access the application and create bookings even when entirely disconnected from the internet (e.g., launching the app or opening in offline mode), provided they have logged in at least once before.

## User Review Required
> [!IMPORTANT]
> - Offline login relies on caching local credentials or providing a system-wide offline PIN. Should this offline fallback rely on local pin/password caching per-user, or should we use a fallback master PIN for offline access?
Ans. Local pin/password caching per-user.
> - During offline login, data sync is deferred until the app regains connectivity. Are there any restrictions on what operations (like fetching past receipts) should be disabled offline?
Ans. Only Bokking should work offline. User must be able to see offline bookings created in offline mode. No other operations should be allowed.

## Proposed Changes

### Credential Caching (`src/app/utils/auth.ts` or New Cache Utility)
#### [NEW / MODIFY] `auth.ts`
- Modify the successful sign-in flow to securely hash and cache the user's role, `userId`, `depotId`, and credentials (email/password hash or an access pin) to local storage (e.g., IndexedDB or `localforage`, which is already used by `syncEngine`).

### Login Component (`src/app/components/LoginPage.tsx`)
#### [MODIFY] `LoginPage.tsx`
- Before attempting Supabase authentication, check `navigator.onLine`.
- If offline, compare the inputted credentials against the locally cached credentials.
- If authorized, allow the user into the primary application shell and set `useOnlineStore` status to offline.
- If no credentials match or the cache is empty (first time), prompt the user: "You must be online for your first login."

### App Entry (`src/app/App.tsx`)
#### [MODIFY] `App.tsx`
- Ensure that the primary App shell does not hard block mounting when Supabase session fetch fails due to network `fetch` errors. It should gracefully fallback to the cached session.

### Data Fetching and Submission
- Rely on the existing `syncEngine.ts` to queue new bookings as `CREATE_BOOKING`.
- Ensure critical baseline lists (depots, pricing, packages) are cached and available offline on successful login.

## Verification Plan
1. Log into the application while online.
2. Disable network connectivity on the device/browser.
3. Refresh the application / Clear memory and execute a cold start.
4. Supply login credentials on `LoginPage.tsx`.
5. Verify successful authentication and UI routing to New Booking.
6. Verify booking can be successfully queued offline.
