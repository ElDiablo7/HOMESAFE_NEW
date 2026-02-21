/**
 * GRACE-X Builder API - Projects, scope pack, RAMS
 */
const express = require('express');
const router = express.Router();
const storage = require('../utils/storage');
const { buildBuilderPdf, buildBuilderExcel } = require('../utils/exports');
const XLSX = require('xlsx');

const MODULE = 'builder';

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
}

// Optional user id from header
router.use((req, res, next) => {
  req.userId = req.userId || req.headers['x-user-id'] || req.headers['x-userid'] || 'default';
  next();
});

// POST /api/builder/projects - Save (create or update) project
router.post('/projects', (req, res) => {
  if (!req.userId || req.userId === 'default') {
    return res.status(401).json({ success: false, error: 'Authentication required' });
  }
  try {
    const body = req.body || {};
    const id = body.id || generateId();
    const data = {
      id,
      name: body.name || 'Unnamed Project',
      address: body.address || '',
      createdAt: body.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...body
    };
    storage.write(MODULE, req.userId, 'project', id, data);
    res.json({ success: true, id, project: data });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// GET /api/builder/projects - List user projects
router.get('/projects', (req, res) => {
  try {
    const projects = storage.list(MODULE, req.userId, 'project');
    res.json({ success: true, projects });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// GET /api/builder/projects/:id - Get project
router.get('/projects/:id', (req, res) => {
  try {
    const project = storage.read(MODULE, req.userId, 'project', req.params.id);
    if (!project) return res.status(404).json({ success: false, error: 'Project not found' });
    res.json({ success: true, project });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// PUT /api/builder/projects/:id - Update project
router.put('/projects/:id', (req, res) => {
  if (!req.userId || req.userId === 'default') {
    return res.status(401).json({ success: false, error: 'Authentication required' });
  }
  try {
    const existing = storage.read(MODULE, req.userId, 'project', req.params.id);
    if (!existing) return res.status(404).json({ success: false, error: 'Project not found' });
    const data = { ...existing, ...req.body, id: req.params.id, updatedAt: new Date().toISOString() };
    storage.write(MODULE, req.userId, 'project', req.params.id, data);
    res.json({ success: true, project: data });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// DELETE /api/builder/projects/:id - Delete project
router.delete('/projects/:id', (req, res) => {
  if (!req.userId || req.userId === 'default') {
    return res.status(401).json({ success: false, error: 'Authentication required' });
  }
  try {
    storage.remove(MODULE, req.userId, 'project', req.params.id);
    storage.remove(MODULE, req.userId, 'scope', req.params.id);
    storage.remove(MODULE, req.userId, 'rams', req.params.id);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// POST /api/builder/scope-pack - Save scope pack (body: { projectId, items, assumptions, rooms })
router.post('/scope-pack', (req, res) => {
  if (!req.userId || req.userId === 'default') {
    return res.status(401).json({ success: false, error: 'Authentication required' });
  }
  try {
    const { projectId, items = [], assumptions = [], rooms = [] } = req.body || {};
    const id = projectId || generateId();
    const data = { projectId: id, items, assumptions, rooms, updatedAt: new Date().toISOString() };
    storage.write(MODULE, req.userId, 'scope', id, data);
    res.json({ success: true, projectId: id, scope: data });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// GET /api/builder/scope-pack/:projectId - Get scope pack
router.get('/scope-pack/:projectId', (req, res) => {
  try {
    const scope = storage.read(MODULE, req.userId, 'scope', req.params.projectId);
    if (!scope) return res.status(404).json({ success: false, error: 'Scope pack not found' });
    res.json({ success: true, scope });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// POST /api/builder/rams - Save RAMS (body: { projectId, rams } or full RAMS object)
router.post('/rams', (req, res) => {
  if (!req.userId || req.userId === 'default') {
    return res.status(401).json({ success: false, error: 'Authentication required' });
  }
  try {
    const body = req.body || {};
    const projectId = body.projectId || body.id || generateId();
    const data = { projectId, ...body, updatedAt: new Date().toISOString() };
    storage.write(MODULE, req.userId, 'rams', projectId, data);
    res.json({ success: true, projectId, rams: data });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// GET /api/builder/rams/:projectId - Get RAMS
router.get('/rams/:projectId', (req, res) => {
  try {
    const rams = storage.read(MODULE, req.userId, 'rams', req.params.projectId);
    if (!rams) return res.status(404).json({ success: false, error: 'RAMS not found' });
    res.json({ success: true, rams });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// POST /api/builder/export/pdf - Generate PDF from current scope (body: { projectName, scopePack })
router.post('/export/pdf', (req, res) => {
  try {
    const data = req.body || {};
    const doc = buildBuilderPdf(data);
    const buf = doc.output('arraybuffer');
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=GRACEX_Builder_Scope.pdf');
    res.send(Buffer.from(buf));
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// POST /api/builder/export/excel - Generate Excel from current scope
router.post('/export/excel', (req, res) => {
  try {
    const data = req.body || {};
    const wb = buildBuilderExcel(data);
    const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=GRACEX_Builder_Scope.xlsx');
    res.send(buf);
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

module.exports = router;
