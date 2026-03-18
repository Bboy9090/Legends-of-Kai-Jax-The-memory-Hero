# BLACK SCREEN DEBUG
## Troubleshooting Guide

**Issue:** Screen is black on localhost:5173
**Status:** Investigating...

---

## POSSIBLE CAUSES

1. **Router not mounted** - App.tsx doesn't render GameRouter
2. **CSS issue** - Background is black, content is black
3. **JavaScript error** - App crashes before render
4. **Wrong entry point** - main.tsx renders wrong component
5. **Initialization error** - Game state initialization fails

---

## CHECKLIST

### 1. Browser Console (F12)
- [ ] Open browser console (F12)
- [ ] Look for JavaScript errors (red text)
- [ ] Note any error messages
- [ ] Check if React is loading

### 2. Terminal Output
- [ ] Check terminal for build errors
- [ ] Look for "Failed to compile" messages
- [ ] Check if TypeScript errors exist
- [ ] Note any warnings

### 3. Network Tab (F12)
- [ ] Open Network tab in browser
- [ ] Check if main.js loads (200 status)
- [ ] Check if index.html loads
- [ ] Check for 404 errors

### 4. Page Source
- [ ] Right-click page → View Page Source
- [ ] Check if HTML exists
- [ ] Check if scripts are loading
- [ ] Verify #root element exists

---

## IMMEDIATE FIXES TO TRY

### Fix 1: Check Console Errors
```
1. Open browser console (F12)
2. Look for red errors
3. Report errors found
```

### Fix 2: Check Terminal
```
1. Look at terminal window
2. Check for compilation errors
3. Report errors found
```

### Fix 3: Verify Entry Point
```
Check: apps/web/src/main.tsx
Should render: App component or GameRouter
```

---

## STATUS: Waiting for console/terminal errors to proceed
