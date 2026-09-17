# Phase C: Feature Flags & Safe Deployment System

**Purpose:** Enable rapid iteration, A/B testing, and safe fighter additions without redeployment  
**Status:** Design phase, ready for implementation in Phase C Week 4 (C4.2)

---

## Feature Flag Architecture

### Core Concept

Feature flags allow enabling/disabling features remotely without code changes:
- New fighters can be deployed disabled, then enabled on schedule
- Balance changes can be A/B tested on subsets of players
- Broken features can be instantly disabled if critical bugs are found
- No downtime required for deployments

### Design: Lightweight Custom Implementation

Rather than full third-party (LaunchDarkly expensive), use simple custom system:

```typescript
// apps/web/src/services/featureFlags.ts

interface FeatureFlag {
  id: string;
  enabled: boolean;
  rolloutPercentage: number;           // 0-100, percentage of players
  targeting: {
    minPlayerLevel?: number;
    maxPlayerLevel?: number;
    regions?: string[];                // ["US", "EU", "ASIA"]
    betaTesters?: string[];            // User IDs
  };
  metadata: {
    name: string;
    description: string;
    releasedAt: string;
    expiresAt?: string;
  };
}

type FeatureFlagSet = Record<string, FeatureFlag>;

class FeatureFlagService {
  private flags: FeatureFlagSet = {};
  private userId: string;
  private userLevel: number;
  private userRegion: string;
  
  constructor(userId: string) {
    this.userId = userId;
    this.loadFlags();
  }
  
  private async loadFlags(): Promise<void> {
    // Fetch flags from backend (or cache)
    const response = await fetch('/api/feature-flags', {
      cache: 'no-store',
      headers: { 'X-User-ID': this.userId }
    });
    this.flags = await response.json();
  }
  
  isEnabled(flagId: string): boolean {
    const flag = this.flags[flagId];
    if (!flag) return false;
    if (!flag.enabled) return false;
    
    // Check targeting
    if (flag.targeting.minPlayerLevel && this.userLevel < flag.targeting.minPlayerLevel) {
      return false;
    }
    if (flag.targeting.maxPlayerLevel && this.userLevel > flag.targeting.maxPlayerLevel) {
      return false;
    }
    if (flag.targeting.regions && !flag.targeting.regions.includes(this.userRegion)) {
      return false;
    }
    if (flag.targeting.betaTesters && !flag.targeting.betaTesters.includes(this.userId)) {
      return false;
    }
    
    // Check rollout percentage
    const hash = hashFunction(`${this.userId}:${flagId}`);
    const percentage = (hash % 100);
    return percentage < flag.rolloutPercentage;
  }
  
  getAllEnabledFlags(): string[] {
    return Object.keys(this.flags).filter(id => this.isEnabled(id));
  }
}

export const featureFlags = new FeatureFlagService(getCurrentUserId());
```

---

## Fighter Feature Flags

### Fighter Availability Flags

**Flag:** `fighter_velocity_enabled`
```json
{
  "id": "fighter_velocity_enabled",
  "enabled": true,
  "rolloutPercentage": 100,
  "targeting": {
    "regions": ["US", "EU"]
  },
  "metadata": {
    "name": "Velocity Fighter",
    "description": "Speed-based fighter archetype",
    "releasedAt": "2026-09-15",
    "fighterVersion": "1.0"
  }
}
```

### Rollout Strategy

**Phase 1: Beta (Days 1-2)**
```json
{
  "enabled": true,
  "rolloutPercentage": 5,
  "targeting": {
    "betaTesters": ["user_123", "user_456", "user_789"]
  }
}
```
→ Only beta testers see fighter

**Phase 2: Staged (Days 3-4)**
```json
{
  "enabled": true,
  "rolloutPercentage": 25
}
```
→ 25% of players can play fighter

**Phase 3: Wide (Days 5+)**
```json
{
  "enabled": true,
  "rolloutPercentage": 100
}
```
→ All players have access

**Phase 4: Disable (if critical bug)**
```json
{
  "enabled": false
}
```
→ Instant disable, no redeployment

---

## Balance Experiment Flags

### Move Rebalancing A/B Tests

**Experiment:** Test different damage values for move

```json
{
  "id": "exp_velocity_special_damage_increase",
  "enabled": true,
  "rolloutPercentage": 50,
  "targeting": {},
  "metadata": {
    "name": "Velocity Special Damage Increase",
    "description": "Test 50→60 damage increase on special ability",
    "releasedAt": "2026-09-16",
    "experimentGroup": "A/B",
    "variant": "B"  // 50% get variant B (increased damage)
  }
}
```

**Code Integration:**

```typescript
// In OptimizedBeastModel or game logic
const specialDamage = featureFlags.isEnabled('exp_velocity_special_damage_increase')
  ? 60      // Variant B: increased damage
  : 50;     // Control: original damage

// Telemetry automatically tracks which variant player is in
telemetry.event('exp_variant', {
  experimentId: 'exp_velocity_special_damage_increase',
  variant: specialDamage === 60 ? 'B' : 'A'
});
```

### Analysis

Run statistical analysis on telemetry:
- Group A (control): 50 damage, 500 uses, 50% hit rate
- Group B (treatment): 60 damage, 500 uses, 52% hit rate
- Statistical significance: p = 0.08 (not significant, keep original)

**Decision:** If p < 0.05 and positive effect, ship change. Otherwise revert.

---

## Disabled Moves / Hotfixes

### Emergency Disable

If a move is overpowered or broken:

```json
{
  "id": "fighter_kaison_heavy_disabled",
  "enabled": true,
  "rolloutPercentage": 100,
  "metadata": {
    "name": "Kaison Heavy Attack Disabled",
    "description": "Hotfix: Heavy attack dealing 3x expected damage",
    "releasedAt": "2026-09-16T10:00:00Z"
  }
}
```

**Code:**

```typescript
// In move execution logic
if (featureFlags.isEnabled('fighter_kaison_heavy_disabled')) {
  return;  // Prevent move execution
}

// Or in move registry
const disabledMoveFlags = fighter.featureFlags?.disabledMoves || [];
if (disabledMoveFlags.some(flag => featureFlags.isEnabled(flag))) {
  // Move is disabled, show "Move Unavailable" UI
  return;
}
```

### Rapid Hotfix Process

1. **Identify issue** (from telemetry or player reports)
2. **Create flag** (disable broken move/fighter instantly)
3. **Code fix** (implement proper solution)
4. **Test fix** (staging environment)
5. **Deploy code** (new version with fix)
6. **Re-enable flag** (fighters available again)

**Time to fix:** < 30 minutes (no redeploy needed for disable)

---

## Admin UI for Flag Management

### Flag Dashboard (Development/Staging)

```
┌─────────────────────────────────────────────────────────────┐
│ Feature Flags Admin Dashboard                               │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│ Fighter Flags:                                              │
│  ☑ fighter_velocity_enabled      Rollout: 100%    Edit     │
│  ☑ fighter_kaison_enabled         Rollout: 100%    Edit     │
│  ☑ fighter_voltage_fang_enabled   Rollout: 25%     Edit     │
│  ☐ fighter_steelwolf_enabled      Rollout: 0%      Edit     │
│                                                               │
│ Experiment Flags:                                           │
│  ☑ exp_velocity_special_dmg_+10  Rollout: 50%     Edit      │
│  ☑ exp_kaison_balance_nerf        Rollout: 25%     Edit      │
│                                                               │
│ Hotfix Flags:                                               │
│  ☑ fighter_kaison_heavy_disabled  Rollout: 100%    Edit     │
│                                                               │
└─────────────────────────────────────────────────────────────┘

Edit Modal for: fighter_voltage_fang_enabled
─────────────────────────────────────────────────
Enabled:           ☑
Rollout %:         [25]  (beta)
Regions:           [US] [EU] [ASIA]  
Min Player Level:  [  ]
Max Player Level:  [  ]
Beta Testers:      [add]
Expires At:        [2026-09-30]
Description:       Voltage Fang fighter - testing
                   [Save]  [Cancel]
```

---

## Flag Storage & Sync

### Client-Side Caching

```typescript
// apps/web/src/hooks/useFeatureFlags.ts

export function useFeatureFlags() {
  const [flags, setFlags] = useState<FeatureFlagSet>({});
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Load from cache first (stale-while-revalidate)
    const cached = localStorage.getItem('featureFlags');
    if (cached) {
      setFlags(JSON.parse(cached));
    }
    
    // Fetch fresh from backend
    fetchFlags().then(newFlags => {
      setFlags(newFlags);
      localStorage.setItem('featureFlags', JSON.stringify(newFlags));
      setLoading(false);
    });
  }, []);
  
  return { flags, loading };
}
```

### Backend Storage

**Option 1: Simple JSON file**
```
/data/feature-flags.json
├─ flagId
├─ enabled
├─ rolloutPercentage
└─ targeting
```

**Option 2: Supabase table**
```sql
CREATE TABLE feature_flags (
  id TEXT PRIMARY KEY,
  enabled BOOLEAN,
  rollout_percentage INTEGER,
  targeting JSONB,
  metadata JSONB,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

### Refresh Strategy

- **On app startup:** Fetch flags immediately
- **Every 5 minutes:** Background refresh
- **On critical events:** Refresh if fighter selection changes
- **Real-time:** WebSocket for critical hotfixes (optional)

---

## Telemetry Integration

### Track Flag Exposure

```typescript
const flagsActive = featureFlags.getAllEnabledFlags();
telemetry.event('session_start', {
  flags_active: flagsActive,
  fighter_flags: flagsActive.filter(f => f.startsWith('fighter_')),
  experiment_flags: flagsActive.filter(f => f.startsWith('exp_'))
});
```

### Track Experiment Variants

```typescript
// When move is used
telemetry.event('move_used', {
  moveId: 'move_special',
  damage: 60,
  experiment: 'exp_velocity_special_damage_increase',
  variant: 'B'  // Which variant player was assigned
});
```

### Analysis

Dashboard automatically groups events by variant and compares metrics:
- Variant A (control): win_rate = 0.50, pick_rate = 0.10
- Variant B (treatment): win_rate = 0.52, pick_rate = 0.11
- Difference: +2% win rate (p = 0.08, not significant)

---

## Fighter Deployment Checklist (C4.4)

Using feature flags to ship new fighters safely:

### Before Flag Creation
- [ ] Fighter JSON schema valid
- [ ] GLTF model loads without errors
- [ ] All animation clips present
- [ ] Move set balanced (no move damage > 100)
- [ ] Move set unique (no carbon copy of existing fighter)
- [ ] Stats reasonable (health 50-200, speed 0.5-2.0)
- [ ] Cosmetics configured (min 1 default skin)
- [ ] AI behavior patterns tested
- [ ] Story intro written and reviewed

### Flag Configuration
- [ ] Create fighter flag (disabled, 0% rollout)
- [ ] Configure staging region (beta testers only)
- [ ] Set expiration date (if limited-time fighter)
- [ ] Write description for admin UI

### Staged Rollout
- [ ] Day 1: Enable for beta testers only (5 players)
- [ ] Day 2: Monitor telemetry, fix any crashes/balance issues
- [ ] Day 3: Expand to 25% of players (QA feedback)
- [ ] Day 4: Expand to 100% (general release)
- [ ] Day 5+: Monitor win rates, disable if OP/broken

### Success Criteria
- [ ] Fighter playable in Training, Versus, Story modes
- [ ] No crashes reported in 24 hours
- [ ] Win rate within 45-55% vs other fighters
- [ ] Pick rate reasonable (5-15% of matches)
- [ ] Player feedback positive (no balance complaints)

---

## Phase C4 Implementation Plan

### Week 4 Deliverables (Days 22-25)

1. **Days 22-23:** Implement FeatureFlagService class
2. **Days 23-24:** Create admin dashboard UI
3. **Days 24-25:** Integrate flags into fighter selection logic
4. **Days 25:** Deploy to staging environment, test with beta fighters

### Code Locations

```
apps/web/src/services/
├── featureFlags.ts          (FeatureFlagService)
├── featureFlagAdmin.ts      (Admin API)

apps/web/src/hooks/
├── useFeatureFlags.ts       (React hook)

apps/web/src/components/admin/
├── FeatureFlagDashboard.tsx (Admin UI)
├── FlagEditor.tsx           (Edit modal)

apps/web/public/data/
├── feature-flags.json       (Flag definitions)
```

---

## Success Criteria

- ✅ New fighters can be deployed disabled (0% rollout)
- ✅ Flags support staged rollouts (5% → 25% → 100%)
- ✅ A/B experiments can run on move balance
- ✅ Critical bugs can be hotfixed instantly (<5 min)
- ✅ No redeployment required for flag changes
- ✅ Admin dashboard functional and intuitive
- ✅ Telemetry tracks flag exposure and variants

---

## Future Enhancements (Phase D+)

- User cohort targeting (by region, player level, device type)
- Time-based scheduling (enable at specific UTC time)
- Gradual rollout (auto-increase percentage over time)
- Rollback on error (auto-revert if crash rate spikes)
- Real-time flag updates (WebSocket instead of polling)
- Detailed experiment analysis dashboard

---

## Risk Mitigation

**Risk:** Flag changes don't sync to all clients immediately  
**Mitigation:** 5-minute auto-refresh + manual refresh button in settings

**Risk:** Admin accidentally breaks game with flag misconfiguration  
**Mitigation:** Validation rules, staging environment testing, rollback button

**Risk:** Experiments create too many combinations (combinatorial explosion)  
**Mitigation:** Max 5 active experiments at once, clear expiration dates

---

## References

- Feature Flags Best Practices: https://martinfowler.com/articles/feature-toggles.html
- A/B Testing Guide: https://optimizely.com/optimization-glossary/a-b-testing/
- LaunchDarkly (reference): https://launchdarkly.com/
