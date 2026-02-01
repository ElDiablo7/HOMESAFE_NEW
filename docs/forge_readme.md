# GRACE-X Forge™ — Developer Documentation

> **Engineering Bay · Mini-App Builder · Template Assembler**

---

## Overview

GRACE-X Forge™ is a built-in workspace for designing, assembling, and shipping mini-apps and modules directly within the GRACE-X ecosystem. It features a sci-fi "command deck" UI with a multi-panel workspace.

---

## UI Layout

```
┌─────────────────────────────────────────────────────────────────────┐
│                          HEADER (Status)                            │
├───────────────┬─────────────────────────────┬───────────────────────┤
│               │                             │                       │
│  PROJECT TREE │    EDITOR / PREVIEW / DIFF  │  CAPABILITY CONSOLE   │
│               │                             │                       │
│   Files       │    Code editing             │   Tools               │
│   Folders     │    Live preview             │   Quick Actions       │
│   Search      │    Diff view                │   Safety Checks       │
│               │                             │   Project Info        │
│               │                             │                       │
├───────────────┴─────────────────────────────┴───────────────────────┤
│                        OUTPUT / LOGS (Console)                       │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+S` | Save current file |
| `Ctrl+Enter` | Run / Update preview |
| `Ctrl+B` | Build package |
| `Escape` | Close modals |

---

## Templates

### 1. HTML Only
Basic single-file HTML page with inline styles.

**Files created:**
- `index.html`
- `manifest.json`
- `changelog.md`

### 2. HTML + JavaScript
Multi-file app with separate HTML, CSS, and JavaScript.

**Files created:**
- `index.html`
- `style.css`
- `app.js`
- `manifest.json`
- `changelog.md`

### 3. Module Tab
GRACE-X module template with brain panel integration.

**Files created:**
- `index.html` (module section)
- `module.js`
- `manifest.json`
- `changelog.md`

### 4. Landing Page
Full landing page template with hero, features, and footer.

**Files created:**
- `index.html`
- `style.css`
- `manifest.json`
- `changelog.md`

---

## ForgeEngine API

### Project Management

```javascript
// Create a new project
ForgeEngine.createProject('My App', 'html-js');

// Get current project
ForgeEngine.currentProject;

// Save to localStorage
ForgeEngine.saveToStorage();

// Load from localStorage
ForgeEngine.loadFromStorage();
```

### File Operations

```javascript
// Create file
ForgeEngine.createFile('script.js', '// code here');

// Read file
const content = ForgeEngine.readFile('index.html');

// Write file (creates backup first)
ForgeEngine.writeFile('index.html', newContent);

// Delete file (creates backup first)
ForgeEngine.deleteFile('old-file.js');

// Rename file
ForgeEngine.renameFile('old.js', 'new.js');
```

### Patch System

Apply patches using markers:

```javascript
// Content must have markers:
// /* FORGE:START patchId */
// ... content to replace ...
// /* FORGE:END patchId */

ForgeEngine.applyPatch('index.html', 'header', '<header>New Header</header>');
```

### Backup & Restore

```javascript
// Create manual backup
ForgeEngine.createBackup('index.html');

// Restore from backup
ForgeEngine.restoreBackup('index.html_1702847400000');
```

### Verification

```javascript
// Verify paths exist
const result = ForgeEngine.verifyPaths(['index.html', 'style.css', 'missing.js']);
// Returns: { found: ['index.html', 'style.css'], missing: ['missing.js'] }
```

### Build & Export

```javascript
// Build manifest with checksums
ForgeEngine.buildManifest();

// Add changelog entry
ForgeEngine.writeChangelog('Added new feature');

// Run smoke tests
const results = ForgeEngine.smokeChecklist();
// Returns array of { id, name, passed }

// Export package (downloads JSON)
ForgeEngine.exportPackage();
```

### Logging

```javascript
// Log entries
ForgeEngine.log('INFO', 'Message');
ForgeEngine.log('WARN', 'Warning');
ForgeEngine.log('ERROR', 'Error');
ForgeEngine.log('SUCCESS', 'Success');

// Get all logs
ForgeEngine.logs;
```

---

## Smoke Test Checklist

| Test | Description |
|------|-------------|
| `has-index` | Project has index.html |
| `has-manifest` | Project has manifest.json |
| `no-empty-files` | No files are empty |
| `valid-html` | index.html has proper structure |
| `no-broken-refs` | All src/href references resolve |

---

## Safety Features

### Security

- **Path Traversal Prevention**: Blocks `../` in file paths
- **Sandbox Preview**: iframe uses `sandbox` attribute
- **No Remote Scripts**: Never auto-executes external code
- **Backup Before Write**: Every file modification creates a backup

### Safety Indicators

The UI shows real-time safety status:
- ✅ No path traversal
- ✅ Sandbox enabled
- ✅ Backup ready
- ✅ No remote scripts

---

## Storage

Projects are stored in `localStorage` under the key:
```
gracex_forge_project
```

Structure:
```json
{
  "project": {
    "name": "My App",
    "slug": "my-app",
    "template": "html-js",
    "created": "2025-12-17T...",
    "modified": "2025-12-17T..."
  },
  "files": {
    "index.html": "<!DOCTYPE html>...",
    "style.css": "/* styles */...",
    "app.js": "// code..."
  }
}
```

---

## File Structure

```
modules/
└── forge.html          # Forge UI

assets/
├── js/
│   └── forge.js        # ForgeEngine + UI Controller
└── css/
    └── forge.css       # Sci-fi theme styles

docs/
└── forge_readme.md     # This documentation
```

---

## Export Format

When you click "Export Package", a JSON file is downloaded:

```json
{
  "project": {
    "name": "My App",
    "slug": "my-app",
    "template": "html-js",
    "created": "...",
    "modified": "..."
  },
  "files": {
    "index.html": "...",
    "style.css": "...",
    "app.js": "...",
    "manifest.json": "...",
    "changelog.md": "..."
  }
}
```

---

## Manifest Format

```json
{
  "name": "My App",
  "version": "1.0.0",
  "template": "html-js",
  "created": "2025-12-17T...",
  "modified": "2025-12-17T...",
  "files": [
    "index.html",
    "style.css",
    "app.js"
  ],
  "checksums": {
    "index.html": "a1b2c3d4",
    "style.css": "e5f6g7h8",
    "app.js": "i9j0k1l2"
  }
}
```

---

## Boot Guard

Forge implements a non-blocking boot guard. If the Forge module fails to load or initialize, the rest of the GRACE-X platform continues to function normally. Errors are caught and logged without crashing the application.

---

## Changelog

### v1.0.0 - December 2025
- Initial release
- Multi-panel workspace UI
- 4 project templates
- ForgeEngine with file management
- Patch system with markers
- Backup/restore functionality
- Smoke test checklist
- JSON export
- Keyboard shortcuts

---

*Built for GRACE-X AI™ by Zac Crockett*

