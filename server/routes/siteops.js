/**
 * GRACE-X SiteOps API - Projects, import from Builder, reports
 */
const express = require('express');
const router = express.Router();
const storage = require('../utils/storage');
const { buildSiteOpsPdf, buildSiteOpsExcel } = require('../utils/exports');
const XLSX = require('xlsx');

const MODULE = 'siteops';

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
}

router.use((req, res, next) => {
  req.userId = req.userId || req.headers['x-user-id'] || req.headers['x-userid'] || 'default';
  next();
});

// POST /api/siteops/projects - Save (create or update) full project state
router.post('/projects', (req, res) => {
  if (!req.userId || req.userId === 'default') {
    return res.status(401).json({ success: false, error: 'Authentication required' });
  }
  try {
    const body = req.body || {};
    const id = body.project?.name ? (body.id || generateId()) : generateId();
    const project = body.project || body;
    const state = {
      id,
      project: project.project || project,
      phases: body.phases || [],
      trades: body.trades || [],
      dependencies: body.dependencies || [],
      gates: body.gates || [],
      issues: body.issues || [],
      dailyLogs: body.dailyLogs || [],
      changes: body.changes || [],
      updatedAt: new Date().toISOString()
    };
    if (body.phases !== undefined) state.phases = body.phases;
    if (body.trades !== undefined) state.trades = body.trades;
    if (body.dependencies !== undefined) state.dependencies = body.dependencies;
    if (body.gates !== undefined) state.gates = body.gates;
    if (body.issues !== undefined) state.issues = body.issues;
    if (body.dailyLogs !== undefined) state.dailyLogs = body.dailyLogs;
    if (body.changes !== undefined) state.changes = body.changes;
    storage.write(MODULE, req.userId, 'project', id, state);
    res.json({ success: true, id, state });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// GET /api/siteops/projects - List user projects
router.get('/projects', (req, res) => {
  try {
    const list = storage.list(MODULE, req.userId, 'project');
    const summary = list.map(s => ({
      id: s.id,
      name: s.project?.name || 'Unnamed',
      address: s.project?.address || '',
      status: s.project?.status || 'planning',
      updatedAt: s.updatedAt
    }));
    res.json({ success: true, projects: summary });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// GET /api/siteops/projects/:id - Get full project state
router.get('/projects/:id', (req, res) => {
  try {
    const state = storage.read(MODULE, req.userId, 'project', req.params.id);
    if (!state) return res.status(404).json({ success: false, error: 'Project not found' });
    res.json({ success: true, state });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// PUT /api/siteops/projects/:id - Update project
router.put('/projects/:id', (req, res) => {
  if (!req.userId || req.userId === 'default') {
    return res.status(401).json({ success: false, error: 'Authentication required' });
  }
  try {
    const existing = storage.read(MODULE, req.userId, 'project', req.params.id);
    if (!existing) return res.status(404).json({ success: false, error: 'Project not found' });
    const state = { ...existing, ...req.body, id: req.params.id, updatedAt: new Date().toISOString() };
    storage.write(MODULE, req.userId, 'project', req.params.id, state);
    res.json({ success: true, state });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// DELETE /api/siteops/projects/:id
router.delete('/projects/:id', (req, res) => {
  if (!req.userId || req.userId === 'default') {
    return res.status(401).json({ success: false, error: 'Authentication required' });
  }
  try {
    storage.remove(MODULE, req.userId, 'project', req.params.id);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// Helper: build report text from state
function buildWeeklyReport(state) {
  const lines = [];
  const proj = state.project || {};
  lines.push('═══════════════════════════════════════════════════════════════');
  lines.push('WEEKLY SITE REPORT');
  lines.push('═══════════════════════════════════════════════════════════════');
  lines.push(`Project: ${proj.name || 'Unnamed'}`);
  lines.push(`Week ending: ${new Date().toLocaleDateString()}`);
  lines.push(`Status: ${proj.status || 'planning'}`);
  lines.push('');
  lines.push('PROGRAMME STATUS');
  lines.push('────────────────');
  const phases = state.phases || [];
  const done = phases.filter(p => p.status === 'done').length;
  const inProgress = phases.filter(p => p.status === 'in-progress').length;
  const blocked = phases.filter(p => p.status === 'blocked').length;
  lines.push(`Completed: ${done}/${phases.length} phases`);
  lines.push(`In Progress: ${inProgress}`);
  lines.push(`Blocked: ${blocked}`);
  lines.push('');
  const issues = state.issues || [];
  lines.push('ISSUES SUMMARY');
  lines.push('──────────────');
  const openIssues = issues.filter(i => i.status !== 'closed');
  lines.push(`Open issues: ${openIssues.length}`);
  lines.push(`Blockers: ${issues.filter(i => i.category === 'blocker' && i.status !== 'closed').length}`);
  lines.push('');
  lines.push('GATES STATUS');
  lines.push('────────────');
  (state.gates || []).forEach(g => lines.push(`${g.type || g.id}: ${g.status}`));
  lines.push('');
  lines.push('═══════════════════════════════════════════════════════════════');
  return lines.join('\n');
}

function buildClientReport(state) {
  const lines = [];
  const proj = state.project || {};
  lines.push('═══════════════════════════════════════════════════════════════');
  lines.push('CLIENT UPDATE');
  lines.push('═══════════════════════════════════════════════════════════════');
  lines.push(`Project: ${proj.name || 'Unnamed'}`);
  lines.push(`Address: ${proj.address || '—'}`);
  lines.push(`Date: ${new Date().toLocaleDateString()}`);
  lines.push('');
  lines.push('PROGRESS SUMMARY');
  lines.push('────────────────');
  const phases = state.phases || [];
  const completed = phases.filter(p => p.status === 'done');
  lines.push(`Phases completed this period: ${completed.length}`);
  completed.forEach(p => lines.push(`  • ${p.name} (${p.trade})`));
  lines.push('');
  lines.push('NEXT STEPS');
  lines.push('──────────');
  const inProgress = phases.filter(p => p.status === 'in-progress');
  inProgress.forEach(p => lines.push(`  • ${p.name}`));
  if (inProgress.length === 0) lines.push('  No phases currently in progress.');
  lines.push('');
  lines.push('═══════════════════════════════════════════════════════════════');
  return lines.join('\n');
}

function buildTradeReport(state) {
  const lines = [];
  const proj = state.project || {};
  lines.push('═══════════════════════════════════════════════════════════════');
  lines.push('TRADE BRIEF');
  lines.push('═══════════════════════════════════════════════════════════════');
  lines.push(`Project: ${proj.name || 'Unnamed'}`);
  lines.push(`Date: ${new Date().toLocaleDateString()}`);
  lines.push('');
  lines.push('TRADES ON SITE');
  lines.push('──────────────');
  (state.trades || []).forEach(t => {
    lines.push(`  ${t.name || t.trade || t}: ${t.contact || '—'}`);
  });
  lines.push('');
  lines.push('PHASES BY TRADE');
  lines.push('────────────────');
  (state.phases || []).forEach(p => {
    lines.push(`  ${p.name} | ${p.trade} | Start: Day ${p.startDay} | Duration: ${p.duration}d`);
  });
  lines.push('');
  lines.push('═══════════════════════════════════════════════════════════════');
  return lines.join('\n');
}

function buildComplianceReport(state) {
  const lines = [];
  const proj = state.project || {};
  lines.push('═══════════════════════════════════════════════════════════════');
  lines.push('COMPLIANCE STATUS');
  lines.push('═══════════════════════════════════════════════════════════════');
  lines.push(`Project: ${proj.name || 'Unnamed'}`);
  lines.push(`Date: ${new Date().toLocaleDateString()}`);
  lines.push('');
  lines.push('GATES & SIGN-OFFS');
  lines.push('──────────────────');
  (state.gates || []).forEach(g => {
    lines.push(`  ${g.type || g.name || g.id}: ${g.status || 'pending'}`);
  });
  lines.push('');
  lines.push('OPEN ISSUES (COMPLIANCE-RELATED)');
  lines.push('────────────────────────────────');
  const issues = (state.issues || []).filter(i => i.status !== 'closed');
  issues.forEach(i => lines.push(`  [${i.severity || '—'}] ${i.description || ''}`));
  lines.push('');
  lines.push('═══════════════════════════════════════════════════════════════');
  return lines.join('\n');
}

// POST /api/siteops/import-builder - Import from Builder (body: Builder scope/project data)
router.post('/import-builder', (req, res) => {
  if (!req.userId || req.userId === 'default') {
    return res.status(401).json({ success: false, error: 'Authentication required' });
  }
  try {
    const body = req.body || {};
    const scopePack = body.scopePack || body.scope || body;
    const items = scopePack.items || [];
    const projectName = body.name || scopePack.projectName || 'Imported from Builder';
    const projectAddress = body.address || scopePack.address || '';

    const phases = items.map((item, idx) => ({
      id: idx + 1,
      name: item.room ? `${item.taskType || item.trade || 'Task'} - ${item.room}` : (item.taskType || item.trade || `Phase ${idx + 1}`),
      trade: item.trade || item.taskType || 'General',
      startDay: idx * 5 + 1,
      duration: item.duration || 5,
      dependsOn: idx > 0 ? [idx] : [],
      gate: false,
      status: 'planned',
      critical: idx === 0
    }));

    const state = {
      id: body.id || generateId(),
      project: {
        name: projectName,
        address: projectAddress,
        status: 'planning',
        startDate: new Date().toISOString().split('T')[0],
        constraints: {}
      },
      phases,
      trades: [],
      dependencies: [],
      gates: [],
      issues: [],
      dailyLogs: [],
      changes: [],
      updatedAt: new Date().toISOString()
    };

    const id = state.id;
    storage.write(MODULE, req.userId, 'project', id, state);
    res.json({ success: true, id, state, message: 'Imported from Builder' });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// GET /api/siteops/reports/weekly/:projectId
router.get('/reports/weekly/:projectId', (req, res) => {
  try {
    const state = storage.read(MODULE, req.userId, 'project', req.params.projectId);
    if (!state) return res.status(404).json({ success: false, error: 'Project not found' });
    const report = buildWeeklyReport(state);
    res.type('text/plain').send(report);
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// GET /api/siteops/reports/client/:projectId
router.get('/reports/client/:projectId', (req, res) => {
  try {
    const state = storage.read(MODULE, req.userId, 'project', req.params.projectId);
    if (!state) return res.status(404).json({ success: false, error: 'Project not found' });
    const report = buildClientReport(state);
    res.type('text/plain').send(report);
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// GET /api/siteops/reports/trade/:projectId
router.get('/reports/trade/:projectId', (req, res) => {
  try {
    const state = storage.read(MODULE, req.userId, 'project', req.params.projectId);
    if (!state) return res.status(404).json({ success: false, error: 'Project not found' });
    const report = buildTradeReport(state);
    res.type('text/plain').send(report);
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// GET /api/siteops/reports/compliance/:projectId
router.get('/reports/compliance/:projectId', (req, res) => {
  try {
    const state = storage.read(MODULE, req.userId, 'project', req.params.projectId);
    if (!state) return res.status(404).json({ success: false, error: 'Project not found' });
    const report = buildComplianceReport(state);
    res.type('text/plain').send(report);
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// GET /api/siteops/export/pdf/:projectId
router.get('/export/pdf/:projectId', (req, res) => {
  try {
    const state = storage.read(MODULE, req.userId, 'project', req.params.projectId);
    if (!state) return res.status(404).json({ success: false, error: 'Project not found' });
    const doc = buildSiteOpsPdf(state);
    const buf = doc.output('arraybuffer');
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=GRACEX_SiteOps_Report.pdf');
    res.send(Buffer.from(buf));
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// POST /api/siteops/export/pdf - Export current state (body: full state) for when not yet saved
router.post('/export/pdf', (req, res) => {
  try {
    const state = req.body || {};
    const doc = buildSiteOpsPdf(state);
    const buf = doc.output('arraybuffer');
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=GRACEX_SiteOps_Report.pdf');
    res.send(Buffer.from(buf));
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// GET /api/siteops/export/excel/:projectId
router.get('/export/excel/:projectId', (req, res) => {
  try {
    const state = storage.read(MODULE, req.userId, 'project', req.params.projectId);
    if (!state) return res.status(404).json({ success: false, error: 'Project not found' });
    const wb = buildSiteOpsExcel(state);
    const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=GRACEX_SiteOps_Export.xlsx');
    res.send(buf);
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// POST /api/siteops/export/excel - Export current state (body: full state)
router.post('/export/excel', (req, res) => {
  try {
    const state = req.body || {};
    const wb = buildSiteOpsExcel(state);
    const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=GRACEX_SiteOps_Export.xlsx');
    res.send(buf);
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

module.exports = router;
