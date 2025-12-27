# Database Migration Safety Guidelines

## ⚠️ CRITICAL: Migration Files Are Automatically Applied

When you run `npx supabase db push`, ALL pending migration files in the `supabase/migrations/` folder are automatically applied to your production database.

## Safety Rules

### 1. Never Put Destructive Migrations in the Folder
- Files with `DELETE`, `TRUNCATE`, or `DROP` statements should NEVER be placed in the migrations folder
- If you need to clear data, run the SQL manually in the Supabase SQL Editor

### 2. Naming Convention for Dangerous Files
If you must store destructive scripts, use a naming convention that prevents auto-execution:
- `MANUAL_ONLY_*.sql` - for scripts that should only be run manually
- `*.sql.DISABLED` - disabled scripts
- Store in a separate folder like `supabase/scripts/` instead of `supabase/migrations/`

### 3. Review Before Pushing
Always review pending migrations before running `db push`:
```bash
# List pending migrations
npx supabase migration list

# Review each pending file manually before pushing
```

### 4. Backup Before Migration
Always take a backup before running migrations:
- Use Supabase's Point-in-Time Recovery (Pro plan)
- Export data manually before major migrations

### 5. Use Transaction Blocks
Always wrap data modifications in transactions:
```sql
BEGIN;
-- Your changes here
COMMIT;
```

## Archived Files

These files have been disabled to prevent accidental re-execution:
- `ARCHIVED_20251226000000_clear_test_data_for_alpha.sql.DISABLED`

## Safe Migration Template
```sql
-- ============================================================
-- Migration: [Description]
-- Created: [Date]
-- Author: [Name]
-- 
-- SAFETY CHECK: This migration contains:
-- [ ] Only schema changes (safe)
-- [ ] Data insertions (safe)
-- [ ] Data updates (review carefully)
-- [ ] Data deletions (DANGEROUS - should be manual only!)
-- ============================================================

BEGIN;

-- Your safe migration SQL here

COMMIT;
```
