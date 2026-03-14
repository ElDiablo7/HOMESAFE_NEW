// ═══════════════════════════════════════════════════════════════════════════════
// GRACE-X OSINT™ REPORT - Professional Report Generator
// © Zac Crockett - White-hat OSINT only - Ethical · Legal · Professional
// ═══════════════════════════════════════════════════════════════════════════════
//
// Generates professional OSINT reports with:
// - Scope definition
// - Sources used
// - Findings with confidence levels
// - Limitations
// - Legal disclaimer
// - Export to HTML, Markdown, JSON
//
// ═══════════════════════════════════════════════════════════════════════════════

(function() {
  'use strict';

  // ═══════════════════════════════════════════════════════════════════════════
  // OSINT REPORT GENERATOR
  // ═══════════════════════════════════════════════════════════════════════════

  const OSINTReport = {

    // ═════════════════════════════════════════════════════════════════════════
    // REPORT CONFIGURATION
    // ═════════════════════════════════════════════════════════════════════════

    config: {
      organization: 'GRACE-X OSINT™',
      version: '1.0.0',
      disclaimer: `LEGAL DISCLAIMER:
This report has been generated using GRACE-X OSINT™, an ethical open-source intelligence platform. 

All information contained herein has been obtained from publicly available sources. This report does not constitute legal advice and should not be used as the sole basis for any legal, business, or personal decisions.

The accuracy of information cannot be guaranteed as source data may change or be inaccurate. Users are advised to independently verify all findings before taking action.

This tool is intended for lawful purposes only, including:
- Due diligence and background research
- Security assessments
- Journalistic investigation
- Academic research
- Personal safety verification

Misuse of this tool for harassment, stalking, discrimination, or any illegal purpose is strictly prohibited and may be subject to legal action.

© ${new Date().getFullYear()} GRACE-X AI™ - All rights reserved.`
    },

    // ═════════════════════════════════════════════════════════════════════════
    // REPORT GENERATION
    // ═════════════════════════════════════════════════════════════════════════

    /**
     * Generate a complete OSINT report
     */
    generate(data) {
      const report = {
        metadata: this.generateMetadata(data),
        scope: data.scope || {},
        methodology: this.generateMethodology(data),
        sources: this.compileSources(data),
        findings: data.findings || [],
        evidence: data.evidence || [],
        analysis: data.analysis || '',
        limitations: this.generateLimitations(data),
        recommendations: data.recommendations || [],
        disclaimer: this.config.disclaimer,
        appendix: data.appendix || []
      };

      return report;
    },

    /**
     * Generate report metadata
     */
    generateMetadata(data) {
      return {
        caseId: data.caseId || this.generateCaseId(),
        title: data.title || 'OSINT Investigation Report',
        subtitle: data.subtitle || '',
        investigator: data.investigator || 'GRACE-X OSINT™ User',
        organization: this.config.organization,
        dateCreated: new Date().toISOString(),
        dateRange: {
          start: data.startDate || new Date().toISOString(),
          end: data.endDate || new Date().toISOString()
        },
        classification: data.classification || 'Confidential',
        version: '1.0'
      };
    },

    /**
     * Generate unique case ID
     */
    generateCaseId() {
      const date = new Date();
      const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
      const random = Math.random().toString(36).substr(2, 6).toUpperCase();
      return `OSINT-${dateStr}-${random}`;
    },

    /**
     * Generate methodology section
     */
    generateMethodology(data) {
      return {
        approach: data.methodology || 'Open Source Intelligence (OSINT) methodology',
        techniques: [
          'Public records search',
          'Social media analysis',
          'Domain/IP reconnaissance',
          'Media verification',
          'Pattern analysis'
        ].filter(t => !data.excludeTechniques || !data.excludeTechniques.includes(t)),
        tools: [
          'GRACE-X OSINT™ Platform',
          'Public search engines',
          'Domain lookup services',
          'Social media platforms (public data only)',
          'Breach notification services'
        ],
        constraints: data.constraints || [
          'Limited to publicly available information',
          'No login-required data accessed',
          'No automated scraping performed',
          'All searches user-initiated'
        ]
      };
    },

    /**
     * Compile sources used
     */
    compileSources(data) {
      const sources = data.sourcesUsed || [];
      
      return {
        count: sources.length,
        categories: this.categorizeSourcesList(sources),
        list: sources.map(s => ({
          name: s.name,
          url: s.url || 'N/A',
          accessed: s.timestamp || new Date().toISOString(),
          category: s.category || 'general',
          reliability: s.reliability || 'unverified'
        }))
      };
    },

    /**
     * Categorize sources list
     */
    categorizeSourcesList(sources) {
      const categories = {};
      sources.forEach(s => {
        const cat = s.category || 'general';
        if (!categories[cat]) categories[cat] = 0;
        categories[cat]++;
      });
      return categories;
    },

    /**
     * Generate limitations section
     */
    generateLimitations(data) {
      const standard = [
        'This investigation was limited to publicly available information.',
        'Privately held or restricted data was not accessed.',
        'Information may be outdated or inaccurate at time of access.',
        'Social media content may have been altered or deleted since collection.',
        'No direct contact was made with subjects or third parties.',
        'Findings represent a point-in-time snapshot and may change.'
      ];

      return data.limitations 
        ? [...standard, ...data.limitations]
        : standard;
    },

    // ═════════════════════════════════════════════════════════════════════════
    // EXPORT FORMATS
    // ═════════════════════════════════════════════════════════════════════════

    /**
     * Export as HTML (PDF-ready)
     */
    exportHTML(report) {
      const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${this.escapeHtml(report.metadata.title)} - ${report.metadata.caseId}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
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
      border-bottom: 3px solid #0ea5e9;
      margin-bottom: 30px;
    }
    
    .header h1 {
      font-size: 28px;
      color: #0f172a;
      margin-bottom: 10px;
    }
    
    .header .case-id {
      font-family: 'Consolas', monospace;
      font-size: 14px;
      color: #64748b;
      background: #f1f5f9;
      padding: 4px 12px;
      border-radius: 4px;
      display: inline-block;
    }
    
    .metadata {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 15px;
      background: #f8fafc;
      padding: 20px;
      border-radius: 8px;
      margin-bottom: 30px;
    }
    
    .metadata-item {
      font-size: 14px;
    }
    
    .metadata-item label {
      font-weight: 600;
      color: #475569;
    }
    
    .metadata-item span {
      color: #0f172a;
    }
    
    h2 {
      font-size: 20px;
      color: #0f172a;
      border-bottom: 2px solid #e2e8f0;
      padding-bottom: 10px;
      margin: 30px 0 15px;
    }
    
    h3 {
      font-size: 16px;
      color: #334155;
      margin: 20px 0 10px;
    }
    
    p { margin-bottom: 12px; }
    
    ul, ol {
      margin-left: 20px;
      margin-bottom: 15px;
    }
    
    li { margin-bottom: 8px; }
    
    .finding {
      background: #fff;
      border: 1px solid #e2e8f0;
      border-left: 4px solid #0ea5e9;
      padding: 15px;
      margin-bottom: 15px;
      border-radius: 0 8px 8px 0;
    }
    
    .finding.high-confidence { border-left-color: #10b981; }
    .finding.medium-confidence { border-left-color: #f59e0b; }
    .finding.low-confidence { border-left-color: #ef4444; }
    
    .finding-title {
      font-weight: 600;
      color: #0f172a;
      margin-bottom: 8px;
    }
    
    .confidence-badge {
      display: inline-block;
      font-size: 11px;
      padding: 2px 8px;
      border-radius: 10px;
      text-transform: uppercase;
      font-weight: 600;
    }
    
    .confidence-high {
      background: #d1fae5;
      color: #065f46;
    }
    
    .confidence-medium {
      background: #fef3c7;
      color: #92400e;
    }
    
    .confidence-low {
      background: #fee2e2;
      color: #991b1b;
    }
    
    .evidence {
      background: #f1f5f9;
      padding: 12px;
      border-radius: 6px;
      margin-bottom: 10px;
      font-size: 14px;
    }
    
    .disclaimer {
      background: #fef3c7;
      border: 1px solid #f59e0b;
      padding: 20px;
      border-radius: 8px;
      margin-top: 40px;
      font-size: 13px;
      color: #78350f;
    }
    
    .disclaimer h3 {
      color: #92400e;
      margin-bottom: 15px;
    }
    
    .footer {
      text-align: center;
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #e2e8f0;
      font-size: 12px;
      color: #64748b;
    }
    
    .sources-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 20px;
      font-size: 13px;
    }
    
    .sources-table th,
    .sources-table td {
      border: 1px solid #e2e8f0;
      padding: 10px;
      text-align: left;
    }
    
    .sources-table th {
      background: #f1f5f9;
      font-weight: 600;
      color: #334155;
    }
    
    @media print {
      body { padding: 20px; }
      .page-break { page-break-before: always; }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>${this.escapeHtml(report.metadata.title)}</h1>
    ${report.metadata.subtitle ? `<p>${this.escapeHtml(report.metadata.subtitle)}</p>` : ''}
    <span class="case-id">${this.escapeHtml(report.metadata.caseId)}</span>
  </div>

  <div class="metadata">
    <div class="metadata-item">
      <label>Date Created:</label>
      <span>${new Date(report.metadata.dateCreated).toLocaleDateString()}</span>
    </div>
    <div class="metadata-item">
      <label>Investigator:</label>
      <span>${this.escapeHtml(report.metadata.investigator)}</span>
    </div>
    <div class="metadata-item">
      <label>Organization:</label>
      <span>${this.escapeHtml(report.metadata.organization)}</span>
    </div>
    <div class="metadata-item">
      <label>Classification:</label>
      <span>${this.escapeHtml(report.metadata.classification)}</span>
    </div>
  </div>

  <h2>1. Scope</h2>
  <p><strong>Subject:</strong> ${this.escapeHtml(report.scope.subject || 'Not specified')}</p>
  <p><strong>Objective:</strong> ${this.escapeHtml(report.scope.objective || 'General intelligence gathering')}</p>
  ${report.scope.constraints ? `
  <h3>Constraints</h3>
  <ul>
    ${report.scope.constraints.map(c => `<li>${this.escapeHtml(c)}</li>`).join('')}
  </ul>
  ` : ''}

  <h2>2. Methodology</h2>
  <p>${this.escapeHtml(report.methodology.approach)}</p>
  <h3>Techniques Used</h3>
  <ul>
    ${report.methodology.techniques.map(t => `<li>${this.escapeHtml(t)}</li>`).join('')}
  </ul>
  <h3>Tools</h3>
  <ul>
    ${report.methodology.tools.map(t => `<li>${this.escapeHtml(t)}</li>`).join('')}
  </ul>

  <h2>3. Sources Used</h2>
  <p>Total sources consulted: <strong>${report.sources.count}</strong></p>
  ${report.sources.list.length > 0 ? `
  <table class="sources-table">
    <thead>
      <tr>
        <th>Source</th>
        <th>Category</th>
        <th>Accessed</th>
      </tr>
    </thead>
    <tbody>
      ${report.sources.list.map(s => `
      <tr>
        <td>${this.escapeHtml(s.name)}</td>
        <td>${this.escapeHtml(s.category)}</td>
        <td>${new Date(s.accessed).toLocaleDateString()}</td>
      </tr>
      `).join('')}
    </tbody>
  </table>
  ` : '<p><em>No sources recorded.</em></p>'}

  <div class="page-break"></div>

  <h2>4. Findings</h2>
  ${report.findings.length > 0 ? report.findings.map(f => `
  <div class="finding ${f.confidence}-confidence">
    <div class="finding-title">
      ${this.escapeHtml(f.title || 'Finding')}
      <span class="confidence-badge confidence-${f.confidence || 'medium'}">${f.confidence || 'medium'}</span>
    </div>
    <p>${this.escapeHtml(f.content || f.description || '')}</p>
    ${f.source ? `<small>Source: ${this.escapeHtml(f.source)}</small>` : ''}
  </div>
  `).join('') : '<p><em>No findings recorded.</em></p>'}

  <h2>5. Evidence</h2>
  ${report.evidence.length > 0 ? report.evidence.map(e => `
  <div class="evidence">
    <strong>${this.escapeHtml(e.type || 'Evidence')}:</strong> ${this.escapeHtml(e.content || '')}
    <br><small>Collected: ${new Date(e.timestamp).toLocaleString()}</small>
  </div>
  `).join('') : '<p><em>No evidence items collected.</em></p>'}

  <h2>6. Analysis</h2>
  <p>${this.escapeHtml(report.analysis || 'No additional analysis provided.')}</p>

  <h2>7. Limitations</h2>
  <ul>
    ${report.limitations.map(l => `<li>${this.escapeHtml(l)}</li>`).join('')}
  </ul>

  ${report.recommendations.length > 0 ? `
  <h2>8. Recommendations</h2>
  <ul>
    ${report.recommendations.map(r => `<li>${this.escapeHtml(r)}</li>`).join('')}
  </ul>
  ` : ''}

  <div class="disclaimer">
    <h3>⚠️ Legal Disclaimer</h3>
    <p style="white-space: pre-wrap;">${this.escapeHtml(report.disclaimer)}</p>
  </div>

  <div class="footer">
    <p>Generated by ${this.escapeHtml(this.config.organization)} v${this.config.version}</p>
    <p>Report ID: ${this.escapeHtml(report.metadata.caseId)} | Generated: ${new Date().toISOString()}</p>
  </div>
</body>
</html>`;

      return html;
    },

    /**
     * Export as Markdown
     */
    exportMarkdown(report) {
      let md = `# ${report.metadata.title}

**Case ID:** ${report.metadata.caseId}  
**Date:** ${new Date(report.metadata.dateCreated).toLocaleDateString()}  
**Investigator:** ${report.metadata.investigator}  
**Classification:** ${report.metadata.classification}

---

## 1. Scope

**Subject:** ${report.scope.subject || 'Not specified'}  
**Objective:** ${report.scope.objective || 'General intelligence gathering'}

${report.scope.constraints ? `### Constraints
${report.scope.constraints.map(c => `- ${c}`).join('\n')}` : ''}

---

## 2. Methodology

${report.methodology.approach}

### Techniques Used
${report.methodology.techniques.map(t => `- ${t}`).join('\n')}

### Tools
${report.methodology.tools.map(t => `- ${t}`).join('\n')}

---

## 3. Sources Used

Total sources: **${report.sources.count}**

${report.sources.list.length > 0 ? `| Source | Category | Accessed |
|--------|----------|----------|
${report.sources.list.map(s => `| ${s.name} | ${s.category} | ${new Date(s.accessed).toLocaleDateString()} |`).join('\n')}` : '*No sources recorded.*'}

---

## 4. Findings

${report.findings.length > 0 ? report.findings.map(f => `### ${f.title || 'Finding'} [${(f.confidence || 'medium').toUpperCase()}]

${f.content || f.description || ''}

${f.source ? `*Source: ${f.source}*` : ''}`).join('\n\n') : '*No findings recorded.*'}

---

## 5. Evidence

${report.evidence.length > 0 ? report.evidence.map(e => `- **${e.type || 'Evidence'}:** ${e.content || ''} *(${new Date(e.timestamp).toLocaleString()})*`).join('\n') : '*No evidence collected.*'}

---

## 6. Analysis

${report.analysis || 'No additional analysis provided.'}

---

## 7. Limitations

${report.limitations.map(l => `- ${l}`).join('\n')}

${report.recommendations.length > 0 ? `---

## 8. Recommendations

${report.recommendations.map(r => `- ${r}`).join('\n')}` : ''}

---

## ⚠️ Legal Disclaimer

${report.disclaimer}

---

*Generated by ${this.config.organization} v${this.config.version}*  
*Report ID: ${report.metadata.caseId}*
`;

      return md;
    },

    /**
     * Export as JSON
     */
    exportJSON(report) {
      return JSON.stringify(report, null, 2);
    },

    // ═════════════════════════════════════════════════════════════════════════
    // DOWNLOAD HELPERS
    // ═════════════════════════════════════════════════════════════════════════

    /**
     * Download report in specified format
     */
    download(report, format = 'html') {
      let content, mimeType, extension;

      switch (format.toLowerCase()) {
        case 'html':
          content = this.exportHTML(report);
          mimeType = 'text/html';
          extension = 'html';
          break;
        case 'markdown':
        case 'md':
          content = this.exportMarkdown(report);
          mimeType = 'text/markdown';
          extension = 'md';
          break;
        case 'json':
          content = this.exportJSON(report);
          mimeType = 'application/json';
          extension = 'json';
          break;
        default:
          throw new Error(`Unsupported format: ${format}`);
      }

      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${report.metadata.caseId}_report.${extension}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      // Log export
      if (window.OSINTEngine) {
        window.OSINTEngine.log('ACTION', `Report exported as ${format.toUpperCase()}`, {
          caseId: report.metadata.caseId
        });
      }

      return true;
    },

    // ═════════════════════════════════════════════════════════════════════════
    // UTILITY METHODS
    // ═════════════════════════════════════════════════════════════════════════

    /**
     * Escape HTML special characters
     */
    escapeHtml(text) {
      if (!text) return '';
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    },

    /**
     * Generate report from current session
     */
    generateFromSession(options = {}) {
      const engine = window.OSINTEngine;
      if (!engine) {
        console.error('[OSINTReport] Engine not available');
        return null;
      }

      const data = {
        title: options.title || 'OSINT Investigation Report',
        subtitle: options.subtitle || '',
        investigator: options.investigator || 'GRACE-X User',
        scope: {
          subject: options.subject || 'General Investigation',
          objective: options.objective || 'Intelligence gathering and analysis',
          constraints: options.constraints || []
        },
        findings: options.findings || [],
        evidence: engine.getEvidence(),
        analysis: options.analysis || engine.getNotes(),
        recommendations: options.recommendations || [],
        sourcesUsed: options.sources || []
      };

      return this.generate(data);
    }
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // EXPOSE GLOBALLY
  // ═══════════════════════════════════════════════════════════════════════════

  window.OSINTReport = OSINTReport;

  console.log('[GRACEX] OSINT Report generator loaded');

})();
