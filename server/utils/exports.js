/**
 * GRACE-X Builder/SiteOps - PDF and Excel export generation (server-side)
 */
const { jsPDF } = require('jspdf');
const XLSX = require('xlsx');

function buildSiteOpsPdf(state) {
  const doc = new jsPDF();
  const proj = state.project || {};
  let y = 20;

  doc.setFontSize(16);
  doc.text('GRACE-X SiteOps - Project Report', 20, y);
  y += 10;
  doc.setFontSize(10);
  doc.text(`Project: ${proj.name || 'Unnamed'}`, 20, y);
  y += 6;
  doc.text(`Address: ${proj.address || '—'}`, 20, y);
  y += 6;
  doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, y);
  y += 12;

  doc.setFontSize(12);
  doc.text('Programme', 20, y);
  y += 8;
  doc.setFontSize(9);
  const phases = state.phases || [];
  phases.slice(0, 15).forEach((p, i) => {
    if (y > 270) { doc.addPage(); y = 20; }
    doc.text(`${i + 1}. ${p.name} | ${p.trade} | Day ${p.startDay} | ${p.duration}d | ${p.status || 'planned'}`, 20, y);
    y += 6;
  });
  y += 8;

  if (state.issues && state.issues.length > 0) {
    if (y > 250) { doc.addPage(); y = 20; }
    doc.setFontSize(12);
    doc.text('Open Issues', 20, y);
    y += 8;
    doc.setFontSize(9);
    state.issues.filter(i => i.status !== 'closed').slice(0, 10).forEach(i => {
      if (y > 270) { doc.addPage(); y = 20; }
      doc.text(`- [${i.severity || '—'}] ${(i.description || '').substring(0, 80)}`, 20, y);
      y += 6;
    });
  }

  return doc;
}

function buildSiteOpsExcel(state) {
  const wb = XLSX.utils.book_new();
  const proj = state.project || {};

  const programmeData = [
    ['Phase', 'Trade', 'Start Day', 'Duration', 'Depends On', 'Gate', 'Status'],
    ...(state.phases || []).map(p => [
      p.name,
      p.trade,
      p.startDay,
      p.duration,
      (p.dependsOn || []).join(', '),
      p.gate ? 'Yes' : 'No',
      p.status || 'planned'
    ])
  ];
  const wsProgramme = XLSX.utils.aoa_to_sheet(programmeData);
  XLSX.utils.book_append_sheet(wb, wsProgramme, 'Programme');

  const issuesData = [
    ['Category', 'Severity', 'Description', 'Owner', 'Status'],
    ...(state.issues || []).map(i => [i.category, i.severity, i.description, i.owner, i.status])
  ];
  const wsIssues = XLSX.utils.aoa_to_sheet(issuesData);
  XLSX.utils.book_append_sheet(wb, wsIssues, 'Issues');

  return wb;
}

function buildBuilderPdf(data) {
  const doc = new jsPDF();
  let y = 20;

  doc.setFontSize(16);
  doc.text('GRACE-X Builder - Scope Pack', 20, y);
  y += 10;
  doc.setFontSize(10);
  doc.text(`Project: ${data.projectName || 'Unnamed'}`, 20, y);
  y += 6;
  doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, y);
  y += 12;

  const items = data.scopePack?.items || data.items || [];
  doc.setFontSize(12);
  doc.text('Scope Items', 20, y);
  y += 8;
  doc.setFontSize(9);
  items.slice(0, 25).forEach((item, i) => {
    if (y > 270) { doc.addPage(); y = 20; }
    const line = `${i + 1}. ${item.room || ''} ${item.taskType || item.trade || 'Task'} | ${item.area || 0} m² | ${item.labourHours || 0} hrs`;
    doc.text(line.substring(0, 90), 20, y);
    y += 6;
  });

  return doc;
}

function buildBuilderExcel(data) {
  const wb = XLSX.utils.book_new();
  const items = data.scopePack?.items || data.items || [];

  const rows = [
    ['Room', 'Task Type', 'Trade', 'Area (m²)', 'Labour (hrs)', 'Cost Low', 'Cost High'],
    ...items.map(i => [
      i.room || '',
      i.taskType || i.trade || '',
      i.trade || '',
      i.area || 0,
      i.labourHours || 0,
      i.costLow || 0,
      i.costHigh || 0
    ])
  ];
  const ws = XLSX.utils.aoa_to_sheet(rows);
  XLSX.utils.book_append_sheet(wb, ws, 'Scope Pack');
  return wb;
}

module.exports = {
  buildSiteOpsPdf,
  buildSiteOpsExcel,
  buildBuilderPdf,
  buildBuilderExcel
};
