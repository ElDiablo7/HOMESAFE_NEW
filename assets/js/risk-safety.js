/**
 * ╔═══════════════════════════════════════════════════════════════════════╗
 * ║                  GRACE-X RISK & SAFETY™                               ║
 * ║        Enterprise Safety Management & Compliance System               ║
 * ║                                                                       ║
 * ║  Purpose: Incident reporting, safety checklists, risk management,    ║
 * ║           compliance tracking, and safety inductions                  ║
 * ║                                                                       ║
 * ║  © 2026 GRACE-X AI™ - MOD/Cabinet Office Grade                       ║
 * ╚═══════════════════════════════════════════════════════════════════════╝
 */

(function() {
  'use strict';

  const STORAGE_KEY = 'gracex_risk_safety';
  const API_BASE = 'http://localhost:3000/api/safety';

  // ============================================================================
  // RISK & SAFETY ENGINE
  // ============================================================================
  
  const RiskSafety = {
    initialized: false,
    incidents: [],
    checklists: [],
    risks: [],
    inductions: [],
    nearMisses: [],

    // Severity Levels
    SEVERITY: {
      CRITICAL: 'critical',
      HIGH: 'high',
      MEDIUM: 'medium',
      LOW: 'low'
    },

    // Incident Types
    INCIDENT_TYPES: {
      INJURY: 'injury',
      NEAR_MISS: 'near_miss',
      PROPERTY_DAMAGE: 'property_damage',
      ENVIRONMENTAL: 'environmental',
      SECURITY: 'security',
      EQUIPMENT_FAILURE: 'equipment_failure',
      OTHER: 'other'
    },

    init() {
      if (this.initialized) return;

      console.log('[RISK & SAFETY] Initializing...');
      
      // Load from storage
      this.loadFromStorage();
      
      // Register with Master Control
      if (window.GraceXMaster) {
        window.GraceXMaster.registerModule('risk-safety', {
          name: 'Risk & Safety',
          version: '1.0.0',
          status: 'active',
          capabilities: ['incident-reporting', 'safety-checklists', 'risk-management', 'compliance']
        });

        // Subscribe to other modules
        window.GraceXMaster.subscribe('callsheet.created', (data) => {
          this.log('Call sheet created, ready for safety checks', data.sheetId);
        });
      }

      this.initialized = true;
      console.log('[RISK & SAFETY] ✅ Ready');
    },

    // ============================================================================
    // INCIDENT REPORTING
    // ============================================================================
    
    reportIncident(data) {
      const incident = {
        id: this.generateId(),
        date: data.date || Date.now(),
        site: data.site || '',
        siteId: data.siteId || '',
        reporter: data.reporter || '',
        reporterRole: data.reporterRole || '',
        
        type: data.type || this.INCIDENT_TYPES.OTHER,
        severity: data.severity || this.SEVERITY.LOW,
        
        title: data.title || '',
        description: data.description || '',
        location: data.location || '',
        
        injuredParty: data.injuredParty || null,
        witnesses: data.witnesses || [],
        
        immediateActions: data.immediateActions || '',
        correctiveActions: data.correctiveActions || '',
        preventiveMeasures: data.preventiveMeasures || '',
        
        photos: data.photos || [],
        documents: data.documents || [],
        
        status: 'open',
        investigationStatus: 'pending',
        
        notifiedAuthorities: data.notifiedAuthorities || false,
        authoritiesNotified: data.authoritiesNotified || [],
        
        assignedTo: data.assignedTo || null,
        dueDate: data.dueDate || null,
        
        createdAt: Date.now(),
        updatedAt: Date.now(),
        createdBy: data.createdBy || 'system'
      };

      this.incidents.push(incident);
      this.saveToStorage();

      // Publish event
      if (window.GraceXMaster) {
        window.GraceXMaster.publish('incident.reported', {
          incidentId: incident.id,
          severity: incident.severity,
          type: incident.type
        });

        // Alert Guardian module for critical incidents
        if (incident.severity === this.SEVERITY.CRITICAL) {
          window.GraceXMaster.publish('guardian.alert', {
            type: 'critical_incident',
            incident: incident
          });
        }
      }

      this.log('Incident reported', `${incident.type} - ${incident.severity}`);
      return incident;
    },

    getIncident(incidentId) {
      return this.incidents.find(i => i.id === incidentId);
    },

    updateIncident(incidentId, updates) {
      const incident = this.getIncident(incidentId);
      if (!incident) return null;

      Object.assign(incident, updates, { updatedAt: Date.now() });
      this.saveToStorage();

      if (window.GraceXMaster) {
        window.GraceXMaster.publish('incident.updated', { incidentId, updates });
      }

      return incident;
    },

    closeIncident(incidentId, resolution) {
      return this.updateIncident(incidentId, {
        status: 'closed',
        closedAt: Date.now(),
        resolution: resolution || ''
      });
    },

    getIncidentsBySite(siteId) {
      return this.incidents.filter(i => i.siteId === siteId);
    },

    getIncidentsBySeverity(severity) {
      return this.incidents.filter(i => i.severity === severity);
    },

    getOpenIncidents() {
      return this.incidents.filter(i => i.status === 'open');
    },

    // ============================================================================
    // SAFETY CHECKLISTS
    // ============================================================================
    
    createChecklist(data) {
      const checklist = {
        id: this.generateId(),
        name: data.name || 'Safety Checklist',
        type: data.type || 'daily', // daily, weekly, monthly, pre-start
        site: data.site || '',
        siteId: data.siteId || '',
        
        items: data.items || [],
        
        inspector: data.inspector || '',
        date: data.date || Date.now(),
        
        status: 'pending',
        overallPass: null,
        
        notes: data.notes || '',
        signature: data.signature || null,
        
        createdAt: Date.now(),
        completedAt: null
      };

      this.checklists.push(checklist);
      this.saveToStorage();

      if (window.GraceXMaster) {
        window.GraceXMaster.publish('checklist.created', { checklistId: checklist.id });
      }

      return checklist;
    },

    addChecklistItem(checklistId, item) {
      const checklist = this.checklists.find(c => c.id === checklistId);
      if (!checklist) return null;

      const checkItem = {
        id: this.generateId(),
        description: item.description || '',
        category: item.category || '',
        pass: null,
        fail: null,
        na: null,
        notes: '',
        actionRequired: false
      };

      checklist.items.push(checkItem);
      this.saveToStorage();

      return checkItem;
    },

    completeChecklistItem(checklistId, itemId, result) {
      const checklist = this.checklists.find(c => c.id === checklistId);
      if (!checklist) return false;

      const item = checklist.items.find(i => i.id === itemId);
      if (!item) return false;

      item.pass = result.pass || false;
      item.fail = result.fail || false;
      item.na = result.na || false;
      item.notes = result.notes || '';
      item.actionRequired = result.actionRequired || false;

      this.saveToStorage();
      return true;
    },

    completeChecklist(checklistId, signature) {
      const checklist = this.checklists.find(c => c.id === checklistId);
      if (!checklist) return null;

      const totalItems = checklist.items.length;
      const passedItems = checklist.items.filter(i => i.pass).length;
      const failedItems = checklist.items.filter(i => i.fail).length;

      checklist.status = 'completed';
      checklist.completedAt = Date.now();
      checklist.signature = signature;
      checklist.overallPass = failedItems === 0;

      this.saveToStorage();

      if (window.GraceXMaster) {
        window.GraceXMaster.publish('checklist.completed', {
          checklistId,
          passed: checklist.overallPass,
          score: `${passedItems}/${totalItems}`
        });
      }

      // Alert if critical failures
      if (failedItems > 0) {
        const criticalFails = checklist.items.filter(i => i.fail && i.actionRequired);
        if (criticalFails.length > 0 && window.GraceXMaster) {
          window.GraceXMaster.publish('guardian.alert', {
            type: 'safety_checklist_failure',
            checklist: checklist,
            criticalFails
          });
        }
      }

      return checklist;
    },

    // ============================================================================
    // RISK REGISTER
    // ============================================================================
    
    registerRisk(data) {
      const risk = {
        id: this.generateId(),
        title: data.title || '',
        description: data.description || '',
        category: data.category || '',
        
        site: data.site || '',
        siteId: data.siteId || '',
        
        likelihood: data.likelihood || 1, // 1-5
        impact: data.impact || 1, // 1-5
        riskScore: (data.likelihood || 1) * (data.impact || 1),
        
        existingControls: data.existingControls || '',
        mitigationPlan: data.mitigationPlan || '',
        residualLikelihood: data.residualLikelihood || null,
        residualImpact: data.residualImpact || null,
        
        owner: data.owner || '',
        reviewDate: data.reviewDate || null,
        
        status: 'active',
        
        createdAt: Date.now(),
        updatedAt: Date.now()
      };

      // Calculate residual risk
      if (risk.residualLikelihood && risk.residualImpact) {
        risk.residualRiskScore = risk.residualLikelihood * risk.residualImpact;
      }

      this.risks.push(risk);
      this.saveToStorage();

      if (window.GraceXMaster) {
        window.GraceXMaster.publish('risk.registered', {
          riskId: risk.id,
          riskScore: risk.riskScore
        });

        // Alert Guardian for high-risk items (score > 15)
        if (risk.riskScore > 15) {
          window.GraceXMaster.publish('guardian.alert', {
            type: 'high_risk_identified',
            risk: risk
          });
        }
      }

      return risk;
    },

    updateRisk(riskId, updates) {
      const risk = this.risks.find(r => r.id === riskId);
      if (!risk) return null;

      Object.assign(risk, updates, { updatedAt: Date.now() });
      
      // Recalculate risk scores
      if (updates.likelihood || updates.impact) {
        risk.riskScore = risk.likelihood * risk.impact;
      }
      if (updates.residualLikelihood || updates.residualImpact) {
        risk.residualRiskScore = risk.residualLikelihood * risk.residualImpact;
      }

      this.saveToStorage();
      return risk;
    },

    getRiskMatrix() {
      const matrix = {
        critical: [], // Score > 20
        high: [], // Score 16-20
        medium: [], // Score 11-15
        low: [] // Score <= 10
      };

      this.risks.forEach(risk => {
        if (risk.status !== 'active') return;
        
        if (risk.riskScore > 20) matrix.critical.push(risk);
        else if (risk.riskScore >= 16) matrix.high.push(risk);
        else if (risk.riskScore >= 11) matrix.medium.push(risk);
        else matrix.low.push(risk);
      });

      return matrix;
    },

    // ============================================================================
    // SAFETY INDUCTIONS
    // ============================================================================
    
    recordInduction(data) {
      const induction = {
        id: this.generateId(),
        personName: data.personName || '',
        personCompany: data.personCompany || '',
        personRole: data.personRole || '',
        
        site: data.site || '',
        siteId: data.siteId || '',
        
        inductionType: data.inductionType || 'site',
        topics: data.topics || [],
        
        instructor: data.instructor || '',
        date: data.date || Date.now(),
        expiryDate: data.expiryDate || null,
        
        signature: data.signature || null,
        certificate: data.certificate || null,
        
        status: 'valid',
        
        createdAt: Date.now()
      };

      this.inductions.push(induction);
      this.saveToStorage();

      if (window.GraceXMaster) {
        window.GraceXMaster.publish('induction.recorded', {
          inductionId: induction.id,
          person: induction.personName
        });
      }

      return induction;
    },

    checkInductionStatus(personName, siteId) {
      const inductions = this.inductions.filter(i => 
        i.personName === personName && 
        i.siteId === siteId &&
        i.status === 'valid'
      );

      if (inductions.length === 0) return { valid: false, reason: 'No induction found' };

      const latestInduction = inductions.sort((a, b) => b.date - a.date)[0];
      
      if (latestInduction.expiryDate && Date.now() > latestInduction.expiryDate) {
        return { valid: false, reason: 'Induction expired', induction: latestInduction };
      }

      return { valid: true, induction: latestInduction };
    },

    // ============================================================================
    // COMPLIANCE TRACKING
    // ============================================================================
    
    getComplianceStatus(siteId = null) {
      const status = {
        incidents: {
          total: this.incidents.length,
          open: this.incidents.filter(i => i.status === 'open').length,
          critical: this.incidents.filter(i => i.severity === this.SEVERITY.CRITICAL).length
        },
        checklists: {
          total: this.checklists.length,
          completed: this.checklists.filter(c => c.status === 'completed').length,
          failed: this.checklists.filter(c => c.overallPass === false).length,
          pending: this.checklists.filter(c => c.status === 'pending').length
        },
        risks: {
          total: this.risks.length,
          critical: this.risks.filter(r => r.riskScore > 20).length,
          high: this.risks.filter(r => r.riskScore >= 16 && r.riskScore <= 20).length
        },
        inductions: {
          total: this.inductions.length,
          valid: this.inductions.filter(i => i.status === 'valid').length
        }
      };

      // Calculate overall compliance score (0-100)
      const openIncidentsScore = Math.max(0, 100 - (status.incidents.open * 5));
      const checklistScore = status.checklists.total > 0 
        ? (status.checklists.completed / status.checklists.total) * 100 
        : 100;
      const riskScore = Math.max(0, 100 - (status.risks.critical * 20) - (status.risks.high * 10));

      status.overallScore = Math.round((openIncidentsScore + checklistScore + riskScore) / 3);
      status.complianceLevel = 
        status.overallScore >= 90 ? 'excellent' :
        status.overallScore >= 75 ? 'good' :
        status.overallScore >= 60 ? 'acceptable' : 'critical';

      return status;
    },

    // ============================================================================
    // STORAGE & SYNC
    // ============================================================================
    
    saveToStorage() {
      try {
        const data = {
          incidents: this.incidents,
          checklists: this.checklists,
          risks: this.risks,
          inductions: this.inductions,
          nearMisses: this.nearMisses,
          lastUpdated: Date.now()
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      } catch (error) {
        console.error('[RISK & SAFETY] Storage save error:', error);
      }
    },

    loadFromStorage() {
      try {
        const data = localStorage.getItem(STORAGE_KEY);
        if (data) {
          const parsed = JSON.parse(data);
          this.incidents = parsed.incidents || [];
          this.checklists = parsed.checklists || [];
          this.risks = parsed.risks || [];
          this.inductions = parsed.inductions || [];
          this.nearMisses = parsed.nearMisses || [];
        }
      } catch (error) {
        console.error('[RISK & SAFETY] Storage load error:', error);
      }
    },

    async syncWithBackend() {
      try {
        // Sync incidents
        for (const incident of this.incidents) {
          if (!incident.synced) {
            await fetch(`${API_BASE}/incident`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(incident)
            });
            incident.synced = true;
          }
        }
        
        this.saveToStorage();
        console.log('[RISK & SAFETY] Sync complete');
        
      } catch (error) {
        console.error('[RISK & SAFETY] Sync error:', error);
      }
    },

    // ============================================================================
    // UTILITIES
    // ============================================================================
    
    generateId() {
      return `rs-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    },

    log(action, details) {
      console.log(`[RISK & SAFETY] ${action}:`, details);
      
      if (window.GraceXMaster) {
        window.GraceXMaster.log('RISK_SAFETY', action, { details });
      }
    },

    getStats() {
      return {
        totalIncidents: this.incidents.length,
        openIncidents: this.incidents.filter(i => i.status === 'open').length,
        totalChecklists: this.checklists.length,
        totalRisks: this.risks.length,
        totalInductions: this.inductions.length,
        complianceScore: this.getComplianceStatus().overallScore
      };
    }
  };

  // ============================================================================
  // EXPOSE API
  // ============================================================================
  
  window.RiskSafety = RiskSafety;

  // Auto-init on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => RiskSafety.init());
  } else {
    RiskSafety.init();
  }

  console.log('[RISK & SAFETY] Module loaded');

})();
