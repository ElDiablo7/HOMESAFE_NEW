/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * GRACE-X Accounting™ - Mini-Finance Suite V2
 * Personal & Small Business Finance Assistant
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * DISCLAIMER: This is NOT financial advice. It's an organiser + calculator.
 * Always consult a qualified accountant for tax and financial decisions.
 * 
 * Dependencies:
 * - accounting_engine.js (AccountingEngine)
 * - accounting_reports.js (AccountingReports)
 * 
 * ═══════════════════════════════════════════════════════════════════════════════
 */
(function () {
  'use strict';

  // ═══════════════════════════════════════════════════════════════════════════
  // UI CONTROLLER
  // ═══════════════════════════════════════════════════════════════════════════

  const AccountingUI = {
    initialized: false,
    currentTab: 'dashboard',
    pendingReceiptData: null,

    // ═════════════════════════════════════════════════════════════════════════
    // INITIALIZATION
    // ═════════════════════════════════════════════════════════════════════════

    init() {
      // Check if we're on the accounting module
      if (!document.querySelector('.accounting-container')) {
        return;
      }

      // Wait for engine
      if (!window.AccountingEngine || !window.AccountingEngine.isReady) {
        setTimeout(() => this.init(), 100);
        return;
      }

      console.log('[GRACEX Accounting] Initializing UI V2...');

      // Wire up all components
      this.wireTabs();
      this.wireQuickEntry();
      this.wireTransactionForm();
      this.wireTransactionFilters();
      this.wireInvoiceForm();
      this.wireReceiptUpload();
      this.wireTaxCalculator();
      this.wireExports();
      this.wireSettings();
      this.wireQuickActions();
      this.wireAuditLog();
      this.wireBrain();
      this.wireNotes();

      // Populate categories
      this.populateCategories();

      // Set default date
      this.setDefaultDates();

      // Initial render
      this.updateDashboard();
      this.renderTransactions();
      this.renderInvoices();
      this.renderReceipts();
      this.renderAuditLog();
      this.loadSettings();

      // Listen for engine events
      this.bindEngineEvents();

      this.initialized = true;
      console.log('[GRACEX Accounting] UI V2 ready');
    },

    // ═════════════════════════════════════════════════════════════════════════
    // TAB NAVIGATION
    // ═════════════════════════════════════════════════════════════════════════

    wireTabs() {
      const navBtns = document.querySelectorAll('.acc-nav-btn');
      
      navBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          const tab = btn.dataset.tab;
          this.switchTab(tab);
        });
      });

      // Wire quick tabs (income/expense toggle)
      const quickTabs = document.querySelectorAll('#acc-quick-tabs .gx-tab');
      quickTabs.forEach(tab => {
        tab.addEventListener('click', () => {
          quickTabs.forEach(t => t.classList.remove('active'));
          tab.classList.add('active');
          
          const isIncome = tab.dataset.tab === 'income';
          document.getElementById('acc-quick-income').style.display = isIncome ? 'grid' : 'none';
          document.getElementById('acc-quick-expense').style.display = isIncome ? 'none' : 'grid';
        });
      });

      // Wire breakdown tabs
      const breakdownTabs = document.querySelectorAll('#acc-breakdown-tabs .gx-tab');
      breakdownTabs.forEach(tab => {
        tab.addEventListener('click', () => {
          breakdownTabs.forEach(t => t.classList.remove('active'));
          tab.classList.add('active');
          
          const isExpense = tab.dataset.tab === 'expense-cat';
          document.getElementById('acc-expense-breakdown').style.display = isExpense ? 'block' : 'none';
          document.getElementById('acc-income-breakdown').style.display = isExpense ? 'none' : 'block';
        });
      });
    },

    switchTab(tab) {
      this.currentTab = tab;

      // Update nav buttons
      document.querySelectorAll('.acc-nav-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tab);
      });

      // Update tab content
      document.querySelectorAll('.acc-tab-content').forEach(content => {
        content.classList.toggle('active', content.id === `acc-tab-${tab}`);
      });

      // Log tab switch
      window.AccountingEngine.log('INFO', `Switched to ${tab} tab`);
    },

    // ═════════════════════════════════════════════════════════════════════════
    // QUICK ENTRY
    // ═════════════════════════════════════════════════════════════════════════

    wireQuickEntry() {
      document.querySelectorAll('[data-quick]').forEach(btn => {
        btn.addEventListener('click', () => {
          const type = btn.dataset.quick;
          const category = btn.dataset.cat;
          this.showQuickEntryModal(type, category);
        });
      });
    },

    showQuickEntryModal(type, category) {
      const isIncome = type === 'income';
      const title = isIncome ? `Add ${category} Income` : `Add ${category} Expense`;
      
      if (window.GXModal) {
        window.GXModal.show({
          title: title,
          content: `
            <div style="margin-bottom: 16px;">
              <label style="display: block; margin-bottom: 4px;">Amount (£)</label>
              <input type="number" id="quick-amount" step="0.01" min="0" placeholder="0.00" 
                     style="width: 100%; padding: 12px; font-size: 1.2rem; text-align: center;" />
            </div>
            <div>
              <label style="display: block; margin-bottom: 4px;">Description</label>
              <input type="text" id="quick-desc" placeholder="${category}" style="width: 100%;" />
            </div>
          `,
          buttons: [
            { text: 'Cancel', class: 'gx-btn-ghost' },
            {
              text: isIncome ? '💵 Add Income' : '💸 Add Expense',
              class: 'gx-btn-primary',
              onClick: () => {
                const amount = parseFloat(document.getElementById('quick-amount')?.value);
                const desc = document.getElementById('quick-desc')?.value || category;

                if (!amount || amount <= 0) {
                  this.showToast('Please enter a valid amount', 'warning');
                  return;
                }

                window.AccountingEngine.addTransaction({
                  description: desc,
                  amount: amount,
                  type: type,
                  category: category,
                  date: new Date().toISOString().split('T')[0]
                });

                this.updateDashboard();
                this.renderTransactions();
                this.showToast(`${isIncome ? 'Income' : 'Expense'} added: £${amount.toFixed(2)}`, 'success');
              }
            }
          ]
        });

        setTimeout(() => {
          document.getElementById('quick-amount')?.focus();
        }, 100);
      }
    },

    // ═════════════════════════════════════════════════════════════════════════
    // TRANSACTION FORM
    // ═════════════════════════════════════════════════════════════════════════

    wireTransactionForm() {
      const addBtn = document.getElementById('acc-tx-add');
      const clearBtn = document.getElementById('acc-tx-clear');
      const typeSelect = document.getElementById('acc-tx-type');

      if (addBtn) {
        addBtn.addEventListener('click', () => this.addTransaction());
      }

      if (clearBtn) {
        clearBtn.addEventListener('click', () => this.clearTransactionForm());
      }

      // Update categories when type changes
      if (typeSelect) {
        typeSelect.addEventListener('change', () => this.populateCategories());
      }

      // Enter key to submit
      ['acc-tx-desc', 'acc-tx-amount'].forEach(id => {
        const el = document.getElementById(id);
        if (el) {
          el.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') addBtn?.click();
          });
        }
      });
    },

    addTransaction() {
      const desc = document.getElementById('acc-tx-desc')?.value?.trim();
      const amount = parseFloat(document.getElementById('acc-tx-amount')?.value);
      const type = document.getElementById('acc-tx-type')?.value;
      const category = document.getElementById('acc-tx-category')?.value;
      const vendor = document.getElementById('acc-tx-vendor')?.value?.trim();
      const date = document.getElementById('acc-tx-date')?.value;
      const notes = document.getElementById('acc-tx-notes')?.value?.trim();

      if (!desc) {
        this.showToast('Please enter a description', 'warning');
        return;
      }
      if (!amount || amount <= 0) {
        this.showToast('Please enter a valid amount', 'warning');
        return;
      }

      window.AccountingEngine.addTransaction({
        description: desc,
        amount: amount,
        type: type,
        category: category || 'Other',
        vendor: vendor,
        date: date,
        notes: notes
      });

      this.clearTransactionForm();
      this.updateDashboard();
      this.renderTransactions();
      this.showToast(`${type === 'income' ? 'Income' : 'Expense'} added: £${amount.toFixed(2)}`, 'success');
    },

    clearTransactionForm() {
      document.getElementById('acc-tx-desc').value = '';
      document.getElementById('acc-tx-amount').value = '';
      document.getElementById('acc-tx-vendor').value = '';
      document.getElementById('acc-tx-notes').value = '';
      this.setDefaultDates();
    },

    // ═════════════════════════════════════════════════════════════════════════
    // TRANSACTION FILTERS & LIST
    // ═════════════════════════════════════════════════════════════════════════

    wireTransactionFilters() {
      const typeFilter = document.getElementById('acc-tx-filter-type');
      const categoryFilter = document.getElementById('acc-tx-filter-category');
      const searchInput = document.getElementById('acc-tx-search');
      const periodFilter = document.getElementById('acc-period-filter');

      [typeFilter, categoryFilter, periodFilter].forEach(el => {
        if (el) {
          el.addEventListener('change', () => {
            this.updateDashboard();
            this.renderTransactions();
          });
        }
      });

      if (searchInput) {
        let debounce;
        searchInput.addEventListener('input', () => {
          clearTimeout(debounce);
          debounce = setTimeout(() => this.renderTransactions(), 300);
        });
      }
    },

    getFilters() {
      return {
        type: document.getElementById('acc-tx-filter-type')?.value || 'all',
        category: document.getElementById('acc-tx-filter-category')?.value || '',
        search: document.getElementById('acc-tx-search')?.value || '',
        period: document.getElementById('acc-period-filter')?.value || 'month'
      };
    },

    renderTransactions() {
      const container = document.getElementById('acc-tx-list');
      if (!container) return;

      const filters = this.getFilters();
      const transactions = window.AccountingEngine.getTransactions(filters);

      if (transactions.length === 0) {
        container.innerHTML = `
          <div class="acc-empty">
            <div class="acc-empty-icon">📭</div>
            <div class="acc-empty-title">No transactions found</div>
            <div class="acc-empty-desc">Add your first entry or adjust filters</div>
          </div>
        `;
        return;
      }

      container.innerHTML = transactions.map(tx => {
        const isIncome = tx.type === 'income';
        const icon = this.getCategoryIcon(tx.category);
        const dateStr = new Date(tx.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });

        return `
          <div class="acc-transaction-item" data-id="${tx.id}">
            <div class="acc-transaction-icon">${icon}</div>
            <div class="acc-transaction-details">
              <div class="acc-transaction-desc">${this.escapeHTML(tx.description)}</div>
              <div class="acc-transaction-meta">
                ${dateStr} ${tx.category ? `· ${tx.category}` : ''} ${tx.vendor ? `· ${tx.vendor}` : ''}
              </div>
            </div>
            <div class="acc-transaction-amount ${tx.type}">
              ${isIncome ? '+' : '-'}£${tx.amount.toFixed(2)}
            </div>
            <button class="builder-btn gx-btn-ghost" data-action="delete" style="padding: 6px;">🗑️</button>
          </div>
        `;
      }).join('');

      // Wire delete buttons
      container.querySelectorAll('[data-action="delete"]').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const item = btn.closest('.acc-transaction-item');
          const id = item?.dataset.id;
          
          if (window.GXModal) {
            window.GXModal.confirm({
              title: 'Delete Transaction',
              message: 'Are you sure you want to delete this transaction?',
              onConfirm: () => {
                window.AccountingEngine.deleteTransaction(id);
                this.updateDashboard();
                this.renderTransactions();
              }
            });
          }
        });
      });
    },

    // ═════════════════════════════════════════════════════════════════════════
    // INVOICE FORM
    // ═════════════════════════════════════════════════════════════════════════

    wireInvoiceForm() {
      const addLineBtn = document.getElementById('acc-inv-add-line');
      const createBtn = document.getElementById('acc-inv-create');
      const previewBtn = document.getElementById('acc-inv-preview');
      const clearBtn = document.getElementById('acc-inv-clear');

      if (addLineBtn) {
        addLineBtn.addEventListener('click', () => this.addInvoiceLine());
      }

      if (createBtn) {
        createBtn.addEventListener('click', () => this.createInvoice());
      }

      if (previewBtn) {
        previewBtn.addEventListener('click', () => this.previewInvoice());
      }

      if (clearBtn) {
        clearBtn.addEventListener('click', () => this.clearInvoiceForm());
      }

      // Wire initial line item
      this.wireLineItemInputs();

      // Check VAT setting
      this.updateVATDisplay();
    },

    addInvoiceLine() {
      const container = document.getElementById('acc-inv-items');
      const rowCount = container.querySelectorAll('.acc-line-item-row').length + 1;

      const row = document.createElement('div');
      row.className = 'acc-line-item-row';
      row.dataset.row = rowCount;
      row.innerHTML = `
        <input type="text" class="item-desc" placeholder="Service or product" />
        <input type="number" class="item-qty" value="1" min="1" />
        <input type="number" class="item-price" step="0.01" placeholder="0.00" />
        <span class="acc-line-item-total">£0.00</span>
        <button class="acc-line-remove" title="Remove">🗑️</button>
      `;

      container.appendChild(row);
      this.wireLineItemInputs();
    },

    wireLineItemInputs() {
      const container = document.getElementById('acc-inv-items');
      
      container.querySelectorAll('.acc-line-item-row').forEach(row => {
        const qtyInput = row.querySelector('.item-qty');
        const priceInput = row.querySelector('.item-price');
        const totalSpan = row.querySelector('.acc-line-item-total');
        const removeBtn = row.querySelector('.acc-line-remove');

        const updateTotal = () => {
          const qty = parseFloat(qtyInput?.value) || 0;
          const price = parseFloat(priceInput?.value) || 0;
          const total = qty * price;
          if (totalSpan) totalSpan.textContent = `£${total.toFixed(2)}`;
          this.updateInvoiceTotals();
        };

        qtyInput?.removeEventListener('input', updateTotal);
        priceInput?.removeEventListener('input', updateTotal);
        qtyInput?.addEventListener('input', updateTotal);
        priceInput?.addEventListener('input', updateTotal);

        removeBtn?.addEventListener('click', () => {
          if (container.querySelectorAll('.acc-line-item-row').length > 1) {
            row.remove();
            this.updateInvoiceTotals();
          }
        });
      });
    },

    updateInvoiceTotals() {
      const container = document.getElementById('acc-inv-items');
      let subtotal = 0;

      container.querySelectorAll('.acc-line-item-row').forEach(row => {
        const qty = parseFloat(row.querySelector('.item-qty')?.value) || 0;
        const price = parseFloat(row.querySelector('.item-price')?.value) || 0;
        subtotal += qty * price;
      });

      const settings = window.AccountingEngine.getSettings();
      const vatRate = settings.vatRegistered ? settings.vatRate : 0;
      const vat = subtotal * (vatRate / 100);
      const total = subtotal + vat;

      document.getElementById('acc-inv-subtotal').textContent = `£${subtotal.toFixed(2)}`;
      document.getElementById('acc-inv-vat').textContent = `£${vat.toFixed(2)}`;
      document.getElementById('acc-inv-total').textContent = `£${total.toFixed(2)}`;
      document.getElementById('acc-inv-vat-rate').textContent = vatRate;

      // Show/hide VAT row
      document.getElementById('acc-inv-vat-row').style.display = vatRate > 0 ? 'flex' : 'none';
    },

    updateVATDisplay() {
      const settings = window.AccountingEngine.getSettings();
      document.getElementById('acc-inv-vat-row').style.display = settings.vatRegistered ? 'flex' : 'none';
    },

    createInvoice() {
      const clientName = document.getElementById('acc-inv-client-name')?.value?.trim();
      const clientEmail = document.getElementById('acc-inv-client-email')?.value?.trim();
      const clientAddress = document.getElementById('acc-inv-client-address')?.value?.trim();
      const notes = document.getElementById('acc-inv-notes')?.value?.trim();

      if (!clientName) {
        this.showToast('Please enter a client name', 'warning');
        return;
      }

      const items = [];
      document.querySelectorAll('#acc-inv-items .acc-line-item-row').forEach(row => {
        const desc = row.querySelector('.item-desc')?.value?.trim();
        const qty = parseFloat(row.querySelector('.item-qty')?.value) || 0;
        const price = parseFloat(row.querySelector('.item-price')?.value) || 0;

        if (desc && qty > 0 && price > 0) {
          items.push({ description: desc, quantity: qty, unitPrice: price });
        }
      });

      if (items.length === 0) {
        this.showToast('Please add at least one line item', 'warning');
        return;
      }

      const invoice = window.AccountingEngine.createInvoice({
        clientName,
        clientEmail,
        clientAddress,
        items,
        notes
      });

      this.clearInvoiceForm();
      this.renderInvoices();
      this.showToast(`Invoice ${invoice.number} created`, 'success');
    },

    previewInvoice() {
      // Build a temporary invoice object for preview
      const clientName = document.getElementById('acc-inv-client-name')?.value || 'Client Name';
      const items = [];
      
      document.querySelectorAll('#acc-inv-items .acc-line-item-row').forEach(row => {
        const desc = row.querySelector('.item-desc')?.value || 'Item';
        const qty = parseFloat(row.querySelector('.item-qty')?.value) || 1;
        const price = parseFloat(row.querySelector('.item-price')?.value) || 0;
        items.push({ description: desc, quantity: qty, unitPrice: price, total: qty * price });
      });

      const subtotal = items.reduce((sum, i) => sum + i.total, 0);
      const settings = window.AccountingEngine.getSettings();
      const vatRate = settings.vatRegistered ? settings.vatRate : 0;
      const vatAmount = subtotal * (vatRate / 100);

      const tempInvoice = {
        number: 'PREVIEW',
        client: { name: clientName, address: '', email: '' },
        items,
        subtotal,
        vatRate,
        vatAmount,
        total: subtotal + vatAmount,
        notes: document.getElementById('acc-inv-notes')?.value || '',
        paymentTerms: 'Payment due within 30 days',
        createdAt: new Date().toISOString(),
        status: 'draft'
      };

      if (window.AccountingReports) {
        window.AccountingReports.printInvoice(tempInvoice);
      }
    },

    clearInvoiceForm() {
      document.getElementById('acc-inv-client-name').value = '';
      document.getElementById('acc-inv-client-email').value = '';
      document.getElementById('acc-inv-client-address').value = '';
      document.getElementById('acc-inv-notes').value = '';

      const container = document.getElementById('acc-inv-items');
      container.innerHTML = `
        <div class="acc-line-item-header">
          <span>Description</span>
          <span>Qty</span>
          <span>Unit Price</span>
          <span>Total</span>
          <span></span>
        </div>
        <div class="acc-line-item-row" data-row="1">
          <input type="text" class="item-desc" placeholder="Service or product" />
          <input type="number" class="item-qty" value="1" min="1" />
          <input type="number" class="item-price" step="0.01" placeholder="0.00" />
          <span class="acc-line-item-total">£0.00</span>
          <button class="acc-line-remove" title="Remove">🗑️</button>
        </div>
      `;

      this.wireLineItemInputs();
      this.updateInvoiceTotals();
    },

    renderInvoices() {
      const container = document.getElementById('acc-invoice-list');
      if (!container) return;

      const invoices = window.AccountingEngine.getInvoices();

      if (invoices.length === 0) {
        container.innerHTML = `
          <div class="acc-empty">
            <div class="acc-empty-icon">📄</div>
            <div class="acc-empty-title">No invoices yet</div>
            <div class="acc-empty-desc">Create your first invoice below</div>
          </div>
        `;
        return;
      }

      container.innerHTML = invoices.map(inv => {
        const statusColors = {
          draft: '#64748b', sent: '#3b82f6', paid: '#10b981', overdue: '#ef4444', cancelled: '#6b7280'
        };
        const dateStr = new Date(inv.createdAt).toLocaleDateString('en-GB');

        return `
          <div class="result-row" data-id="${inv.id}">
            <div style="flex: 1;">
              <strong>${inv.number}</strong>
              <span style="margin-left: 10px;">${this.escapeHTML(inv.client.name)}</span>
              <div class="hint">${dateStr}</div>
            </div>
            <strong style="margin-right: 12px;">£${inv.total.toFixed(2)}</strong>
            <span class="gx-badge" style="background: ${statusColors[inv.status]};">${inv.status}</span>
            <button class="builder-btn gx-btn-ghost" data-action="print" style="margin-left: 8px;">🖨️</button>
            <button class="builder-btn gx-btn-ghost" data-action="delete">🗑️</button>
          </div>
        `;
      }).join('');

      // Wire actions
      container.querySelectorAll('[data-action="print"]').forEach(btn => {
        btn.addEventListener('click', () => {
          const id = btn.closest('.result-row')?.dataset.id;
          const invoice = invoices.find(i => i.id === id);
          if (invoice && window.AccountingReports) {
            window.AccountingReports.printInvoice(invoice);
          }
        });
      });

      container.querySelectorAll('[data-action="delete"]').forEach(btn => {
        btn.addEventListener('click', () => {
          const id = btn.closest('.result-row')?.dataset.id;
          if (window.GXModal) {
            window.GXModal.confirm({
              title: 'Delete Invoice',
              message: 'Are you sure?',
              onConfirm: () => {
                window.AccountingEngine.deleteInvoice(id);
                this.renderInvoices();
              }
            });
          }
        });
      });
    },

    // ═════════════════════════════════════════════════════════════════════════
    // RECEIPT UPLOAD
    // ═════════════════════════════════════════════════════════════════════════

    wireReceiptUpload() {
      const uploadZone = document.getElementById('acc-receipt-upload-zone');
      const fileInput = document.getElementById('acc-receipt-file');
      const saveBtn = document.getElementById('acc-rcp-save');
      const cancelBtn = document.getElementById('acc-rcp-cancel');

      if (uploadZone) {
        uploadZone.addEventListener('click', () => fileInput?.click());
        
        uploadZone.addEventListener('dragover', (e) => {
          e.preventDefault();
          uploadZone.classList.add('dragover');
        });

        uploadZone.addEventListener('dragleave', () => {
          uploadZone.classList.remove('dragover');
        });

        uploadZone.addEventListener('drop', (e) => {
          e.preventDefault();
          uploadZone.classList.remove('dragover');
          const file = e.dataTransfer?.files[0];
          if (file) this.handleReceiptFile(file);
        });
      }

      if (fileInput) {
        fileInput.addEventListener('change', (e) => {
          const file = e.target.files?.[0];
          if (file) this.handleReceiptFile(file);
        });
      }

      if (saveBtn) {
        saveBtn.addEventListener('click', () => this.saveReceipt());
      }

      if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
          document.getElementById('acc-receipt-form').style.display = 'none';
          this.pendingReceiptData = null;
        });
      }
    },

    handleReceiptFile(file) {
      // Check size
      if (file.size > 5 * 1024 * 1024) {
        this.showToast('File too large (max 5MB recommended)', 'warning');
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        this.pendingReceiptData = {
          fileName: file.name,
          fileType: file.type,
          fileDataURL: e.target.result
        };

        // Show form
        document.getElementById('acc-receipt-form').style.display = 'block';
        
        // Show preview if image
        const previewDiv = document.getElementById('acc-receipt-preview-img');
        if (file.type.startsWith('image/')) {
          previewDiv.innerHTML = `<img src="${e.target.result}" style="max-width: 100%; max-height: 200px; object-fit: contain;" />`;
        } else {
          previewDiv.innerHTML = `<div style="padding: 20px; text-align: center;"><span style="font-size: 3rem;">📄</span><br>${file.name}</div>`;
        }

        // Set today's date
        document.getElementById('acc-rcp-date').value = new Date().toISOString().split('T')[0];
      };
      reader.readAsDataURL(file);
    },

    saveReceipt() {
      if (!this.pendingReceiptData) return;

      const vendor = document.getElementById('acc-rcp-vendor')?.value?.trim();
      const amount = parseFloat(document.getElementById('acc-rcp-amount')?.value);
      const category = document.getElementById('acc-rcp-category')?.value;
      const date = document.getElementById('acc-rcp-date')?.value;
      const notes = document.getElementById('acc-rcp-notes')?.value?.trim();

      if (!vendor) {
        this.showToast('Please enter a vendor name', 'warning');
        return;
      }

      window.AccountingEngine.addReceipt({
        vendor,
        amount: amount || 0,
        category,
        date,
        notes,
        ...this.pendingReceiptData
      });

      // Clear form
      document.getElementById('acc-receipt-form').style.display = 'none';
      document.getElementById('acc-rcp-vendor').value = '';
      document.getElementById('acc-rcp-amount').value = '';
      document.getElementById('acc-rcp-notes').value = '';
      this.pendingReceiptData = null;

      this.renderReceipts();
      this.showToast('Receipt saved', 'success');
    },

    renderReceipts() {
      const container = document.getElementById('acc-receipt-grid');
      if (!container) return;

      const receipts = window.AccountingEngine.getReceipts();

      if (receipts.length === 0) {
        container.innerHTML = `
          <div class="acc-empty" style="grid-column: 1/-1;">
            <div class="acc-empty-icon">🧾</div>
            <div class="acc-empty-title">No receipts yet</div>
            <div class="acc-empty-desc">Upload your first receipt above</div>
          </div>
        `;
        return;
      }

      container.innerHTML = receipts.map(rcp => {
        const dateStr = new Date(rcp.date).toLocaleDateString('en-GB');
        const isImage = rcp.fileType?.startsWith('image/');

        return `
          <div class="acc-receipt-card" data-id="${rcp.id}">
            <div class="acc-receipt-preview">
              ${isImage && rcp.fileDataURL 
                ? `<img src="${rcp.fileDataURL}" alt="Receipt" />`
                : '📄'}
            </div>
            <div class="acc-receipt-info">
              <div class="acc-receipt-vendor">${this.escapeHTML(rcp.vendor)}</div>
              <div class="acc-receipt-amount">£${(rcp.amount || 0).toFixed(2)}</div>
              <div class="acc-receipt-date">${dateStr}</div>
            </div>
            <div class="acc-receipt-actions">
              <button class="builder-btn gx-btn-ghost" data-action="view">👁️</button>
              <button class="builder-btn gx-btn-ghost" data-action="delete">🗑️</button>
            </div>
          </div>
        `;
      }).join('');

      // Wire actions
      container.querySelectorAll('[data-action="view"]').forEach(btn => {
        btn.addEventListener('click', () => {
          const id = btn.closest('.acc-receipt-card')?.dataset.id;
          const receipt = receipts.find(r => r.id === id);
          if (receipt?.fileDataURL) {
            window.open(receipt.fileDataURL, '_blank');
          }
        });
      });

      container.querySelectorAll('[data-action="delete"]').forEach(btn => {
        btn.addEventListener('click', () => {
          const id = btn.closest('.acc-receipt-card')?.dataset.id;
          if (window.GXModal) {
            window.GXModal.confirm({
              title: 'Delete Receipt',
              message: 'Are you sure?',
              onConfirm: () => {
                window.AccountingEngine.deleteReceipt(id);
                this.renderReceipts();
              }
            });
          }
        });
      });
    },

    // ═════════════════════════════════════════════════════════════════════════
    // TAX CALCULATOR
    // ═════════════════════════════════════════════════════════════════════════

    wireTaxCalculator() {
      const calcBtn = document.getElementById('acc-tax-calculate');
      const setAsideSlider = document.getElementById('acc-set-aside-pct');

      if (calcBtn) {
        calcBtn.addEventListener('click', () => this.calculateTax());
      }

      if (setAsideSlider) {
        setAsideSlider.addEventListener('input', () => this.updateSetAside());
      }
    },

    calculateTax() {
      const result = window.AccountingEngine.calculateTaxEstimate();
      const resultsDiv = document.getElementById('acc-tax-results');
      const setAsideDiv = document.getElementById('acc-set-aside');
      const symbol = '£';

      resultsDiv.style.display = 'block';
      setAsideDiv.style.display = 'block';

      resultsDiv.innerHTML = `
        <div class="acc-tax-result-row">
          <span>Total Income</span>
          <strong style="color: var(--acc-income);">${symbol}${result.income.toFixed(2)}</strong>
        </div>
        <div class="acc-tax-result-row">
          <span>Total Expenses</span>
          <strong style="color: var(--acc-expense);">${symbol}${result.expenses.toFixed(2)}</strong>
        </div>
        <div class="acc-tax-result-row">
          <span>Net Profit</span>
          <strong>${symbol}${result.profit.toFixed(2)}</strong>
        </div>
        <hr style="border-color: var(--acc-border); margin: 10px 0;">
        <div class="acc-tax-result-row">
          <span>Personal Allowance</span>
          <strong>-${symbol}${result.personalAllowance.toFixed(2)}</strong>
        </div>
        <div class="acc-tax-result-row">
          <span>Taxable Income</span>
          <strong>${symbol}${result.taxableIncome.toFixed(2)}</strong>
        </div>
        <hr style="border-color: var(--acc-border); margin: 10px 0;">
        <div class="acc-tax-result-row">
          <span>Income Tax (est.)</span>
          <strong>${symbol}${result.incomeTax.toFixed(2)}</strong>
        </div>
        <div class="acc-tax-result-row">
          <span>Class 2 NI</span>
          <strong>${symbol}${result.class2NI.toFixed(2)}</strong>
        </div>
        <div class="acc-tax-result-row">
          <span>Class 4 NI (est.)</span>
          <strong>${symbol}${result.class4NI.toFixed(2)}</strong>
        </div>
        <div class="acc-tax-result-row total">
          <span>Total Tax Due (est.)</span>
          <strong style="color: var(--acc-warning);">${symbol}${result.totalTax.toFixed(2)}</strong>
        </div>
        <p class="hint" style="margin-top: 12px; text-align: center;">
          ⚠️ ${result.disclaimer}
        </p>
      `;

      // Update set aside
      document.getElementById('acc-set-aside-pct').value = result.setAsidePercentage;
      this.updateSetAside();
    },

    updateSetAside() {
      const pct = parseInt(document.getElementById('acc-set-aside-pct')?.value) || 25;
      const summary = window.AccountingEngine.getTransactionSummary({ period: 'tax-year' });
      const amount = summary.netProfit * (pct / 100);

      document.getElementById('acc-set-aside-pct-display').textContent = `${pct}%`;
      document.getElementById('acc-set-aside-amount').textContent = `£${Math.max(0, amount).toFixed(2)}`;
    },

    // ═════════════════════════════════════════════════════════════════════════
    // EXPORTS
    // ═════════════════════════════════════════════════════════════════════════

    wireExports() {
      const csvBtn = document.getElementById('acc-export-csv');
      const jsonBtn = document.getElementById('acc-export-json');
      const monthlyBtn = document.getElementById('acc-export-monthly');
      const importInput = document.getElementById('acc-import-file');
      const copySummaryBtn = document.getElementById('acc-copy-summary');
      const copyTxBtn = document.getElementById('acc-copy-transactions');

      if (csvBtn) {
        csvBtn.addEventListener('click', () => {
          const transactions = window.AccountingEngine.getTransactions();
          if (transactions.length === 0) {
            this.showToast('No transactions to export', 'info');
            return;
          }
          window.AccountingReports.exportTransactionsCSV(transactions);
          this.showToast('CSV exported', 'success');
        });
      }

      if (jsonBtn) {
        jsonBtn.addEventListener('click', () => {
          window.AccountingReports.exportAllJSON();
          this.showToast('JSON backup exported', 'success');
        });
      }

      if (monthlyBtn) {
        monthlyBtn.addEventListener('click', () => {
          const month = parseInt(document.getElementById('acc-export-month')?.value) || 0;
          const year = parseInt(document.getElementById('acc-export-year')?.value) || 2024;
          window.AccountingReports.generateMonthlyReport(year, month);
          this.showToast('Monthly report generated', 'success');
        });
      }

      if (importInput) {
        importInput.addEventListener('change', (e) => {
          const file = e.target.files?.[0];
          if (file) {
            const reader = new FileReader();
            reader.onload = (ev) => {
              const success = window.AccountingEngine.importData(ev.target.result);
              if (success) {
                this.updateDashboard();
                this.renderTransactions();
                this.showToast('Data imported successfully', 'success');
              } else {
                this.showToast('Import failed - invalid format', 'error');
              }
            };
            reader.readAsText(file);
          }
        });
      }

      if (copySummaryBtn) {
        copySummaryBtn.addEventListener('click', () => {
          const summary = window.AccountingEngine.getTransactionSummary();
          const text = `GRACE-X Accounting Summary\n\nIncome: £${summary.totalIncome.toFixed(2)}\nExpenses: £${summary.totalExpenses.toFixed(2)}\nProfit: £${summary.netProfit.toFixed(2)}\nTransactions: ${summary.transactionCount}`;
          navigator.clipboard.writeText(text);
          this.showToast('Summary copied to clipboard', 'success');
        });
      }

      if (copyTxBtn) {
        copyTxBtn.addEventListener('click', () => {
          const transactions = window.AccountingEngine.getTransactions();
          const text = transactions.map(t => 
            `${t.date} | ${t.type} | ${t.description} | £${t.amount.toFixed(2)}`
          ).join('\n');
          navigator.clipboard.writeText(text);
          this.showToast('Transactions copied', 'success');
        });
      }

      // Set current month
      const monthSelect = document.getElementById('acc-export-month');
      const yearSelect = document.getElementById('acc-export-year');
      if (monthSelect) monthSelect.value = new Date().getMonth();
      if (yearSelect) yearSelect.value = new Date().getFullYear();
    },

    // ═════════════════════════════════════════════════════════════════════════
    // SETTINGS
    // ═════════════════════════════════════════════════════════════════════════

    wireSettings() {
      const saveBtn = document.getElementById('acc-save-settings');
      const clearAllBtn = document.getElementById('acc-clear-all');
      const addCategoryBtn = document.getElementById('acc-set-add-category');

      if (saveBtn) {
        saveBtn.addEventListener('click', () => this.saveSettings());
      }

      if (clearAllBtn) {
        clearAllBtn.addEventListener('click', () => {
          if (window.GXModal) {
            window.GXModal.confirm({
              title: 'Clear All Data',
              message: 'This will permanently delete ALL your accounting data. This cannot be undone!',
              onConfirm: () => {
                window.AccountingEngine.clearAllData();
                this.updateDashboard();
                this.renderTransactions();
                this.renderInvoices();
                this.renderReceipts();
                this.showToast('All data cleared', 'info');
              }
            });
          }
        });
      }

      if (addCategoryBtn) {
        addCategoryBtn.addEventListener('click', () => {
          const name = document.getElementById('acc-set-new-category')?.value?.trim();
          const type = document.getElementById('acc-set-category-type')?.value;
          
          if (name) {
            window.AccountingEngine.addCategory(type, name);
            document.getElementById('acc-set-new-category').value = '';
            this.populateCategories();
            this.showToast(`Category "${name}" added`, 'success');
          }
        });
      }
    },

    loadSettings() {
      const settings = window.AccountingEngine.getSettings();

      document.getElementById('acc-set-business-name').value = settings.businessName || '';
      document.getElementById('acc-set-business-address').value = settings.businessAddress || '';
      document.getElementById('acc-set-bank-details').value = settings.bankDetails || '';
      document.getElementById('acc-set-business-type').value = settings.businessType || 'self-employed';
      document.getElementById('acc-set-vat-registered').checked = settings.vatRegistered || false;
      document.getElementById('acc-set-vat-rate').value = settings.vatRate || 20;
      document.getElementById('acc-set-aside-percent').value = settings.setAsidePercentage || 25;

      // Storage info
      const health = window.AccountingEngine.getHealth();
      document.getElementById('acc-storage-info').textContent = 
        `Storage: ${health.storageUsed} | ${health.transactions} transactions | ${health.invoices} invoices | ${health.receipts} receipts`;
    },

    saveSettings() {
      const settings = {
        businessName: document.getElementById('acc-set-business-name')?.value || '',
        businessAddress: document.getElementById('acc-set-business-address')?.value || '',
        bankDetails: document.getElementById('acc-set-bank-details')?.value || '',
        businessType: document.getElementById('acc-set-business-type')?.value || 'self-employed',
        vatRegistered: document.getElementById('acc-set-vat-registered')?.checked || false,
        vatRate: parseInt(document.getElementById('acc-set-vat-rate')?.value) || 20,
        setAsidePercentage: parseInt(document.getElementById('acc-set-aside-percent')?.value) || 25
      };

      window.AccountingEngine.updateSettings(settings);
      this.updateVATDisplay();
      this.showToast('Settings saved', 'success');
    },

    // ═════════════════════════════════════════════════════════════════════════
    // QUICK ACTIONS (Right Panel)
    // ═════════════════════════════════════════════════════════════════════════

    wireQuickActions() {
      document.getElementById('acc-quick-income-btn')?.addEventListener('click', () => {
        this.switchTab('transactions');
        document.getElementById('acc-tx-type').value = 'income';
        this.populateCategories();
      });

      document.getElementById('acc-quick-expense-btn')?.addEventListener('click', () => {
        this.switchTab('transactions');
        document.getElementById('acc-tx-type').value = 'expense';
        this.populateCategories();
      });

      document.getElementById('acc-quick-invoice-btn')?.addEventListener('click', () => {
        this.switchTab('invoices');
      });

      document.getElementById('acc-quick-receipt-btn')?.addEventListener('click', () => {
        this.switchTab('receipts');
      });
    },

    // ═════════════════════════════════════════════════════════════════════════
    // AUDIT LOG
    // ═════════════════════════════════════════════════════════════════════════

    wireAuditLog() {
      // Listen for log events
      document.addEventListener('acc:log', () => this.renderAuditLog());
    },

    renderAuditLog() {
      const container = document.getElementById('acc-audit-log');
      const countEl = document.getElementById('acc-audit-count');
      if (!container) return;

      const logs = window.AccountingEngine.getAuditLog(50);
      
      if (countEl) {
        countEl.textContent = `${logs.length} entries`;
      }

      if (logs.length === 0) {
        container.innerHTML = `
          <div class="acc-audit-entry">
            <span class="acc-audit-time">--:--:--</span>
            <span class="acc-audit-type info">INFO</span>
            <span class="acc-audit-msg">No actions logged yet</span>
          </div>
        `;
        return;
      }

      container.innerHTML = logs.map(log => `
        <div class="acc-audit-entry">
          <span class="acc-audit-time">${log.time}</span>
          <span class="acc-audit-type ${log.type.toLowerCase()}">${log.type}</span>
          <span class="acc-audit-msg">${this.escapeHTML(log.message)}</span>
        </div>
      `).join('');
    },

    // ═════════════════════════════════════════════════════════════════════════
    // BRAIN PANEL
    // ═════════════════════════════════════════════════════════════════════════

    wireBrain() {
      if (window.setupModuleBrain) {
        window.setupModuleBrain("accounting", {
          panelId: "account-brain-panel",
          inputId: "account-brain-input",
          sendId: "account-brain-send",
          outputId: "account-brain-output",
          clearId: "account-brain-clear",
          initialMessage: "I can help with budgeting, expense tracking, and financial questions. Note: This is guidance only, not professional financial advice."
        });
      }
    },

    // ═════════════════════════════════════════════════════════════════════════
    // NOTES
    // ═════════════════════════════════════════════════════════════════════════

    wireNotes() {
      const notesEl = document.getElementById('acc-quick-notes');
      const saveBtn = document.getElementById('acc-save-notes');

      if (notesEl) {
        notesEl.value = localStorage.getItem('acc_quick_notes') || '';
      }

      if (saveBtn) {
        saveBtn.addEventListener('click', () => {
          localStorage.setItem('acc_quick_notes', notesEl?.value || '');
          this.showToast('Notes saved', 'success');
        });
      }
    },

    // ═════════════════════════════════════════════════════════════════════════
    // DASHBOARD
    // ═════════════════════════════════════════════════════════════════════════

    updateDashboard() {
      const filters = this.getFilters();
      const summary = window.AccountingEngine.getTransactionSummary(filters);
      const symbol = '£';

      // Main stats
      document.getElementById('acc-stat-income').textContent = `${symbol}${summary.totalIncome.toFixed(2)}`;
      document.getElementById('acc-stat-expense').textContent = `${symbol}${summary.totalExpenses.toFixed(2)}`;
      document.getElementById('acc-stat-balance').textContent = `${symbol}${summary.netProfit.toFixed(2)}`;
      document.getElementById('acc-stat-entries').textContent = summary.transactionCount;

      // Side panel stats
      document.getElementById('acc-side-income').textContent = `${symbol}${summary.totalIncome.toFixed(2)}`;
      document.getElementById('acc-side-expense').textContent = `${symbol}${summary.totalExpenses.toFixed(2)}`;
      document.getElementById('acc-side-profit').textContent = `${symbol}${summary.netProfit.toFixed(2)}`;

      // Category breakdown
      this.renderCategoryBreakdown(summary.byCategory);

      // Weekly chart
      this.renderWeeklyChart();
    },

    renderCategoryBreakdown(byCategory) {
      const expenseDiv = document.getElementById('acc-expense-breakdown');
      const incomeDiv = document.getElementById('acc-income-breakdown');

      const renderBreakdown = (categories, type, container) => {
        const entries = Object.entries(categories)
          .filter(([_, values]) => values[type === 'expense' ? 'expenses' : 'income'] > 0)
          .map(([cat, values]) => ({
            category: cat,
            amount: values[type === 'expense' ? 'expenses' : 'income']
          }))
          .sort((a, b) => b.amount - a.amount);

        if (entries.length === 0) {
          container.innerHTML = `<div class="hint" style="text-align: center; padding: 20px;">No ${type}s recorded</div>`;
          return;
        }

        const total = entries.reduce((sum, e) => sum + e.amount, 0);
        const colorClass = type === 'expense' ? 'gx-progress-danger' : 'gx-progress-success';

        container.innerHTML = entries.map(e => {
          const pct = (e.amount / total * 100).toFixed(1);
          return `
            <div class="result-row">
              <span>${e.category}</span>
              <div style="display: flex; align-items: center; gap: 8px;">
                <div class="gx-progress" style="width: 80px; height: 6px;">
                  <div class="gx-progress-bar ${colorClass}" style="width: ${pct}%;"></div>
                </div>
                <strong>£${e.amount.toFixed(2)}</strong>
                <span class="hint">(${pct}%)</span>
              </div>
            </div>
          `;
        }).join('');
      };

      renderBreakdown(byCategory, 'expense', expenseDiv);
      renderBreakdown(byCategory, 'income', incomeDiv);
    },

    renderWeeklyChart() {
      const container = document.getElementById('acc-weekly-chart');
      if (!container) return;

      const days = [];
      const today = new Date();
      
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        days.push({
          date: date.toISOString().split('T')[0],
          label: date.toLocaleDateString('en-GB', { weekday: 'short' }),
          income: 0,
          expense: 0
        });
      }

      // Get last 7 days transactions
      const transactions = window.AccountingEngine.getTransactions({ period: 'week' });
      
      transactions.forEach(tx => {
        const day = days.find(d => d.date === tx.date);
        if (day) {
          if (tx.type === 'income') {
            day.income += tx.amount;
          } else {
            day.expense += tx.amount;
          }
        }
      });

      const maxValue = Math.max(...days.map(d => Math.max(d.income, d.expense)), 1);

      container.innerHTML = days.map(day => {
        const incomeHeight = (day.income / maxValue * 100);
        const expenseHeight = (day.expense / maxValue * 100);
        
        return `
          <div style="display: flex; flex-direction: column; align-items: center; gap: 4px; flex: 1;">
            <div style="display: flex; gap: 2px; align-items: flex-end; height: 80px;">
              <div class="acc-bar income" style="height: ${Math.max(incomeHeight, 2)}%; width: 10px;" title="Income: £${day.income.toFixed(2)}"></div>
              <div class="acc-bar expense" style="height: ${Math.max(expenseHeight, 2)}%; width: 10px;" title="Expense: £${day.expense.toFixed(2)}"></div>
            </div>
            <span style="font-size: 0.65rem; color: var(--acc-secondary);">${day.label}</span>
          </div>
        `;
      }).join('');
    },

    // ═════════════════════════════════════════════════════════════════════════
    // UTILITIES
    // ═════════════════════════════════════════════════════════════════════════

    populateCategories() {
      const settings = window.AccountingEngine.getSettings();
      const type = document.getElementById('acc-tx-type')?.value || 'expense';
      const categories = type === 'income' ? settings.incomeCategories : settings.expenseCategories;

      // Transaction form
      const txCategorySelect = document.getElementById('acc-tx-category');
      if (txCategorySelect) {
        txCategorySelect.innerHTML = '<option value="">Select category…</option>' +
          categories.map(c => `<option value="${c}">${c}</option>`).join('');
      }

      // Filter
      const filterCategorySelect = document.getElementById('acc-tx-filter-category');
      if (filterCategorySelect) {
        const allCategories = [...settings.incomeCategories, ...settings.expenseCategories];
        const unique = [...new Set(allCategories)];
        filterCategorySelect.innerHTML = '<option value="">All Categories</option>' +
          unique.map(c => `<option value="${c}">${c}</option>`).join('');
      }

      // Receipt form
      const rcpCategorySelect = document.getElementById('acc-rcp-category');
      if (rcpCategorySelect) {
        rcpCategorySelect.innerHTML = '<option value="">Select category…</option>' +
          settings.expenseCategories.map(c => `<option value="${c}">${c}</option>`).join('');
      }
    },

    setDefaultDates() {
      const today = new Date().toISOString().split('T')[0];
      ['acc-tx-date', 'acc-rcp-date'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = today;
      });
    },

    getCategoryIcon(category) {
      const icons = {
        'Salary': '💼', 'Invoice': '📄', 'Freelance': '💻', 'Sale': '🏷️', 'Refund': '↩️',
        'Fuel': '⛽', 'Groceries': '🛒', 'Tools': '🔧', 'Materials': '🧱', 'Bills': '📱',
        'Software': '💿', 'Travel': '🚗', 'Office': '🏢', 'Marketing': '📣', 'Insurance': '🛡️',
        'Professional Fees': '👔', 'Other': '📦', 'Other Income': '📥'
      };
      return icons[category] || '📝';
    },

    escapeHTML(text) {
      if (!text) return '';
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    },

    showToast(message, type = 'info') {
      if (window.GXToast) {
        window.GXToast[type] ? window.GXToast[type]('Accounting', message) : window.GXToast.info('Accounting', message);
      } else {
        console.log(`[Accounting ${type}] ${message}`);
      }
    },

    bindEngineEvents() {
      document.addEventListener('acc:transaction:added', () => {
        this.updateDashboard();
        this.renderTransactions();
        this.renderAuditLog();
      });

      document.addEventListener('acc:transaction:deleted', () => {
        this.updateDashboard();
        this.renderTransactions();
        this.renderAuditLog();
      });

      document.addEventListener('acc:invoice:created', () => {
        this.renderInvoices();
        this.renderAuditLog();
      });

      document.addEventListener('acc:receipt:added', () => {
        this.renderReceipts();
        this.renderAuditLog();
      });
    }
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // EXPOSE GLOBALLY
  // ═══════════════════════════════════════════════════════════════════════════

  window.AccountingUI = AccountingUI;

  // ═══════════════════════════════════════════════════════════════════════════
  // INITIALIZATION
  // ═══════════════════════════════════════════════════════════════════════════

  document.addEventListener('DOMContentLoaded', () => AccountingUI.init());

  document.addEventListener('gracex:module:loaded', (ev) => {
    if (ev.detail && (ev.detail.module === 'accounting' || (ev.detail.url && ev.detail.url.includes('accounting.html')))) {
      setTimeout(() => AccountingUI.init(), 50);
    }
  });

  if (document.querySelector('.accounting-container')) {
    setTimeout(() => AccountingUI.init(), 100);
  }

  console.log('[GRACEX] Accounting UI V2 loaded');

})();
