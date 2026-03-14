# GRACE-X OSINT™ - Documentation

**Version:** 1.0.0  
**Author:** Zac Crockett  
**Classification:** Professional-Grade · White-Hat Only

---

## 🔐 Overview

GRACE-X OSINT™ is an ethical, white-hat Open Source Intelligence module designed for:

- **Parents** - Protecting children from online threats
- **Journalists** - Fact-checking and source verification
- **Investigators** - Professional due diligence
- **Researchers** - Academic and security research
- **Businesses** - Background checks and risk assessment

### Hard Constraints (Non-Negotiable)

| ❌ PROHIBITED | ✅ ALLOWED |
|---------------|------------|
| Illegal access | Public data only |
| Credential harvesting | User-initiated searches |
| Scraping behind logins | Link-out to external tools |
| Malware/exploits | Educational content |
| Auto-execution of scripts | Audit trail for all actions |
| Surveillance/stalking | Ethical research methodology |

---

## 🧠 Architecture

### File Structure

```
assets/
├── css/
│   └── osint.css         # OSINT-specific styles
├── js/
│   ├── osint.js          # Main UI controller
│   ├── osint_engine.js   # Core OSINT functionality
│   ├── osint_sources.js  # Safe data sources registry
│   └── osint_report.js   # Report generation
modules/
└── osint.html            # Module UI template
docs/
└── OSINT_README.md       # This file
```

### Module Components

1. **OSINTEngine** (`osint_engine.js`)
   - Access control (lock/unlock)
   - Audit logging
   - Evidence collection
   - Search execution
   - Threat pattern analysis

2. **OSINTSources** (`osint_sources.js`)
   - Safe, public data sources
   - Link-out only (no scraping)
   - Categorized by use case

3. **OSINTReport** (`osint_report.js`)
   - Professional report generation
   - Export: HTML, Markdown, JSON
   - Legal disclaimers included

4. **OSINTUI** (`osint.js`)
   - Mode selector
   - Search forms
   - Evidence panel
   - Audit log display

---

## 🧩 OSINT Modes (Sub-Brains)

### 1. Person OSINT 👤
- Username search across platforms
- Email breach notification (HIBP-style stubs)
- Social footprint mapping
- Alias correlation (non-probabilistic)

### 2. Company/Business OSINT 🏢
- Company registry links (UK, US, Global)
- Directors & officers lookup
- Domain ownership verification
- Financial red flags (public indicators)

### 3. Domain/IP OSINT 🌐
- WHOIS lookup
- DNS records analysis
- SSL certificate inspection
- ASN/hosting provider identification
- Reputation indicators

### 4. Media OSINT 🖼️
- Image EXIF metadata viewer (local only)
- Reverse image search (link-out)
- Video source verification
- Deepfake risk checklist (educational)

### 5. Threat Pattern Analysis 🛡️
- Grooming indicators (Guardian-derived)
- Scam/phishing pattern detection
- Impersonation red flags
- Rule-based, explainable analysis

### 6. OSINT Academy 📚
- Step-by-step methodology lessons
- Ethics & legality training
- Verification techniques
- Report writing guidance

---

## 🔒 Access Control

### Locked State (Default)
- Module displays lock overlay
- No functionality available
- Legal disclaimer shown

### Unlock Methods
1. **Passphrase:** Enter `osint_professional_2024`
2. **Professional Mode:** Toggle checkbox (acknowledges terms)

### Lock Event Logging
All unlock/lock events are recorded in the audit log:
```javascript
[TIMESTAMP] ACTION Module unlocked via passphrase
[TIMESTAMP] ACTION Module locked
```

---

## 📋 Audit Trail

Every action is logged with:
- Timestamp (ISO format)
- Action type (INFO, SEARCH, ACTION, WARNING)
- Description
- Associated data (truncated)

### Example Log Entries
```
[14:32:15] INFO    OSINT Engine initialized
[14:32:20] ACTION  Module unlocked via passphrase
[14:33:01] SEARCH  person: johndoe123...
[14:33:45] ACTION  Evidence added: person search
```

---

## 🧰 Data Sources (Safe Only)

All sources must be:
- ✅ Publicly accessible
- ✅ Legal to query
- ✅ Link-out only (user manually visits)

### Person Sources
| Source | Category | Notes |
|--------|----------|-------|
| Google Search | General | Web search |
| LinkedIn | Professional | Public profiles only |
| Twitter/X | Social | Public tweets |
| GitHub | Technical | Developer profiles |
| Have I Been Pwned | Breach | Manual email entry |

### Domain Sources
| Source | Category | Notes |
|--------|----------|-------|
| WHOIS Lookup | Registration | Domain info |
| SSL Labs | Security | Certificate analysis |
| VirusTotal | Security | Reputation check |
| Shodan | Infrastructure | Account for full access |
| Wayback Machine | History | Historical snapshots |

---

## 📄 Report Generation

### Report Sections
1. **Metadata** - Case ID, dates, investigator
2. **Scope** - Subject, objective, constraints
3. **Methodology** - Approach, techniques, tools
4. **Sources** - All consulted sources
5. **Findings** - Results with confidence levels
6. **Evidence** - Collected items
7. **Analysis** - Interpretation
8. **Limitations** - What couldn't be determined
9. **Disclaimer** - Legal notice

### Export Formats
- **HTML** - PDF-ready layout
- **Markdown** - Developer-friendly
- **JSON** - Machine-readable

---

## 🔌 Integration Points

### Event Responses
```javascript
// Listen for module open
document.addEventListener('gracex:openModule', (e) => {
  if (e.detail.module === 'osint') {
    // Handle OSINT module open
  }
});

// Health check
if (window.OSINT_READY) {
  console.log('OSINT module is ready');
}
```

### Forge Map Node
The module registers as a node in the Forge Map:
- **ID:** osint
- **Name:** GRACE-X OSINT™
- **Status:** OSINT_READY

---

## 🧪 Testing Checklist

Before deployment, verify:

- [ ] Module loads without console errors
- [ ] Locked state displays correctly
- [ ] Unlock via passphrase works
- [ ] Unlock via professional toggle works
- [ ] All 6 modes switch correctly
- [ ] Person search generates links
- [ ] Company search generates links
- [ ] Domain search generates links
- [ ] EXIF viewer extracts metadata
- [ ] Threat analysis detects patterns
- [ ] Academy lessons display
- [ ] Evidence collection works
- [ ] Notes save correctly
- [ ] Reports export (HTML, MD, JSON)
- [ ] Audit log updates
- [ ] Lock button works
- [ ] No Core files modified

---

## 🚨 Safety Confirmation

### Pre-Deployment Checklist

| Check | Status |
|-------|--------|
| No illegal access methods | ✅ |
| No credential harvesting | ✅ |
| No scraping behind logins | ✅ |
| No malware/exploits | ✅ |
| No auto-execution | ✅ |
| User-initiated only | ✅ |
| Audit trail complete | ✅ |
| Legal disclaimers present | ✅ |
| Professional-grade quality | ✅ |
| Investor-safe | ✅ |

---

## 🚀 Future Extensions (Not Implemented)

Ideas for future development (DO NOT implement without authorization):

1. **Guardian Integration** - Shared threat pattern logic
2. **API Key Support** - Connect to premium OSINT services
3. **Team Collaboration** - Shared investigations
4. **Custom Source Registry** - User-defined sources
5. **Export Templates** - Customizable report formats

---

## 📜 Legal Disclaimer

GRACE-X OSINT™ is intended for lawful purposes only. Users are responsible for:
- Compliance with local laws
- Ethical use of gathered information
- Protecting subject privacy
- Proper handling of sensitive data

The developers assume no liability for misuse.

---

**© 2024 GRACE-X AI™ - All Rights Reserved**
