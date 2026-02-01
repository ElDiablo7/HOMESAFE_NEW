/**
 * GRACE-X Builder/SiteOps - Frontend export helpers (call API, trigger download)
 */
(function() {
  'use strict';

  const API_BASE = window.GRACEX_API_BASE || 'http://localhost:3000';

  function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  function apiHeaders() {
    return (window.GRACEX_Auth && window.GRACEX_Auth.authHeaders) ? window.GRACEX_Auth.authHeaders() : { 'Content-Type': 'application/json' };
  }

  window.GRACEX_Exports = {
    // Builder: POST current scope pack, get PDF/Excel
    downloadBuilderPdf: function(projectName, scopePack) {
      fetch(API_BASE + '/api/builder/export/pdf', {
        method: 'POST',
        headers: apiHeaders(),
        body: JSON.stringify({ projectName: projectName || 'Builder Project', scopePack: scopePack || { items: [] } })
      })
        .then(res => res.ok ? res.blob() : res.json().then(j => Promise.reject(new Error(j.error))))
        .then(blob => downloadBlob(blob, 'GRACEX_Builder_Scope.pdf'))
        .catch(err => { if (window.GRACEX_Utils) GRACEX_Utils.showToast('Export failed: ' + (err.message || ''), 'error'); });
    },
    downloadBuilderExcel: function(projectName, scopePack) {
      fetch(API_BASE + '/api/builder/export/excel', {
        method: 'POST',
        headers: apiHeaders(),
        body: JSON.stringify({ projectName: projectName || 'Builder Project', scopePack: scopePack || { items: [] } })
      })
        .then(res => res.ok ? res.blob() : res.json().then(j => Promise.reject(new Error(j.error))))
        .then(blob => downloadBlob(blob, 'GRACEX_Builder_Scope.xlsx'))
        .catch(err => { if (window.GRACEX_Utils) GRACEX_Utils.showToast('Export failed: ' + (err.message || ''), 'error'); });
    },

    // SiteOps: POST current state (no projectId) or GET by projectId
    downloadSiteOpsPdf: function(stateOrProjectId) {
      const isId = typeof stateOrProjectId === 'string' && !stateOrProjectId.startsWith('{');
      const url = isId
        ? API_BASE + '/api/siteops/export/pdf/' + stateOrProjectId
        : API_BASE + '/api/siteops/export/pdf';
      const opts = isId ? { method: 'GET', headers: apiHeaders() } : { method: 'POST', headers: apiHeaders(), body: JSON.stringify(stateOrProjectId || {}) };
      fetch(url, opts)
        .then(res => res.ok ? res.blob() : res.json().then(j => Promise.reject(new Error(j.error))))
        .then(blob => downloadBlob(blob, 'GRACEX_SiteOps_Report.pdf'))
        .catch(err => { if (window.GRACEX_Utils) GRACEX_Utils.showToast('Export failed: ' + (err.message || ''), 'error'); });
    },
    downloadSiteOpsExcel: function(stateOrProjectId) {
      const isId = typeof stateOrProjectId === 'string' && !stateOrProjectId.startsWith('{');
      const url = isId
        ? API_BASE + '/api/siteops/export/excel/' + stateOrProjectId
        : API_BASE + '/api/siteops/export/excel';
      const opts = isId ? { method: 'GET', headers: apiHeaders() } : { method: 'POST', headers: apiHeaders(), body: JSON.stringify(stateOrProjectId || {}) };
      fetch(url, opts)
        .then(res => res.ok ? res.blob() : res.json().then(j => Promise.reject(new Error(j.error))))
        .then(blob => downloadBlob(blob, 'GRACEX_SiteOps_Export.xlsx'))
        .catch(err => { if (window.GRACEX_Utils) GRACEX_Utils.showToast('Export failed: ' + (err.message || ''), 'error'); });
    }
  };
})();
