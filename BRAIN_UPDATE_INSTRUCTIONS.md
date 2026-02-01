# INDEX.HTML UPDATE INSTRUCTIONS

## Quick Integration Steps

### STEP 1: Add Brain Scripts

Open your `index.html` file and locate the brain script section. It should look something like this:

```html
<!-- Existing brain scripts -->
<script src="assets/js/brain/gracex.state.js"></script>
<script src="assets/js/brain/gracex.router.js"></script>
<script src="assets/js/brain/gracex.brain.js"></script>
```

**ADD these two lines immediately after:**

```html
<!-- NEW: RAM and Analytics Brains -->
<script src="assets/js/brain/gracex.ram.js"></script>
<script src="assets/js/brain/gracex.analytics.js"></script>
```

The complete section should now look like:

```html
<!-- Brain System Scripts -->
<script src="assets/js/brain/gracex.state.js"></script>
<script src="assets/js/brain/gracex.router.js"></script>
<script src="assets/js/brain/gracex.brain.js"></script>
<!-- NEW: RAM and Analytics Brains -->
<script src="assets/js/brain/gracex.ram.js"></script>
<script src="assets/js/brain/gracex.analytics.js"></script>
```

### STEP 2: Verify Installation

1. Save the index.html file
2. Restart your GRACE-X server (run START.bat or START.sh)
3. Open browser console (F12)
4. You should see these messages:

```
[GRACEX STATE] V2 loaded with conversation memory & emotional tracking
[GRACEX ROUTER] V3 loaded with time-aware greetings & emotional detection
[GRACEX BRAIN] V2 loaded
[GRACE-X RAM BRAIN] v1.0.0 loaded ✓
[RAM] Buffers: 0/10 | Chains: 0/5 | Status: Ready
[GRACE-X ANALYTICS BRAIN] v1.0.0 loaded ✓
[ANALYTICS] Pattern detection: ON | Anomaly detection: ON
```

### STEP 3: Test Functionality

Open browser console and run:

```javascript
// Test RAM Brain
GraceX.RAM.setBuffer('test', {hello: 'world'});
console.log(GraceX.RAM.getBuffer('test')); // Should show: {hello: 'world'}

// Test Analytics Brain
const result = GraceX.Analytics.inspect([1,2,3,4,5]);
console.log(result.type); // Should show: 'array'
console.log(result.metrics.mean); // Should show: 3
```

If these work, you're done! ✓

### STEP 4: Access Demo Module (Optional)

Navigate to: `http://localhost:8080/modules/brain-demo.html`

Or add it to your module navigation menu.

---

## TROUBLESHOOTING

**Scripts not loading?**
- Check file paths are correct
- Make sure files were copied to the correct locations
- Check browser console for 404 errors

**GraceX.RAM is undefined?**
- Scripts must load in correct order
- state.js, router.js, brain.js MUST load before RAM and Analytics
- Check for JavaScript errors in console

**Functions not working?**
- Hard refresh browser (Ctrl+Shift+R or Cmd+Shift+R)
- Clear browser cache
- Check console for errors

---

## FILE LOCATIONS CHECKLIST

Verify these files exist:

```
✓ /assets/js/brain/gracex.ram.js
✓ /assets/js/brain/gracex.analytics.js
✓ /modules/brain-demo.html
✓ /docs/BRAIN_INTEGRATION_GUIDE.md
```

---

## WHAT'S CHANGED

**Added:**
- RAM Brain (working memory system)
- Analytics Brain (deep inspection engine)
- Demo module for testing
- Comprehensive documentation

**Not Changed:**
- Existing module files
- Core system architecture
- State management
- Router or existing brains

**Safe to integrate:**
Yes - these additions are non-breaking and purely additive.

---

## NEXT ACTIONS

After integration:

1. ✓ Test both brains in console
2. ✓ Visit demo module
3. ✓ Read full integration guide
4. ✓ Start using in your modules

See `/docs/BRAIN_INTEGRATION_GUIDE.md` for complete API reference and usage patterns.

---

**END OF UPDATE INSTRUCTIONS**
