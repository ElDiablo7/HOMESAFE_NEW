/**
 * ╔═══════════════════════════════════════════════════════════════════════╗
 * ║                    GRACE-X CALL SHEETS™                               ║
 * ║           Site Communication & Crew Management System                 ║
 * ║                                                                       ║
 * ║  Purpose: Daily call sheets, crew tracking, task assignment,         ║
 * ║           attendance, and site communication logging                  ║
 * ║                                                                       ║
 * ║  © 2026 GRACE-X AI™ - Enterprise Grade                               ║
 * ╚═══════════════════════════════════════════════════════════════════════╝
 */

(function() {
  'use strict';

  const STORAGE_KEY = 'gracex_callsheets';
  const API_BASE = 'http://localhost:3000/api/callsheets';

  // ============================================================================
  // CALL SHEETS ENGINE
  // ============================================================================
  
  const CallSheets = {
    initialized: false,
    currentSheet: null,
    sheets: [],
    crewMembers: [],
    sites: [],

    init() {
      if (this.initialized) return;

      console.log('[CALL SHEETS] Initializing...');
      
      // Load from localStorage
      this.loadFromStorage();
      
      // Register with Master Control
      if (window.GraceXMaster) {
        window.GraceXMaster.registerModule('callsheets', {
          name: 'Call Sheets',
          version: '1.0.0',
          status: 'active',
          capabilities: ['crew-management', 'task-tracking', 'attendance', 'site-communication']
        });
      }

      this.initialized = true;
      console.log('[CALL SHEETS] ✅ Ready');
    },

    // ============================================================================
    // CALL SHEET MANAGEMENT
    // ============================================================================
    
    createCallSheet(data) {
      const sheet = {
        id: this.generateId(),
        date: data.date || this.getTodayDate(),
        site: data.site || '',
        siteId: data.siteId || '',
        supervisor: data.supervisor || '',
        weather: data.weather || { condition: '', temp: '', wind: '' },
        crew: data.crew || [],
        tasks: data.tasks || [],
        notes: data.notes || '',
        photos: data.photos || [],
        status: 'active',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        createdBy: data.createdBy || 'system'
      };

      this.sheets.push(sheet);
      this.currentSheet = sheet;
      this.saveToStorage();
      
      // Publish event
      if (window.GraceXMaster) {
        window.GraceXMaster.publish('callsheet.created', { sheetId: sheet.id, sheet });
      }

      this.log('Created call sheet', sheet.id);
      return sheet;
    },

    getCallSheet(sheetId) {
      return this.sheets.find(s => s.id === sheetId);
    },

    getCallSheetsByDate(date) {
      return this.sheets.filter(s => s.date === date);
    },

    getCallSheetsBySite(siteId) {
      return this.sheets.filter(s => s.siteId === siteId);
    },

    updateCallSheet(sheetId, updates) {
      const sheet = this.getCallSheet(sheetId);
      if (!sheet) {
        console.error('[CALL SHEETS] Sheet not found:', sheetId);
        return null;
      }

      Object.assign(sheet, updates, { updatedAt: Date.now() });
      this.saveToStorage();

      if (window.GraceXMaster) {
        window.GraceXMaster.publish('callsheet.updated', { sheetId, updates });
      }

      this.log('Updated call sheet', sheetId);
      return sheet;
    },

    deleteCallSheet(sheetId) {
      const index = this.sheets.findIndex(s => s.id === sheetId);
      if (index === -1) return false;

      this.sheets.splice(index, 1);
      this.saveToStorage();

      if (window.GraceXMaster) {
        window.GraceXMaster.publish('callsheet.deleted', { sheetId });
      }

      this.log('Deleted call sheet', sheetId);
      return true;
    },

    // ============================================================================
    // CREW MANAGEMENT
    // ============================================================================
    
    addCrewMember(sheetId, crewData) {
      const sheet = this.getCallSheet(sheetId);
      if (!sheet) return null;

      const crewMember = {
        id: this.generateId(),
        name: crewData.name || '',
        role: crewData.role || '',
        company: crewData.company || '',
        phone: crewData.phone || '',
        clockIn: crewData.clockIn || null,
        clockOut: crewData.clockOut || null,
        hoursWorked: 0,
        breaks: crewData.breaks || [],
        tasks: crewData.tasks || [],
        status: 'onsite',
        notes: crewData.notes || ''
      };

      sheet.crew.push(crewMember);
      this.updateCallSheet(sheetId, { crew: sheet.crew });

      if (window.GraceXMaster) {
        window.GraceXMaster.publish('crew.added', { sheetId, crewMember });
      }

      return crewMember;
    },

    clockIn(sheetId, crewId) {
      const sheet = this.getCallSheet(sheetId);
      if (!sheet) return false;

      const crew = sheet.crew.find(c => c.id === crewId);
      if (!crew) return false;

      crew.clockIn = Date.now();
      crew.status = 'working';
      this.updateCallSheet(sheetId, { crew: sheet.crew });

      if (window.GraceXMaster) {
        window.GraceXMaster.publish('crew.clockin', { sheetId, crewId, time: crew.clockIn });
      }

      this.log('Crew clocked in', `${crew.name} (${crewId})`);
      return true;
    },

    clockOut(sheetId, crewId) {
      const sheet = this.getCallSheet(sheetId);
      if (!sheet) return false;

      const crew = sheet.crew.find(c => c.id === crewId);
      if (!crew || !crew.clockIn) return false;

      crew.clockOut = Date.now();
      crew.status = 'offsite';
      crew.hoursWorked = (crew.clockOut - crew.clockIn) / (1000 * 60 * 60); // Convert to hours
      
      this.updateCallSheet(sheetId, { crew: sheet.crew });

      if (window.GraceXMaster) {
        window.GraceXMaster.publish('crew.clockout', { 
          sheetId, 
          crewId, 
          time: crew.clockOut,
          hoursWorked: crew.hoursWorked 
        });
      }

      this.log('Crew clocked out', `${crew.name} - ${crew.hoursWorked.toFixed(2)}h`);
      return true;
    },

    // ============================================================================
    // TASK MANAGEMENT
    // ============================================================================
    
    addTask(sheetId, taskData) {
      const sheet = this.getCallSheet(sheetId);
      if (!sheet) return null;

      const task = {
        id: this.generateId(),
        title: taskData.title || '',
        description: taskData.description || '',
        assignedTo: taskData.assignedTo || [],
        priority: taskData.priority || 'medium',
        status: 'pending',
        startTime: taskData.startTime || null,
        endTime: taskData.endTime || null,
        progress: 0,
        notes: taskData.notes || '',
        photos: taskData.photos || []
      };

      sheet.tasks.push(task);
      this.updateCallSheet(sheetId, { tasks: sheet.tasks });

      if (window.GraceXMaster) {
        window.GraceXMaster.publish('task.added', { sheetId, task });
      }

      return task;
    },

    updateTask(sheetId, taskId, updates) {
      const sheet = this.getCallSheet(sheetId);
      if (!sheet) return null;

      const task = sheet.tasks.find(t => t.id === taskId);
      if (!task) return null;

      Object.assign(task, updates);
      this.updateCallSheet(sheetId, { tasks: sheet.tasks });

      if (window.GraceXMaster) {
        window.GraceXMaster.publish('task.updated', { sheetId, taskId, updates });
      }

      return task;
    },

    completeTask(sheetId, taskId) {
      return this.updateTask(sheetId, taskId, {
        status: 'completed',
        endTime: Date.now(),
        progress: 100
      });
    },

    // ============================================================================
    // SITE COMMUNICATION
    // ============================================================================
    
    addNote(sheetId, noteText, author) {
      const sheet = this.getCallSheet(sheetId);
      if (!sheet) return null;

      const note = {
        id: this.generateId(),
        text: noteText,
        author: author || 'Anonymous',
        timestamp: Date.now(),
        type: 'note'
      };

      if (!sheet.communications) sheet.communications = [];
      sheet.communications.push(note);
      
      this.updateCallSheet(sheetId, { communications: sheet.communications });

      if (window.GraceXMaster) {
        window.GraceXMaster.publish('communication.added', { sheetId, note });
      }

      return note;
    },

    addPhoto(sheetId, photoData) {
      const sheet = this.getCallSheet(sheetId);
      if (!sheet) return null;

      const photo = {
        id: this.generateId(),
        url: photoData.url || '',
        caption: photoData.caption || '',
        uploadedBy: photoData.uploadedBy || '',
        timestamp: Date.now()
      };

      sheet.photos.push(photo);
      this.updateCallSheet(sheetId, { photos: sheet.photos });

      return photo;
    },

    // ============================================================================
    // REPORTS & EXPORT
    // ============================================================================
    
    generateDailyReport(sheetId) {
      const sheet = this.getCallSheet(sheetId);
      if (!sheet) return null;

      const report = {
        id: sheet.id,
        date: sheet.date,
        site: sheet.site,
        supervisor: sheet.supervisor,
        weather: sheet.weather,
        
        crew: {
          total: sheet.crew.length,
          onsite: sheet.crew.filter(c => c.status === 'onsite' || c.status === 'working').length,
          offsite: sheet.crew.filter(c => c.status === 'offsite').length,
          totalHours: sheet.crew.reduce((sum, c) => sum + c.hoursWorked, 0).toFixed(2),
          members: sheet.crew.map(c => ({
            name: c.name,
            role: c.role,
            hours: c.hoursWorked.toFixed(2),
            status: c.status
          }))
        },
        
        tasks: {
          total: sheet.tasks.length,
          completed: sheet.tasks.filter(t => t.status === 'completed').length,
          inProgress: sheet.tasks.filter(t => t.status === 'in-progress').length,
          pending: sheet.tasks.filter(t => t.status === 'pending').length,
          list: sheet.tasks
        },
        
        notes: sheet.notes,
        communications: sheet.communications || [],
        photos: sheet.photos,
        
        generatedAt: Date.now()
      };

      return report;
    },

    exportToPDF(sheetId) {
      // This would integrate with a PDF library
      // For now, return the report data
      const report = this.generateDailyReport(sheetId);
      console.log('[CALL SHEETS] PDF export requested', report);
      
      // Trigger PDF generation (would need pdf-lib or similar)
      if (window.GraceXMaster) {
        window.GraceXMaster.publish('callsheet.export.pdf', { sheetId, report });
      }
      
      return report;
    },

    exportToCSV(sheetId) {
      const sheet = this.getCallSheet(sheetId);
      if (!sheet) return null;

      const headers = ['Name', 'Role', 'Clock In', 'Clock Out', 'Hours', 'Status'];
      const rows = sheet.crew.map(c => [
        c.name,
        c.role,
        c.clockIn ? new Date(c.clockIn).toLocaleTimeString() : 'N/A',
        c.clockOut ? new Date(c.clockOut).toLocaleTimeString() : 'N/A',
        c.hoursWorked.toFixed(2),
        c.status
      ]);

      const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
      return csv;
    },

    // ============================================================================
    // STORAGE & SYNC
    // ============================================================================
    
    saveToStorage() {
      try {
        const data = {
          sheets: this.sheets,
          crewMembers: this.crewMembers,
          sites: this.sites,
          lastUpdated: Date.now()
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      } catch (error) {
        console.error('[CALL SHEETS] Storage save error:', error);
      }
    },

    loadFromStorage() {
      try {
        const data = localStorage.getItem(STORAGE_KEY);
        if (data) {
          const parsed = JSON.parse(data);
          this.sheets = parsed.sheets || [];
          this.crewMembers = parsed.crewMembers || [];
          this.sites = parsed.sites || [];
        }
      } catch (error) {
        console.error('[CALL SHEETS] Storage load error:', error);
      }
    },

    async syncWithBackend() {
      try {
        // Upload local sheets to backend
        for (const sheet of this.sheets) {
          if (!sheet.synced) {
            await fetch(`${API_BASE}/sync`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(sheet)
            });
            sheet.synced = true;
          }
        }
        
        this.saveToStorage();
        console.log('[CALL SHEETS] Sync complete');
        
        if (window.GraceXMaster) {
          window.GraceXMaster.publish('callsheets.synced', { count: this.sheets.length });
        }
        
      } catch (error) {
        console.error('[CALL SHEETS] Sync error:', error);
      }
    },

    // ============================================================================
    // UTILITIES
    // ============================================================================
    
    generateId() {
      return `cs-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    },

    getTodayDate() {
      const today = new Date();
      return today.toISOString().split('T')[0];
    },

    formatTime(timestamp) {
      return new Date(timestamp).toLocaleTimeString();
    },

    formatDate(timestamp) {
      return new Date(timestamp).toLocaleDateString();
    },

    log(action, details) {
      console.log(`[CALL SHEETS] ${action}:`, details);
      
      if (window.GraceXMaster) {
        window.GraceXMaster.log('CALLSHEETS', action, { details });
      }
    },

    getStats() {
      return {
        totalSheets: this.sheets.length,
        activeSheets: this.sheets.filter(s => s.status === 'active').length,
        totalCrew: this.crewMembers.length,
        sites: this.sites.length
      };
    }
  };

  // ============================================================================
  // EXPOSE API
  // ============================================================================
  
  window.CallSheets = CallSheets;

  // Auto-init on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => CallSheets.init());
  } else {
    CallSheets.init();
  }

  console.log('[CALL SHEETS] Module loaded');

})();
