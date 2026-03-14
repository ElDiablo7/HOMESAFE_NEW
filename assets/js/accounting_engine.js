// ═══════════════════════════════════════════════════════════════════════════════
// GRACE-X Accounting™ ENGINE - Core Data Layer
// © Zac Crockett - Personal + Small Business Finance Assistant
// ═══════════════════════════════════════════════════════════════════════════════
//
// DISCLAIMER: This is NOT financial advice. It's an organiser + calculator.
// Always consult a qualified accountant for tax and financial decisions.
//
// ═══════════════════════════════════════════════════════════════════════════════

(function() {
  'use strict';

  // ═══════════════════════════════════════════════════════════════════════════
  // CONFIGURATION
  // ═══════════════════════════════════════════════════════════════════════════

  const CONFIG = {
    version: '2.0.0',
    storageKey: 'gracex_accounting_v1',
    maxAuditEntries: 500,
    maxReceiptSize: 2 * 1024 * 1024, // 2MB warning threshold
    defaultCurrency: 'GBP',
    defaultVatRate: 20
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // DATA SCHEMA
  // ═══════════════════════════════════════════════════════════════════════════

  const DEFAULT_DATA = {
    transactions: [],
    invoices: [],
    receipts: [],
    settings: {
      currency: 'GBP',
      currencySymbol: '£',
      taxYear: '2024-25',
      vatRegistered: false,
      vatRate: 20,
      businessType: 'self-employed',
      businessName: '',
      businessAddress: '',
      bankDetails: '',
      incomeCategories: ['Salary', 'Invoice', 'Freelance', 'Sale', 'Refund', 'Other Income'],
      expenseCategories: ['Fuel', 'Groceries', 'Tools', 'Materials', 'Bills', 'Software', 'Travel', 'Office', 'Marketing', 'Insurance', 'Professional Fees', 'Other'],
      setAsidePercentage: 25
    },
    auditLog: [],
    metadata: {
      created: null,
      lastModified: null,
      version: CONFIG.version
    }
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // ACCOUNTING ENGINE
  // ═══════════════════════════════════════════════════════════════════════════

  const AccountingEngine = {
    data: null,
    isReady: false,

    // ═════════════════════════════════════════════════════════════════════════
    // INITIALIZATION
    // ═════════════════════════════════════════════════════════════════════════

    init() {
      console.log('[GRACEX Accounting] Initializing engine...');
      
      this.loadData();
      this.isReady = true;
      
      console.log('[GRACEX Accounting] Engine ready');
      console.log(`[GRACEX Accounting] ${this.data.transactions.length} transactions, ${this.data.invoices.length} invoices, ${this.data.receipts.length} receipts`);
      
      return this;
    },

    // ═════════════════════════════════════════════════════════════════════════
    // DATA PERSISTENCE
    // ═════════════════════════════════════════════════════════════════════════

    loadData() {
      try {
        const stored = localStorage.getItem(CONFIG.storageKey);
        if (stored) {
          const parsed = JSON.parse(stored);
          // Merge with defaults to ensure all fields exist
          this.data = this.mergeWithDefaults(parsed);
        } else {
          this.data = JSON.parse(JSON.stringify(DEFAULT_DATA));
          this.data.metadata.created = new Date().toISOString();
        }
      } catch (e) {
        console.error('[Accounting] Failed to load data:', e);
        this.data = JSON.parse(JSON.stringify(DEFAULT_DATA));
        this.data.metadata.created = new Date().toISOString();
      }
    },

    mergeWithDefaults(data) {
      const merged = JSON.parse(JSON.stringify(DEFAULT_DATA));
      
      // Copy over existing data
      if (data.transactions) merged.transactions = data.transactions;
      if (data.invoices) merged.invoices = data.invoices;
      if (data.receipts) merged.receipts = data.receipts;
      if (data.auditLog) merged.auditLog = data.auditLog;
      if (data.metadata) merged.metadata = { ...merged.metadata, ...data.metadata };
      if (data.settings) merged.settings = { ...merged.settings, ...data.settings };
      
      // Migrate old format if needed
      if (!data.transactions && Array.isArray(data)) {
        merged.transactions = data;
      }
      
      return merged;
    },

    saveData() {
      try {
        this.data.metadata.lastModified = new Date().toISOString();
        this.data.metadata.version = CONFIG.version;
        localStorage.setItem(CONFIG.storageKey, JSON.stringify(this.data));
        return true;
      } catch (e) {
        console.error('[Accounting] Failed to save data:', e);
        return false;
      }
    },

    // ═════════════════════════════════════════════════════════════════════════
    // AUDIT LOG (Immutable append-only)
    // ═════════════════════════════════════════════════════════════════════════

    log(type, message, data = null) {
      const entry = {
        timestamp: new Date().toISOString(),
        time: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        type: type.toUpperCase(),
        message: message,
        data: data ? JSON.stringify(data).substring(0, 100) : null
      };

      this.data.auditLog.unshift(entry);

      // Ring buffer - remove oldest if over limit
      if (this.data.auditLog.length > CONFIG.maxAuditEntries) {
        this.data.auditLog = this.data.auditLog.slice(0, CONFIG.maxAuditEntries);
      }

      this.saveData();

      // Dispatch event for UI update
      document.dispatchEvent(new CustomEvent('acc:log', { detail: entry }));

      return entry;
    },

    getAuditLog(limit = 50) {
      return this.data.auditLog.slice(0, limit);
    },

    // ═════════════════════════════════════════════════════════════════════════
    // TRANSACTIONS (Income & Expenses)
    // ═════════════════════════════════════════════════════════════════════════

    addTransaction(transaction) {
      const newTx = {
        id: this.generateId('TX'),
        date: transaction.date || new Date().toISOString().split('T')[0],
        type: transaction.type || 'expense', // income | expense
        amount: parseFloat(transaction.amount) || 0,
        category: transaction.category || 'Other',
        vendor: transaction.vendor || '',
        description: transaction.description || '',
        notes: transaction.notes || '',
        tags: transaction.tags || [],
        recurring: transaction.recurring || false,
        recurringFrequency: transaction.recurringFrequency || null,
        receiptId: transaction.receiptId || null,
        createdAt: new Date().toISOString()
      };

      this.data.transactions.push(newTx);
      this.saveData();
      this.log('ADD', `${newTx.type === 'income' ? 'Income' : 'Expense'}: ${this.formatCurrency(newTx.amount)} - ${newTx.description || newTx.category}`);

      document.dispatchEvent(new CustomEvent('acc:transaction:added', { detail: newTx }));
      return newTx;
    },

    updateTransaction(id, updates) {
      const index = this.data.transactions.findIndex(t => t.id === id);
      if (index === -1) return null;

      const tx = this.data.transactions[index];
      Object.assign(tx, updates, { modifiedAt: new Date().toISOString() });
      
      this.saveData();
      this.log('EDIT', `Updated transaction: ${tx.description || tx.id}`);

      document.dispatchEvent(new CustomEvent('acc:transaction:updated', { detail: tx }));
      return tx;
    },

    deleteTransaction(id) {
      const index = this.data.transactions.findIndex(t => t.id === id);
      if (index === -1) return false;

      const tx = this.data.transactions[index];
      this.data.transactions.splice(index, 1);
      
      this.saveData();
      this.log('DELETE', `Deleted transaction: ${tx.description || tx.id}`);

      document.dispatchEvent(new CustomEvent('acc:transaction:deleted', { detail: { id } }));
      return true;
    },

    getTransactions(filters = {}) {
      let results = [...this.data.transactions];

      // Filter by type
      if (filters.type && filters.type !== 'all') {
        results = results.filter(t => t.type === filters.type);
      }

      // Filter by category
      if (filters.category) {
        results = results.filter(t => t.category === filters.category);
      }

      // Filter by date range
      if (filters.startDate) {
        results = results.filter(t => t.date >= filters.startDate);
      }
      if (filters.endDate) {
        results = results.filter(t => t.date <= filters.endDate);
      }

      // Filter by period
      if (filters.period) {
        const now = new Date();
        let startDate;
        
        switch (filters.period) {
          case 'today':
            startDate = now.toISOString().split('T')[0];
            results = results.filter(t => t.date === startDate);
            break;
          case 'week':
            startDate = new Date(now - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
            results = results.filter(t => t.date >= startDate);
            break;
          case 'month':
            startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
            results = results.filter(t => t.date >= startDate);
            break;
          case 'year':
            startDate = new Date(now.getFullYear(), 0, 1).toISOString().split('T')[0];
            results = results.filter(t => t.date >= startDate);
            break;
          case 'tax-year':
            // UK tax year: 6 April to 5 April
            const taxYearStart = now.getMonth() >= 3 && now.getDate() >= 6
              ? new Date(now.getFullYear(), 3, 6)
              : new Date(now.getFullYear() - 1, 3, 6);
            results = results.filter(t => new Date(t.date) >= taxYearStart);
            break;
        }
      }

      // Search filter
      if (filters.search) {
        const search = filters.search.toLowerCase();
        results = results.filter(t => 
          (t.description && t.description.toLowerCase().includes(search)) ||
          (t.vendor && t.vendor.toLowerCase().includes(search)) ||
          (t.category && t.category.toLowerCase().includes(search)) ||
          (t.notes && t.notes.toLowerCase().includes(search))
        );
      }

      // Sort by date (newest first)
      results.sort((a, b) => new Date(b.date) - new Date(a.date));

      return results;
    },

    getTransactionSummary(filters = {}) {
      const transactions = this.getTransactions(filters);
      
      let totalIncome = 0;
      let totalExpenses = 0;
      const byCategory = {};

      transactions.forEach(t => {
        const amount = parseFloat(t.amount) || 0;
        
        if (t.type === 'income') {
          totalIncome += amount;
        } else {
          totalExpenses += amount;
        }

        const cat = t.category || 'Other';
        if (!byCategory[cat]) {
          byCategory[cat] = { income: 0, expenses: 0, count: 0 };
        }
        byCategory[cat][t.type === 'income' ? 'income' : 'expenses'] += amount;
        byCategory[cat].count++;
      });

      return {
        totalIncome,
        totalExpenses,
        netProfit: totalIncome - totalExpenses,
        transactionCount: transactions.length,
        byCategory
      };
    },

    // ═════════════════════════════════════════════════════════════════════════
    // INVOICES
    // ═════════════════════════════════════════════════════════════════════════

    createInvoice(invoiceData) {
      const invoiceNumber = this.generateInvoiceNumber();
      
      const invoice = {
        id: this.generateId('INV'),
        number: invoiceNumber,
        client: {
          name: invoiceData.clientName || '',
          email: invoiceData.clientEmail || '',
          address: invoiceData.clientAddress || '',
          phone: invoiceData.clientPhone || ''
        },
        items: (invoiceData.items || []).map((item, idx) => ({
          id: idx + 1,
          description: item.description || '',
          quantity: parseFloat(item.quantity) || 1,
          unitPrice: parseFloat(item.unitPrice) || 0,
          total: (parseFloat(item.quantity) || 1) * (parseFloat(item.unitPrice) || 0)
        })),
        subtotal: 0,
        vatRate: this.data.settings.vatRegistered ? this.data.settings.vatRate : 0,
        vatAmount: 0,
        total: 0,
        notes: invoiceData.notes || '',
        paymentTerms: invoiceData.paymentTerms || 'Payment due within 30 days',
        dueDate: invoiceData.dueDate || this.calculateDueDate(30),
        status: 'draft', // draft | sent | paid | overdue | cancelled
        createdAt: new Date().toISOString(),
        sentAt: null,
        paidAt: null
      };

      // Calculate totals
      invoice.subtotal = invoice.items.reduce((sum, item) => sum + item.total, 0);
      invoice.vatAmount = invoice.subtotal * (invoice.vatRate / 100);
      invoice.total = invoice.subtotal + invoice.vatAmount;

      this.data.invoices.push(invoice);
      this.saveData();
      this.log('ADD', `Invoice created: ${invoice.number} for ${invoice.client.name}`);

      document.dispatchEvent(new CustomEvent('acc:invoice:created', { detail: invoice }));
      return invoice;
    },

    updateInvoice(id, updates) {
      const index = this.data.invoices.findIndex(i => i.id === id);
      if (index === -1) return null;

      const invoice = this.data.invoices[index];
      
      // Update client info
      if (updates.client) {
        invoice.client = { ...invoice.client, ...updates.client };
      }

      // Update items and recalculate
      if (updates.items) {
        invoice.items = updates.items.map((item, idx) => ({
          id: idx + 1,
          description: item.description || '',
          quantity: parseFloat(item.quantity) || 1,
          unitPrice: parseFloat(item.unitPrice) || 0,
          total: (parseFloat(item.quantity) || 1) * (parseFloat(item.unitPrice) || 0)
        }));
        
        invoice.subtotal = invoice.items.reduce((sum, item) => sum + item.total, 0);
        invoice.vatAmount = invoice.subtotal * (invoice.vatRate / 100);
        invoice.total = invoice.subtotal + invoice.vatAmount;
      }

      // Update other fields
      ['notes', 'paymentTerms', 'dueDate', 'status'].forEach(field => {
        if (updates[field] !== undefined) invoice[field] = updates[field];
      });

      // Update status timestamps
      if (updates.status === 'sent' && !invoice.sentAt) {
        invoice.sentAt = new Date().toISOString();
      }
      if (updates.status === 'paid' && !invoice.paidAt) {
        invoice.paidAt = new Date().toISOString();
      }

      invoice.modifiedAt = new Date().toISOString();

      this.saveData();
      this.log('EDIT', `Invoice updated: ${invoice.number}`);

      document.dispatchEvent(new CustomEvent('acc:invoice:updated', { detail: invoice }));
      return invoice;
    },

    deleteInvoice(id) {
      const index = this.data.invoices.findIndex(i => i.id === id);
      if (index === -1) return false;

      const invoice = this.data.invoices[index];
      this.data.invoices.splice(index, 1);
      
      this.saveData();
      this.log('DELETE', `Invoice deleted: ${invoice.number}`);

      document.dispatchEvent(new CustomEvent('acc:invoice:deleted', { detail: { id } }));
      return true;
    },

    getInvoices(filters = {}) {
      let results = [...this.data.invoices];

      if (filters.status && filters.status !== 'all') {
        results = results.filter(i => i.status === filters.status);
      }

      if (filters.search) {
        const search = filters.search.toLowerCase();
        results = results.filter(i =>
          i.number.toLowerCase().includes(search) ||
          i.client.name.toLowerCase().includes(search)
        );
      }

      results.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      return results;
    },

    generateInvoiceNumber() {
      const year = new Date().getFullYear();
      const count = this.data.invoices.filter(i => 
        i.number && i.number.startsWith(`INV-${year}`)
      ).length + 1;
      return `INV-${year}-${String(count).padStart(4, '0')}`;
    },

    // ═════════════════════════════════════════════════════════════════════════
    // RECEIPTS
    // ═════════════════════════════════════════════════════════════════════════

    addReceipt(receiptData) {
      const receipt = {
        id: this.generateId('RCP'),
        date: receiptData.date || new Date().toISOString().split('T')[0],
        vendor: receiptData.vendor || '',
        amount: parseFloat(receiptData.amount) || 0,
        category: receiptData.category || 'Other',
        fileName: receiptData.fileName || '',
        fileType: receiptData.fileType || '',
        fileDataURL: receiptData.fileDataURL || null, // Optional base64
        notes: receiptData.notes || '',
        transactionId: receiptData.transactionId || null,
        createdAt: new Date().toISOString()
      };

      // Warn about large files
      if (receipt.fileDataURL && receipt.fileDataURL.length > CONFIG.maxReceiptSize) {
        console.warn('[Accounting] Large receipt file - may impact storage');
      }

      this.data.receipts.push(receipt);
      this.saveData();
      this.log('ADD', `Receipt added: ${receipt.vendor} - ${this.formatCurrency(receipt.amount)}`);

      document.dispatchEvent(new CustomEvent('acc:receipt:added', { detail: receipt }));
      return receipt;
    },

    updateReceipt(id, updates) {
      const index = this.data.receipts.findIndex(r => r.id === id);
      if (index === -1) return null;

      const receipt = this.data.receipts[index];
      Object.assign(receipt, updates, { modifiedAt: new Date().toISOString() });
      
      this.saveData();
      this.log('EDIT', `Receipt updated: ${receipt.id}`);

      return receipt;
    },

    deleteReceipt(id) {
      const index = this.data.receipts.findIndex(r => r.id === id);
      if (index === -1) return false;

      const receipt = this.data.receipts[index];
      this.data.receipts.splice(index, 1);
      
      this.saveData();
      this.log('DELETE', `Receipt deleted: ${receipt.vendor}`);

      return true;
    },

    getReceipts(filters = {}) {
      let results = [...this.data.receipts];

      if (filters.category) {
        results = results.filter(r => r.category === filters.category);
      }

      if (filters.unlinked) {
        results = results.filter(r => !r.transactionId);
      }

      if (filters.search) {
        const search = filters.search.toLowerCase();
        results = results.filter(r =>
          r.vendor.toLowerCase().includes(search) ||
          r.notes.toLowerCase().includes(search)
        );
      }

      results.sort((a, b) => new Date(b.date) - new Date(a.date));
      return results;
    },

    linkReceiptToTransaction(receiptId, transactionId) {
      const receipt = this.data.receipts.find(r => r.id === receiptId);
      const transaction = this.data.transactions.find(t => t.id === transactionId);

      if (!receipt || !transaction) return false;

      receipt.transactionId = transactionId;
      transaction.receiptId = receiptId;

      this.saveData();
      this.log('INFO', `Linked receipt to transaction: ${transaction.description}`);

      return true;
    },

    // ═════════════════════════════════════════════════════════════════════════
    // TAX CALCULATIONS (UK-FRIENDLY - ESTIMATES ONLY)
    // ═════════════════════════════════════════════════════════════════════════

    calculateTaxEstimate(options = {}) {
      const summary = this.getTransactionSummary({ period: 'tax-year' });
      const profit = summary.netProfit;
      const settings = this.data.settings;

      // UK 2024-25 Tax Thresholds (ESTIMATES ONLY)
      const personalAllowance = 12570;
      const basicRateThreshold = 37700;
      const higherRateThreshold = 125140;

      const taxableIncome = Math.max(0, profit - personalAllowance);

      // Income Tax
      let incomeTax = 0;
      if (taxableIncome > 0) {
        if (taxableIncome <= basicRateThreshold) {
          incomeTax = taxableIncome * 0.20;
        } else if (taxableIncome <= higherRateThreshold) {
          incomeTax = (basicRateThreshold * 0.20) + ((taxableIncome - basicRateThreshold) * 0.40);
        } else {
          incomeTax = (basicRateThreshold * 0.20) + 
                      ((higherRateThreshold - basicRateThreshold) * 0.40) + 
                      ((taxableIncome - higherRateThreshold) * 0.45);
        }
      }

      // National Insurance (Class 2 & 4 for self-employed)
      let class2NI = 0;
      let class4NI = 0;

      if (settings.businessType === 'self-employed' || settings.businessType === 'both') {
        // Class 2: Flat rate if profit > threshold
        class2NI = profit > 12570 ? 179.40 : 0;

        // Class 4: 9% on profits between £12,570 and £50,270, 2% above
        if (profit > 12570) {
          if (profit <= 50270) {
            class4NI = (profit - 12570) * 0.09;
          } else {
            class4NI = ((50270 - 12570) * 0.09) + ((profit - 50270) * 0.02);
          }
        }
      }

      // VAT (if registered)
      let vatLiability = 0;
      if (settings.vatRegistered) {
        // Simplified: VAT on income minus VAT on expenses
        // In reality, this is more complex
        vatLiability = summary.totalIncome * (settings.vatRate / 100);
      }

      const totalTax = incomeTax + class2NI + class4NI;
      const setAsideAmount = profit * (settings.setAsidePercentage / 100);

      this.log('INFO', `Tax estimate calculated: ${this.formatCurrency(totalTax)}`);

      return {
        income: summary.totalIncome,
        expenses: summary.totalExpenses,
        profit: profit,
        personalAllowance: Math.min(personalAllowance, profit),
        taxableIncome: taxableIncome,
        incomeTax: incomeTax,
        class2NI: class2NI,
        class4NI: class4NI,
        totalNI: class2NI + class4NI,
        totalTax: totalTax,
        vatLiability: vatLiability,
        setAsideAmount: setAsideAmount,
        setAsidePercentage: settings.setAsidePercentage,
        effectiveTaxRate: profit > 0 ? ((totalTax / profit) * 100).toFixed(1) : 0,
        disclaimer: 'ESTIMATE ONLY - Consult HMRC or a qualified accountant'
      };
    },

    // ═════════════════════════════════════════════════════════════════════════
    // SETTINGS
    // ═════════════════════════════════════════════════════════════════════════

    getSettings() {
      return { ...this.data.settings };
    },

    updateSettings(updates) {
      this.data.settings = { ...this.data.settings, ...updates };
      this.saveData();
      this.log('INFO', 'Settings updated');
      return this.data.settings;
    },

    addCategory(type, categoryName) {
      const key = type === 'income' ? 'incomeCategories' : 'expenseCategories';
      if (!this.data.settings[key].includes(categoryName)) {
        this.data.settings[key].push(categoryName);
        this.saveData();
        this.log('INFO', `Added ${type} category: ${categoryName}`);
      }
      return this.data.settings[key];
    },

    // ═════════════════════════════════════════════════════════════════════════
    // UTILITIES
    // ═════════════════════════════════════════════════════════════════════════

    generateId(prefix = 'ID') {
      return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
    },

    formatCurrency(amount) {
      const symbol = this.data?.settings?.currencySymbol || '£';
      return `${symbol}${parseFloat(amount || 0).toFixed(2)}`;
    },

    calculateDueDate(days) {
      const date = new Date();
      date.setDate(date.getDate() + days);
      return date.toISOString().split('T')[0];
    },

    // ═════════════════════════════════════════════════════════════════════════
    // DATA EXPORT/IMPORT
    // ═════════════════════════════════════════════════════════════════════════

    exportAllData() {
      const exportData = {
        ...this.data,
        exportedAt: new Date().toISOString(),
        version: CONFIG.version
      };
      
      this.log('EXPORT', 'Full data export');
      return JSON.stringify(exportData, null, 2);
    },

    importData(jsonString) {
      try {
        const imported = JSON.parse(jsonString);
        
        // Validate structure
        if (!imported.transactions && !imported.invoices && !imported.receipts) {
          throw new Error('Invalid data format');
        }

        // Merge with existing
        if (imported.transactions) {
          this.data.transactions = [...this.data.transactions, ...imported.transactions];
        }
        if (imported.invoices) {
          this.data.invoices = [...this.data.invoices, ...imported.invoices];
        }
        if (imported.receipts) {
          this.data.receipts = [...this.data.receipts, ...imported.receipts];
        }

        this.saveData();
        this.log('INFO', `Imported data: ${imported.transactions?.length || 0} transactions`);
        
        return true;
      } catch (e) {
        console.error('[Accounting] Import failed:', e);
        return false;
      }
    },

    clearAllData() {
      this.log('DELETE', 'All data cleared');
      this.data = JSON.parse(JSON.stringify(DEFAULT_DATA));
      this.data.metadata.created = new Date().toISOString();
      this.saveData();
    },

    // ═════════════════════════════════════════════════════════════════════════
    // HEALTH CHECK
    // ═════════════════════════════════════════════════════════════════════════

    getHealth() {
      const storageUsed = new Blob([localStorage.getItem(CONFIG.storageKey) || '']).size;
      
      return {
        ready: this.isReady,
        version: CONFIG.version,
        transactions: this.data.transactions.length,
        invoices: this.data.invoices.length,
        receipts: this.data.receipts.length,
        auditEntries: this.data.auditLog.length,
        storageUsed: `${(storageUsed / 1024).toFixed(1)} KB`,
        created: this.data.metadata.created,
        lastModified: this.data.metadata.lastModified
      };
    }
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // EXPOSE GLOBALLY
  // ═══════════════════════════════════════════════════════════════════════════

  window.AccountingEngine = AccountingEngine;
  window.ACCOUNTING_READY = true;

  // Initialize
  AccountingEngine.init();

  console.log('[GRACEX] Accounting Engine loaded');

})();
