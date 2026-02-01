// ============================================
// GRACE-X Gallery™ JavaScript Handler
// Media Browser for Images & Videos
// © 2026 Zachary Charles Anthony Crockett
// ============================================

(function() {
    'use strict';
    
    const API_BASE = window.GRACEX_BRAIN_API || window.GRACEX_API_BASE || 'http://localhost:3000';
    const MEDIA_API = `${API_BASE}/api/gallery/media`;
    
    let currentFolder = '';
    let currentItems = [];
    let currentViewIndex = -1;
    let isListView = false;
    
    // Initialize on load
    document.addEventListener('DOMContentLoaded', function() {
        loadGallery('');
        setupKeyboardNavigation();
    });
    
    // Load gallery contents
    async function loadGallery(folder) {
        const loadingEl = document.getElementById('loading');
        const folderListEl = document.getElementById('folder-list');
        const mediaGridEl = document.getElementById('media-grid');
        const emptyStateEl = document.getElementById('empty-state');
        
        // Show loading
        if (loadingEl) loadingEl.style.display = 'block';
        if (folderListEl) folderListEl.innerHTML = '';
        if (mediaGridEl) mediaGridEl.innerHTML = '';
        if (emptyStateEl) emptyStateEl.style.display = 'none';
        
        try {
            const response = await fetch(`${API_BASE}/api/gallery/list?folder=${encodeURIComponent(folder)}`);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            currentFolder = folder;
            currentItems = data.items || [];
            
            // Update breadcrumb
            updateBreadcrumb(folder);
            
            // Separate folders and media
            const folders = currentItems.filter(item => item.type === 'folder');
            const media = currentItems.filter(item => item.type === 'image' || item.type === 'video');
            
            // Render folders
            if (folders.length > 0) {
                renderFolders(folders);
            }
            
            // Render media
            if (media.length > 0) {
                renderMedia(media);
            } else if (folders.length === 0) {
                // Show empty state
                if (emptyStateEl) emptyStateEl.style.display = 'block';
            }
            
        } catch (error) {
            console.error('[Gallery] Load error:', error);
            if (mediaGridEl) {
                mediaGridEl.innerHTML = `
                    <div style="grid-column:1/-1;text-align:center;padding:40px;color:rgba(255,255,255,0.5);">
                        <p>❌ Failed to load gallery</p>
                        <p style="font-size:0.9em;margin-top:10px;">${error.message}</p>
                        <button class="btn" onclick="loadGallery('${folder}')" style="margin-top:20px;">Retry</button>
                    </div>
                `;
            }
        } finally {
            if (loadingEl) loadingEl.style.display = 'none';
        }
    }
    
    // Render folders
    function renderFolders(folders) {
        const folderListEl = document.getElementById('folder-list');
        if (!folderListEl) return;
        
        folderListEl.innerHTML = folders.map(folder => `
            <div class="folder-item" onclick="navigateTo('${folder.path}')">
                <div class="folder-icon">📁</div>
                <div class="folder-name">${escapeHtml(folder.name)}</div>
                <div class="folder-count">Folder</div>
            </div>
        `).join('');
    }
    
    // Render media grid
    function renderMedia(media) {
        const mediaGridEl = document.getElementById('media-grid');
        if (!mediaGridEl) return;
        
        mediaGridEl.innerHTML = media.map((item, index) => {
            const mediaUrl = `${MEDIA_API}/${item.path}`;
            const sizeStr = formatFileSize(item.size);
            
            if (item.type === 'image') {
                return `
                    <div class="media-item" onclick="openViewer(${index})">
                        <img src="${mediaUrl}" alt="${escapeHtml(item.name)}" loading="lazy">
                        <div class="media-type-badge image">IMG</div>
                        <div class="media-overlay">
                            <div class="media-name">${escapeHtml(item.name)}</div>
                            <div class="media-size">${sizeStr}</div>
                        </div>
                    </div>
                `;
            } else if (item.type === 'video') {
                return `
                    <div class="media-item" onclick="openViewer(${index})">
                        <video src="${mediaUrl}" preload="metadata" muted></video>
                        <div class="media-type-badge video">VID</div>
                        <div class="media-overlay">
                            <div class="media-name">${escapeHtml(item.name)}</div>
                            <div class="media-size">${sizeStr}</div>
                        </div>
                    </div>
                `;
            }
            return '';
        }).join('');
        
        // Store media items for viewer
        window.galleryMedia = media;
    }
    
    // Update breadcrumb
    function updateBreadcrumb(folder) {
        const breadcrumbEl = document.getElementById('breadcrumb');
        if (!breadcrumbEl) return;
        
        const parts = folder ? folder.split('/').filter(p => p) : [];
        let html = '<span class="breadcrumb-item" onclick="navigateTo(\'\')">Home</span>';
        
        let currentPath = '';
        parts.forEach((part, index) => {
            currentPath += (currentPath ? '/' : '') + part;
            html += '<span class="breadcrumb-separator">›</span>';
            html += `<span class="breadcrumb-item" onclick="navigateTo('${currentPath}')">${escapeHtml(part)}</span>`;
        });
        
        breadcrumbEl.innerHTML = html;
    }
    
    // Navigate to folder
    window.navigateTo = function(folder) {
        loadGallery(folder);
    };
    
    // Go home
    window.goHome = function() {
        navigateTo('');
    };
    
    // Refresh gallery
    window.refreshGallery = function() {
        loadGallery(currentFolder);
    };
    
    // Toggle view (list/grid)
    window.toggleView = function() {
        isListView = !isListView;
        const mediaGridEl = document.getElementById('media-grid');
        if (mediaGridEl) {
            mediaGridEl.style.gridTemplateColumns = isListView 
                ? 'repeat(auto-fill, minmax(100%, 1fr))' 
                : 'repeat(auto-fill, minmax(250px, 1fr))';
        }
    };
    
    // Open media viewer
    window.openViewer = function(index) {
        const media = currentItems.filter(item => item.type === 'image' || item.type === 'video');
        if (index < 0 || index >= media.length) return;
        
        currentViewIndex = index;
        const item = media[index];
        const mediaUrl = `${MEDIA_API}/${item.path}`;
        
        const viewerModal = document.getElementById('viewer-modal');
        const viewerMedia = document.getElementById('viewer-media');
        
        if (!viewerModal || !viewerMedia) return;
        
        if (item.type === 'image') {
            viewerMedia.innerHTML = `<img src="${mediaUrl}" alt="${escapeHtml(item.name)}">`;
        } else if (item.type === 'video') {
            viewerMedia.innerHTML = `
                <video src="${mediaUrl}" controls autoplay style="max-width:100%;max-height:90vh;border-radius:12px;">
                    Your browser does not support video playback.
                </video>
            `;
        }
        
        viewerModal.classList.add('active');
        
        // Prevent body scroll
        document.body.style.overflow = 'hidden';
    };
    
    // Close viewer
    window.closeViewer = function() {
        const viewerModal = document.getElementById('viewer-modal');
        if (viewerModal) {
            viewerModal.classList.remove('active');
        }
        document.body.style.overflow = '';
        
        // Stop video if playing
        const video = viewerModal?.querySelector('video');
        if (video) {
            video.pause();
            video.currentTime = 0;
        }
    };
    
    // Navigate to previous media
    window.prevMedia = function() {
        const media = currentItems.filter(item => item.type === 'image' || item.type === 'video');
        if (media.length === 0) return;
        
        currentViewIndex = (currentViewIndex - 1 + media.length) % media.length;
        openViewer(currentViewIndex);
    };
    
    // Navigate to next media
    window.nextMedia = function() {
        const media = currentItems.filter(item => item.type === 'image' || item.type === 'video');
        if (media.length === 0) return;
        
        currentViewIndex = (currentViewIndex + 1) % media.length;
        openViewer(currentViewIndex);
    };
    
    // Setup keyboard navigation
    function setupKeyboardNavigation() {
        document.addEventListener('keydown', function(e) {
            const viewerModal = document.getElementById('viewer-modal');
            if (!viewerModal || !viewerModal.classList.contains('active')) return;
            
            if (e.key === 'Escape') {
                closeViewer();
            } else if (e.key === 'ArrowLeft') {
                prevMedia();
            } else if (e.key === 'ArrowRight') {
                nextMedia();
            }
        });
    }
    
    // Utility functions
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    function formatFileSize(bytes) {
        if (!bytes || bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    }
    
    // Expose loadGallery globally
    window.loadGallery = loadGallery;
    
    console.log('🎨 GRACE-X Gallery™ Module Loaded');
    
})();
