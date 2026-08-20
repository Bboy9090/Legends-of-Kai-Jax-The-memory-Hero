# Gate 7: Deployment Eligibility

**Purpose:** Verify production readiness before deploying to live environment.

**Precondition:** Gate 6 (merge to phase1b-production-readiness) must be complete.

---

## Pre-Deployment Checklist

### Merge Validation
- [ ] Merge commit visible on `phase1b-production-readiness`
- [ ] CI/CD passed on merged commit (build, tests, typecheck)
- [ ] No conflicts during merge

### Production Build Validation
- [ ] Fresh production build succeeds (< 20 seconds)
- [ ] No build warnings in animation/rendering code
- [ ] Bundle size expected (no unexpected bloat)
- [ ] Source maps generated

### Deployment Configuration
- [ ] Vercel/hosting configured
- [ ] Environment variables set (if any)
- [ ] Build command correct
- [ ] CDN/cache configured
- [ ] Error reporting configured

### Pre-Production Testing
- [ ] Preview deployment accessible
- [ ] Load time reasonable
- [ ] Training Mode: fighter visible, animations smooth
- [ ] Versus Mode: both fighters visible
- [ ] Animations smooth in preview environment

### Performance Baseline
- [ ] Mobile performance confirmed (56–58 fps from Phase B2)
- [ ] Live device performance confirmed (iOS + Android from Phase B3)
- [ ] No performance regressions

### Compatibility
- [ ] Chrome/Edge/Safari/Firefox compatible
- [ ] Mobile browsers tested (iOS Safari, Chrome Android)
- [ ] Network conditions acceptable

### Security Review
- [ ] No new dependencies introduced
- [ ] No secrets in codebase
- [ ] CORS configured correctly
- [ ] CSP headers appropriate

### Backup & Rollback
- [ ] Previous stable release accessible
- [ ] Rollback procedure documented
- [ ] Backups current

---

## Deployment Decision

**GO if:**
- ✅ Merge successful and verified
- ✅ Production build passes all checks
- ✅ Preview deployment working
- ✅ Performance baseline met
- ✅ Phase B3 confirmed no critical issues

**NO-GO if:**
- ❌ CI/CD failed
- ❌ Build errors present
- ❌ Preview deployment broken
- ❌ Performance regression
- ❌ Security vulnerabilities found

---

## Deployment Execution (if approved)

```bash
# Build and verify
git checkout phase1b-production-readiness
git pull origin phase1b-production-readiness
npm ci
npm run build

# Deploy (Vercel auto-deploys on push, or manual deployment)
git push origin phase1b-production-readiness
# Vercel builds and deploys automatically
```

---

## Post-Deployment Verification

### Smoke Test Production
- [ ] Page loads without errors
- [ ] Canvas renders (Three.js active)
- [ ] Main Menu accessible
- [ ] Training Mode: fighter visible, animations smooth
- [ ] Versus Mode: both fighters visible, combat responsive
- [ ] No console errors

### First Hour Monitoring
- [ ] No increase in error rate
- [ ] Performance metrics stable
- [ ] No user reports of crashes
- [ ] Mobile performance acceptable

### Extended Monitoring (24 hours)
- [ ] Sustained performance (no degradation)
- [ ] No thermal issues reported
- [ ] Animation smoothness stable

---

## Rollback Procedure

If critical issues found:

```bash
git log origin/phase1b-production-readiness --oneline -10
# Identify previous stable commit
git checkout [previous-stable-commit]
npm run build
# Redeploy
vercel --prod
```

---

## Sign-Off

**Pre-Deployment:**
- [ ] Gate 6 (merge) complete
- [ ] All pre-deployment checks passed
- [ ] GO decision: **YES** ✅

**Approved by:** [name]  
**Date:** [YYYY-MM-DD]

**Post-Deployment:**
- [ ] Deployment successful
- [ ] Production smoke test passed
- [ ] First hour monitoring complete
- [ ] Extended monitoring started

**Deployed by:** [name]  
**Date:** [YYYY-MM-DD]  
**Production URL:** [https://prod-domain.com]
