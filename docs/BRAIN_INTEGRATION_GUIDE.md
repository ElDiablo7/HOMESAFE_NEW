# GRACE-X BRAIN INTEGRATION GUIDE
## RAM Brain & Analytics Brain

**Version:** 1.0.0  
**Date:** December 25, 2025  
**Author:** Zac Crockett

---

## 📋 OVERVIEW

GRACE-X now includes two new specialist intelligence units:

1. **RAM Brain** - Working memory buffer for temporary context and multi-step reasoning
2. **Analytics Brain** - Deep inspection and pattern recognition engine

These brains operate **below** the module layer and can be called by any module or the Core.

---

## 🏗️ ARCHITECTURE INTEGRATION

```
┌──────────────────────────────────────────────────┐
│                   GRACE-X CORE                    │
├──────────────────────────────────────────────────┤
│  Modules: Builder, SiteOps, Uplift, etc.        │
├──────────────────────────────────────────────────┤
│  BRAINS LAYER (Specialist Intelligence)          │
│  ┌────────────┐  ┌───────────────┐  ┌─────────┐ │
│  │   Router   │  │  RAM Brain    │  │Analytics│ │
│  │   Brain    │  │  (Memory)     │  │ Brain   │ │
│  └────────────┘  └───────────────┘  └─────────┘ │
├──────────────────────────────────────────────────┤
│             State Management (state.js)           │
└──────────────────────────────────────────────────┘
```

---

## 📦 FILE STRUCTURE

```
GRACEX_FULL_PATCHED/
├── assets/
│   └── js/
│       └── brain/
│           ├── gracex.router.js     (existing)
│           ├── gracex.brain.js      (existing)
│           ├── gracex.state.js      (existing)
│           ├── gracex.ram.js        ← NEW
│           └── gracex.analytics.js  ← NEW
├── modules/
│   └── brain-demo.html              ← NEW (demo module)
└── index.html                       (update required)
```

---

## 🔧 INSTALLATION

### Step 1: Add Scripts to index.html

Add these script tags **after** the existing brain scripts but **before** module loading:

```html
<!-- Existing brain scripts -->
<script src="assets/js/brain/gracex.state.js"></script>
<script src="assets/js/brain/gracex.router.js"></script>
<script src="assets/js/brain/gracex.brain.js"></script>

<!-- NEW: Add these lines -->
<script src="assets/js/brain/gracex.ram.js"></script>
<script src="assets/js/brain/gracex.analytics.js"></script>

<!-- Module loader -->
<script src="assets/js/module-loader.js"></script>
```

### Step 2: Verify Installation

Open browser console and check:

```javascript
// Should see initialization messages:
// [GRACE-X RAM BRAIN] v1.0.0 loaded ✓
// [GRACE-X ANALYTICS BRAIN] v1.0.0 loaded ✓

// Verify availability
console.log(GraceX.RAM);        // Should show object with methods
console.log(GraceX.Analytics);  // Should show object with methods
```

### Step 3: Test Functionality

```javascript
// Quick RAM test
GraceX.RAM.setBuffer('test', { hello: 'world' });
console.log(GraceX.RAM.getBuffer('test')); // Should show {hello: 'world'}

// Quick Analytics test
const analysis = GraceX.Analytics.inspect([1, 2, 3, 4, 5]);
console.log(analysis); // Should show comprehensive array analysis
```

---

## 💾 RAM BRAIN API REFERENCE

### Buffers (Clipboard-Style Storage)

**Purpose:** Store temporary data with automatic expiry and limits (max 10 buffers)

```javascript
// Set a buffer
GraceX.RAM.setBuffer(name, data, options)
  name: string - Buffer identifier
  data: any - Data to store
  options: {
    module: string,      // Module name (auto-detected if not provided)
    type: string,        // Data type hint
    ttl: number,        // Time-to-live in milliseconds
    metadata: object    // Additional metadata
  }

// Examples:
GraceX.RAM.setBuffer('calculation', 42);
GraceX.RAM.setBuffer('temp-data', {x: 10, y: 20}, {ttl: 60000}); // 1 min TTL
GraceX.RAM.setBuffer('measurement', '10.5m', {metadata: {unit: 'meters'}});

// Get buffer data
GraceX.RAM.getBuffer(name) // Returns data or null

// Get buffer with metadata
GraceX.RAM.getBufferFull(name) // Returns full buffer object

// Delete buffer
GraceX.RAM.deleteBuffer(name) // Returns true if existed

// List all buffers
GraceX.RAM.listBuffers() 
// Returns: [{name, type, age, module}, ...]
```

### Working Context

**Purpose:** Single active task context (only one at a time)

```javascript
// Set current working context
GraceX.RAM.setContext(contextData)

// Example:
GraceX.RAM.setContext({
  task: 'room-measurement',
  room: 'kitchen',
  step: 'wall-1',
  measurements: []
});

// Get current context
const ctx = GraceX.RAM.getContext(); // Returns data or null

// Clear context
GraceX.RAM.clearContext();
```

### Reasoning Chains

**Purpose:** Multi-step task tracking with step history (max 5 chains)

```javascript
// Start a new chain
GraceX.RAM.startChain(chainId, initialData)

// Example:
GraceX.RAM.startChain('job-calc-001', {
  jobType: 'kitchen-refit',
  estimatedDays: 5
});

// Add steps to the chain
GraceX.RAM.addChainStep(chainId, stepData)

// Example:
GraceX.RAM.addChainStep('job-calc-001', {
  phase: 'demolition',
  duration: 1,
  cost: 500
});

GraceX.RAM.addChainStep('job-calc-001', {
  phase: 'plumbing',
  duration: 2,
  cost: 1200
});

// Get chain status
const chain = GraceX.RAM.getChain('job-calc-001');
// Returns: {started, steps[], currentStep, data, status}

// Complete chain with result
GraceX.RAM.completeChain('job-calc-001', {
  totalCost: 3500,
  totalDays: 5
});

// Abandon chain (delete it)
GraceX.RAM.abandonChain('job-calc-001');
```

### Scratch Pad

**Purpose:** Quick temporary calculations (no limits)

```javascript
// Set scratch value
GraceX.RAM.setScratch(key, value)

// Examples:
GraceX.RAM.setScratch('area', 25.5);
GraceX.RAM.setScratch('perimeter', 20);

// Get scratch value
GraceX.RAM.getScratch('area'); // Returns 25.5

// Clear all scratch
GraceX.RAM.clearScratch();
```

### Module Data Exchange

**Purpose:** Pass data between modules

```javascript
// Set data for another module
GraceX.RAM.setModuleData(targetModule, key, value)

// Example: Builder sends data to SiteOps
GraceX.RAM.setModuleData('siteops', 'materials-list', {
  cement: 20,
  bricks: 500
});

// SiteOps retrieves it
const materials = GraceX.RAM.getModuleData('siteops', 'materials-list');

// Clear module data
GraceX.RAM.clearModuleData('siteops');
```

### Utilities

```javascript
// Get comprehensive stats
const stats = GraceX.RAM.getStats();
// Returns: {buffers, chains, scratch, moduleData, meta}

// Get text summary
const summary = GraceX.RAM.summary();
console.log(summary); // Formatted text output

// Clear everything (nuclear option)
GraceX.RAM.clearAll();

// Manual garbage collection (auto runs every 5 mins)
GraceX.RAM.garbageCollect(); // Removes expired buffers
```

---

## 🔍 ANALYTICS BRAIN API REFERENCE

### Core Inspection

**Purpose:** Deep analysis of any data structure

```javascript
// Inspect any target
const analysis = GraceX.Analytics.inspect(target, options)

// Options (all optional):
{
  maxDepth: 5,              // Max object inspection depth
  maxArrayItems: 100,       // Max array items to analyze
  enablePatterns: true,     // Pattern recognition
  enableAnomalies: true,    // Anomaly detection
  enableMetrics: true,      // Statistical metrics
  cacheResults: true,       // Cache analysis
  cacheTTL: 300000         // Cache duration (5 mins)
}

// Returns comprehensive analysis object:
{
  timestamp: number,
  type: string,           // 'dom-element', 'array', 'object', 'string', 'number', 'function'
  summary: object,        // Type-specific summary
  structure: object,      // Structural information
  metadata: object,       // Additional metadata
  patterns: array,        // Detected patterns
  anomalies: array,       // Detected anomalies (if applicable)
  metrics: object,        // Statistical metrics (if applicable)
  insights: array,        // Generated insights
  processingTime: number  // Analysis duration in ms
}
```

### Type-Specific Analysis

#### DOM Element Analysis

```javascript
const button = document.getElementById('my-button');
const analysis = GraceX.Analytics.inspect(button);

// Returns:
{
  type: 'dom-element',
  summary: {
    tag: 'button',
    id: 'my-button',
    classes: ['builder-btn', 'primary'],
    attributes: {id: 'my-button', class: '...', onclick: '...'}
  },
  structure: {
    parent: 'div',
    children: 2,
    siblings: {previous: 1, next: 3},
    depth: 5
  },
  metadata: {
    dimensions: {width: 120, height: 40, top: 100, left: 50},
    visibility: {visible: true, inViewport: true},
    computed: {display: 'block', position: 'static', ...}
  },
  patterns: [
    {type: 'interactive', confidence: 0.9},
    {type: 'form-element', confidence: 1.0}
  ],
  insights: [...]
}
```

#### Array Analysis

```javascript
const data = [10, 20, 15, 25, 30, 18, 22];
const analysis = GraceX.Analytics.inspect(data);

// Returns:
{
  type: 'array',
  summary: {
    length: 7,
    sampled: 7,
    isEmpty: false
  },
  structure: {
    types: ['number'],
    homogeneous: true,
    nested: false,
    maxDepth: 0
  },
  metrics: {
    count: 7,
    sum: 140,
    mean: 20,
    median: 20,
    min: 10,
    max: 30,
    range: 20,
    standardDeviation: 6.2
  },
  patterns: [
    {type: 'sorted', direction: 'ascending', confidence: 0.9}
  ],
  anomalies: [],
  insights: [
    {level: 'info', message: 'Homogeneous array of numbers'}
  ]
}
```

#### Object Analysis

```javascript
const obj = {
  name: 'Test',
  count: 42,
  nested: {x: 1, y: 2},
  list: [1, 2, 3]
};
const analysis = GraceX.Analytics.inspect(obj);

// Returns detailed object structure analysis
```

#### String Analysis

```javascript
const text = "Contact: user@example.com or call 07700 900123";
const analysis = GraceX.Analytics.inspect(text);

// Returns:
{
  type: 'string',
  summary: {
    length: 47,
    isEmpty: false,
    preview: 'Contact: user@example.com or call 07700 900123'
  },
  structure: {
    lines: 1,
    words: 6,
    chars: {
      alphanumeric: 35,
      whitespace: 6,
      special: 6
    }
  },
  patterns: [
    {type: 'email', confidence: 0.9},
    {type: 'phone-uk', confidence: 0.8}
  ],
  insights: [...]
}
```

### Batch Operations

```javascript
// Analyze multiple targets
const results = GraceX.Analytics.batchInspect([target1, target2, target3], options);

// Returns:
{
  count: 3,
  successful: 3,
  failed: 0,
  results: [analysis1, analysis2, analysis3],
  summary: {
    types: ['array', 'object', 'string'],
    totalProcessingTime: 25.3
  }
}

// Compare two targets
const comparison = GraceX.Analytics.compare(target1, target2, options);

// Returns:
{
  target1: analysis1,
  target2: analysis2,
  comparison: {
    sameType: true,
    differences: [...]
  }
}
```

### Cache Management

```javascript
// Clear analysis cache
GraceX.Analytics.clearCache(); // Returns number of entries cleared

// Get analytics stats
const stats = GraceX.Analytics.getStats();
// Returns: {cacheSize: 5, config: {...}}
```

---

## 🔗 INTEGRATION PATTERNS

### Pattern 1: Store-Analyze-Retrieve

```javascript
// 1. Store data in RAM
GraceX.RAM.setBuffer('user-input', formData);

// 2. Analyze it
const analysis = GraceX.Analytics.inspect(formData);

// 3. Store analysis results
GraceX.RAM.setBuffer('analysis-results', analysis);

// 4. Use results in decision-making
const results = GraceX.RAM.getBuffer('analysis-results');
if (results.insights.some(i => i.level === 'warning')) {
  // Handle warnings
}
```

### Pattern 2: Multi-Step Reasoning with Chain

```javascript
// Start a reasoning chain for complex task
GraceX.RAM.startChain('job-estimation', {
  task: 'kitchen-refit',
  budget: 10000
});

// Step 1: Gather measurements
const measurements = {width: 4, length: 3, height: 2.4};
GraceX.RAM.addChainStep('job-estimation', {
  phase: 'measurement',
  data: measurements
});

// Step 2: Analyze measurements
const measAnalysis = GraceX.Analytics.inspect(measurements);
GraceX.RAM.addChainStep('job-estimation', {
  phase: 'analysis',
  area: measurements.width * measurements.length,
  patterns: measAnalysis.patterns
});

// Step 3: Calculate materials
GraceX.RAM.addChainStep('job-estimation', {
  phase: 'materials',
  tiles: 120,
  grout: 5,
  adhesive: 3
});

// Complete with final estimate
GraceX.RAM.completeChain('job-estimation', {
  totalCost: 8500,
  duration: 7,
  withinBudget: true
});

// Retrieve complete chain for review
const fullChain = GraceX.RAM.getChain('job-estimation');
```

### Pattern 3: Element Inspection with LASER

```javascript
// When user clicks an element via LASER™
function onElementSelected(element) {
  // Deep inspect the element
  const analysis = GraceX.Analytics.inspect(element, {
    enablePatterns: true
  });
  
  // Store in RAM for further processing
  GraceX.RAM.setBuffer('selected-element', {
    element: element,
    analysis: analysis,
    selectedAt: Date.now()
  });
  
  // Generate insights
  const insights = analysis.insights.filter(i => i.level === 'warning');
  if (insights.length > 0) {
    // Show warnings to user
    console.warn('Element issues detected:', insights);
  }
  
  // Pass to module for action
  GraceX.RAM.setModuleData('builder', 'inspected-element', analysis);
}
```

### Pattern 4: Data Pipeline

```javascript
async function processDataPipeline(inputData) {
  // Start pipeline chain
  GraceX.RAM.startChain('pipeline-001', {
    started: Date.now(),
    input: inputData
  });
  
  // Stage 1: Analyze input
  const inputAnalysis = GraceX.Analytics.inspect(inputData);
  GraceX.RAM.addChainStep('pipeline-001', {
    stage: 'analyze-input',
    type: inputAnalysis.type,
    patterns: inputAnalysis.patterns
  });
  
  // Stage 2: Transform
  const transformed = await transformData(inputData);
  GraceX.RAM.setBuffer('pipeline-transformed', transformed);
  GraceX.RAM.addChainStep('pipeline-001', {
    stage: 'transform',
    recordCount: transformed.length
  });
  
  // Stage 3: Validate
  const validation = GraceX.Analytics.inspect(transformed);
  const isValid = validation.anomalies.length === 0;
  GraceX.RAM.addChainStep('pipeline-001', {
    stage: 'validate',
    valid: isValid,
    anomalies: validation.anomalies.length
  });
  
  // Stage 4: Complete
  if (isValid) {
    GraceX.RAM.completeChain('pipeline-001', {
      success: true,
      output: transformed
    });
    return transformed;
  } else {
    GraceX.RAM.completeChain('pipeline-001', {
      success: false,
      errors: validation.anomalies
    });
    throw new Error('Validation failed');
  }
}
```

---

## 🎯 USE CASES BY MODULE

### Builder Module

```javascript
// Store room measurements
GraceX.RAM.setContext({
  module: 'builder',
  room: 'kitchen',
  measurements: {
    walls: [],
    floor: {width: 4, length: 3}
  }
});

// Analyze measurement data
const floorData = GraceX.RAM.getContext().measurements.floor;
const analysis = GraceX.Analytics.inspect(floorData);

// Calculate area
const area = floorData.width * floorData.length;
GraceX.RAM.setScratch('floor-area', area);
```

### SiteOps Module

```javascript
// Multi-phase job tracking
GraceX.RAM.startChain('site-project-001', {
  site: 'London Street',
  phases: ['demolition', 'structure', 'finishing']
});

// Track each phase
GraceX.RAM.addChainStep('site-project-001', {
  phase: 'demolition',
  duration: 2,
  completed: true
});

// Analyze project status
const chain = GraceX.RAM.getChain('site-project-001');
const progress = chain.currentStep / chain.steps.length;
```

### Uplift Module

```javascript
// Store conversation context for crisis detection
GraceX.RAM.setBuffer('uplift-session', {
  mood: 'anxious',
  triggers: ['stress', 'overwhelmed'],
  techniques: ['breathing', 'grounding']
}, {ttl: 3600000}); // 1 hour TTL

// Analyze conversation patterns
const sessionData = GraceX.RAM.getBuffer('uplift-session');
const analysis = GraceX.Analytics.inspect(sessionData);

// Detect patterns in mood
if (analysis.patterns.some(p => p.type === 'repetitions')) {
  // User repeating same concerns - escalate care
}
```

---

## ⚠️ IMPORTANT NOTES

### RAM Brain

1. **Not Persistent** - RAM clears on page reload
2. **Automatic Limits** - 10 buffers, 5 chains (oldest evicted)
3. **TTL Support** - Buffers can auto-expire
4. **Garbage Collection** - Runs every 5 minutes automatically
5. **No Sensitive Data** - Don't store passwords, API keys, etc.

### Analytics Brain

1. **No Personality** - Pure analysis, no chat responses
2. **Cache Aware** - Results cached for 5 minutes by default
3. **Performance** - Deep analysis can be slow on large objects
4. **DOM Specific** - Some features only work with DOM elements
5. **Pattern Recognition** - Confidence scores are estimates

---

## 🐛 DEBUGGING

### Check RAM State

```javascript
// Full summary
console.log(GraceX.RAM.summary());

// Detailed stats
console.log(GraceX.RAM.getStats());

// Export all RAM (for debugging)
const ramExport = GraceX.RAM.export();
console.log(JSON.stringify(ramExport, null, 2));
```

### Check Analytics Performance

```javascript
// Run analysis with timing
const start = performance.now();
const analysis = GraceX.Analytics.inspect(target);
console.log(`Analysis took: ${performance.now() - start}ms`);
console.log(`Analysis reported: ${analysis.processingTime}ms`);

// Check cache
console.log(GraceX.Analytics.getStats());
```

### Monitor Brain Activity

```javascript
// Console logs are enabled by default
// Look for these in browser console:
// [RAM] Buffer set: calculation (number)
// [ANALYTICS] Pattern detection: ON
// [RAM] Garbage collection: 2 buffers removed
```

---

## 🚀 QUICK START EXAMPLES

### Example 1: Simple Data Storage

```javascript
// Store some data
GraceX.RAM.setBuffer('my-data', {name: 'Test', value: 123});

// Retrieve it later
const data = GraceX.RAM.getBuffer('my-data');
console.log(data); // {name: 'Test', value: 123}
```

### Example 2: Array Analysis

```javascript
const numbers = [5, 10, 15, 20, 25];
const analysis = GraceX.Analytics.inspect(numbers);

console.log(`Mean: ${analysis.metrics.mean}`);
console.log(`Patterns: ${analysis.patterns.map(p => p.type).join(', ')}`);
```

### Example 3: Multi-Step Task

```javascript
// Start
GraceX.RAM.startChain('my-task', {goal: 'calculate'});

// Add steps
GraceX.RAM.addChainStep('my-task', {step: 1, value: 10});
GraceX.RAM.addChainStep('my-task', {step: 2, value: 20});

// Complete
GraceX.RAM.completeChain('my-task', {result: 30});

// Review
const chain = GraceX.RAM.getChain('my-task');
console.log(chain);
```

---

## 📚 NEXT STEPS

1. Test the demo module at `/modules/brain-demo.html`
2. Integrate RAM buffers into existing modules
3. Use Analytics for LASER™ element inspection
4. Build custom reasoning chains for complex workflows
5. Monitor RAM usage and optimize buffer strategy

---

**Questions or Issues?**
Check browser console for detailed logging from both brains.

---

**END OF DOCUMENTATION**
