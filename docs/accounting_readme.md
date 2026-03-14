# GRACE-X Accounting™ - Documentation

**Version:** 2.0.0  
**Author:** Zac Crockett  
**Type:** Personal & Small Business Finance Suite

---

## ⚠️ IMPORTANT DISCLAIMER

**This module is NOT financial advice.** It is an organiser, calculator, and document helper. Always consult a qualified accountant for tax and financial decisions. Check with HMRC for UK tax requirements.

---

## 📋 Overview

GRACE-X Accounting™ is a comprehensive mini-finance suite for:
- **Personal finance tracking**
- **Small business accounting**
- **Freelancer income/expense management**
- **Self-employed tax preparation helpers**

### Key Features

| Feature | Description |
|---------|-------------|
| 💳 **Transactions** | Add/edit/delete income & expenses with categories |
| 📄 **Invoices** | Create professional invoices with line items |
| 🧾 **Receipts** | Upload and store receipt images with metadata |
| 🏛️ **Tax Helper** | UK-friendly tax estimate calculator |
| 📥 **Exports** | CSV, JSON, and HTML report exports |
| 📜 **Audit Log** | Timestamped action history |

---

## 🏗️ Architecture

### File Structure

```
assets/
├── css/
│   └── accounting.css        # Module styling
├── js/
│   ├── accounting.js         # Main UI controller
│   ├── accounting_engine.js  # Core data layer
│   └── accounting_reports.js # Export/report generation
modules/
└── accounting.html           # Module UI template
docs/
├── accounting_readme.md      # This file
└── accounting_log.md         # Change log
```

### Data Storage

All data is stored in `localStorage` under the key:
```
gracex_accounting_v1
```

### Data Entities

```javascript
// Transaction
{
  id: "TX-1234567890-ABC123",
  date: "2024-12-17",
  type: "income" | "expense",
  amount: 150.00,
  category: "Freelance",
  vendor: "Client Name",
  description: "Website development",
  notes: "Optional notes",
  tags: ["web", "2024"],
  recurring: false,
  receiptId: null,
  createdAt: "2024-12-17T10:30:00.000Z"
}

// Invoice
{
  id: "INV-1234567890-ABC123",
  number: "INV-2024-0001",
  client: {
    name: "Client Ltd",
    email: "client@example.com",
    address: "123 Street, London"
  },
  items: [
    { description: "Service", quantity: 1, unitPrice: 500, total: 500 }
  ],
  subtotal: 500,
  vatRate: 20,
  vatAmount: 100,
  total: 600,
  status: "draft" | "sent" | "paid" | "overdue" | "cancelled",
  createdAt: "2024-12-17T10:30:00.000Z"
}

// Receipt
{
  id: "RCP-1234567890-ABC123",
  date: "2024-12-17",
  vendor: "Store Name",
  amount: 25.99,
  category: "Fuel",
  fileName: "receipt.jpg",
  fileDataURL: "data:image/jpeg;base64,...",
  notes: "Optional notes",
  transactionId: null
}
```

---

## 🖥️ UI Layout

### 3-Panel Design

```
┌─────────────┬────────────────────────┬──────────────┐
│   SIDEBAR   │      MAIN CONTENT      │   SUMMARY    │
│   (Tabs)    │   (Active Tab View)    │   (Stats)    │
│             │                        │              │
│ Dashboard   │  Forms, Lists, etc.    │  Income      │
│ Transactions│                        │  Expenses    │
│ Invoices    │                        │  Profit      │
│ Receipts    │                        │              │
│ Tax Helper  │                        │  Quick       │
│ Exports     │                        │  Actions     │
│ Settings    │                        │              │
├─────────────┴────────────────────────┴──────────────┤
│                    AUDIT LOG (Bottom)                │
└─────────────────────────────────────────────────────┘
```

---

## 🏛️ Tax Helper (UK)

### Disclaimer
**ESTIMATES ONLY** - Always verify with HMRC or a qualified accountant.

### Calculations Included

| Tax Component | Description |
|---------------|-------------|
| Personal Allowance | £12,570 (2024-25) |
| Basic Rate (20%) | Up to £37,700 taxable |
| Higher Rate (40%) | £37,701 - £125,140 |
| Additional Rate (45%) | Above £125,140 |
| Class 2 NI | Flat rate if profit > £12,570 |
| Class 4 NI | 9% (£12,570-£50,270), 2% above |

### VAT Support
- Toggle VAT registration in Settings
- Default rate: 20%
- Shows VAT on invoices when enabled

### "Set Aside" Feature
- Slider to calculate suggested tax reserve
- Default: 25% of profit
- Adjustable from 10-50%

---

## 📄 Invoice Generator

### Features
- Professional PDF-ready layout
- Client details (name, email, address)
- Multiple line items
- Automatic calculations
- Optional VAT
- Payment terms
- Print-to-PDF via browser

### Statuses
- `draft` - Not sent
- `sent` - Awaiting payment
- `paid` - Completed
- `overdue` - Past due date
- `cancelled` - Voided

---

## 🧾 Receipt Vault

### Supported Files
- Images: JPG, PNG, GIF
- Documents: PDF

### Storage
- Files stored as Base64 in localStorage
- **Warning:** Large files consume storage quota
- Recommended max: 5MB per file

### Linking
- Receipts can be linked to transactions
- Shows visual connection in both views

---

## 📥 Export Options

| Format | Contains | Use Case |
|--------|----------|----------|
| **CSV** | Transactions only | Spreadsheet import |
| **JSON** | All data | Full backup |
| **HTML Report** | Monthly/Annual summary | Printing/sharing |

---

## 🔧 Settings

### Business Details
- Business name (for invoices)
- Address
- Bank details

### Tax Settings
- Business type (self-employed, limited, etc.)
- VAT registered toggle
- VAT rate (default 20%)
- Set-aside percentage

### Categories
- Custom income categories
- Custom expense categories

---

## 📜 Audit Log

All actions are logged with:
- Timestamp
- Action type (ADD, EDIT, DELETE, EXPORT, INFO)
- Description
- Associated data (truncated)

**Ring buffer:** Limited to 500 entries (oldest removed first)

---

## 🧪 Testing Checklist

Before deployment, verify:

- [ ] Module loads without console errors
- [ ] Tab navigation works
- [ ] Add/edit/delete transactions works
- [ ] Totals update correctly
- [ ] Category breakdown renders
- [ ] Invoice creation works
- [ ] Invoice prints cleanly
- [ ] Receipt upload works
- [ ] Receipt preview opens
- [ ] Tax calculator runs
- [ ] CSV export generates file
- [ ] JSON export generates file
- [ ] HTML report generates
- [ ] Data persists after refresh
- [ ] Settings save correctly

---

## 🚨 Known Limitations

1. **Storage Size** - localStorage typically ~5-10MB per domain
2. **Receipt Images** - Large base64 images consume storage quickly
3. **No Cloud Sync** - Data stays in browser only
4. **Tax Estimates** - Not official calculations
5. **No HMRC Integration** - Manual filing still required
6. **Single User** - No multi-user support

---

## 🔐 Hard Rules (Non-Negotiable)

| Rule | Status |
|------|--------|
| No external paid APIs | ✅ |
| Works offline | ✅ |
| Data stays local | ✅ |
| No financial advice | ✅ |
| Clear disclaimers | ✅ |
| Audit trail | ✅ |

---

## 🚀 Future Enhancements (Not Implemented)

Ideas for future development:
1. **Bank Statement Import** - CSV/OFX parsing
2. **Recurring Transactions** - Auto-add monthly
3. **Budget Tracker** - Category limits
4. **Debt Tracker** - Loan management
5. **Multi-Currency** - GBP, EUR, USD
6. **Cloud Backup** - Optional sync

---

**© 2024 GRACE-X AI™ - All Rights Reserved**
