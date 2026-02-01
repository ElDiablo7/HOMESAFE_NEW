/* ============================================
   GRACE-X UI CONTROLS
   Sidebar Toggle & Theme System
   © 2026 Zachary Charles Anthony Crockett
   ============================================ */

(function() {
    'use strict';
    
    // Wait for DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
    function init() {
        // DISABLED BY USER REQUEST - Jan 29, 2026
        // setupSidebarToggle();
        // setupThemeSystem();
        loadSavedPreferences();
    }
    
    // ============================================
    // SIDEBAR COLLAPSE/EXPAND
    // ============================================
    function setupSidebarToggle() {
        const aside = document.querySelector('.aside');
        if (!aside) return;
        
        // Create toggle button
        const toggleBtn = document.createElement('button');
        toggleBtn.className = 'sidebar-toggle';
        toggleBtn.innerHTML = '☰';
        toggleBtn.setAttribute('title', 'Toggle Sidebar');
        document.body.appendChild(toggleBtn);
        
        // Load saved state
        const collapsed = localStorage.getItem('gracex-sidebar-collapsed') === 'true';
        if (collapsed) {
            aside.classList.add('collapsed');
        }
        
        // Toggle on click
        toggleBtn.addEventListener('click', () => {
            const isCollapsed = aside.classList.toggle('collapsed');
            localStorage.setItem('gracex-sidebar-collapsed', isCollapsed);
            
            // Announce state change
            if (window.GRACEX_TTS) {
                GRACEX_TTS.speak(isCollapsed ? 'Sidebar hidden' : 'Sidebar shown');
            }
        });
        
        // Mobile: tap outside to close
        if (window.innerWidth <= 768) {
            document.getElementById('content')?.addEventListener('click', () => {
                if (aside.classList.contains('show')) {
                    aside.classList.remove('show');
                }
            });
        }
    }
    
    // ============================================
    // THEME SYSTEM
    // ============================================
    function setupThemeSystem() {
        // Create theme toggle button
        const themeBtn = document.createElement('button');
        themeBtn.id = 'theme-toggle';
        themeBtn.innerHTML = '🎨';
        themeBtn.setAttribute('title', 'Change Theme');
        themeBtn.style.cssText = `
            position: fixed;
            bottom: 90px;
            right: 20px;
            width: 56px;
            height: 56px;
            border-radius: 50%;
            background: linear-gradient(135deg, #00f0ff 0%, #ff00ff 100%);
            border: none;
            color: white;
            font-size: 24px;
            cursor: pointer;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            z-index: 9998;
            transition: transform 0.2s;
        `;
        document.body.appendChild(themeBtn);
        
        // Create theme selector panel
        const themeSelector = document.createElement('div');
        themeSelector.className = 'theme-selector';
        themeSelector.innerHTML = `
            <div class="theme-option theme-titan" data-theme="titan" title="TITAN - Cyan/Magenta"></div>
            <div class="theme-option theme-sentinel" data-theme="sentinel" title="SENTINEL - Professional Blue"></div>
            <div class="theme-option theme-forge" data-theme="forge" title="FORGE - Matrix Green"></div>
            <div class="theme-option theme-venus" data-theme="venus" title="VENUS - Pink/Purple"></div>
            <div class="theme-option theme-stealth" data-theme="stealth" title="STEALTH - Dark Gray"></div>
            <div class="theme-option theme-solar" data-theme="solar" title="SOLAR - Light Mode"></div>
        `;
        document.body.appendChild(themeSelector);
        
        // Toggle theme selector
        themeBtn.addEventListener('click', () => {
            themeSelector.classList.toggle('show');
        });
        
        // Theme selection
        themeSelector.querySelectorAll('.theme-option').forEach(option => {
            option.addEventListener('click', () => {
                const theme = option.dataset.theme;
                setTheme(theme);
                themeSelector.classList.remove('show');
                
                // Update active state
                themeSelector.querySelectorAll('.theme-option').forEach(opt => {
                    opt.classList.remove('active');
                });
                option.classList.add('active');
                
                // Announce theme change
                if (window.GRACEX_TTS) {
                    GRACEX_TTS.speak(`${theme} theme activated`);
                }
            });
        });
        
        // Close theme selector when clicking outside
        document.addEventListener('click', (e) => {
            if (!themeBtn.contains(e.target) && !themeSelector.contains(e.target)) {
                themeSelector.classList.remove('show');
            }
        });
        
        // Hover effects
        themeBtn.addEventListener('mouseenter', () => {
            themeBtn.style.transform = 'scale(1.1)';
        });
        themeBtn.addEventListener('mouseleave', () => {
            themeBtn.style.transform = 'scale(1)';
        });
    }
    
    function setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('gracex-theme', theme);
        
        console.log(`[GRACE-X] Theme changed to: ${theme}`);
        
        // Dispatch custom event for other systems to react
        window.dispatchEvent(new CustomEvent('gracex-theme-change', { 
            detail: { theme } 
        }));
    }
    
    function loadSavedPreferences() {
        // Load theme
        const savedTheme = localStorage.getItem('gracex-theme') || 'titan';
        setTheme(savedTheme);
        
        // Mark active theme in selector
        const activeOption = document.querySelector(`.theme-option[data-theme="${savedTheme}"]`);
        if (activeOption) {
            activeOption.classList.add('active');
        }
    }
    
    // ============================================
    // EXPORT TO WINDOW
    // ============================================
    window.GRACEX_UI = {
        setTheme,
        toggleSidebar: () => {
            const aside = document.querySelector('.aside');
            if (aside) {
                aside.classList.toggle('collapsed');
            }
        }
    };
    
    console.log('[GRACE-X UI] Controls initialized');
})();
