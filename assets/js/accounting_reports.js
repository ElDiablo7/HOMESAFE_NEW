// ═══════════════════════════════════════════════════════════════════════════════
// GRACE-X Accounting™ REPORTS - Export & Report Generation
// © Zac Crockett - Personal + Small Business Finance Assistant
// ═══════════════════════════════════════════════════════════════════════════════
//
// Generates: CSV, JSON, HTML reports, Invoice PDFs (via print)
//
// ═══════════════════════════════════════════════════════════════════════════════

(function() {
  'use strict';

  // ═══════════════════════════════════════════════════════════════════════════
  // ACCOUNTING REPORTS
  // ═══════════════════════════════════════════════════════════════════════════

  const AccountingReports = {

    // ═════════════════════════════════════════════════════════════════════════
    // CSV EXPORT
    // ═════════════════════════════════════════════════════════════════════════

    exportTransactionsCSV(transactions) {
      if (!transactions || transactions.length === 0) {
        console.warn('[AccountingReports] No transactions to export');
        return null;
      }

      const headers = ['Date', 'Type', 'Description', 'Category', 'Vendor', 'Amount', 'Notes'];
      
      const rows = transactions.map(t => [
        t.date,
        t.type,
        this.escapeCSV(t.description || ''),
        this.escapeCSV(t.category || ''),
        this.escapeCSV(t.vendor || ''),
        t.amount.toFixed(2),
        this.escapeCSV(t.notes || '')
      ]);

      const csv = [
        headers.join(','),
        ...rows.map(row => row.join(','))
      ].join('\n');

      this.downloadFile(csv, 'gracex-transactions.csv', 'text/csv');
      
      if (window.AccountingEngine) {
        window.AccountingEngine.log('EXPORT', `Exported ${transactions.length} transactions to CSV`);
      }

      return csv;
    },

    escapeCSV(value) {
      if (!value) return '';
      const escaped = String(value).replace(/"/g, '""');
      return escaped.includes(',') || escaped.includes('"') || escaped.includes('\n')
        ? `"${escaped}"`
        : escaped;
    },

    // ═════════════════════════════════════════════════════════════════════════
    // JSON EXPORT
    // ═════════════════════════════════════════════════════════════════════════

    exportAllJSON() {
      if (!window.AccountingEngine) {
        console.error('[AccountingReports] Engine not available');
        return null;
      }

      const json = window.AccountingEngine.exportAllData();
      this.downloadFile(json, 'gracex-accounting-backup.json', 'application/json');
      
      return json;
    },

    exportTransactionsJSON(transactions) {
      const json = JSON.stringify(transactions, null, 2);
      this.downloadFile(json, 'gracex-transactions.json', 'application/json');
      
      if (window.AccountingEngine) {
        window.AccountingEngine.log('EXPORT', `Exported ${transactions.length} transactions to JSON`);
      }

      return json;
    },

    // ═════════════════════════════════════════════════════════════════════════
    // HTML REPORT
    // ═════════════════════════════════════════════════════════════════════════

    generateMonthlyReport(year, month) {
      if (!window.AccountingEngine) return null;

      const startDate = new Date(year, month, 1);
      const endDate = new Date(year, month + 1, 0);
      
      const transactions = window.AccountingEngine.getTransactions({
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0]
      });

      const summary = window.AccountingEngine.getTransactionSummary({
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0]
      });

      const settings = window.AccountingEngine.getSettings();
      const monthName = startDate.toLocaleString('en-GB', { month: 'long', year: 'numeric' });

      const html = this.buildReportHTML({
        title: `Monthly Report - ${monthName}`,
        period: monthName,
        summary: summary,
        transactions: transactions,
        settings: settings
      });

      this.downloadFile(html, `gracex-report-${year}-${String(month + 1).padStart(2, '0')}.html`, 'text/html');
      
      window.AccountingEngine.log('EXPORT', `Generated monthly report: ${monthName}`);

      return html;
    },

    generateAnnualReport(year) {
      if (!window.AccountingEngine) return null;

      const startDate = new Date(year, 0, 1);
      const endDate = new Date(year, 11, 31);
      
      const transactions = window.AccountingEngine.getTransactions({
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0]
      });

      const summary = window.AccountingEngine.getTransactionSummary({
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0]
      });

      const settings = window.AccountingEngine.getSettings();

      const html = this.buildReportHTML({
        title: `Annual Report - ${year}`,
        period: String(year),
        summary: summary,
        transactions: transactions,
        settings: settings
      });

      this.downloadFile(html, `gracex-annual-report-${year}.html`, 'text/html');
      
      window.AccountingEngine.log('EXPORT', `Generated annual report: ${year}`);

      return html;
    },

    buildReportHTML(data) {
      const { title, period, summary, transactions, settings } = data;
      const symbol = settings?.currencySymbol || '£';

      // Build category breakdown
      let categoryRows = '';
      Object.entries(summary.byCategory).sort((a, b) => {
        return (b[1].expenses + b[1].income) - (a[1].expenses + a[1].income);
      }).forEach(([category, values]) => {
        categoryRows += `
          <tr>
            <td>${this.escapeHTML(category)}</td>
            <td style="color: #10b981;">${symbol}${values.income.toFixed(2)}</td>
            <td style="color: #ef4444;">${symbol}${values.expenses.toFixed(2)}</td>
            <td>${values.count}</td>
          </tr>
        `;
      });

      // Build transaction rows
      let transactionRows = '';
      transactions.slice(0, 100).forEach(t => {
        const isIncome = t.type === 'income';
        transactionRows += `
          <tr>
            <td>${t.date}</td>
            <td>${this.escapeHTML(t.description || t.category)}</td>
            <td>${this.escapeHTML(t.category || '')}</td>
            <td style="color: ${isIncome ? '#10b981' : '#ef4444'};">
              ${isIncome ? '+' : '-'}${symbol}${t.amount.toFixed(2)}
            </td>
          </tr>
        `;
      });

      return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${this.escapeHTML(title)}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Segoe UI', Tahoma, sans-serif;
      line-height: 1.6;
      color: #1a1a2e;
      background: #fff;
      padding: 40px;
      max-width: 900px;
      margin: 0 auto;
    }
    
    .header {
      text-align: center;
      padding-bottom: 30px;
      border-bottom: 3px solid #3b82f6;
      margin-bottom: 30px;
    }
    
    .header h1 { font-size: 28px; color: #0f172a; }
    .header p { color: #64748b; margin-top: 8px; }
    
    .summary-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 20px;
      margin-bottom: 40px;
    }
    
    .summary-card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 20px;
      text-align: center;
    }
    
    .summary-card .value {
      font-size: 24px;
      font-weight: 700;
      margin-bottom: 4px;
    }
    
    .summary-card .label {
      font-size: 14px;
      color: #64748b;
    }
    
    .income { color: #10b981; }
    .expense { color: #ef4444; }
    .profit { color: #3b82f6; }
    
    h2 {
      font-size: 20px;
      color: #0f172a;
      border-bottom: 2px solid #e2e8f0;
      padding-bottom: 10px;
      margin: 30px 0 15px;
    }
    
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 30px;
    }
    
    th, td {
      padding: 12px;
      text-align: left;
      border-bottom: 1px solid #e2e8f0;
    }
    
    th {
      background: #f1f5f9;
      font-weight: 600;
      color: #334155;
    }
    
    .footer {
      text-align: center;
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #e2e8f0;
      font-size: 12px;
      color: #64748b;
    }
    
    .disclaimer {
      background: #fef3c7;
      border: 1px solid #f59e0b;
      padding: 15px;
      border-radius: 8px;
      margin-top: 30px;
      font-size: 13px;
      color: #92400e;
    }
    
    @media print {
      body { padding: 20px; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>${this.escapeHTML(title)}</h1>
    <p>Generated by GRACE-X Accounting™ on ${new Date().toLocaleDateString('en-GB')}</p>
  </div>

  <div class="summary-grid">
    <div class="summary-card">
      <div class="value income">${symbol}${summary.totalIncome.toFixed(2)}</div>
      <div class="label">Total Income</div>
    </div>
    <div class="summary-card">
      <div class="value expense">${symbol}${summary.totalExpenses.toFixed(2)}</div>
      <div class="label">Total Expenses</div>
    </div>
    <div class="summary-card">
      <div class="value profit">${symbol}${summary.netProfit.toFixed(2)}</div>
      <div class="label">Net Profit/Loss</div>
    </div>
    <div class="summary-card">
      <div class="value">${summary.transactionCount}</div>
      <div class="label">Transactions</div>
    </div>
  </div>

  <h2>Category Breakdown</h2>
  <table>
    <thead>
      <tr>
        <th>Category</th>
        <th>Income</th>
        <th>Expenses</th>
        <th>Count</th>
      </tr>
    </thead>
    <tbody>
      ${categoryRows || '<tr><td colspan="4">No data</td></tr>'}
    </tbody>
  </table>

  <h2>Transactions (Latest ${Math.min(transactions.length, 100)})</h2>
  <table>
    <thead>
      <tr>
        <th>Date</th>
        <th>Description</th>
        <th>Category</th>
        <th>Amount</th>
      </tr>
    </thead>
    <tbody>
      ${transactionRows || '<tr><td colspan="4">No transactions</td></tr>'}
    </tbody>
  </table>

  <div class="disclaimer">
    <strong>⚠️ Disclaimer:</strong> This report is for informational purposes only and does not constitute financial advice. 
    Please verify all figures and consult a qualified accountant for tax and financial decisions.
  </div>

  <div class="footer">
    <p>GRACE-X Accounting™ | Report ID: RPT-${Date.now()}</p>
  </div>
</body>
</html>`;
    },

    // ═════════════════════════════════════════════════════════════════════════
    // INVOICE HTML (Print-ready)
    // ═════════════════════════════════════════════════════════════════════════

    generateInvoiceHTML(invoice) {
      if (!window.AccountingEngine) return null;

      const settings = window.AccountingEngine.getSettings();
      const symbol = settings.currencySymbol || '£';

      let itemRows = '';
      invoice.items.forEach(item => {
        itemRows += `
          <tr>
            <td>${this.escapeHTML(item.description)}</td>
            <td style="text-align: center;">${item.quantity}</td>
            <td style="text-align: right;">${symbol}${item.unitPrice.toFixed(2)}</td>
            <td style="text-align: right;">${symbol}${item.total.toFixed(2)}</td>
          </tr>
        `;
      });

      return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Invoice ${invoice.number}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Segoe UI', Tahoma, sans-serif;
      line-height: 1.5;
      color: #1a1a2e;
      background: #fff;
      padding: 40px;
      max-width: 800px;
      margin: 0 auto;
    }
    
    .invoice-header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 40px;
      padding-bottom: 20px;
      border-bottom: 3px solid #3b82f6;
    }
    
    .invoice-title { font-size: 32px; font-weight: 700; color: #0f172a; }
    .invoice-number { font-size: 14px; color: #64748b; margin-top: 4px; }
    
    .invoice-meta {
      text-align: right;
      font-size: 14px;
    }
    
    .invoice-meta strong { display: block; }
    
    .parties {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 40px;
      margin-bottom: 40px;
    }
    
    .party h3 {
      font-size: 12px;
      text-transform: uppercase;
      color: #64748b;
      margin-bottom: 8px;
    }
    
    .party p { font-size: 14px; line-height: 1.6; }
    
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 30px;
    }
    
    th, td {
      padding: 12px;
      border-bottom: 1px solid #e2e8f0;
    }
    
    th {
      background: #f1f5f9;
      font-weight: 600;
      text-align: left;
      font-size: 12px;
      text-transform: uppercase;
      color: #334155;
    }
    
    .totals {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      margin-bottom: 40px;
    }
    
    .total-row {
      display: flex;
      justify-content: space-between;
      width: 250px;
      padding: 8px 0;
      border-bottom: 1px solid #e2e8f0;
    }
    
    .total-row.grand {
      font-size: 18px;
      font-weight: 700;
      border-bottom: 3px solid #3b82f6;
      padding: 12px 0;
    }
    
    .notes {
      background: #f8fafc;
      padding: 20px;
      border-radius: 8px;
      margin-bottom: 30px;
    }
    
    .notes h4 {
      font-size: 12px;
      text-transform: uppercase;
      color: #64748b;
      margin-bottom: 8px;
    }
    
    .footer {
      text-align: center;
      font-size: 12px;
      color: #64748b;
      border-top: 1px solid #e2e8f0;
      padding-top: 20px;
    }
    
    @media print {
      body { padding: 20px; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <div class="invoice-header">
    <div>
      <div class="invoice-title">INVOICE</div>
      <div class="invoice-number">${invoice.number}</div>
    </div>
    <div class="invoice-meta">
      <strong>Date: ${new Date(invoice.createdAt).toLocaleDateString('en-GB')}</strong>
      <strong>Due: ${invoice.dueDate}</strong>
      <span style="display: inline-block; margin-top: 8px; padding: 4px 12px; background: ${this.getStatusColor(invoice.status)}; color: #fff; border-radius: 4px; font-size: 12px; text-transform: uppercase;">${invoice.status}</span>
    </div>
  </div>

  <div class="parties">
    <div class="party">
      <h3>From</h3>
      <p>
        <strong>${this.escapeHTML(settings.businessName || 'Your Business')}</strong><br>
        ${this.escapeHTML(settings.businessAddress || '').replace(/\n/g, '<br>')}
      </p>
    </div>
    <div class="party">
      <h3>Bill To</h3>
      <p>
        <strong>${this.escapeHTML(invoice.client.name)}</strong><br>
        ${this.escapeHTML(invoice.client.address || '').replace(/\n/g, '<br>')}
        ${invoice.client.email ? `<br>${invoice.client.email}` : ''}
      </p>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>Description</th>
        <th style="text-align: center;">Qty</th>
        <th style="text-align: right;">Unit Price</th>
        <th style="text-align: right;">Total</th>
      </tr>
    </thead>
    <tbody>
      ${itemRows}
    </tbody>
  </table>

  <div class="totals">
    <div class="total-row">
      <span>Subtotal</span>
      <span>${symbol}${invoice.subtotal.toFixed(2)}</span>
    </div>
    ${invoice.vatRate > 0 ? `
    <div class="total-row">
      <span>VAT (${invoice.vatRate}%)</span>
      <span>${symbol}${invoice.vatAmount.toFixed(2)}</span>
    </div>
    ` : ''}
    <div class="total-row grand">
      <span>Total Due</span>
      <span>${symbol}${invoice.total.toFixed(2)}</span>
    </div>
  </div>

  ${invoice.notes ? `
  <div class="notes">
    <h4>Notes</h4>
    <p>${this.escapeHTML(invoice.notes)}</p>
  </div>
  ` : ''}

  <div class="notes">
    <h4>Payment Terms</h4>
    <p>${this.escapeHTML(invoice.paymentTerms)}</p>
    ${settings.bankDetails ? `<p style="margin-top: 10px;"><strong>Bank Details:</strong><br>${this.escapeHTML(settings.bankDetails).replace(/\n/g, '<br>')}</p>` : ''}
  </div>

  <div class="footer">
    <p>Thank you for your business!</p>
    <p style="margin-top: 8px;">Generated by GRACE-X Accounting™</p>
  </div>
</body>
</html>`;
    },

    getStatusColor(status) {
      const colors = {
        draft: '#64748b',
        sent: '#3b82f6',
        paid: '#10b981',
        overdue: '#ef4444',
        cancelled: '#6b7280'
      };
      return colors[status] || colors.draft;
    },

    printInvoice(invoice) {
      const html = this.generateInvoiceHTML(invoice);
      const printWindow = window.open('', '_blank');
      printWindow.document.write(html);
      printWindow.document.close();
      printWindow.focus();
      
      setTimeout(() => {
        printWindow.print();
      }, 500);

      if (window.AccountingEngine) {
        window.AccountingEngine.log('EXPORT', `Printed invoice: ${invoice.number}`);
      }
    },

    // ═════════════════════════════════════════════════════════════════════════
    // UTILITIES
    // ═════════════════════════════════════════════════════════════════════════

    downloadFile(content, filename, mimeType) {
      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    },

    escapeHTML(text) {
      if (!text) return '';
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    },

    copyToClipboard(text) {
      if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(() => {
          console.log('[AccountingReports] Copied to clipboard');
        });
      } else {
        // Fallback
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
    }
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // EXPOSE GLOBALLY
  // ═══════════════════════════════════════════════════════════════════════════

  window.AccountingReports = AccountingReports;

  console.log('[GRACEX] Accounting Reports loaded');

})();
