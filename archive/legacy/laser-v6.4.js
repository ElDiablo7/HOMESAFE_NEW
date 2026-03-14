/**
 * GRACE-X LASER™ — Element Inspector & Resource Allocator
 * Click anything to deep-inspect, analyze, and focus resources
 * Engineered by Zac Crockett
 */

const GraceXLaser = {
  active: false,
  overlay: null,
  panel: null,
  targetElement: null,
  reticle: null,

  // ============================================
  // INITIALIZATION
  // ============================================

  init: () => {
    GraceXLaser.createLaserButton();
    GraceXLaser.createOverlay();
    GraceXLaser.createPanel();
    GraceXLaser.createReticle();
    GraceXUtils.log.success('Laser', 'LASER™ Inspector initialized');
  },

  // ============================================
  // UI COMPONENTS
  // ============================================

  createLaserButton: () => {
    const button = document.createElement('button');
    button.id = 'gx-laser-btn';
    button.className = 'gx-laser-button';
    button.innerHTML = '🎯';
    button.title = 'LASER™ Global Inspector - Click ANY element ANYWHERE on this page (Ctrl+Shift+L)';
    
    button.addEventListener('click', () => {
      GraceXLaser.toggle();
    });
    
    document.body.appendChild(button);
  },

  createOverlay: () => {
    const overlay = document.createElement('div');
    overlay.id = 'gx-laser-overlay';
    overlay.className = 'gx-laser-overlay';
    overlay.innerHTML = `
      <div class="gx-laser-header">
        <div class="gx-laser-title">
          <span class="gx-laser-icon">🎯</span>
          <span>LASER™ GLOBAL MODE</span>
          <span class="gx-laser-pulse"></span>
        </div>
        <div class="gx-laser-instructions">
          Click ANYTHING on this page • Works on ALL elements • ESC to exit
        </div>
      </div>
    `;
    
    document.body.appendChild(overlay);
    GraceXLaser.overlay = overlay;
  },

  createPanel: () => {
    const panel = document.createElement('div');
    panel.id = 'gx-laser-panel';
    panel.className = 'gx-laser-panel';
    panel.innerHTML = `
      <div class="gx-laser-panel-header">
        <div class="gx-laser-panel-title">🎯 LASER™ Analysis</div>
        <button class="gx-laser-panel-close">×</button>
      </div>
      <div class="gx-laser-panel-content" id="gx-laser-content">
        <div class="gx-laser-empty">Click an element to begin analysis</div>
      </div>
      <div class="gx-laser-panel-actions">
        <button class="gx-btn gx-btn-sm" id="gx-laser-focus">⚡ Focus Resources</button>
        <button class="gx-btn gx-btn-sm" id="gx-laser-inspect">🔍 DevTools</button>
        <button class="gx-btn gx-btn-sm" id="gx-laser-analyze">🧠 AI Analyze</button>
      </div>
    `;
    
    document.body.appendChild(panel);
    GraceXLaser.panel = panel;
    
    // Event listeners
    panel.querySelector('.gx-laser-panel-close').addEventListener('click', () => {
      GraceXLaser.deactivate();
    });
    
    panel.querySelector('#gx-laser-focus').addEventListener('click', () => {
      GraceXLaser.focusResources();
    });
    
    panel.querySelector('#gx-laser-inspect').addEventListener('click', () => {
      GraceXLaser.openDevTools();
    });
    
    panel.querySelector('#gx-laser-analyze').addEventListener('click', () => {
      GraceXLaser.aiAnalyze();
    });
  },

  createReticle: () => {
    const reticle = document.createElement('div');
    reticle.id = 'gx-laser-reticle';
    reticle.className = 'gx-laser-reticle';
    reticle.innerHTML = `
      <div class="gx-reticle-crosshair">
        <div class="gx-reticle-line gx-reticle-top"></div>
        <div class="gx-reticle-line gx-reticle-right"></div>
        <div class="gx-reticle-line gx-reticle-bottom"></div>
        <div class="gx-reticle-line gx-reticle-left"></div>
        <div class="gx-reticle-center"></div>
      </div>
    `;
    
    document.body.appendChild(reticle);
    GraceXLaser.reticle = reticle;
  },

  // ============================================
  // ACTIVATION / DEACTIVATION
  // ============================================

  toggle: () => {
    if (GraceXLaser.active) {
      GraceXLaser.deactivate();
    } else {
      GraceXLaser.activate();
    }
  },

  activate: () => {
    GraceXLaser.active = true;
    document.body.classList.add('gx-laser-active');
    GraceXLaser.overlay.classList.add('gx-laser-show');
    GraceXLaser.panel.classList.add('gx-laser-show');
    
    // Add event listeners
    document.addEventListener('mousemove', GraceXLaser.handleMouseMove);
    document.addEventListener('click', GraceXLaser.handleClick, true);
    document.addEventListener('keydown', GraceXLaser.handleKeydown);
    
    GraceXUtils.log.success('Laser', 'LASER™ activated - targeting mode enabled');
    GraceXUtils.showSuccess('LASER™ activated - click any element');
  },

  deactivate: () => {
    GraceXLaser.active = false;
    document.body.classList.remove('gx-laser-active');
    GraceXLaser.overlay.classList.remove('gx-laser-show');
    GraceXLaser.panel.classList.remove('gx-laser-show');
    GraceXLaser.reticle.classList.remove('gx-reticle-show');
    
    // Remove event listeners
    document.removeEventListener('mousemove', GraceXLaser.handleMouseMove);
    document.removeEventListener('click', GraceXLaser.handleClick, true);
    document.removeEventListener('keydown', GraceXLaser.handleKeydown);
    
    // Clear highlights
    document.querySelectorAll('.gx-laser-highlight').forEach(el => {
      el.classList.remove('gx-laser-highlight');
    });
    
    GraceXUtils.log.info('Laser', 'LASER™ deactivated');
  },

  // ============================================
  // EVENT HANDLERS
  // ============================================

  handleMouseMove: (e) => {
    // Move reticle to cursor
    GraceXLaser.reticle.style.left = e.pageX + 'px';
    GraceXLaser.reticle.style.top = e.pageY + 'px';
    GraceXLaser.reticle.classList.add('gx-reticle-show');
    
    // Highlight hovered element (any element, anywhere!)
    const target = document.elementFromPoint(e.clientX, e.clientY);
    if (target && !target.closest('.gx-laser-panel, #gx-laser-btn')) {
      // Remove previous highlights
      document.querySelectorAll('.gx-laser-highlight').forEach(el => {
        el.classList.remove('gx-laser-highlight');
      });
      
      // Add new highlight - works on ANY element
      target.classList.add('gx-laser-highlight');
    }
  },

  handleClick: (e) => {
    const target = e.target;
    
    // Only ignore LASER's own UI - inspect everything else!
    if (target.closest('.gx-laser-panel, #gx-laser-btn')) {
      return;
    }
    
    // Allow overlay header clicks to pass through for instructions
    if (target.closest('.gx-laser-overlay') && !target.closest('a, button')) {
      return;
    }
    
    e.preventDefault();
    e.stopPropagation();
    
    GraceXLaser.inspectElement(target);
  },

  handleKeydown: (e) => {
    if (e.key === 'Escape') {
      GraceXLaser.deactivate();
    }
  },

  // ============================================
  // ELEMENT INSPECTION
  // ============================================

  inspectElement: (element) => {
    GraceXLaser.targetElement = element;
    
    // Flash the reticle
    GraceXLaser.reticle.classList.add('gx-reticle-locked');
    setTimeout(() => {
      GraceXLaser.reticle.classList.remove('gx-reticle-locked');
    }, 500);
    
    // Generate analysis
    const analysis = GraceXLaser.analyzeElement(element);
    
    // Display in panel
    GraceXLaser.displayAnalysis(analysis);
    
    // Scroll element into view
    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    
    GraceXUtils.log.info('Laser', 'Element inspected', element);
  },

  analyzeElement: (element) => {
    const rect = element.getBoundingClientRect();
    const styles = window.getComputedStyle(element);
    
    // Get all attributes
    const attributes = {};
    for (let attr of element.attributes) {
      attributes[attr.name] = attr.value;
    }
    
    // Get event listeners (approximate)
    const eventListeners = [];
    const eventProps = Object.keys(element).filter(key => key.startsWith('on'));
    eventProps.forEach(prop => {
      if (element[prop]) eventListeners.push(prop.slice(2));
    });
    
    // Performance metrics
    const performance = {
      childCount: element.children.length,
      textLength: element.textContent?.length || 0,
      hasImages: element.querySelectorAll('img').length,
      hasScripts: element.querySelectorAll('script').length,
      depth: GraceXLaser.getElementDepth(element)
    };
    
    // Generate CSS selector
    const cssSelector = GraceXLaser.generateCSSSelector(element);
    
    // Generate XPath
    const xpath = GraceXLaser.generateXPath(element);
    
    // Get DOM path
    const domPath = GraceXLaser.getDOMPath(element);
    
    // Check for Shadow DOM
    const hasShadowRoot = !!element.shadowRoot;
    
    // Get data attributes
    const dataAttributes = {};
    Object.keys(attributes).forEach(key => {
      if (key.startsWith('data-')) {
        dataAttributes[key] = attributes[key];
      }
    });
    
    return {
      tag: element.tagName.toLowerCase(),
      id: element.id || null,
      classes: Array.from(element.classList),
      attributes: attributes,
      dataAttributes: dataAttributes,
      cssSelector: cssSelector,
      xpath: xpath,
      domPath: domPath,
      hasShadowRoot: hasShadowRoot,
      dimensions: {
        width: Math.round(rect.width),
        height: Math.round(rect.height),
        top: Math.round(rect.top),
        left: Math.round(rect.left),
        right: Math.round(rect.right),
        bottom: Math.round(rect.bottom)
      },
      viewport: {
        inViewport: GraceXLaser.isInViewport(element),
        visiblePercentage: GraceXLaser.getVisiblePercentage(element)
      },
      styles: {
        display: styles.display,
        position: styles.position,
        zIndex: styles.zIndex,
        backgroundColor: styles.backgroundColor,
        color: styles.color,
        fontSize: styles.fontSize,
        fontFamily: styles.fontFamily,
        opacity: styles.opacity,
        visibility: styles.visibility
      },
      eventListeners: eventListeners,
      performance: performance,
      innerHTML: element.innerHTML.substring(0, 500) + (element.innerHTML.length > 500 ? '...' : ''),
      textContent: element.textContent?.substring(0, 200) + (element.textContent?.length > 200 ? '...' : ''),
      outerHTML: element.outerHTML.substring(0, 300) + (element.outerHTML.length > 300 ? '...' : '')
    };
  },

  // Generate unique CSS selector for element
  generateCSSSelector: (element) => {
    if (element.id) {
      return '#' + element.id;
    }
    
    const path = [];
    let current = element;
    
    while (current && current.nodeType === Node.ELEMENT_NODE) {
      let selector = current.nodeName.toLowerCase();
      
      if (current.id) {
        selector += '#' + current.id;
        path.unshift(selector);
        break;
      } else {
        let sibling = current;
        let nth = 1;
        
        while (sibling.previousElementSibling) {
          sibling = sibling.previousElementSibling;
          if (sibling.nodeName.toLowerCase() === selector) nth++;
        }
        
        if (nth > 1) {
          selector += ':nth-of-type(' + nth + ')';
        }
      }
      
      path.unshift(selector);
      current = current.parentElement;
    }
    
    return path.join(' > ');
  },

  // Generate XPath for element
  generateXPath: (element) => {
    if (element.id) {
      return '//*[@id="' + element.id + '"]';
    }
    
    const path = [];
    let current = element;
    
    while (current && current.nodeType === Node.ELEMENT_NODE) {
      let index = 0;
      let sibling = current.previousSibling;
      
      while (sibling) {
        if (sibling.nodeType === Node.ELEMENT_NODE && sibling.nodeName === current.nodeName) {
          index++;
        }
        sibling = sibling.previousSibling;
      }
      
      const tagName = current.nodeName.toLowerCase();
      const pathIndex = index > 0 ? '[' + (index + 1) + ']' : '';
      path.unshift(tagName + pathIndex);
      
      current = current.parentElement;
    }
    
    return '/' + path.join('/');
  },

  // Get DOM path as array
  getDOMPath: (element) => {
    const path = [];
    let current = element;
    
    while (current) {
      let name = current.nodeName.toLowerCase();
      if (current.id) {
        name += '#' + current.id;
      } else if (current.classList.length > 0) {
        name += '.' + Array.from(current.classList).join('.');
      }
      path.unshift(name);
      current = current.parentElement;
    }
    
    return path;
  },

  // Check if element is in viewport
  isInViewport: (element) => {
    const rect = element.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
  },

  // Get visible percentage of element
  getVisiblePercentage: (element) => {
    const rect = element.getBoundingClientRect();
    const windowHeight = window.innerHeight || document.documentElement.clientHeight;
    const windowWidth = window.innerWidth || document.documentElement.clientWidth;
    
    const visibleHeight = Math.min(rect.bottom, windowHeight) - Math.max(rect.top, 0);
    const visibleWidth = Math.min(rect.right, windowWidth) - Math.max(rect.left, 0);
    
    if (visibleHeight <= 0 || visibleWidth <= 0) return 0;
    
    const visibleArea = visibleHeight * visibleWidth;
    const totalArea = rect.height * rect.width;
    
    return totalArea > 0 ? Math.round((visibleArea / totalArea) * 100) : 0;
  },

  getElementDepth: (element) => {
    let depth = 0;
    let current = element;
    while (current.parentElement) {
      depth++;
      current = current.parentElement;
    }
    return depth;
  },

  displayAnalysis: (analysis) => {
    const content = document.getElementById('gx-laser-content');
    
    const html = `
      <div class="gx-laser-section">
        <div class="gx-laser-section-title">📍 Element Identity</div>
        <div class="gx-laser-data-grid">
          <div class="gx-laser-data-item">
            <span class="gx-laser-data-label">Tag:</span>
            <span class="gx-laser-data-value">&lt;${analysis.tag}&gt;</span>
          </div>
          ${analysis.id ? `
          <div class="gx-laser-data-item">
            <span class="gx-laser-data-label">ID:</span>
            <span class="gx-laser-data-value">#${analysis.id}</span>
          </div>
          ` : ''}
          ${analysis.classes.length > 0 ? `
          <div class="gx-laser-data-item">
            <span class="gx-laser-data-label">Classes:</span>
            <span class="gx-laser-data-value">${analysis.classes.map(c => '.' + c).join(' ')}</span>
          </div>
          ` : ''}
        </div>
      </div>
      
      <div class="gx-laser-section">
        <div class="gx-laser-section-title">🎯 Selectors (Click to Copy)</div>
        <div class="gx-laser-selector-group">
          <div class="gx-laser-selector-item" onclick="GraceXUtils.copyToClipboard('${analysis.cssSelector.replace(/'/g, "\\'")}')">
            <div class="gx-laser-selector-label">CSS Selector:</div>
            <div class="gx-laser-selector-value">${GraceXUtils.escapeHtml(analysis.cssSelector)}</div>
          </div>
          <div class="gx-laser-selector-item" onclick="GraceXUtils.copyToClipboard('${analysis.xpath.replace(/'/g, "\\'")}')">
            <div class="gx-laser-selector-label">XPath:</div>
            <div class="gx-laser-selector-value">${GraceXUtils.escapeHtml(analysis.xpath)}</div>
          </div>
        </div>
      </div>
      
      <div class="gx-laser-section">
        <div class="gx-laser-section-title">📂 DOM Path</div>
        <div class="gx-laser-dom-path">
          ${analysis.domPath.map((item, i) => `
            <span class="gx-dom-path-item">${item}</span>${i < analysis.domPath.length - 1 ? '<span class="gx-dom-path-arrow">→</span>' : ''}
          `).join('')}
        </div>
      </div>
      
      <div class="gx-laser-section">
        <div class="gx-laser-section-title">📐 Dimensions & Viewport</div>
        <div class="gx-laser-data-grid">
          <div class="gx-laser-data-item">
            <span class="gx-laser-data-label">Size:</span>
            <span class="gx-laser-data-value">${analysis.dimensions.width}×${analysis.dimensions.height}px</span>
          </div>
          <div class="gx-laser-data-item">
            <span class="gx-laser-data-label">Position:</span>
            <span class="gx-laser-data-value">x:${analysis.dimensions.left} y:${analysis.dimensions.top}</span>
          </div>
          <div class="gx-laser-data-item">
            <span class="gx-laser-data-label">In Viewport:</span>
            <span class="gx-laser-data-value">${analysis.viewport.inViewport ? '✅ Yes' : '❌ No'}</span>
          </div>
          <div class="gx-laser-data-item">
            <span class="gx-laser-data-label">Visible:</span>
            <span class="gx-laser-data-value">${analysis.viewport.visiblePercentage}%</span>
          </div>
        </div>
      </div>
      
      <div class="gx-laser-section">
        <div class="gx-laser-section-title">🎨 Computed Styles</div>
        <div class="gx-laser-data-grid">
          ${Object.entries(analysis.styles).map(([key, value]) => `
            <div class="gx-laser-data-item">
              <span class="gx-laser-data-label">${key}:</span>
              <span class="gx-laser-data-value">${value}</span>
            </div>
          `).join('')}
        </div>
      </div>
      
      ${analysis.eventListeners.length > 0 ? `
      <div class="gx-laser-section">
        <div class="gx-laser-section-title">⚡ Event Listeners</div>
        <div class="gx-laser-badges">
          ${analysis.eventListeners.map(event => `
            <span class="gx-badge gx-badge-info">${event}</span>
          `).join('')}
        </div>
      </div>
      ` : ''}
      
      <div class="gx-laser-section">
        <div class="gx-laser-section-title">📊 Performance Metrics</div>
        <div class="gx-laser-data-grid">
          <div class="gx-laser-data-item">
            <span class="gx-laser-data-label">Children:</span>
            <span class="gx-laser-data-value">${analysis.performance.childCount}</span>
          </div>
          <div class="gx-laser-data-item">
            <span class="gx-laser-data-label">Depth:</span>
            <span class="gx-laser-data-value">${analysis.performance.depth}</span>
          </div>
          <div class="gx-laser-data-item">
            <span class="gx-laser-data-label">Images:</span>
            <span class="gx-laser-data-value">${analysis.performance.hasImages}</span>
          </div>
          <div class="gx-laser-data-item">
            <span class="gx-laser-data-label">Text Length:</span>
            <span class="gx-laser-data-value">${analysis.performance.textLength}</span>
          </div>
          ${analysis.hasShadowRoot ? `
          <div class="gx-laser-data-item">
            <span class="gx-laser-data-label">Shadow DOM:</span>
            <span class="gx-laser-data-value">✅ Yes</span>
          </div>
          ` : ''}
        </div>
      </div>
      
      ${Object.keys(analysis.dataAttributes).length > 0 ? `
      <div class="gx-laser-section">
        <div class="gx-laser-section-title">📊 Data Attributes</div>
        <div class="gx-laser-code">
          ${Object.entries(analysis.dataAttributes).map(([key, value]) => `
            <div><span class="gx-code-key">${key}</span>=<span class="gx-code-value">"${GraceXUtils.escapeHtml(value)}"</span></div>
          `).join('')}
        </div>
      </div>
      ` : ''}
      
      ${Object.keys(analysis.attributes).length > 0 ? `
      <div class="gx-laser-section">
        <div class="gx-laser-section-title">🏷️ All Attributes</div>
        <div class="gx-laser-code">
          ${Object.entries(analysis.attributes).map(([key, value]) => `
            <div><span class="gx-code-key">${key}</span>=<span class="gx-code-value">"${GraceXUtils.escapeHtml(value)}"</span></div>
          `).join('')}
        </div>
      </div>
      ` : ''}
      
      <div class="gx-laser-section">
        <div class="gx-laser-section-title">📄 Content Preview</div>
        <div class="gx-laser-code">
          ${GraceXUtils.escapeHtml(analysis.innerHTML)}
        </div>
      </div>
    `;
    
    content.innerHTML = html;
  },

  // ============================================
  // ACTIONS
  // ============================================

  focusResources: async () => {
    if (!GraceXLaser.targetElement) {
      GraceXUtils.showError('No element selected');
      return;
    }
    
    const loading = GraceXUtils.showLoading('Focusing all resources on target...');
    
    try {
      // Highlight the element prominently
      GraceXLaser.targetElement.style.outline = '3px solid #06b6d4';
      GraceXLaser.targetElement.style.outlineOffset = '4px';
      GraceXLaser.targetElement.style.boxShadow = '0 0 40px rgba(6, 182, 212, 0.6)';
      
      // Scroll and center
      GraceXLaser.targetElement.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center' 
      });
      
      // Log to console for inspection
      console.log('🎯 LASER™ FOCUS:', GraceXLaser.targetElement);
      console.log('📊 Analysis:', GraceXLaser.analyzeElement(GraceXLaser.targetElement));
      
      // Expose globally
      window.$LASER_TARGET = GraceXLaser.targetElement;
      
      setTimeout(() => {
        loading.hide();
        GraceXUtils.showSuccess('Resources focused! Check console: window.$LASER_TARGET');
      }, 1000);
      
    } catch (error) {
      loading.hide();
      GraceXUtils.showError('Failed to focus resources');
      GraceXUtils.log.error('Laser', 'Focus failed', error);
    }
  },

  openDevTools: () => {
    if (!GraceXLaser.targetElement) {
      GraceXUtils.showError('No element selected');
      return;
    }
    
    // Log element for inspection
    console.log('🎯 LASER™ DevTools Inspect:', GraceXLaser.targetElement);
    
    // Try to trigger inspect (browser dependent)
    if (window.devtools && window.devtools.inspectElement) {
      window.devtools.inspectElement(GraceXLaser.targetElement);
    }
    
    GraceXUtils.showSuccess('Element logged to console - open DevTools (F12)');
  },

  aiAnalyze: async () => {
    if (!GraceXLaser.targetElement) {
      GraceXUtils.showError('No element selected');
      return;
    }
    
    const loading = GraceXUtils.showLoading('AI analyzing element...');
    
    try {
      const analysis = GraceXLaser.analyzeElement(GraceXLaser.targetElement);
      
      // Build AI prompt
      const prompt = `Analyze this UI element and provide insights:

Tag: ${analysis.tag}
Classes: ${analysis.classes.join(', ')}
Dimensions: ${analysis.dimensions.width}×${analysis.dimensions.height}px
Text: ${analysis.textContent}

Provide:
1. Purpose assessment
2. UX/UI recommendations
3. Accessibility improvements
4. Performance optimizations
5. Best practice violations (if any)`;

      // Call AI API
      const response = await fetch(window.GRACEX_BRAIN_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          module: 'core',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.7,
          max_tokens: 1000
        })
      });
      
      const data = await response.json();
      
      loading.hide();
      
      // Display AI analysis
      if (data.success) {
        const content = document.getElementById('gx-laser-content');
        content.innerHTML += `
          <div class="gx-laser-section">
            <div class="gx-laser-section-title">🧠 AI Analysis</div>
            <div class="gx-laser-ai-response">
              ${data.response.replace(/\n/g, '<br>')}
            </div>
          </div>
        `;
        
        GraceXUtils.showSuccess('AI analysis complete');
      } else {
        GraceXUtils.showError('AI analysis failed');
      }
      
    } catch (error) {
      loading.hide();
      GraceXUtils.showError('AI analysis failed');
      GraceXUtils.log.error('Laser', 'AI analysis failed', error);
    }
  }
};

// Initialize on load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', GraceXLaser.init);
} else {
  GraceXLaser.init();
}

// Keyboard shortcut: Ctrl/Cmd + Shift + L
document.addEventListener('keydown', (e) => {
  if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'L') {
    e.preventDefault();
    GraceXLaser.toggle();
  }
});

// Make globally available
window.GraceXLaser = GraceXLaser;

GraceXUtils.log.success('Laser', 'LASER™ system ready - Press Ctrl+Shift+L or click 🎯 button');
