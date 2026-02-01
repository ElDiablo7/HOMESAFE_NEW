/**
 * GRACE-X LASER™ ULTRA - Universal Inspector
 * Click ANYTHING - Internal elements, URLs, Links, Names, IDs, Files, EVERYTHING
 * Enhanced to inspect content beyond the ecosystem
 * © Zac Crockett 2025
 */

const GraceXLaserUltra = {
  active: false,
  overlay: null,
  panel: null,
  target: null,
  reticle: null,
  mode: 'hybrid', // 'element', 'text', 'hybrid'

  // ============================================
  // INITIALIZATION
  // ============================================

  init: () => {
    GraceXLaserUltra.createLaserButton();
    GraceXLaserUltra.createOverlay();
    GraceXLaserUltra.createPanel();
    GraceXLaserUltra.createReticle();
    GraceXLaserUltra.setupKeyboardShortcuts();
    console.log('✅ LASER™ ULTRA initialized - inspect ANYTHING mode enabled');
  },

  // ============================================
  // UI COMPONENTS
  // ============================================

  createLaserButton: () => {
    const button = document.createElement('button');
    button.id = 'gx-laser-ultra-btn';
    button.className = 'gx-laser-button';
    button.innerHTML = '🎯';
    button.title = 'LASER™ ULTRA - Click ANYTHING: Elements, URLs, Names, IDs, Files, Links, Text';
    
    button.addEventListener('click', () => {
      GraceXLaserUltra.toggle();
    });
    
    // Position it near voice button
    button.style.cssText = `
      position: fixed;
      bottom: 95px;
      right: 25px;
      width: 50px;
      height: 50px;
      border-radius: 50%;
      background: linear-gradient(135deg, #f59e0b, #dc2626);
      border: none;
      color: #fff;
      font-size: 20px;
      cursor: pointer;
      box-shadow: 0 8px 25px rgba(245, 158, 11, 0.4);
      transition: all 0.2s;
      z-index: 999;
    `;
    
    button.onmouseenter = () => button.style.transform = 'scale(1.1)';
    button.onmouseleave = () => button.style.transform = 'scale(1)';
    
    document.body.appendChild(button);
  },

  createOverlay: () => {
    const overlay = document.createElement('div');
    overlay.id = 'gx-laser-ultra-overlay';
    overlay.style.cssText = `
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.3);
      z-index: 99998;
      display: none;
      pointer-events: none;
    `;
    
    overlay.innerHTML = `
      <div style="
        position: absolute;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(15, 23, 42, 0.95);
        padding: 15px 30px;
        border-radius: 12px;
        border: 2px solid #f59e0b;
        box-shadow: 0 8px 30px rgba(245, 158, 11, 0.5);
        text-align: center;
      ">
        <div style="font-size: 1.3rem; font-weight: 700; color: #f59e0b; margin-bottom: 8px;">
          🎯 LASER™ ULTRA - INSPECT ANYTHING MODE
        </div>
        <div style="font-size: 0.9rem; color: #94a3b8;">
          Click: Elements • URLs • Links • Names • IDs • Files • Text • EVERYTHING
        </div>
        <div style="font-size: 0.8rem; color: #64748b; margin-top: 5px;">
          ESC to exit • Right-click for options
        </div>
      </div>
    `;
    
    document.body.appendChild(overlay);
    GraceXLaserUltra.overlay = overlay;
  },

  createPanel: () => {
    const panel = document.createElement('div');
    panel.id = 'gx-laser-ultra-panel';
    panel.style.cssText = `
      position: fixed;
      top: 50%;
      right: 20px;
      transform: translateY(-50%);
      width: 450px;
      max-height: 80vh;
      background: rgba(15, 23, 42, 0.98);
      border: 2px solid #f59e0b;
      border-radius: 16px;
      box-shadow: 0 16px 60px rgba(0, 0, 0, 0.7);
      z-index: 99999;
      display: none;
      overflow: hidden;
    `;
    
    panel.innerHTML = `
      <div style="padding: 20px; border-bottom: 1px solid rgba(148, 163, 184, 0.2);">
        <div style="display: flex; align-items: center; justify-content: space-between;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <span style="font-size: 1.5rem;">🎯</span>
            <span style="font-size: 1.2rem; font-weight: 700; color: #f59e0b;">LASER™ ULTRA</span>
          </div>
          <button id="gx-laser-ultra-close" style="
            background: none;
            border: none;
            color: #64748b;
            font-size: 1.5rem;
            cursor: pointer;
            padding: 0;
            width: 30px;
            height: 30px;
            line-height: 1;
          ">×</button>
        </div>
      </div>
      
      <div id="gx-laser-ultra-content" style="padding: 20px; max-height: calc(80vh - 180px); overflow-y: auto;">
        <div style="text-align: center; padding: 40px; color: #64748b;">
          <div style="font-size: 2rem; margin-bottom: 10px;">🎯</div>
          <div>Click anything to begin universal analysis</div>
        </div>
      </div>
      
      <div style="padding: 15px 20px; border-top: 1px solid rgba(148, 163, 184, 0.2); display: flex; gap: 8px; flex-wrap: wrap;">
        <button class="gx-laser-action" id="gx-laser-copy" style="flex: 1; min-width: 100px;">
          📋 Copy Data
        </button>
        <button class="gx-laser-action" id="gx-laser-open" style="flex: 1; min-width: 100px;">
          🔗 Open/Visit
        </button>
        <button class="gx-laser-action" id="gx-laser-analyze" style="flex: 1; min-width: 100px;">
          🧠 AI Analyze
        </button>
        <button class="gx-laser-action" id="gx-laser-search" style="flex: 1; min-width: 100px;">
          🔍 Web Search
        </button>
      </div>
    `;
    
    // Add action button styles
    const style = document.createElement('style');
    style.textContent = `
      .gx-laser-action {
        padding: 10px 15px;
        background: linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(220, 38, 38, 0.2));
        border: 1px solid rgba(245, 158, 11, 0.3);
        border-radius: 8px;
        color: #f59e0b;
        font-size: 0.85rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s;
      }
      .gx-laser-action:hover {
        background: linear-gradient(135deg, rgba(245, 158, 11, 0.3), rgba(220, 38, 38, 0.3));
        border-color: #f59e0b;
        transform: translateY(-2px);
        box-shadow: 0 4px 15px rgba(245, 158, 11, 0.3);
      }
      #gx-laser-ultra-content::-webkit-scrollbar {
        width: 6px;
      }
      #gx-laser-ultra-content::-webkit-scrollbar-thumb {
        background: rgba(245, 158, 11, 0.3);
        border-radius: 10px;
      }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(panel);
    GraceXLaserUltra.panel = panel;
    
    // Event listeners
    panel.querySelector('#gx-laser-ultra-close').addEventListener('click', () => {
      GraceXLaserUltra.deactivate();
    });
    
    panel.querySelector('#gx-laser-copy').addEventListener('click', () => {
      GraceXLaserUltra.copyTargetData();
    });
    
    panel.querySelector('#gx-laser-open').addEventListener('click', () => {
      GraceXLaserUltra.openTarget();
    });
    
    panel.querySelector('#gx-laser-analyze').addEventListener('click', () => {
      GraceXLaserUltra.aiAnalyze();
    });
    
    panel.querySelector('#gx-laser-search').addEventListener('click', () => {
      GraceXLaserUltra.webSearch();
    });
  },

  createReticle: () => {
    const reticle = document.createElement('div');
    reticle.id = 'gx-laser-ultra-reticle';
    reticle.style.cssText = `
      position: fixed;
      width: 40px;
      height: 40px;
      border: 2px solid #f59e0b;
      border-radius: 50%;
      pointer-events: none;
      z-index: 99997;
      display: none;
      box-shadow: 0 0 20px rgba(245, 158, 11, 0.6), inset 0 0 20px rgba(245, 158, 11, 0.3);
      animation: reticlePulse 1.5s ease-in-out infinite;
    `;
    
    reticle.innerHTML = `
      <div style="position: absolute; top: 50%; left: 0; right: 0; height: 2px; background: #f59e0b;"></div>
      <div style="position: absolute; left: 50%; top: 0; bottom: 0; width: 2px; background: #f59e0b;"></div>
      <div style="position: absolute; top: 50%; left: 50%; width: 6px; height: 6px; background: #f59e0b; border-radius: 50%; transform: translate(-50%, -50%);"></div>
    `;
    
    const style = document.createElement('style');
    style.textContent = `
      @keyframes reticlePulse {
        0%, 100% { transform: scale(1) rotate(0deg); opacity: 1; }
        50% { transform: scale(1.1) rotate(180deg); opacity: 0.7; }
      }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(reticle);
    GraceXLaserUltra.reticle = reticle;
  },

  // ============================================
  // ACTIVATION / DEACTIVATION
  // ============================================

  toggle: () => {
    if (GraceXLaserUltra.active) {
      GraceXLaserUltra.deactivate();
    } else {
      GraceXLaserUltra.activate();
    }
  },

  activate: () => {
    GraceXLaserUltra.active = true;
    GraceXLaserUltra.overlay.style.display = 'block';
    GraceXLaserUltra.panel.style.display = 'block';
    GraceXLaserUltra.reticle.style.display = 'block';
    
    // Add event listeners
    document.addEventListener('mousemove', GraceXLaserUltra.handleMouseMove);
    document.addEventListener('click', GraceXLaserUltra.handleClick, true);
    document.addEventListener('contextmenu', GraceXLaserUltra.handleRightClick, true);
    document.addEventListener('keydown', GraceXLaserUltra.handleKeydown);
    
    console.log('🎯 LASER™ ULTRA activated - inspect ANYTHING mode');
  },

  deactivate: () => {
    GraceXLaserUltra.active = false;
    GraceXLaserUltra.overlay.style.display = 'none';
    GraceXLaserUltra.panel.style.display = 'none';
    GraceXLaserUltra.reticle.style.display = 'none';
    
    // Remove event listeners
    document.removeEventListener('mousemove', GraceXLaserUltra.handleMouseMove);
    document.removeEventListener('click', GraceXLaserUltra.handleClick, true);
    document.removeEventListener('contextmenu', GraceXLaserUltra.handleRightClick, true);
    document.removeEventListener('keydown', GraceXLaserUltra.handleKeydown);
    
    console.log('🎯 LASER™ ULTRA deactivated');
  },

  // ============================================
  // EVENT HANDLERS
  // ============================================

  handleMouseMove: (e) => {
    // Update reticle position
    GraceXLaserUltra.reticle.style.left = (e.clientX - 20) + 'px';
    GraceXLaserUltra.reticle.style.top = (e.clientY - 20) + 'px';
  },

  handleClick: (e) => {
    // Don't inspect laser UI itself
    if (e.target.closest('#gx-laser-ultra-panel') || 
        e.target.closest('#gx-laser-ultra-overlay') ||
        e.target.closest('#gx-laser-ultra-btn')) {
      return;
    }
    
    e.preventDefault();
    e.stopPropagation();
    
    GraceXLaserUltra.inspectTarget(e.target, e);
  },

  handleRightClick: (e) => {
    if (!GraceXLaserUltra.active) return;
    
    // Don't block right-click on laser UI
    if (e.target.closest('#gx-laser-ultra-panel')) {
      return;
    }
    
    e.preventDefault();
    e.stopPropagation();
    
    // Show context options
    GraceXLaserUltra.showContextMenu(e);
  },

  handleKeydown: (e) => {
    if (e.key === 'Escape') {
      GraceXLaserUltra.deactivate();
    }
  },

  setupKeyboardShortcuts: () => {
    document.addEventListener('keydown', (e) => {
      // Ctrl+Shift+L to toggle laser
      if (e.ctrlKey && e.shiftKey && e.key === 'L') {
        e.preventDefault();
        GraceXLaserUltra.toggle();
      }
    });
  },

  // ============================================
  // UNIVERSAL INSPECTION
  // ============================================

  inspectTarget: (element, event) => {
    GraceXLaserUltra.target = {
      element: element,
      event: event,
      data: GraceXLaserUltra.extractAllData(element, event)
    };
    
    GraceXLaserUltra.displayAnalysis();
  },

  extractAllData: (element, event) => {
    const data = {
      type: [],
      values: {},
      metadata: {}
    };
    
    // Element data
    data.values.tagName = element.tagName;
    data.values.id = element.id;
    data.values.className = element.className;
    data.values.textContent = element.textContent?.trim().substring(0, 200);
    data.type.push('DOM Element');
    
    // URLs and Links
    const href = element.href || element.getAttribute('href');
    if (href) {
      data.values.url = href;
      data.type.push('URL/Link');
      data.metadata.urlType = href.startsWith('http') ? 'External' : 'Internal';
    }
    
    // Data attributes
    Array.from(element.attributes).forEach(attr => {
      if (attr.name.startsWith('data-')) {
        data.values[attr.name] = attr.value;
        data.type.push('Data Attribute');
      }
    });
    
    // Images
    if (element.tagName === 'IMG') {
      data.values.src = element.src;
      data.values.alt = element.alt;
      data.type.push('Image');
    }
    
    // Forms and inputs
    if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
      data.values.inputType = element.type;
      data.values.name = element.name;
      data.values.value = element.value;
      data.type.push('Form Input');
    }
    
    // Extract emails, phone numbers, IDs from text
    const text = element.textContent || '';
    
    // Email regex
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
    const emails = text.match(emailRegex);
    if (emails) {
      data.values.emails = emails;
      data.type.push('Email Address');
    }
    
    // Phone regex (various formats)
    const phoneRegex = /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g;
    const phones = text.match(phoneRegex);
    if (phones) {
      data.values.phones = phones;
      data.type.push('Phone Number');
    }
    
    // URLs in text
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const urls = text.match(urlRegex);
    if (urls) {
      data.values.urlsInText = urls;
      data.type.push('URLs in Text');
    }
    
    // File paths
    const filePathRegex = /([A-Za-z]:\\|\/)[^\s<>"|?*]+/g;
    const filePaths = text.match(filePathRegex);
    if (filePaths) {
      data.values.filePaths = filePaths;
      data.type.push('File Path');
    }
    
    // User IDs, numbers
    const idRegex = /\b(id|ID|userId|user_id|#)[\s:=]?(\d+|[a-f0-9-]{8,})\b/gi;
    const ids = text.match(idRegex);
    if (ids) {
      data.values.identifiers = ids;
      data.type.push('Identifier/ID');
    }
    
    // Names (capitalized words)
    const nameRegex = /\b[A-Z][a-z]+ [A-Z][a-z]+\b/g;
    const names = text.match(nameRegex);
    if (names) {
      data.values.possibleNames = names;
      data.type.push('Possible Name');
    }
    
    // Coordinates
    data.metadata.position = {
      x: event.clientX,
      y: event.clientY,
      scrollX: window.scrollX,
      scrollY: window.scrollY
    };
    
    // Computed styles (key ones)
    const computed = window.getComputedStyle(element);
    data.metadata.styles = {
      display: computed.display,
      position: computed.position,
      zIndex: computed.zIndex,
      backgroundColor: computed.backgroundColor,
      color: computed.color
    };
    
    return data;
  },

  displayAnalysis: () => {
    const content = document.getElementById('gx-laser-ultra-content');
    const { data } = GraceXLaserUltra.target;
    
    let html = `
      <div style="margin-bottom: 20px;">
        <div style="font-size: 0.85rem; color: #64748b; margin-bottom: 5px;">TARGET TYPE</div>
        <div style="display: flex; gap: 6px; flex-wrap: wrap;">
          ${data.type.map(t => `
            <span style="
              padding: 4px 10px;
              background: rgba(245, 158, 11, 0.2);
              border: 1px solid rgba(245, 158, 11, 0.3);
              border-radius: 6px;
              font-size: 0.75rem;
              color: #f59e0b;
            ">${t}</span>
          `).join('')}
        </div>
      </div>
    `;
    
    // Display all extracted values
    for (const [key, value] of Object.entries(data.values)) {
      if (!value || (Array.isArray(value) && value.length === 0)) continue;
      
      html += `
        <div style="margin-bottom: 15px; padding-bottom: 15px; border-bottom: 1px solid rgba(148, 163, 184, 0.1);">
          <div style="font-size: 0.75rem; color: #64748b; margin-bottom: 5px; text-transform: uppercase; letter-spacing: 0.5px;">
            ${key.replace(/([A-Z])/g, ' $1').trim()}
          </div>
          <div style="color: #f1f5f9; word-break: break-all;">
            ${Array.isArray(value) ? value.join(', ') : value}
          </div>
        </div>
      `;
    }
    
    // Metadata
    if (data.metadata.position) {
      html += `
        <div style="margin-top: 20px; padding: 12px; background: rgba(245, 158, 11, 0.1); border-radius: 8px;">
          <div style="font-size: 0.75rem; color: #f59e0b; margin-bottom: 8px; font-weight: 600;">METADATA</div>
          <div style="font-size: 0.8rem; color: #94a3b8;">
            Position: (${data.metadata.position.x}, ${data.metadata.position.y})<br>
            Scroll: (${data.metadata.position.scrollX}, ${data.metadata.position.scrollY})
          </div>
        </div>
      `;
    }
    
    content.innerHTML = html;
  },

  // ============================================
  // ACTIONS
  // ============================================

  copyTargetData: () => {
    const text = JSON.stringify(GraceXLaserUltra.target.data, null, 2);
    navigator.clipboard.writeText(text).then(() => {
      alert('✅ Data copied to clipboard!');
    });
  },

  openTarget: () => {
    const { data } = GraceXLaserUltra.target;
    
    if (data.values.url) {
      window.open(data.values.url, '_blank');
    } else if (data.values.urlsInText && data.values.urlsInText[0]) {
      window.open(data.values.urlsInText[0], '_blank');
    } else if (data.values.src) {
      window.open(data.values.src, '_blank');
    } else {
      alert('No URL found to open');
    }
  },

  webSearch: () => {
    const { data } = GraceXLaserUltra.target;
    let query = '';
    
    if (data.values.possibleNames && data.values.possibleNames[0]) {
      query = data.values.possibleNames[0];
    } else if (data.values.textContent) {
      query = data.values.textContent.substring(0, 100);
    } else if (data.values.emails && data.values.emails[0]) {
      query = data.values.emails[0];
    }
    
    if (query) {
      window.open(`https://www.google.com/search?q=${encodeURIComponent(query)}`, '_blank');
    } else {
      alert('No searchable content found');
    }
  },

  aiAnalyze: () => {
    // Send to Core module for AI analysis
    const { data } = GraceXLaserUltra.target;
    const summary = `Analyze this data:\n${JSON.stringify(data, null, 2)}`;
    
    // Try to send to brain if available
    if (window.GraceX && typeof window.GraceX.think === 'function') {
      window.GraceX.think({
        text: summary,
        module: 'core',
        mode: 'laser-analysis'
      });
      alert('✅ Sent to AI brain for analysis');
    } else {
      alert('AI brain not available - data in console');
      console.log('LASER Analysis:', data);
    }
  },

  showContextMenu: (e) => {
    // You can add a custom context menu here if needed
    alert('Right-click context menu - coming soon!\nFor now, use the action buttons.');
  }
};

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    GraceXLaserUltra.init();
  });
} else {
  GraceXLaserUltra.init();
}

// Export for use in other modules
window.GraceXLaserUltra = GraceXLaserUltra;
