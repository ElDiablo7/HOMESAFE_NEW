/**
 * GRACE-X Builder/SiteOps - JSON file storage utility
 * Stores data in server/data/{module}/ by optional user id
 */
const fs = require('fs');
const path = require('path');

const DATA_ROOT = path.join(__dirname, '..', 'data');

function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function getUserDir(moduleName, userId = 'default') {
  const safe = String(userId).replace(/[^a-zA-Z0-9_-]/g, '_').substring(0, 64);
  const dir = path.join(DATA_ROOT, moduleName, safe);
  ensureDir(dir);
  return dir;
}

function getFilePath(moduleName, userId, resource, id) {
  const dir = getUserDir(moduleName, userId);
  const safeId = String(id).replace(/[^a-zA-Z0-9_-]/g, '_');
  return path.join(dir, `${resource}_${safeId}.json`);
}

function listFiles(moduleName, userId, resourcePrefix) {
  const dir = getUserDir(moduleName, userId);
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.json'));
  const prefix = resourcePrefix ? `${resourcePrefix}_` : '';
  return files
    .filter(f => f.startsWith(prefix))
    .map(f => f.replace('.json', '').replace(prefix, ''));
}

function read(moduleName, userId, resource, id) {
  const filePath = getFilePath(moduleName, userId, resource, id);
  if (!fs.existsSync(filePath)) return null;
  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
}

function write(moduleName, userId, resource, id, data) {
  const filePath = getFilePath(moduleName, userId, resource, id);
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  return data;
}

function remove(moduleName, userId, resource, id) {
  const filePath = getFilePath(moduleName, userId, resource, id);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
    return true;
  }
  return false;
}

function list(moduleName, userId, resource) {
  const ids = listFiles(moduleName, userId, resource);
  return ids.map(id => read(moduleName, userId, resource, id)).filter(Boolean);
}

module.exports = {
  ensureDir,
  getUserDir,
  getFilePath,
  listFiles,
  read,
  write,
  remove,
  list,
  DATA_ROOT
};
