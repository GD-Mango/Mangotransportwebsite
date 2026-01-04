# Mango Transport Website - Git Documentation

## Repository Overview

| Property | Value |
|----------|-------|
| **Repository Name** | Mangotransportwebsite |
| **Remote URL** | https://github.com/GD-Mango/Mangotransportwebsite/ |
| **Primary Branch** | `main` |
| **Total Commits** | 30 |
| **Contributors** | 2 |
| **Project Started** | December 23, 2025 |
| **Last Updated** | January 4, 2026 |

---

## Contributors

| Contributor | Commits |
|-------------|---------|
| Sonoma Developer | 27 |
| figma[bot] | 3 |

---

## Commit History

### January 2026

| Date | Hash | Description |
|------|------|-------------|
| 2026-01-04 | `54b4bf1` | chore: add dist/ to gitignore and fix encoding |
| 2026-01-04 | `349cd0c` | chore: add dist/ to gitignore and remove build output from tracking |
| 2026-01-04 | `beaccbd` | fix: add id, name, and htmlFor attributes to form fields for accessibility |
| 2026-01-04 | `9f1a7b4` | Update branding: rename to Dirba Amba, update logo placement, and update favicon references |
| 2026-01-04 | `e9f9e2f` | Update logo to Logo.svg, add new icons, and fix TypeScript errors |
| 2026-01-04 | `8aa113e` | Rebrand: Change 'Mango Express' to 'Dirba Amba Service' |

### December 2025

| Date | Hash | Description |
|------|------|-------------|
| 2025-12-28 | Various | Reports CSV export enhancements, credit customer detailed exports |
| 2025-12-27 | Various | Trip auto-completion logic for managed depots |
| 2025-12-26 | Various | Offline booking & sync implementation, admin receipt management |
| 2025-12-25 | Various | Trip-receipt integration with auto-completion |
| 2025-12-24 | Various | Credit payments, contacts, and pricing features |
| 2025-12-23 | `4984502` | Initial commit from Figma Make |

---

## Key Features Implemented

Based on commit history, the following major features have been developed:

### Core Functionality
- 📦 **Booking System** - Multi-receiver package booking with pricing
- 🚚 **Trip Management** - Trip creation, forwarding, and delivery tracking
- 💳 **Credit System** - Credit customer management and payment tracking
- 📊 **Reports** - Revenue, booking, and depot reports with CSV export

### User Experience
- 🔐 **Role-based Access** - Owner, Booking Clerk, and Depot Manager roles
- 📱 **Responsive Design** - Mobile-friendly UI with touch navigation
- 🔄 **Offline Support** - Offline booking with sync when back online
- 📄 **PDF Receipts** - Professional receipt generation and WhatsApp sharing

### Technical
- ⚡ **Performance** - Code splitting, lazy loading, optimized bundles
- ♿ **Accessibility** - Proper form labels and ARIA attributes
- 🔄 **PWA** - Service worker for offline functionality

---

## Branch Strategy

| Branch | Purpose |
|--------|---------|
| `main` | Production-ready code, deployed to production |

---

## Remote Configuration

```
origin  https://github.com/GD-Mango/Mangotransportwebsite/ (fetch)
origin  https://github.com/GD-Mango/Mangotransportwebsite/ (push)
```

---

## .gitignore Configuration

The repository uses a comprehensive `.gitignore` that excludes:

- `node_modules/` - NPM dependencies
- `dist/` - Production build output
- `.env*` - Environment files with secrets
- Editor/IDE settings (`.vscode/`, `.idea/`)
- OS files (`.DS_Store`, `Thumbs.db`)
- Log files and temporary files

---

## Quick Reference Commands

```bash
# Clone the repository
git clone https://github.com/GD-Mango/Mangotransportwebsite.git

# View commit history
git log --oneline

# Check current status
git status

# Pull latest changes
git pull origin main

# Push changes
git push origin main

# View all branches
git branch -a

# View remote details
git remote -v
```

---

## Technology Stack

| Category | Technology |
|----------|------------|
| **Frontend** | React 18.3.1, TypeScript |
| **Build Tool** | Vite 6.3.5 |
| **Styling** | TailwindCSS 4.1.12 |
| **State Management** | Zustand 5.0.9 |
| **Backend** | Supabase |
| **PDF Generation** | jsPDF 3.0.4 |
| **UI Components** | Radix UI |
| **Charts** | Recharts 2.15.2 |

---

*Document generated on: January 4, 2026*
