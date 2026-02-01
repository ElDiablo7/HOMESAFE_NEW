# GRACE-X Accounting™ - Change Log

## Version 2.0.0 (2024-12-17)

### 🚀 Major Upgrade: Mini-Finance Suite

**Complete rewrite** of the Accounting module from basic tracker to comprehensive finance suite.

### ✨ New Features

#### Income & Expense Tracker
- Fast entry with quick-tap category buttons
- Full form with vendor, notes, and tags
- Filters: period, category, type, search
- Category breakdown with progress bars
- 7-day mini bar chart

#### Invoice Generator
- Professional PDF-ready layout
- Client details (name, email, address)
- Multiple line items with auto-calc
- Optional VAT support
- Print via browser's print dialog
- Status tracking (draft/sent/paid/overdue)

#### Receipt Vault
- Drag & drop upload
- Image preview
- Metadata entry (vendor, amount, category)
- Base64 storage (local only)
- Link to transactions

#### Tax Helper (UK-Friendly)
- Self-employed tax estimate calculator
- Income Tax (20%/40%/45% bands)
- National Insurance (Class 2 & 4)
- Personal Allowance handling
- VAT toggle for registered businesses
- "Set Aside" suggestion slider
- **BIG DISCLAIMER**: Estimates only

#### Exports & Reports
- CSV export (transactions)
- JSON backup (all data)
- HTML monthly/annual reports
- Copy to clipboard helpers

#### Audit Log
- Timestamped action history
- Action types: ADD, EDIT, DELETE, EXPORT, INFO
- Ring buffer (500 max entries)
- Displayed in bottom panel

### 🎨 UI Changes

- **3-Panel Layout**: Left (tabs), Center (content), Right (summary)
- Dark sci-fi theme with blue/silver accents
- Quick action buttons in right panel
- Responsive grid for receipts
- Improved transaction list styling

### 🏗️ Architecture Changes

- Separated into 3 JS files:
  - `accounting_engine.js` - Core data layer
  - `accounting_reports.js` - Export/report generation
  - `accounting.js` - UI controller
- New CSS file: `accounting.css`
- Unified storage key: `gracex_accounting_v1`

### 📁 Files Created/Modified

| File | Action |
|------|--------|
| `assets/css/accounting.css` | ✨ Created |
| `assets/js/accounting_engine.js` | ✨ Created |
| `assets/js/accounting_reports.js` | ✨ Created |
| `assets/js/accounting.js` | 🔄 Replaced |
| `modules/accounting.html` | 🔄 Replaced |
| `index.html` | 📝 Patched (CSS + JS links) |
| `docs/accounting_readme.md` | ✨ Created |
| `docs/accounting_log.md` | ✨ Created |

### 🔒 Compliance

- ✅ No external paid APIs
- ✅ Works offline (localStorage)
- ✅ Data stays local
- ✅ No financial advice claims
- ✅ Clear tax disclaimers
- ✅ Audit trail implemented
- ✅ Patch-only changes to index.html

---

## Version 1.0.0 (Previous)

- Basic income/expense tracker
- Simple category breakdown
- Basic tax calculator
- CSV export
- Notes section

---

**Maintainer:** Zac Crockett  
**Last Updated:** 2024-12-17
