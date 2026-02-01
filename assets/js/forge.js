// ═══════════════════════════════════════════════════════════════════════════════
// GRACE-X FORGE™ — Engineering Bay / Mini-App Builder
// ForgeEngine + UI Controller
// ═══════════════════════════════════════════════════════════════════════════════

(function() {
  'use strict';

  // ═══════════════════════════════════════════════════════════════════════════
  // FORGE ENGINE — Core Capability Layer
  // ═══════════════════════════════════════════════════════════════════════════

  const ForgeEngine = {
    // Current project state
    currentProject: null,
    files: new Map(),
    backups: new Map(),
    logs: [],
    desktopSaveEnabled: true, // NEW: Enable desktop saving by default

    // Templates
    TEMPLATES: {
      'html-only': {
        name: 'HTML Only',
        files: {
          'index.html': `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{PROJECT_NAME}}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: system-ui, -apple-system, sans-serif;
      background: #0a0e14;
      color: #e6edf3;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .container {
      text-align: center;
      padding: 40px;
    }
    h1 { color: #00d4ff; margin-bottom: 16px; }
  </style>
</head>
<body>
  <div class="container">
    <h1>{{PROJECT_NAME}}</h1>
    <p>Built with GRACE-X Forge™</p>
  </div>
</body>
</html>`
        }
      },
      'html-js': {
        name: 'HTML + JavaScript',
        files: {
          'index.html': `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{PROJECT_NAME}}</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <div class="container">
    <h1>{{PROJECT_NAME}}</h1>
    <p id="output">Loading...</p>
    <button id="action-btn">Click Me</button>
  </div>
  <script src="app.js"></script>
</body>
</html>`,
          'style.css': `/* {{PROJECT_NAME}} Styles */
* { margin: 0; padding: 0; box-sizing: border-box; }

body {
  font-family: system-ui, -apple-system, sans-serif;
  background: linear-gradient(135deg, #0a0e14 0%, #1a1f2e 100%);
  color: #e6edf3;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.container {
  text-align: center;
  padding: 40px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  border: 1px solid rgba(0, 212, 255, 0.2);
}

h1 {
  color: #00d4ff;
  margin-bottom: 16px;
  text-shadow: 0 0 20px rgba(0, 212, 255, 0.3);
}

p { margin-bottom: 20px; }

button {
  padding: 12px 24px;
  background: linear-gradient(135deg, #0099cc 0%, #005577 100%);
  border: 1px solid #00d4ff;
  border-radius: 6px;
  color: white;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s;
}

button:hover {
  transform: translateY(-2px);
  box-shadow: 0 0 20px rgba(0, 212, 255, 0.4);
}`,
          'app.js': `// {{PROJECT_NAME}} - Main Application
(function() {
  'use strict';

  const output = document.getElementById('output');
  const actionBtn = document.getElementById('action-btn');

  let clickCount = 0;

  function init() {
    output.textContent = 'App initialized!';
    actionBtn.addEventListener('click', handleClick);
    console.log('{{PROJECT_NAME}} loaded successfully');
  }

  function handleClick() {
    clickCount++;
    output.textContent = \`Clicked \${clickCount} time(s)\`;
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();`
        }
      },
      'module-tab': {
        name: 'GRACE-X Module Tab',
        files: {
          'index.html': `<section class="module-section {{PROJECT_SLUG}}-container">
  <!-- Module Header -->
  <div class="module-header">
    <div class="module-logo-slot">
      <span class="module-logo-text">{{PROJECT_ABBR}}</span>
    </div>
    <div class="module-header-text">
      <h1 class="module-title">GRACE-X {{PROJECT_NAME}}™</h1>
      <p class="module-subtitle">
        Your module description here
      </p>
    </div>
  </div>

  <!-- GRACE-X Assistant -->
  <div class="builder-card" id="{{PROJECT_SLUG}}-brain-card">
    <h2>🧠 GRACE-X {{PROJECT_NAME}} Assistant</h2>
    <p class="hint">Ask me anything about {{PROJECT_NAME}}.</p>

    <div class="module-brain" id="{{PROJECT_SLUG}}-brain-panel">
      <div id="{{PROJECT_SLUG}}-brain-output" class="brain-output">
        <div class="brain-message brain-message-system">
          Hello! I'm your {{PROJECT_NAME}} assistant. How can I help?
        </div>
      </div>

      <div class="brain-input-row">
        <button type="button" class="brain-mic-btn" id="{{PROJECT_SLUG}}-brain-mic" title="Voice input">
          🎙️
        </button>
        <input id="{{PROJECT_SLUG}}-brain-input" type="text" placeholder="Ask a question..." />
        <button id="{{PROJECT_SLUG}}-brain-send">Ask</button>
      </div>

      <div class="brain-actions">
        <button class="builder-btn" id="{{PROJECT_SLUG}}-brain-clear">Clear conversation</button>
      </div>
    </div>
  </div>

  <!-- Add your module content here -->
  <div class="builder-card">
    <h2>📋 Main Content</h2>
    <p>Add your module features here.</p>
  </div>

</section>`,
          'module.js': `// GRACE-X {{PROJECT_NAME}}™ Module
(function() {
  'use strict';

  function init{{PROJECT_PASCAL}}() {
    console.log('[GRACEX] {{PROJECT_NAME}} module initialized');
    
    // Initialize brain panel
    if (window.initBrainV5) {
      window.initBrainV5('{{PROJECT_SLUG}}');
    }
    
    // Wire mic button
    if (window.wireBrainMic) {
      window.wireBrainMic('{{PROJECT_SLUG}}');
    }
  }

  // Initialize on module load
  document.addEventListener('gracex:module:loaded', function(e) {
    if (e.detail && e.detail.module === '{{PROJECT_SLUG}}') {
      setTimeout(init{{PROJECT_PASCAL}}, 100);
    }
  });

  // Also try immediate init
  if (document.getElementById('{{PROJECT_SLUG}}-brain-panel')) {
    init{{PROJECT_PASCAL}}();
  }
})();`
        }
      },
      'landing-page': {
        name: 'Landing Page',
        files: {
          'index.html': `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{PROJECT_NAME}}</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <!-- Hero Section -->
  <header class="hero">
    <nav class="nav">
      <div class="logo">{{PROJECT_NAME}}</div>
      <div class="nav-links">
        <a href="#features">Features</a>
        <a href="#about">About</a>
        <a href="#contact">Contact</a>
      </div>
    </nav>
    <div class="hero-content">
      <h1>{{PROJECT_NAME}}</h1>
      <p>Your tagline goes here. Make it memorable.</p>
      <button class="cta-btn">Get Started</button>
    </div>
  </header>

  <!-- Features Section -->
  <section id="features" class="features">
    <h2>Features</h2>
    <div class="feature-grid">
      <div class="feature-card">
        <span class="feature-icon">⚡</span>
        <h3>Fast</h3>
        <p>Lightning quick performance</p>
      </div>
      <div class="feature-card">
        <span class="feature-icon">🔒</span>
        <h3>Secure</h3>
        <p>Built with security in mind</p>
      </div>
      <div class="feature-card">
        <span class="feature-icon">🎨</span>
        <h3>Beautiful</h3>
        <p>Stunning design out of the box</p>
      </div>
    </div>
  </section>

  <!-- Footer -->
  <footer class="footer">
    <p>Built with GRACE-X Forge™</p>
  </footer>
</body>
</html>`,
          'style.css': `/* {{PROJECT_NAME}} Landing Page */
* { margin: 0; padding: 0; box-sizing: border-box; }

:root {
  --primary: #00d4ff;
  --bg-dark: #0a0e14;
  --bg-card: #111921;
  --text-primary: #e6edf3;
  --text-secondary: #8b949e;
}

body {
  font-family: system-ui, -apple-system, sans-serif;
  background: var(--bg-dark);
  color: var(--text-primary);
}

/* Hero */
.hero {
  min-height: 100vh;
  background: linear-gradient(135deg, var(--bg-dark) 0%, #1a2332 100%);
  position: relative;
}

.nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 40px;
}

.logo {
  font-size: 1.5rem;
  font-weight: bold;
  color: var(--primary);
}

.nav-links {
  display: flex;
  gap: 30px;
}

.nav-links a {
  color: var(--text-secondary);
  text-decoration: none;
  transition: color 0.2s;
}

.nav-links a:hover {
  color: var(--primary);
}

.hero-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  min-height: calc(100vh - 80px);
  padding: 40px;
}

.hero-content h1 {
  font-size: 4rem;
  margin-bottom: 20px;
  background: linear-gradient(135deg, var(--primary), #0099cc);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.hero-content p {
  font-size: 1.25rem;
  color: var(--text-secondary);
  margin-bottom: 30px;
}

.cta-btn {
  padding: 16px 40px;
  background: var(--primary);
  border: none;
  border-radius: 8px;
  color: var(--bg-dark);
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.cta-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 30px rgba(0, 212, 255, 0.3);
}

/* Features */
.features {
  padding: 100px 40px;
  text-align: center;
}

.features h2 {
  font-size: 2.5rem;
  margin-bottom: 60px;
  color: var(--primary);
}

.feature-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 30px;
  max-width: 1200px;
  margin: 0 auto;
}

.feature-card {
  background: var(--bg-card);
  padding: 40px;
  border-radius: 12px;
  border: 1px solid rgba(0, 212, 255, 0.1);
  transition: all 0.2s;
}

.feature-card:hover {
  border-color: var(--primary);
  transform: translateY(-5px);
}

.feature-icon {
  font-size: 3rem;
  display: block;
  margin-bottom: 20px;
}

.feature-card h3 {
  margin-bottom: 10px;
}

.feature-card p {
  color: var(--text-secondary);
}

/* Footer */
.footer {
  text-align: center;
  padding: 40px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  color: var(--text-secondary);
}

@media (max-width: 768px) {
  .hero-content h1 { font-size: 2.5rem; }
  .nav { padding: 15px 20px; }
  .nav-links { gap: 15px; }
}`
        }
      }
    },

    // ═══════════════════════════════════════════════════════════════════════
    // PROJECT MANAGEMENT
    // ═══════════════════════════════════════════════════════════════════════

    createProject(name, template) {
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const pascal = name.split(/[-_\s]+/).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('');
      const abbr = name.substring(0, 2).toUpperCase();

      const templateData = this.TEMPLATES[template];
      if (!templateData) {
        this.log('ERROR', `Unknown template: ${template}`);
        return null;
      }

      this.currentProject = {
        name,
        slug,
        template,
        created: new Date().toISOString(),
        modified: new Date().toISOString()
      };

      this.files.clear();

      // Generate files from template
      Object.entries(templateData.files).forEach(([filename, content]) => {
        const processedContent = content
          .replace(/\{\{PROJECT_NAME\}\}/g, name)
          .replace(/\{\{PROJECT_SLUG\}\}/g, slug)
          .replace(/\{\{PROJECT_PASCAL\}\}/g, pascal)
          .replace(/\{\{PROJECT_ABBR\}\}/g, abbr);
        
        this.files.set(filename, processedContent);
      });

      // Add manifest
      this.files.set('manifest.json', JSON.stringify({
        name,
        version: '1.0.0',
        template,
        created: this.currentProject.created,
        files: Array.from(this.files.keys())
      }, null, 2));

      // Add changelog
      this.files.set('changelog.md', `# ${name} Changelog\n\n## v1.0.0 - ${new Date().toLocaleDateString()}\n- Initial creation via GRACE-X Forge™\n`);

      this.log('SUCCESS', `Project "${name}" created from ${templateData.name} template`);
      this.saveToStorage();

      return this.currentProject;
    },

    // ═══════════════════════════════════════════════════════════════════════
    // FILE OPERATIONS
    // ═══════════════════════════════════════════════════════════════════════

    createFile(path, content = '') {
      // Security: prevent path traversal
      if (path.includes('..') || path.startsWith('/')) {
        this.log('ERROR', `Invalid path: ${path} (path traversal blocked)`);
        return false;
      }

      this.files.set(path, content);
      this.updateModified();
      this.log('INFO', `Created file: ${path}`);
      this.saveToStorage();
      return true;
    },

    readFile(path) {
      return this.files.get(path) || null;
    },

    async writeFile(path, content) {
      if (!this.files.has(path)) {
        this.log('WARN', `File doesn't exist, creating: ${path}`);
      }
      
      // Create backup before write
      this.createBackup(path);
      
      this.files.set(path, content);
      this.updateModified();
      this.log('INFO', `Updated file: ${path}`);
      this.saveToStorage();

      // NEW: Also save to real filesystem if enabled
      if (this.desktopSaveEnabled && this.currentProject) {
        const success = await this.writeFileToDesktop(path, content);
        if (success) {
          this.log('SUCCESS', `💾 Saved to Desktop: ${path}`);
        }
      }
      
      return true;
    },

    // NEW: Real file write method
    async writeFileToDesktop(relativePath, content) {
      try {
        // Construct full desktop path
        const fullPath = `C:\\Users\\anyth\\Desktop\\FORGE_PROJECTS\\${this.currentProject.slug}\\${relativePath}`;
        
        const response = await fetch('http://localhost:3000/api/forge/save-file', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            filePath: fullPath.replace(/\//g, '\\'), // Convert forward slashes
            content 
          })
        });
        
        const result = await response.json();
        
        if (result.success) {
          return true;
        } else {
          this.log('ERROR', `Desktop save failed: ${result.error}`);
          return false;
        }
      } catch (error) {
        this.log('ERROR', `Desktop save error: ${error.message}`);
        return false;
      }
    },

    deleteFile(path) {
      if (!this.files.has(path)) {
        this.log('WARN', `File not found: ${path}`);
        return false;
      }

      // Create backup before delete
      this.createBackup(path);

      this.files.delete(path);
      this.updateModified();
      this.log('INFO', `Deleted file: ${path}`);
      this.saveToStorage();
      return true;
    },

    renameFile(oldPath, newPath) {
      if (!this.files.has(oldPath)) {
        this.log('ERROR', `File not found: ${oldPath}`);
        return false;
      }

      const content = this.files.get(oldPath);
      this.files.delete(oldPath);
      this.files.set(newPath, content);
      this.updateModified();
      this.log('INFO', `Renamed: ${oldPath} → ${newPath}`);
      this.saveToStorage();
      return true;
    },

    // ═══════════════════════════════════════════════════════════════════════
    // PATCH SYSTEM
    // ═══════════════════════════════════════════════════════════════════════

    applyPatch(path, patchId, newContent) {
      const content = this.files.get(path);
      if (!content) {
        this.log('ERROR', `Cannot patch: file not found: ${path}`);
        return false;
      }

      const startMarker = `/* FORGE:START ${patchId} */`;
      const endMarker = `/* FORGE:END ${patchId} */`;

      // Check if markers exist
      const hasMarkers = content.includes(startMarker) && content.includes(endMarker);

      if (hasMarkers) {
        // Replace content between markers
        const regex = new RegExp(
          `\\/\\* FORGE:START ${patchId} \\*\\/[\\s\\S]*?\\/\\* FORGE:END ${patchId} \\*\\/`,
          'g'
        );
        const patched = content.replace(regex, `${startMarker}\n${newContent}\n${endMarker}`);
        this.writeFile(path, patched);
        this.log('SUCCESS', `Patch ${patchId} applied to ${path}`);
        return true;
      } else {
        this.log('ERROR', `Patch markers not found for ${patchId} in ${path}`);
        return false;
      }
    },

    // ═══════════════════════════════════════════════════════════════════════
    // BACKUP / RESTORE
    // ═══════════════════════════════════════════════════════════════════════

    createBackup(path) {
      const content = this.files.get(path);
      if (content !== undefined) {
        const backupKey = `${path}_${Date.now()}`;
        this.backups.set(backupKey, {
          path,
          content,
          timestamp: new Date().toISOString()
        });
        this.log('INFO', `Backup created: ${backupKey}`);
      }
    },

    restoreBackup(backupKey) {
      const backup = this.backups.get(backupKey);
      if (backup) {
        this.files.set(backup.path, backup.content);
        this.log('SUCCESS', `Restored ${backup.path} from backup`);
        this.saveToStorage();
        return true;
      }
      return false;
    },

    // ═══════════════════════════════════════════════════════════════════════
    // VERIFICATION
    // ═══════════════════════════════════════════════════════════════════════

    verifyPaths(referenceList) {
      const missing = [];
      const found = [];

      referenceList.forEach(ref => {
        if (this.files.has(ref)) {
          found.push(ref);
        } else {
          missing.push(ref);
        }
      });

      this.log('INFO', `Verified paths: ${found.length} found, ${missing.length} missing`);
      return { found, missing };
    },

    // ═══════════════════════════════════════════════════════════════════════
    // BUILD & EXPORT
    // ═══════════════════════════════════════════════════════════════════════

    buildManifest() {
      if (!this.currentProject) {
        this.log('ERROR', 'No project loaded');
        return null;
      }

      const manifest = {
        name: this.currentProject.name,
        version: '1.0.0',
        template: this.currentProject.template,
        created: this.currentProject.created,
        modified: this.currentProject.modified,
        files: [],
        checksums: {}
      };

      this.files.forEach((content, path) => {
        manifest.files.push(path);
        manifest.checksums[path] = this.simpleHash(content);
      });

      this.files.set('manifest.json', JSON.stringify(manifest, null, 2));
      this.log('SUCCESS', 'Manifest built');
      return manifest;
    },

    writeChangelog(entry) {
      let changelog = this.files.get('changelog.md') || `# ${this.currentProject?.name || 'Project'} Changelog\n\n`;
      const date = new Date().toLocaleDateString();
      changelog = changelog.replace(/^(# .+\n\n)/, `$1## ${date}\n- ${entry}\n\n`);
      this.files.set('changelog.md', changelog);
      this.log('INFO', `Changelog updated: ${entry}`);
      this.saveToStorage();
    },

    smokeChecklist() {
      const checks = [
        { id: 'has-index', name: 'Has index.html', check: () => this.files.has('index.html') },
        { id: 'has-manifest', name: 'Has manifest.json', check: () => this.files.has('manifest.json') },
        { id: 'no-empty-files', name: 'No empty files', check: () => !Array.from(this.files.values()).some(c => !c || c.trim() === '') },
        { id: 'valid-html', name: 'Valid HTML structure', check: () => {
          const html = this.files.get('index.html');
          return html && html.includes('<html') && html.includes('</html>');
        }},
        { id: 'no-broken-refs', name: 'No broken references', check: () => {
          const html = this.files.get('index.html') || '';
          const refs = html.match(/(?:src|href)=["']([^"']+)["']/g) || [];
          return refs.every(ref => {
            const path = ref.match(/["']([^"']+)["']/)?.[1];
            return !path || path.startsWith('http') || path.startsWith('#') || this.files.has(path);
          });
        }}
      ];

      return checks.map(c => ({
        id: c.id,
        name: c.name,
        passed: c.check()
      }));
    },

    exportPackage() {
      if (!this.currentProject) {
        this.log('ERROR', 'No project to export');
        return null;
      }

      // Build manifest first
      this.buildManifest();

      // Create export object
      const exportData = {
        project: this.currentProject,
        files: {}
      };

      this.files.forEach((content, path) => {
        exportData.files[path] = content;
      });

      const json = JSON.stringify(exportData, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `${this.currentProject.slug}-forge-export.json`;
      a.click();
      
      URL.revokeObjectURL(url);
      this.log('SUCCESS', 'Package exported');
      return exportData;
    },

    // ═══════════════════════════════════════════════════════════════════════
    // UTILITIES
    // ═══════════════════════════════════════════════════════════════════════

    log(level, message) {
      const entry = {
        time: new Date().toLocaleTimeString(),
        level,
        message
      };
      this.logs.push(entry);
      
      // Keep only last 100 logs
      if (this.logs.length > 100) {
        this.logs.shift();
      }

      // Update UI
      ForgeUI.addLogEntry(entry);
      
      console.log(`[FORGE ${level}]`, message);
    },

    simpleHash(str) {
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
      }
      return hash.toString(16);
    },

    updateModified() {
      if (this.currentProject) {
        this.currentProject.modified = new Date().toISOString();
      }
    },

    saveToStorage() {
      if (!this.currentProject) return;
      
      const data = {
        project: this.currentProject,
        files: Object.fromEntries(this.files)
      };
      
      try {
        localStorage.setItem('gracex_forge_project', JSON.stringify(data));
      } catch (e) {
        this.log('WARN', 'Could not save to localStorage');
      }
    },

    loadFromStorage() {
      try {
        const data = localStorage.getItem('gracex_forge_project');
        if (data) {
          const parsed = JSON.parse(data);
          this.currentProject = parsed.project;
          this.files = new Map(Object.entries(parsed.files || {}));
          this.log('INFO', `Loaded project: ${this.currentProject.name}`);
          return true;
        }
      } catch (e) {
        this.log('WARN', 'Could not load from localStorage');
      }
      return false;
    },

    clearProject() {
      const name = this.currentProject?.name || 'project';
      this.currentProject = null;
      this.files.clear();
      this.backups.clear();
      try {
        localStorage.removeItem('gracex_forge_project');
      } catch (e) {}
      this.log('INFO', `Project "${name}" deleted`);
    }
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // FORGE UI CONTROLLER
  // ═══════════════════════════════════════════════════════════════════════════

  const ForgeUI = {
    currentFile: null,
    selectedTemplate: 'html-only',

    init() {
      // Try to load existing project
      ForgeEngine.loadFromStorage();

      // Initialize UI components
      // this.initTabs();
      // this.initEditorTabs();
      this.initModals();
      this.initTools();
      this.initLiveToggles();
      this.initEditor();
      this.initKeyboardShortcuts();

      // Update UI state
      this.updateProjectTree();
      this.updateProjectInfo();

      ForgeEngine.log('INFO', 'GRACE-X Forge™ initialized. Ready to build.');
    },

    // ═══════════════════════════════════════════════════════════════════════
    // TABS
    // ═══════════════════════════════════════════════════════════════════════

    initTabs() {
      // Output tabs
      document.querySelectorAll('.forge-output-tab').forEach(tab => {
        tab.addEventListener('click', () => {
          document.querySelectorAll('.forge-output-tab').forEach(t => t.classList.remove('active'));
          tab.classList.add('active');
        });
      });
    },

    initEditorTabs() {
      document.querySelectorAll('.forge-tab').forEach(tab => {
        tab.addEventListener('click', () => {
          const tabId = tab.dataset.tab;
          
          document.querySelectorAll('.forge-tab').forEach(t => t.classList.remove('active'));
          tab.classList.add('active');
          
          document.querySelectorAll('.forge-tab-content').forEach(c => c.classList.remove('active'));
          const content = document.getElementById('forge-tab-' + tabId);
          if (content) content.classList.add('active');
        });
      });
    },

    // ═══════════════════════════════════════════════════════════════════════
    // MODALS
    // ═══════════════════════════════════════════════════════════════════════

    initModals() {
      // Close buttons
      document.querySelectorAll('.forge-modal-close').forEach(btn => {
        btn.addEventListener('click', () => this.closeAllModals());
      });

      // New project
      document.getElementById('forge-new-project-btn')?.addEventListener('click', () => this.showModal('new-project'));
      document.getElementById('forge-tool-new-app')?.addEventListener('click', () => this.showModal('new-project'));
      
      // Template selection
      document.querySelectorAll('.forge-template-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          document.querySelectorAll('.forge-template-btn').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          this.selectedTemplate = btn.dataset.template;
        });
      });

      // Create project
      document.getElementById('forge-modal-create')?.addEventListener('click', () => {
        const name = document.getElementById('forge-new-name').value.trim();
        if (!name) {
          ForgeEngine.log('ERROR', 'Project name required');
          return;
        }
        ForgeEngine.createProject(name, this.selectedTemplate);
        this.closeAllModals();
        this.updateProjectTree();
        this.updateProjectInfo();
      });

      // Cancel buttons
      document.getElementById('forge-modal-cancel')?.addEventListener('click', () => this.closeAllModals());
      document.getElementById('forge-file-cancel')?.addEventListener('click', () => this.closeAllModals());

      // New file
      document.getElementById('forge-add-file-btn')?.addEventListener('click', () => this.showModal('new-file'));
      document.getElementById('forge-file-create')?.addEventListener('click', () => {
        const name = document.getElementById('forge-file-name').value.trim();
        if (name && ForgeEngine.createFile(name)) {
          this.closeAllModals();
          this.updateProjectTree();
          this.openFile(name);
        }
      });

      // Smoke test
      document.getElementById('forge-tool-test')?.addEventListener('click', () => this.showSmokeTest());
      document.getElementById('forge-smoke-run')?.addEventListener('click', () => this.runSmokeTests());
      document.getElementById('forge-smoke-cancel')?.addEventListener('click', () => this.closeAllModals());

      // Confirm delete modal
      document.getElementById('forge-confirm-cancel')?.addEventListener('click', () => this.closeAllModals());
      document.getElementById('forge-confirm-delete')?.addEventListener('click', () => {
        if (this._pendingDelete) {
          ForgeEngine.deleteFile(this._pendingDelete);
          this._pendingDelete = null;
          this.closeAllModals();
          this.updateProjectTree();
        }
      });

      // Add folder (creates folder placeholder)
      document.getElementById('forge-add-folder-btn')?.addEventListener('click', () => {
        const name = prompt('Folder name:');
        if (name && name.trim()) {
          ForgeEngine.createFile(name.trim() + '/.gitkeep', '');
          this.updateProjectTree();
        }
      });

      // Delete project
      document.getElementById('forge-delete-project-btn')?.addEventListener('click', () => {
        if (!ForgeEngine.currentProject) {
          ForgeEngine.log('WARN', 'No project to delete');
          return;
        }
        if (confirm(`Delete project "${ForgeEngine.currentProject.name}"? This cannot be undone.`)) {
          ForgeEngine.clearProject();
          this.currentFile = null;
          document.getElementById('forge-editor').value = '';
          document.getElementById('forge-current-file').textContent = 'No file open';
          this.updateProjectTree();
          this.updateProjectInfo();
        }
      });
    },

    showModal(id) {
      const modal = document.getElementById('forge-modal-' + id);
      if (modal) modal.style.display = 'flex';
    },

    closeAllModals() {
      document.querySelectorAll('.forge-modal').forEach(m => m.style.display = 'none');
    },

    showSmokeTest() {
      const checklist = document.getElementById('forge-smoke-checklist');
      const results = ForgeEngine.smokeChecklist();
      
      checklist.innerHTML = results.map(r => `
        <div class="forge-checklist-item ${r.passed ? 'passed' : 'failed'}">
          <span>${r.passed ? '✅' : '❌'}</span>
          <span>${r.name}</span>
        </div>
      `).join('');
      
      this.showModal('smoke-test');
    },

    runSmokeTests() {
      this.showSmokeTest();
      ForgeEngine.log('INFO', 'Smoke tests completed');
    },

    // ═══════════════════════════════════════════════════════════════════════
    // TOOLS
    // ═══════════════════════════════════════════════════════════════════════

    initTools() {
      // Build package
      document.getElementById('forge-tool-build')?.addEventListener('click', () => {
        ForgeEngine.buildManifest();
        ForgeEngine.log('SUCCESS', 'Build complete');
      });

      // Verify paths
      document.getElementById('forge-tool-verify')?.addEventListener('click', () => {
        const files = Array.from(ForgeEngine.files.keys());
        ForgeEngine.verifyPaths(files);
      });

      // Export
      document.getElementById('forge-export-btn')?.addEventListener('click', () => {
        ForgeEngine.exportPackage();
      });

      // Run/Preview
      document.getElementById('forge-run-btn')?.addEventListener('click', () => this.updatePreview());
      document.getElementById('forge-preview-refresh')?.addEventListener('click', () => this.updatePreview());

      // Preview device modes
      document.getElementById('forge-preview-mobile')?.addEventListener('click', () => {
        const container = document.getElementById('forge-preview-container');
        const frame = document.getElementById('forge-preview-frame');
        if (container && frame) {
          frame.style.maxWidth = '375px';
          frame.style.height = '667px';
          ForgeEngine.log('INFO', 'Preview: Mobile (375x667)');
        }
      });
      document.getElementById('forge-preview-tablet')?.addEventListener('click', () => {
        const frame = document.getElementById('forge-preview-frame');
        if (frame) {
          frame.style.maxWidth = '768px';
          frame.style.height = '100%';
          ForgeEngine.log('INFO', 'Preview: Tablet (768px)');
        }
      });
      document.getElementById('forge-preview-desktop')?.addEventListener('click', () => {
        const frame = document.getElementById('forge-preview-frame');
        if (frame) {
          frame.style.maxWidth = '100%';
          frame.style.height = '100%';
          ForgeEngine.log('INFO', 'Preview: Desktop (full)');
        }
      });

      // Build
      document.getElementById('forge-build-btn')?.addEventListener('click', () => {
        ForgeEngine.buildManifest();
      });

      // Save
      document.getElementById('forge-save-btn')?.addEventListener('click', async () => await this.saveCurrentFile());

      // NEW: Desktop save toggle
      const desktopSaveToggle = document.getElementById('forge-desktop-save-toggle');
      if (desktopSaveToggle) {
        desktopSaveToggle.addEventListener('change', () => {
          ForgeEngine.desktopSaveEnabled = desktopSaveToggle.checked;
          ForgeEngine.log('INFO', `💾 Desktop save ${desktopSaveToggle.checked ? 'ENABLED' : 'DISABLED'}`);
        });
      }

      // Format code (basic)
      document.getElementById('forge-format-btn')?.addEventListener('click', () => {
        const editor = document.getElementById('forge-editor');
        if (editor && this.currentFile) {
          ForgeEngine.log('INFO', 'Format: Use browser dev tools or external formatter');
        }
      });

      // Word wrap toggle
      document.getElementById('forge-wrap-btn')?.addEventListener('click', () => {
        const editor = document.getElementById('forge-editor');
        if (editor) {
          const current = editor.style.whiteSpace;
          editor.style.whiteSpace = current === 'pre' ? 'pre-wrap' : 'pre';
          ForgeEngine.log('INFO', `Word wrap: ${editor.style.whiteSpace === 'pre-wrap' ? 'ON' : 'OFF'}`);
        }
      });

      // Tree controls
      document.getElementById('forge-tree-refresh')?.addEventListener('click', () => {
        this.updateProjectTree();
        ForgeEngine.log('INFO', 'Project tree refreshed');
      });
      document.getElementById('forge-tree-collapse')?.addEventListener('click', () => {
        ForgeEngine.log('INFO', 'Collapse: flat structure, no folders to collapse');
      });

      // Output panel toggle
      document.getElementById('forge-output-toggle')?.addEventListener('click', () => {
        const panel = document.getElementById('forge-panel-bottom');
        if (panel) {
          panel.style.display = panel.style.display === 'none' ? 'flex' : 'none';
        }
      });

      // Console minimize (right panel)
      document.getElementById('forge-console-minimize')?.addEventListener('click', () => {
        const panel = document.getElementById('forge-panel-right');
        if (panel) {
          panel.style.display = panel.style.display === 'none' ? 'flex' : 'none';
        }
      });

      // New module tool (same as new project for now)
      document.getElementById('forge-tool-new-module')?.addEventListener('click', () => {
        this.selectedTemplate = 'module-tab';
        this.showModal('new-project');
      });

      // Patch tool
      document.getElementById('forge-tool-patch')?.addEventListener('click', () => {
        ForgeEngine.log('INFO', 'Patch: Select a file and use FORGE:START/END markers');
      });

      // Clear logs
      document.getElementById('forge-output-clear')?.addEventListener('click', () => {
        const c = document.getElementById('forge-console-output');
const l = document.getElementById('forge-logs-output');
const e = document.getElementById('forge-errors-output');
if (c) c.textContent = '';
if (l) l.textContent = '';
if (e) e.textContent = '';
const legacy = document.getElementById('forge-output-content');
if (legacy) legacy.innerHTML = '';
ForgeEngine.logs = [];
      });

      // Copy logs
      document.getElementById('forge-output-copy')?.addEventListener('click', () => {
        const logs = ForgeEngine.logs.map(l => `[${l.time}] [${l.level}] ${l.message}`).join('\n');
        navigator.clipboard.writeText(logs);
        ForgeEngine.log('INFO', 'Logs copied to clipboard');
      });
    },

    // ═══════════════════════════════════════════════════════════════════════
    // EDITOR
    // ═══════════════════════════════════════════════════════════════════════

    initEditor() {
      const editor = document.getElementById('forge-editor');
      if (!editor) return;

      // Track cursor position
      editor.addEventListener('click', () => this.updateEditorStatus());
      editor.addEventListener('keyup', () => this.updateEditorStatus());
    },

    updateEditorStatus() {
      const editor = document.getElementById('forge-editor');
      if (!editor) return;

      const lines = editor.value.substring(0, editor.selectionStart).split('\n');
      const line = lines.length;
      const col = lines[lines.length - 1].length + 1;

      document.getElementById('forge-editor-line').textContent = 'Ln ' + line;
      document.getElementById('forge-editor-col').textContent = 'Col ' + col;
    },

    openFile(path) {
      const content = ForgeEngine.readFile(path);
      if (content === null) return;

      this.currentFile = path;
      
      const editor = document.getElementById('forge-editor');
      if (editor) editor.value = content;

      document.getElementById('forge-current-file').textContent = path;

      // Set syntax
      const ext = path.split('.').pop();
      const langMap = { html: 'html', css: 'css', js: 'javascript', json: 'json', md: 'markdown' };
      const lang = langMap[ext] || 'html';
      document.getElementById('forge-syntax-select').value = lang;
      document.getElementById('forge-editor-lang').textContent = lang.toUpperCase();

      // Mark active in tree
      document.querySelectorAll('.forge-tree-item').forEach(item => {
        item.classList.toggle('active', item.dataset.path === path);
      });

      ForgeEngine.log('INFO', `Opened: ${path}`);
    },

    async saveCurrentFile() {
      if (!this.currentFile) return;
      
      const editor = document.getElementById('forge-editor');
      if (!editor) return;

      await ForgeEngine.writeFile(this.currentFile, editor.value);
    },

    // ═══════════════════════════════════════════════════════════════════════
    // PROJECT TREE
    // ═══════════════════════════════════════════════════════════════════════

    updateProjectTree() {
      const container = document.getElementById('forge-tree-container');
      if (!container) return;

      if (!ForgeEngine.currentProject || ForgeEngine.files.size === 0) {
        container.innerHTML = `
          <div class="forge-tree-empty">
            <span>📭</span>
            <p>No project loaded</p>
            <button class="forge-btn forge-btn-primary" id="forge-new-project-btn-inner">
              + New Project
            </button>
          </div>
        `;
        document.getElementById('forge-new-project-btn-inner')?.addEventListener('click', () => this.showModal('new-project'));
        return;
      }

      const files = Array.from(ForgeEngine.files.keys()).sort();
      container.innerHTML = files.map(path => {
        const icon = this.getFileIcon(path);
        return `
          <div class="forge-tree-item" data-path="${path}">
            <span>${icon}</span>
            <span>${path}</span>
          </div>
        `;
      }).join('');

      // Add click handlers
      container.querySelectorAll('.forge-tree-item').forEach(item => {
        item.addEventListener('click', () => {
          this.openFile(item.dataset.path);
        });
      });
    },

    getFileIcon(path) {
      const ext = path.split('.').pop().toLowerCase();
      const icons = {
        html: '📄', css: '🎨', js: '📜', json: '📋', md: '📝', txt: '📃'
      };
      return icons[ext] || '📄';
    },

    updateProjectInfo() {
      const project = ForgeEngine.currentProject;
      
      document.getElementById('forge-info-name').textContent = project?.name || '—';
      document.getElementById('forge-info-template').textContent = project?.template || '—';
      document.getElementById('forge-info-files').textContent = ForgeEngine.files.size;
      document.getElementById('forge-info-modified').textContent = project?.modified 
        ? new Date(project.modified).toLocaleTimeString()
        : '—';
    },

    // ═══════════════════════════════════════════════════════════════════════
    // PREVIEW
    // ═══════════════════════════════════════════════════════════════════════

    updatePreview() {
      const frame = document.getElementById('forge-preview-frame');
      if (!frame) return;

      // Get index.html content
      let html = ForgeEngine.readFile('index.html');
      if (!html) {
        ForgeEngine.log('WARN', 'No index.html to preview');
        return;
      }

      // Inline CSS and JS for preview
      const css = ForgeEngine.readFile('style.css');
      const js = ForgeEngine.readFile('app.js');

      if (css) {
        html = html.replace(
          /<link[^>]*href=["']style\.css["'][^>]*>/gi,
          `<style>${css}</style>`
        );
      }

      if (js) {
        html = html.replace(
          /<script[^>]*src=["']app\.js["'][^>]*><\/script>/gi,
          `<script>${js}</script>`
        );
      }

      frame.srcdoc = html;
      ForgeEngine.log('INFO', 'Preview updated');

      // Switch to preview tab
      document.querySelector('.forge-tab[data-tab="preview"]')?.click();
    },

    // ═══════════════════════════════════════════════════════════════════════
    // LOGGING UI
    // ═══════════════════════════════════════════════════════════════════════

    addLogEntry(entry) {
  // Low-RAM single-scroll outputs (v3)
  const line = `[${entry.time}] [${entry.level}] ${entry.message}
`;

  const consolePre = document.getElementById('forge-console-output');
  const logsPre = document.getElementById('forge-logs-output');
  const errorsPre = document.getElementById('forge-errors-output');

  if (consolePre) consolePre.textContent += line;
  if (logsPre) logsPre.textContent += line;

  if (errorsPre && (entry.level === 'WARN' || entry.level === 'ERROR')) {
    errorsPre.textContent += line;
  }

  // Legacy support (if present)
  const legacy = document.getElementById('forge-output-content');
  if (legacy) {
    const div = document.createElement('div');
    div.className = 'forge-log-entry';
    div.textContent = line.trim();
    legacy.appendChild(div);
    legacy.scrollTop = legacy.scrollHeight;
  }
},


    
// ═══════════════════════════════════════════════════════════════════════
// LIVE DATA TOGGLES (Manual Online Mode)
// ═══════════════════════════════════════════════════════════════════════
initLiveToggles() {
  window.GRACEX_NET = window.GRACEX_NET || { footballLive: false, racingLive: false };

// Data mode labels shared with Sport
window.GRACEX_SPORT_DATA_MODE = window.GRACEX_SPORT_DATA_MODE || { football: 'simulated', racing: 'simulated' };


  const ft = document.getElementById('toggleFootballLive');
  const rt = document.getElementById('toggleRacingLive');
  const fs = document.getElementById('footballStatus');
  const rs = document.getElementById('racingStatus');

  const sync = () => {
    if (ft) ft.checked = !!window.GRACEX_NET.footballLive;
    if (rt) rt.checked = !!window.GRACEX_NET.racingLive;
    if (fs) fs.textContent = window.GRACEX_NET.footballLive ? (window.GRACEX_SPORT_DATA_MODE.football==='live' ? 'Status: LIVE (online feed)' : 'Status: SIMULATED (demo feed)') : 'Status: OFFLINE';
    if (rs) rs.textContent = window.GRACEX_NET.racingLive ? (window.GRACEX_SPORT_DATA_MODE.racing==='live' ? 'Status: LIVE (online feed)' : 'Status: SIMULATED (demo feed)') : 'Status: OFFLINE';
  };

  sync();

  ft?.addEventListener('change', () => {
    window.GRACEX_NET.footballLive = !!ft.checked;
    sync();
    ForgeEngine.log('INFO', `Football live mode: ${window.GRACEX_NET.footballLive ? 'ON' : 'OFF'}`);
  });

  rt?.addEventListener('change', () => {
    window.GRACEX_NET.racingLive = !!rt.checked;
    sync();
    ForgeEngine.log('INFO', `Racing live mode: ${window.GRACEX_NET.racingLive ? 'ON' : 'OFF'}`);
  });
},

// ═══════════════════════════════════════════════════════════════════════
    // KEYBOARD SHORTCUTS
    // ═══════════════════════════════════════════════════════════════════════

    initKeyboardShortcuts() {
      document.addEventListener('keydown', (e) => {
        // Only handle when Forge is active
        if (!document.querySelector('.forge-container')) return;

        // Ctrl+S = Save
        if (e.ctrlKey && e.key === 's') {
          e.preventDefault();
          this.saveCurrentFile();
        }

        // Ctrl+Enter = Run/Preview
        if (e.ctrlKey && e.key === 'Enter') {
          e.preventDefault();
          this.updatePreview();
        }

        // Ctrl+B = Build
        if (e.ctrlKey && e.key === 'b') {
          e.preventDefault();
          ForgeEngine.buildManifest();
        }

        // Escape = Close modals
        if (e.key === 'Escape') {
          this.closeAllModals();
        }
      });
    }
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // INITIALIZATION
  // ═══════════════════════════════════════════════════════════════════════════

  // Initialize when Forge module is loaded
  document.addEventListener('gracex:module:loaded', (e) => {
    if (e.detail && e.detail.module === 'forge') {
      setTimeout(() => ForgeUI.init(), 100);
    }
  });

  // Also check if already on Forge page
  if (document.querySelector('.forge-container')) {
    ForgeUI.init();
  }

  // Expose globally
  window.ForgeEngine = ForgeEngine;
  window.ForgeUI = ForgeUI;

  console.log('[GRACEX] Forge™ module loaded');
})();

/* FORGE:START CORE_FORGE_SNIPPET_V1 */
/**
 * GRACE-X Forge Quick-Calls (Voice-Builder / Laser / Android Exporter)
 * Non-invasive: only registers helpers + prompts. No rewrites.
 */

(function initForgeQuickCalls() {
  'use strict';

  // ═══════════════════════════════════════════════════════════════════════════
  // 1) PROMPT LIBRARY — Specialized Forge Modes
  // ═══════════════════════════════════════════════════════════════════════════

  const FORGE_PROMPTS = {
    VOICE_BUILDER: `Forge, enable VOICE-BUILDER workflow.

Goal:
Let the user describe an app/module in plain English (or dictated voice text), and Forge converts it into a safe build plan + minimal file changes.

Inputs:
- A single user "voice order" text blob
- Optional constraints (target folder, template type, module name)

Process (must follow in order):
1) PARSE: Extract requirements into structured fields:
   - App name
   - Primary purpose
   - Screens/pages
   - Inputs/outputs
   - Data storage (none/localStorage/json)
   - UI style notes (GRACE-X sci-fi)
2) PLAN: Output a Build Plan with:
   - Files to create/edit
   - Patch markers to use
   - Risks / unknowns
3) DIFF-FIRST: For any edit, show unified diff BEFORE applying.
4) BUILD: Implement with minimal changes.
5) VERIFY: Run verifyPaths + smoke checklist.
6) REPORT: Produce a "VOICE ORDER → RESULT" summary + log entry.

Hard rules:
- Never refactor unrelated code.
- If markers don't exist, STOP and propose "add markers" patch only.
- All actions appended to /docs/forge_log.md with timestamp.

Now wait for the user's first voice order and respond with PARSE + PLAN only (no changes yet).`,

    LASER_POINTER: `Forge, operate as LASER POINTER INTELLIGENCE.

Definition:
You do not "build everything." You point to the smallest, highest-impact change that moves the project forward safely.

Output format every time:
A) ONE TARGET (single highest-leverage fix or addition)
B) WHY IT MATTERS (1–3 lines)
C) EXACT CHANGESET (files + patch-marker IDs)
D) DIFF PREVIEW
E) SMOKE TEST STEPS (3–7 checks)
F) ROLLBACK INSTRUCTIONS

Rules:
- One target per run. No bundling.
- If uncertain, choose the safest diagnostic target.
- Prefer adding one new capability button/hook over broad rewrites.
- Never change styling globally unless asked.

Start now by selecting ONE TARGET that improves stability or module wiring with minimal risk, based on repo inspection.`,

    ANDROID_EXPORTER: `Forge, create ONE-CLICK ANDROID DEMO EXPORTER.

Goal:
Export the selected module/app into a SINGLE self-contained HTML file that runs offline from Android "Downloads" with zero external assets.

Inputs:
- Source entry file (e.g. /modules/uplift/index.html)
- Demo name (e.g. GRACEX_Uplift_Demo)
- Optional feature toggles:
  • includeTalkToGrace=true
  • includeLocalStorage=true
  • includeBasicTTS=true (Web Speech API fallback)
  • includeFakeAPIStubs=true

Exporter steps:
1) INLINE EVERYTHING:
   - Inline CSS into <style>
   - Inline JS into <script>
   - Replace asset references with embedded base64 where reasonable
   - If too big, stub with placeholders but keep layout intact
2) SAFE FALLBACKS:
   - If camera requested, use getUserMedia with permissions handling
   - If voice requested, use SpeechSynthesis fallback
3) UI SHELL:
   - Add GRACE-X sci-fi header
   - Add module tabs placeholders (non-functional ok)
   - Add "Talk to Grace" button wired to local stub handler
4) OUTPUT:
   - Write file to /exports/<demo_name>.html
   - Generate /exports/<demo_name>_readme.md with "how to run on Android"
   - Log export to /docs/forge_log.md

Hard rules:
- Do not modify source modules during export.
- Exporter is read-only to the project; only writes into /exports.

Now implement the exporter and add an "Export Android Demo" button inside Forge UI that:
- asks for source file + demo name
- runs the exporter
- prints the output path clearly.`
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // 2) FORGE QUICK-CALLS CONTROLLER
  // ═══════════════════════════════════════════════════════════════════════════

  const ForgeQuickCalls = {
    currentMode: null,
    voiceOrder: null,
    
    // Get prompt by mode
    getPrompt(mode) {
      return FORGE_PROMPTS[mode] || null;
    },

    // Activate Voice Builder mode
    activateVoiceBuilder() {
      this.currentMode = 'VOICE_BUILDER';
      if (window.ForgeEngine) {
        window.ForgeEngine.log('INFO', '🎙️ VOICE-BUILDER mode activated. Awaiting voice order...');
      }
      ForgeQuickCallsUI.showVoiceBuilderPanel();
      return FORGE_PROMPTS.VOICE_BUILDER;
    },

    // Activate Laser Pointer mode
    activateLaserPointer() {
      this.currentMode = 'LASER_POINTER';
      if (window.ForgeEngine) {
        window.ForgeEngine.log('INFO', '🎯 LASER POINTER mode activated. Scanning for highest-impact target...');
      }
      ForgeQuickCallsUI.showLaserPointerPanel();
      return FORGE_PROMPTS.LASER_POINTER;
    },

    // Activate Android Exporter
    activateAndroidExporter() {
      this.currentMode = 'ANDROID_EXPORTER';
      if (window.ForgeEngine) {
        window.ForgeEngine.log('INFO', '📱 ANDROID EXPORTER activated. Ready to package for offline use.');
      }
      ForgeQuickCallsUI.showAndroidExporterModal();
      return FORGE_PROMPTS.ANDROID_EXPORTER;
    },

    // Parse voice order into structured plan
    parseVoiceOrder(text) {
      const parsed = {
        raw: text,
        appName: this.extractAppName(text),
        purpose: this.extractPurpose(text),
        screens: this.extractScreens(text),
        storage: this.extractStorage(text),
        style: 'GRACE-X sci-fi (default)',
        timestamp: new Date().toISOString()
      };
      
      if (window.ForgeEngine) {
        window.ForgeEngine.log('INFO', `Parsed voice order: "${parsed.appName || 'Unnamed'}"`);
      }
      
      return parsed;
    },

    // Simple extractors (can be enhanced with AI later)
    extractAppName(text) {
      const patterns = [
        /(?:build|create|make|called?)\s+["']?([a-zA-Z0-9\s-]+?)["']?\s*(?:app|module|page|tool)?/i,
        /["']([a-zA-Z0-9\s-]+?)["']/
      ];
      for (const p of patterns) {
        const match = text.match(p);
        if (match) return match[1].trim();
      }
      return null;
    },

    extractPurpose(text) {
      const patterns = [
        /(?:that|which|to)\s+(.{10,100}?)(?:\.|,|$)/i,
        /(?:for|purpose|goal)\s*:?\s*(.{10,100}?)(?:\.|,|$)/i
      ];
      for (const p of patterns) {
        const match = text.match(p);
        if (match) return match[1].trim();
      }
      return text.substring(0, 100) + '...';
    },

    extractScreens(text) {
      const screens = [];
      const patterns = [
        /(?:page|screen|view|tab)s?\s*:?\s*([^.]+)/gi,
        /(\w+)\s+(?:page|screen|view|tab)/gi
      ];
      for (const p of patterns) {
        let m;
        while ((m = p.exec(text)) !== null) {
          screens.push(m[1].trim());
        }
      }
      return screens.length ? screens : ['main'];
    },

    extractStorage(text) {
      if (/localStorage|local\s*storage/i.test(text)) return 'localStorage';
      if (/database|db|json\s*file/i.test(text)) return 'json';
      if (/no\s*stor|ephemeral|temp/i.test(text)) return 'none';
      return 'localStorage'; // Default
    },

    // Generate build plan from parsed order
    generateBuildPlan(parsed) {
      const slug = (parsed.appName || 'new-app').toLowerCase().replace(/[^a-z0-9]+/g, '-');
      
      return {
        projectName: parsed.appName || 'New App',
        slug,
        template: 'html-js',
        files: [
          { path: 'index.html', action: 'create', description: 'Main entry point' },
          { path: 'style.css', action: 'create', description: 'Styles' },
          { path: 'app.js', action: 'create', description: 'Application logic' },
          { path: 'manifest.json', action: 'create', description: 'Project manifest' }
        ],
        markers: [`FORGE:${slug.toUpperCase()}_MAIN`],
        risks: parsed.screens.length > 3 ? ['Multiple screens may need routing'] : [],
        unknowns: parsed.purpose.includes('...') ? ['Purpose unclear - review before build'] : []
      };
    },

    // Export for Android (simplified in-browser export)
    async exportForAndroid(sourcePath, demoName, options = {}) {
      const engine = window.ForgeEngine;
      if (!engine) {
        console.error('[ForgeQuickCalls] ForgeEngine not available');
        return null;
      }

      const {
        includeTalkToGrace = true,
        includeLocalStorage = true,
        includeBasicTTS = true,
        includeFakeAPIStubs = true
      } = options;

      engine.log('INFO', `Starting Android export: ${demoName}`);

      // Get source content
      let html = engine.readFile(sourcePath);
      if (!html) {
        // Try index.html as fallback
        html = engine.readFile('index.html');
        if (!html) {
          engine.log('ERROR', `Source file not found: ${sourcePath}`);
          return null;
        }
      }

      // Inline CSS
      const css = engine.readFile('style.css');
      if (css) {
        html = html.replace(
          /<link[^>]*href=["']style\.css["'][^>]*>/gi,
          `<style>\n/* Inlined by GRACE-X Forge Android Exporter */\n${css}\n</style>`
        );
      }

      // Inline JS
      let js = engine.readFile('app.js');
      if (js) {
        // Add TTS stub if requested
        if (includeBasicTTS) {
          js = `// GRACE-X TTS Stub for Offline Use
window.GRACEX_TTS = {
  speak: function(text) {
    if ('speechSynthesis' in window) {
      const u = new SpeechSynthesisUtterance(text);
      u.rate = 0.9;
      u.pitch = 1;
      speechSynthesis.speak(u);
    }
    return Promise.resolve();
  }
};
` + js;
        }

        // Add fake API stubs if requested
        if (includeFakeAPIStubs) {
          js = `// GRACE-X API Stub for Offline Use
window.runModuleBrain = function(module, messages) {
  return Promise.resolve({
    success: true,
    reply: "I'm running in offline mode. Full AI features require network connectivity.",
    offline: true
  });
};
` + js;
        }

        html = html.replace(
          /<script[^>]*src=["']app\.js["'][^>]*><\/script>/gi,
          `<script>\n/* Inlined by GRACE-X Forge Android Exporter */\n${js}\n</script>`
        );
      }

      // Add Talk to Grace button if requested
      if (includeTalkToGrace && !html.includes('talk-to-grace')) {
        const talkButton = `
<!-- Talk to GRACE (Offline Stub) -->
<div id="forge-talk-to-grace" style="position:fixed;bottom:20px;right:20px;z-index:9999;">
  <button onclick="if(window.GRACEX_TTS)window.GRACEX_TTS.speak('Hello! I am GRACE-X running offline.')" 
          style="padding:12px 20px;background:#00d4ff;color:#000;border:none;border-radius:8px;font-size:14px;cursor:pointer;box-shadow:0 4px 12px rgba(0,212,255,0.3);">
    🎙️ Talk to GRACE
  </button>
</div>`;
        html = html.replace('</body>', talkButton + '\n</body>');
      }

      // Add GRACE-X branding header
      const brandingHeader = `
<!-- GRACE-X Forge™ Export Header -->
<div style="background:linear-gradient(135deg,#0a0e14,#1a2332);color:#00d4ff;padding:8px 16px;font-family:system-ui;font-size:12px;text-align:center;border-bottom:1px solid rgba(0,212,255,0.2);">
  ⚒️ ${demoName} · Built with GRACE-X Forge™ · Offline Demo
</div>`;
      html = html.replace(/<body[^>]*>/, '$&\n' + brandingHeader);

      // Add meta viewport if missing
      if (!html.includes('viewport')) {
        html = html.replace('<head>', '<head>\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">');
      }

      // Save to exports folder
      const exportPath = `exports/${demoName}.html`;
      const readmePath = `exports/${demoName}_README.md`;

      // Store in ForgeEngine files (virtual)
      engine.files.set(exportPath, html);
      
      // Generate README
      const readme = `# ${demoName} - Android Demo

## How to Run on Android

1. **Download the HTML file** to your Android device
2. **Open your file manager** and navigate to Downloads
3. **Tap the HTML file** - it will open in your browser
4. **Optional:** Create a home screen shortcut:
   - In Chrome: Menu → Add to Home Screen
   - In Firefox: Menu → Install

## Features Included

- ${includeTalkToGrace ? '✅' : '❌'} Talk to GRACE button
- ${includeLocalStorage ? '✅' : '❌'} Local storage support
- ${includeBasicTTS ? '✅' : '❌'} Text-to-Speech (Web Speech API)
- ${includeFakeAPIStubs ? '✅' : '❌'} Offline API stubs

## Notes

- This is a **self-contained offline demo**
- Full AI features require network connectivity
- Built with GRACE-X Forge™ on ${new Date().toLocaleDateString()}

---
*Exported from GRACE-X Forge™*
`;
      engine.files.set(readmePath, readme);
      engine.saveToStorage();

      // Create downloadable file
      const blob = new Blob([html], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${demoName}.html`;
      a.click();
      URL.revokeObjectURL(url);

      engine.log('SUCCESS', `Android demo exported: ${exportPath}`);
      engine.log('INFO', `README generated: ${readmePath}`);

      // Log to forge_log.md
      this.appendToForgeLog(`ANDROID EXPORT: ${demoName} → ${exportPath}`);

      return { exportPath, readmePath, html };
    },

    // Append entry to forge_log.md
    appendToForgeLog(entry) {
      const engine = window.ForgeEngine;
      if (!engine) return;

      const timestamp = new Date().toISOString();
      const logEntry = `\n[${timestamp}] ${entry}`;
      
      let log = engine.readFile('docs/forge_log.md') || `# GRACE-X Forge™ Log\n\n`;
      log += logEntry;
      engine.files.set('docs/forge_log.md', log);
      engine.saveToStorage();
    }
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // 3) FORGE QUICK-CALLS UI
  // ═══════════════════════════════════════════════════════════════════════════

  const ForgeQuickCallsUI = {
    init() {
      // Wire up Quick-Call buttons if they exist
      this.wireButtons();
      console.log('[FORGE] Quick-Calls UI initialized');
    },

    wireButtons() {
      // Voice Builder button
      const voiceBtn = document.getElementById('forge-quickcall-voice');
      if (voiceBtn) {
        voiceBtn.addEventListener('click', () => {
          ForgeQuickCalls.activateVoiceBuilder();
        });
      }

      // Laser Pointer button
      const laserBtn = document.getElementById('forge-quickcall-laser');
      if (laserBtn) {
        laserBtn.addEventListener('click', () => {
          ForgeQuickCalls.activateLaserPointer();
        });
      }

      // Android Exporter button
      const androidBtn = document.getElementById('forge-quickcall-android');
      if (androidBtn) {
        androidBtn.addEventListener('click', () => {
          ForgeQuickCalls.activateAndroidExporter();
        });
      }
    },

    showVoiceBuilderPanel() {
      // Show/create the voice builder input panel
      let panel = document.getElementById('forge-voice-builder-panel');
      if (!panel) {
        panel = this.createVoiceBuilderPanel();
        document.querySelector('.forge-container')?.appendChild(panel);
      }
      panel.style.display = 'block';
    },

    createVoiceBuilderPanel() {
      const panel = document.createElement('div');
      panel.id = 'forge-voice-builder-panel';
      panel.className = 'forge-quick-panel';
      panel.innerHTML = `
        <div class="forge-quick-panel-header">
          <h4>🎙️ Voice Builder</h4>
          <button class="forge-icon-btn forge-quick-panel-close">&times;</button>
        </div>
        <div class="forge-quick-panel-body">
          <p class="hint">Describe your app in plain English. I'll parse it into a build plan.</p>
          <textarea id="forge-voice-order-input" rows="5" placeholder="Example: Build me a task tracker app that lets users add, complete, and delete tasks. It should save to localStorage and have a dark theme."></textarea>
          <div class="forge-quick-panel-actions">
            <button class="forge-btn forge-btn-primary" id="forge-voice-order-parse">🔍 Parse Order</button>
            <button class="forge-btn" id="forge-voice-order-clear">Clear</button>
          </div>
          <div id="forge-voice-order-result" class="forge-quick-panel-result" style="display:none;"></div>
        </div>
      `;

      // Wire close button
      panel.querySelector('.forge-quick-panel-close').addEventListener('click', () => {
        panel.style.display = 'none';
      });

      // Wire parse button
      panel.querySelector('#forge-voice-order-parse').addEventListener('click', () => {
        const input = panel.querySelector('#forge-voice-order-input').value;
        if (!input.trim()) return;

        const parsed = ForgeQuickCalls.parseVoiceOrder(input);
        const plan = ForgeQuickCalls.generateBuildPlan(parsed);

        const resultDiv = panel.querySelector('#forge-voice-order-result');
        resultDiv.style.display = 'block';
        resultDiv.innerHTML = `
          <h5>📋 Build Plan</h5>
          <div class="forge-plan-item"><strong>Name:</strong> ${plan.projectName}</div>
          <div class="forge-plan-item"><strong>Slug:</strong> ${plan.slug}</div>
          <div class="forge-plan-item"><strong>Template:</strong> ${plan.template}</div>
          <div class="forge-plan-item"><strong>Files:</strong></div>
          <ul>${plan.files.map(f => `<li>${f.path} (${f.action})</li>`).join('')}</ul>
          ${plan.risks.length ? `<div class="forge-plan-warning">⚠️ Risks: ${plan.risks.join(', ')}</div>` : ''}
          ${plan.unknowns.length ? `<div class="forge-plan-warning">❓ Unknowns: ${plan.unknowns.join(', ')}</div>` : ''}
          <button class="forge-btn forge-btn-primary" id="forge-voice-order-build">⚡ Build from Plan</button>
        `;

        // Wire build button
        resultDiv.querySelector('#forge-voice-order-build').addEventListener('click', () => {
          if (window.ForgeEngine) {
            window.ForgeEngine.createProject(plan.projectName, plan.template);
            if (window.ForgeUI) {
              window.ForgeUI.updateProjectTree();
              window.ForgeUI.updateProjectInfo();
            }
            ForgeQuickCalls.appendToForgeLog(`VOICE BUILD: ${plan.projectName} from voice order`);
            panel.style.display = 'none';
          }
        });
      });

      // Wire clear button
      panel.querySelector('#forge-voice-order-clear').addEventListener('click', () => {
        panel.querySelector('#forge-voice-order-input').value = '';
        panel.querySelector('#forge-voice-order-result').style.display = 'none';
      });

      return panel;
    },

    showLaserPointerPanel() {
      let panel = document.getElementById('forge-laser-pointer-panel');
      if (!panel) {
        panel = this.createLaserPointerPanel();
        document.querySelector('.forge-container')?.appendChild(panel);
      }
      panel.style.display = 'block';
      this.runLaserAnalysis();
    },

    createLaserPointerPanel() {
      const panel = document.createElement('div');
      panel.id = 'forge-laser-pointer-panel';
      panel.className = 'forge-quick-panel';
      panel.innerHTML = `
        <div class="forge-quick-panel-header">
          <h4>🎯 Laser Pointer Intelligence</h4>
          <button class="forge-icon-btn forge-quick-panel-close">&times;</button>
        </div>
        <div class="forge-quick-panel-body">
          <p class="hint">Analyzing project for highest-impact single change...</p>
          <div id="forge-laser-analysis" class="forge-quick-panel-result">
            <div class="forge-loader">⏳ Scanning...</div>
          </div>
        </div>
      `;

      panel.querySelector('.forge-quick-panel-close').addEventListener('click', () => {
        panel.style.display = 'none';
      });

      return panel;
    },

    runLaserAnalysis() {
      const engine = window.ForgeEngine;
      const analysisDiv = document.getElementById('forge-laser-analysis');
      if (!analysisDiv || !engine) return;

      // Simple analysis based on current project state
      const issues = [];
      
      if (!engine.currentProject) {
        issues.push({
          target: 'No project loaded',
          why: 'Cannot analyze without a project. Create one first.',
          action: 'Create new project',
          risk: 'none'
        });
      } else {
        // Check for common issues
        if (!engine.files.has('index.html')) {
          issues.push({
            target: 'Missing index.html',
            why: 'Entry point required for any web app.',
            action: 'Create index.html from template',
            risk: 'low'
          });
        }

        if (!engine.files.has('manifest.json')) {
          issues.push({
            target: 'Missing manifest.json',
            why: 'Package manifest needed for builds/exports.',
            action: 'Run Build Package to generate',
            risk: 'low'
          });
        }

        const smokeResults = engine.smokeChecklist();
        const failed = smokeResults.filter(r => !r.passed);
        failed.forEach(f => {
          issues.push({
            target: f.name,
            why: 'Smoke test failed - potential issue.',
            action: `Fix: ${f.name}`,
            risk: 'medium'
          });
        });

        if (issues.length === 0) {
          issues.push({
            target: 'Project looks healthy ✅',
            why: 'No critical issues detected.',
            action: 'Consider adding features or exporting',
            risk: 'none'
          });
        }
      }

      // Display highest priority issue
      const top = issues[0];
      analysisDiv.innerHTML = `
        <div class="forge-laser-target">
          <h5>A) TARGET</h5>
          <strong>${top.target}</strong>
        </div>
        <div class="forge-laser-why">
          <h5>B) WHY IT MATTERS</h5>
          <p>${top.why}</p>
        </div>
        <div class="forge-laser-action">
          <h5>C) RECOMMENDED ACTION</h5>
          <p>${top.action}</p>
          <span class="forge-risk-badge forge-risk-${top.risk}">${top.risk.toUpperCase()} RISK</span>
        </div>
        ${issues.length > 1 ? `<p class="hint">${issues.length - 1} more issues detected. Fix this one first.</p>` : ''}
      `;
    },

    showAndroidExporterModal() {
      let modal = document.getElementById('forge-modal-android-export');
      if (!modal) {
        modal = this.createAndroidExporterModal();
        document.querySelector('.forge-container')?.appendChild(modal);
      }
      modal.style.display = 'flex';
    },

    createAndroidExporterModal() {
      const modal = document.createElement('div');
      modal.id = 'forge-modal-android-export';
      modal.className = 'forge-modal';
      modal.innerHTML = `
        <div class="forge-modal-content">
          <div class="forge-modal-header">
            <h3>📱 Export Android Demo</h3>
            <button class="forge-modal-close">&times;</button>
          </div>
          <div class="forge-modal-body">
            <div class="forge-form-group">
              <label>Source File</label>
              <input type="text" id="forge-android-source" value="index.html" />
            </div>
            <div class="forge-form-group">
              <label>Demo Name</label>
              <input type="text" id="forge-android-name" placeholder="GRACEX_MyApp_Demo" />
            </div>
            <div class="forge-form-group">
              <label>Options</label>
              <div class="forge-checkbox-group">
                <label><input type="checkbox" id="forge-android-tts" checked /> Include Talk to GRACE</label>
                <label><input type="checkbox" id="forge-android-storage" checked /> Include LocalStorage</label>
                <label><input type="checkbox" id="forge-android-voice" checked /> Include Basic TTS</label>
                <label><input type="checkbox" id="forge-android-stubs" checked /> Include API Stubs</label>
              </div>
            </div>
          </div>
          <div class="forge-modal-footer">
            <button class="forge-btn forge-android-cancel">Cancel</button>
            <button class="forge-btn forge-btn-primary" id="forge-android-export-btn">📱 Export</button>
          </div>
        </div>
      `;

      // Wire close
      modal.querySelector('.forge-modal-close').addEventListener('click', () => {
        modal.style.display = 'none';
      });
      modal.querySelector('.forge-android-cancel').addEventListener('click', () => {
        modal.style.display = 'none';
      });

      // Wire export
      modal.querySelector('#forge-android-export-btn').addEventListener('click', async () => {
        const source = modal.querySelector('#forge-android-source').value;
        const name = modal.querySelector('#forge-android-name').value || 'GRACEX_Demo';
        const options = {
          includeTalkToGrace: modal.querySelector('#forge-android-tts').checked,
          includeLocalStorage: modal.querySelector('#forge-android-storage').checked,
          includeBasicTTS: modal.querySelector('#forge-android-voice').checked,
          includeFakeAPIStubs: modal.querySelector('#forge-android-stubs').checked
        };

        await ForgeQuickCalls.exportForAndroid(source, name, options);
        modal.style.display = 'none';
      });

      return modal;
    }
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // 4) INITIALIZATION
  // ═══════════════════════════════════════════════════════════════════════════

  // Initialize when Forge module loads
  document.addEventListener('gracex:module:loaded', (e) => {
    if (e.detail && e.detail.module === 'forge') {
      setTimeout(() => ForgeQuickCallsUI.init(), 150);
    }
  });

  // Also try immediate init if already on Forge
  if (document.querySelector('.forge-container')) {
    setTimeout(() => ForgeQuickCallsUI.init(), 100);
  }

  // Expose globally
  window.ForgeQuickCalls = ForgeQuickCalls;
  window.ForgeQuickCallsUI = ForgeQuickCallsUI;
  window.FORGE_PROMPTS = FORGE_PROMPTS;

  console.log('[FORGE] Quick-Calls module loaded (Voice-Builder, Laser, Android Exporter)');

// ═══════════════════════════════════════════════════════════════════════
// LASER MODE (v1) + Chat → Core (Copy/Paste)
// Low-RAM: purely local prompt generator + optional mic talkback.
// ═══════════════════════════════════════════════════════════════════════

const ForgeLaser = {
  active: false,
  target: '',
  talkbackOn: false,
  speech: null,

  setActive(on) {
    this.active = !!on;
    document.body.classList.toggle('forge-laser-active', this.active);

    const stateEl = document.getElementById('forge-laser-state');
    if (stateEl) stateEl.textContent = this.active ? 'ON' : 'OFF';

    // When turning off, we do NOT wipe target (user may re-toggle)
    ForgeUI?.toast?.(this.active ? '🎯 Laser Mode ON: pick a target' : '🎯 Laser Mode OFF', this.active ? 'info' : 'success', 1800);
  },

  setTarget(t) {
    this.target = (t || '').trim();
    const input = document.getElementById('forge-laser-target');
    if (input && input.value.trim() !== this.target) input.value = this.target;
  },

  formatPrompt(userText) {
    const txt = (userText || '').trim();
    const t = (this.target || '').trim();

    // Base header (safe, non-gambling instruction)
    const header = [
      'GRACE-X CORE — LASER FOCUS REQUEST',
      `LaserMode: ${this.active ? 'ON' : 'OFF'}`,
      t ? `Target: ${t}` : 'Target: (none set)',
      '',
      'Instruction: Focus all available reasoning and module-knowledge on the Target only.',
      'Output style: clear steps, no hype, no guarantees, no betting instructions.',
      'Safety: Provide insight and analysis only. Do not instruct placing bets.',
      '',
    ].join('\n');

    return header + (txt ? ('User Request:\n' + txt) : 'User Request:\n(enter a request)');
  },

  // Optional mic talkback (browser feature; off by default)
  toggleTalkback() {
    const stateEl = document.getElementById('forge-talkback-state');

    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRec) {
      ForgeEngine?.log?.('WARN', 'Talkback unavailable (SpeechRecognition not supported in this browser).');
      ForgeUI?.toast?.('Talkback not supported in this browser', 'warn', 2200);
      return;
    }

    if (!this.speech) {
      this.speech = new SpeechRec();
      this.speech.continuous = false;
      this.speech.interimResults = false;
      this.speech.lang = 'en-GB';

      this.speech.onresult = (e) => {
        const transcript = Array.from(e.results).map(r => r[0].transcript).join(' ').trim();
        const input = document.getElementById('forge-chat2core-input');
        if (input && transcript) {
          input.value = (input.value ? (input.value + '\n') : '') + transcript;
          ForgeUI?.toast?.('🎙️ Captured speech → input', 'success', 1400);
        }
      };

      this.speech.onerror = (e) => {
        ForgeEngine?.log?.('WARN', 'Talkback error: ' + (e?.error || 'unknown'));
      };

      this.speech.onend = () => {
        // one-shot; keep state ON but stop listening unless user hits again
      };
    }

    this.talkbackOn = !this.talkbackOn;
    if (stateEl) stateEl.textContent = this.talkbackOn ? 'ON' : 'OFF';

    if (this.talkbackOn) {
      try {
        this.speech.start();
        ForgeUI?.toast?.('🎙️ Talkback ON (say it once)', 'info', 1600);
      } catch (err) {
        // If already started or blocked, revert
        this.talkbackOn = false;
        if (stateEl) stateEl.textContent = 'OFF';
        ForgeEngine?.log?.('WARN', 'Talkback start failed: ' + err);
      }
    } else {
      try { this.speech.stop(); } catch(_) {}
      ForgeUI?.toast?.('🎙️ Talkback OFF', 'success', 1200);
    }
  }
};

function wireChat2CorePanel() {
  const genBtn = document.getElementById('forge-chat2core-generate');
  const copyBtn = document.getElementById('forge-chat2core-copy');
  const clearBtn = document.getElementById('forge-chat2core-clear');
  const outEl = document.getElementById('forge-chat2core-output');
  const inEl = document.getElementById('forge-chat2core-input');
  const laserToggle = document.getElementById('forge-laser-toggle');
  const laserTarget = document.getElementById('forge-laser-target');
  const talkBtn = document.getElementById('forge-talkback-toggle');

  if (laserToggle) {
    laserToggle.addEventListener('click', () => {
      ForgeLaser.setActive(!ForgeLaser.active);
    });
  }

  if (laserTarget) {
    laserTarget.addEventListener('change', () => ForgeLaser.setTarget(laserTarget.value));
    laserTarget.addEventListener('input', () => ForgeLaser.setTarget(laserTarget.value));
  }

  if (talkBtn) {
    talkBtn.addEventListener('click', () => ForgeLaser.toggleTalkback());
  }

  if (genBtn) {
    genBtn.addEventListener('click', () => {
      const prompt = ForgeLaser.formatPrompt(inEl?.value || '');
      if (outEl) outEl.value = prompt;
      ForgeEngine?.log?.('INFO', 'Chat→Core output generated (copy/paste ready).');
      ForgeUI?.toast?.('Output generated', 'success', 1200);
    });
  }

  if (copyBtn) {
    copyBtn.addEventListener('click', async () => {
      const txt = outEl?.value || '';
      if (!txt) return ForgeUI?.toast?.('Nothing to copy', 'warn', 1200);
      try {
        await navigator.clipboard.writeText(txt);
        ForgeUI?.toast?.('Copied', 'success', 1000);
      } catch (err) {
        // Fallback
        outEl?.select?.();
        document.execCommand?.('copy');
        ForgeUI?.toast?.('Copied (fallback)', 'success', 1200);
      }
    });
  }

  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      if (inEl) inEl.value = '';
      if (outEl) outEl.value = '';
      ForgeUI?.toast?.('Cleared', 'info', 900);
    });
  }
}

// Hook Laser targeting into project tree clicks (select + open)
const _origUpdateTree = ForgeUI.updateProjectTree.bind(ForgeUI);
ForgeUI.updateProjectTree = function() {
  _origUpdateTree();
  const container = document.getElementById('forge-tree-container');
  if (!container) return;

  container.querySelectorAll('.forge-tree-item').forEach(item => {
    item.addEventListener('click', () => {
      // If laser is active, mark this as target for the whole system
      if (ForgeLaser.active) {
        const path = item.dataset.path;
        ForgeLaser.setTarget(path);
        // highlight
        container.querySelectorAll('.forge-tree-item').forEach(i => i.classList.remove('forge-laser-target'));
        item.classList.add('forge-laser-target');
      }
    }, { capture: true });
  });
};

// Wire up quickcall laser button to Laser Mode toggle (keep old analysis available in panel)
const _origWire = ForgeQuickCallsUI.wireButtons.bind(ForgeQuickCallsUI);
ForgeQuickCallsUI.wireButtons = function() {
  _origWire();
  const laserBtn = document.getElementById('forge-quickcall-laser');
  if (laserBtn) {
    laserBtn.addEventListener('click', () => {
      // Toggle laser mode instead of single-change scan
      ForgeLaser.setActive(!ForgeLaser.active);
    });
  }
};

// Ensure Chat2Core wiring runs after Forge init
const _origInit = ForgeUI.init.bind(ForgeUI);
ForgeUI.init = function() {
  _origInit();
  wireChat2CorePanel();
  wireForgeBrain(); // Add brain wiring
};

// ============================================
// BRAIN WIRING - Level 5 Integration
// ============================================
function wireForgeBrain() {
  if (typeof window.setupModuleBrain !== 'function') {
    console.warn('[FORGE] Brain system not available - running standalone');
    return;
  }

  window.setupModuleBrain('forge', {
    capabilities: {
      hasFileCreation: true,
      hasCodeGeneration: true,
      hasTemplateSystem: true,
      hasModuleBuilder: true
    },

    onQuery: async (query) => {
      // Handle AI queries about module building
      const lowerQuery = query.toLowerCase();
      
      if (lowerQuery.includes('create') || lowerQuery.includes('build')) {
        return 'Ready to build a new module. What should it do?';
      }
      
      if (lowerQuery.includes('template')) {
        return 'Available templates: React component, HTML page, Node.js module...';
      }
      
      return 'How can I help with module development?';
    },

    onSuggestion: (suggestion) => {
      // Handle brain suggestions for code generation
      if (suggestion.type === 'code_template') {
        // Apply template suggestion
        console.log('[FORGE] Applying code template:', suggestion.template);
      }
    }
  });

  console.log('[FORGE] ✅ Brain wired - Level 5 integration active');
}

// Expose for debugging
window.ForgeLaser = ForgeLaser;

})();
/* FORGE:END CORE_FORGE_SNIPPET_V1 */