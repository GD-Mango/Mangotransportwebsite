# DRT Mango Transport - Test Login Credentials

> **⚠️ WARNING:** These are test credentials for development only. Do not use in production!

---

## Admin / Owner

**Email:** `admin@mango.com`  
**Password:** `admin123`  
**Role:** Owner  
**Access:** Full system access - all features

**Can access:**
- Dashboard (with revenue metrics)
- New Booking
- Trip Creation
- Trips & Deliveries
- Reports (full)
- All Receipts (with edit/delete)
- Credit Ledger
- Settings (user management, depot management, etc.)

---

## Booking Clerk

**Email:** `clerk@mango.com`  
**Password:** `clerk123`  
**Role:** Booking Clerk  
**Access:** Operational access only

**Can access:**
- Dashboard (no revenue metrics)
- New Booking
- Trip Creation
- Trips & Deliveries (view only)

**Cannot access:**
- Settings
- Credit Ledger
- Full Reports
- All Receipts
- Cannot edit/delete bookings

---

## Depot Managers

### 1. Bhusari Colony Manager

**Email:** `bhusari@mango.com`  
**Password:** `bhusari123`  
**Role:** Depot Manager  
**Assigned Depot:** Bhusari Colony  
**Access:** Depot-specific operations

**Can access:**
- Dashboard (depot-specific)
- Trips & Deliveries (for Bhusari Colony)
- Reports (depot-specific)
- All Receipts (for Bhusari Colony only)
- Credit Ledger (view only)
- Mark deliveries for Bhusari Colony depot

**Cannot access:**
- Settings
- Create bookings
- Create trips
- Other depots' data

---

### 2. Sadashiv Peth Manager

**Email:** `sadashiv@mango.com`  
**Password:** `sadashiv123`  
**Role:** Depot Manager  
**Assigned Depot:** Sadashiv Peth (Forwarding Hub)  
**Access:** Depot-specific operations + forwarding

**Can access:**
- Dashboard (depot-specific)
- Trips & Deliveries (for Sadashiv Peth)
- Reports (depot-specific)
- All Receipts (for Sadashiv Peth only)
- Credit Ledger (view only)
- Mark deliveries for Sadashiv Peth depot
- **Create forwarding trips** (to Akurdi, Nagpur, Bhopal)

**Cannot access:**
- Settings
- Create bookings
- Create origin trips
- Other depots' data

---

### 3. Akurdi Manager

**Email:** `akurdi@mango.com`  
**Password:** `akurdi123`  
**Role:** Depot Manager  
**Assigned Depot:** Akurdi  
**Access:** Depot-specific operations

**Can access:**
- Dashboard (depot-specific)
- Trips & Deliveries (for Akurdi)
- Reports (depot-specific)
- All Receipts (for Akurdi only)
- Credit Ledger (view only)
- Mark deliveries for Akurdi depot

**Cannot access:**
- Settings
- Create bookings
- Create trips
- Other depots' data

---

## Quick Login Reference

| Role | Email | Password | Key Access |
|------|-------|----------|------------|
| **Owner** | admin@mango.com | admin123 | Everything |
| **Booking Clerk** | clerk@mango.com | clerk123 | Create bookings/trips only |
| **Bhusari Colony** | bhusari@mango.com | bhusari123 | Bhusari deliveries |
| **Sadashiv Peth** | sadashiv@mango.com | sadashiv123 | Sadashiv deliveries + forwarding |
| **Akurdi** | akurdi@mango.com | akurdi123 | Akurdi deliveries |

---

## Testing Scenarios

### Test 1: Booking Clerk Workflow
1. Login as `clerk@mango.com`
2. Create a new booking
3. Create a trip with the booking
4. Verify cannot access Settings or Credit Ledger
5. Verify Dashboard shows no revenue

### Test 2: Depot Manager Workflow
1. Login as `bhusari@mango.com`
2. Go to Trips & Deliveries
3. Mark receipts as delivered
4. Verify cannot see other depots' data
5. Verify cannot create new bookings

### Test 3: Admin Full Access
1. Login as `admin@mango.com`
2. Access all pages
3. Edit settings, manage users
4. View full reports with revenue

---

**Last Updated:** 2024-12-25
