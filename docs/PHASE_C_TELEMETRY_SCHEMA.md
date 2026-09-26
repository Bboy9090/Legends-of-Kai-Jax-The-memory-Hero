# Phase C: Telemetry Events Schema

**Purpose:** Standardized event tracking for balance data, performance monitoring, and retention analytics  
**Status:** Design phase, ready for implementation in Phase C Week 4 (C4.3)  
**Backend:** Firebase Analytics, Supabase, or Mixpanel (TBD)

---

## Core Telemetry Events

### Session Events

#### `session_start`
Fired when player starts the game.

```json
{
  "event": "session_start",
  "timestamp": "2026-09-15T14:32:00Z",
  "sessionId": "uuid",
  "userId": "uuid",
  "properties": {
    "platform": "web|mobile",
    "os": "iOS|Android|Windows|macOS|Linux",
    "osVersion": "14.5",
    "browser": "Safari|Chrome|Firefox",
    "browserVersion": "120.0",
    "buildVersion": "1.0.0",
    "isFirstSession": true
  }
}
```

#### `session_end`
Fired when player closes the game.

```json
{
  "event": "session_end",
  "timestamp": "2026-09-15T14:42:00Z",
  "sessionId": "uuid",
  "userId": "uuid",
  "properties": {
    "sessionDurationSeconds": 600,
    "matchesPlayed": 5,
    "totalCoinsEarned": 150,
    "reasonClosed": "user|timeout|crash"
  }
}
```

---

### Fighter Selection Events

#### `fighter_selected`
Fired when player selects a fighter for battle.

```json
{
  "event": "fighter_selected",
  "timestamp": "2026-09-15T14:33:00Z",
  "sessionId": "uuid",
  "userId": "uuid",
  "properties": {
    "fighterId": "velocity-fighter",
    "fighterName": "Velocity",
    "gameMode": "training|versus|story",
    "fighterLevel": 5,
    "skinApplied": "default|cosmic|neon",
    "matchId": "uuid"
  }
}
```

#### `fighter_usage_stats` (aggregated daily)
Daily aggregation of fighter usage by all players.

```json
{
  "event": "fighter_usage_stats",
  "timestamp": "2026-09-15T00:00:00Z",
  "properties": {
    "fighterId": "velocity-fighter",
    "totalPicksToday": 245,
    "uniquePlayersToday": 180,
    "averageLevelWhenPicked": 8,
    "pickRatePercentage": 12.5
  }
}
```

---

### Battle Events

#### `match_start`
Fired when a match begins.

```json
{
  "event": "match_start",
  "timestamp": "2026-09-15T14:33:30Z",
  "sessionId": "uuid",
  "userId": "uuid",
  "properties": {
    "matchId": "uuid",
    "gameMode": "training|versus_ai|versus_player",
    "playerId": "uuid",
    "playerFighter": "velocity-fighter",
    "opponentId": "cpu|uuid",
    "opponentFighter": "kaison-fighter",
    "difficulty": "normal|hard|expert",
    "mapId": "arena-1",
    "durationSeconds": 0
  }
}
```

#### `match_end`
Fired when a match concludes.

```json
{
  "event": "match_end",
  "timestamp": "2026-09-15T14:34:15Z",
  "sessionId": "uuid",
  "userId": "uuid",
  "properties": {
    "matchId": "uuid",
    "gameMode": "training|versus_ai|versus_player",
    "playerFighter": "velocity-fighter",
    "opponentFighter": "kaison-fighter",
    "result": "win|loss|draw",
    "durationSeconds": 45,
    "playerDamageDealt": 95,
    "playerDamageTaken": 42,
    "playerHealth": 58,
    "playerMovesUsed": ["light", "medium", "special"],
    "playerCombosLanded": 3,
    "longestComboLength": 5,
    "rewardXP": 150,
    "rewardCoins": 50
  }
}
```

---

### Move Usage Events

#### `move_used`
Fired when a player executes a move during battle.

```json
{
  "event": "move_used",
  "timestamp": "2026-09-15T14:33:45Z",
  "sessionId": "uuid",
  "userId": "uuid",
  "matchId": "uuid",
  "properties": {
    "fighterId": "velocity-fighter",
    "moveId": "move_light",
    "moveName": "Light Attack",
    "moveType": "light|medium|heavy|special|dodge",
    "damageDealt": 10,
    "criticalHit": false,
    "hitTarget": true,
    "energyUsed": 0,
    "timeSincePreviousMoveMS": 800,
    "executionTimeMS": 200
  }
}
```

#### `move_combo`
Fired when a combo sequence completes.

```json
{
  "event": "move_combo",
  "timestamp": "2026-09-15T14:33:50Z",
  "sessionId": "uuid",
  "userId": "uuid",
  "matchId": "uuid",
  "properties": {
    "fighterId": "velocity-fighter",
    "comboLength": 3,
    "moveSequence": ["light", "medium", "heavy"],
    "totalDamage": 65,
    "durationMS": 1500,
    "successRate": 100
  }
}
```

---

### Balance & Win Rate Events

#### `fighter_winrate_daily`
Aggregated daily win rate by fighter.

```json
{
  "event": "fighter_winrate_daily",
  "timestamp": "2026-09-15T00:00:00Z",
  "properties": {
    "fighterId": "velocity-fighter",
    "totalMatches": 500,
    "wins": 275,
    "losses": 225,
    "winRate": 0.55,
    "drawRate": 0.0,
    "matchesVsEachFighter": {
      "kaison-fighter": {
        "wins": 45,
        "losses": 30,
        "winRate": 0.60
      }
    }
  }
}
```

#### `move_winrate_daily`
Aggregated daily win rate per move across all fighters.

```json
{
  "event": "move_winrate_daily",
  "timestamp": "2026-09-15T00:00:00Z",
  "properties": {
    "moveId": "move_special",
    "moveName": "Special Ability",
    "totalUsages": 1200,
    "hitRate": 0.85,
    "damageAverage": 48.5,
    "criticalHitRate": 0.12
  }
}
```

---

### Progression Events

#### `fighter_leveled_up`
Fired when a fighter reaches a new level.

```json
{
  "event": "fighter_leveled_up",
  "timestamp": "2026-09-15T14:35:00Z",
  "sessionId": "uuid",
  "userId": "uuid",
  "properties": {
    "fighterId": "velocity-fighter",
    "newLevel": 6,
    "previousLevel": 5,
    "totalXP": 850,
    "xpToNextLevel": 150,
    "moveUnlocked": "move_special",
    "cosmeticUnlocked": "neon_skin"
  }
}
```

#### `cosmetic_purchased`
Fired when a player buys or unlocks a cosmetic.

```json
{
  "event": "cosmetic_purchased",
  "timestamp": "2026-09-15T14:35:30Z",
  "sessionId": "uuid",
  "userId": "uuid",
  "properties": {
    "cosmeticId": "neon_skin",
    "cosmeticName": "Neon Skin",
    "fighterId": "velocity-fighter",
    "purchaseMethod": "xp_unlock|battle_pass|cosmetic_shop",
    "priceUSD": 4.99
  }
}
```

#### `daily_challenge_completed`
Fired when player completes a daily challenge.

```json
{
  "event": "daily_challenge_completed",
  "timestamp": "2026-09-15T14:36:00Z",
  "sessionId": "uuid",
  "userId": "uuid",
  "properties": {
    "challengeId": "challenge_123",
    "challengeName": "Win 3 matches with Velocity",
    "rewardXP": 100,
    "rewardCoins": 50,
    "completionTime": 1800,
    "streakContinued": true,
    "currentStreak": 5
  }
}
```

---

### Performance Events

#### `performance_frame_drop`
Fired when FPS drops below threshold.

```json
{
  "event": "performance_frame_drop",
  "timestamp": "2026-09-15T14:33:45Z",
  "sessionId": "uuid",
  "userId": "uuid",
  "properties": {
    "averageFPS": 28,
    "minFPS": 15,
    "maxFPS": 45,
    "droppedFrameCount": 12,
    "cause": "animation_load|particle_effect|model_rendering|unknown",
    "deviceThermalState": "normal|warm|hot|throttled"
  }
}
```

#### `crash_report`
Fired when game crashes (sent next session).

```json
{
  "event": "crash_report",
  "timestamp": "2026-09-15T14:34:00Z",
  "sessionId": "uuid",
  "userId": "uuid",
  "properties": {
    "crashTimestamp": "2026-09-15T14:33:59Z",
    "errorMessage": "Cannot read property 'mesh' of undefined",
    "errorStack": "[truncated stack trace]",
    "gameMode": "versus",
    "fighterId": "velocity-fighter",
    "opponentFighter": "kaison-fighter",
    "matchDurationSeconds": 12,
    "osVersion": "14.5",
    "buildVersion": "1.0.0"
  }
}
```

#### `load_time`
Fired when game finishes loading.

```json
{
  "event": "load_time",
  "timestamp": "2026-09-15T14:32:05Z",
  "sessionId": "uuid",
  "userId": "uuid",
  "properties": {
    "totalLoadTimeMS": 4500,
    "modelLoadTimeMS": 2100,
    "textureLoadTimeMS": 1200,
    "animationLoadTimeMS": 800,
    "uiRenderTimeMS": 400,
    "platform": "web|mobile",
    "buildSize": "4.2MB"
  }
}
```

---

## Analytics Dashboard KPIs

### Real-Time Dashboards

**Fighter Balance:**
- Win rates by fighter (target: 45-55%)
- Matchup win rates (fighter A vs fighter B)
- Move usage frequency
- Special ability success rate
- Damage distribution

**Performance:**
- Average session FPS
- Load time percentiles (p50, p95, p99)
- Crash rate per 1000 sessions
- Thermal throttling incidents
- Frame drop frequency

**Engagement:**
- Daily active users (DAU)
- Session length distribution
- Match completion rate
- Daily challenge completion rate
- Cosmetic purchase conversion

**Retention:**
- Day 1, 3, 7, 30 retention rates
- Churn rate
- Fighter level progression speed
- Session frequency (days played)

---

## Event Batching & Transmission

### Client-Side Batching
- Collect events in memory buffer
- Batch every 30 seconds or 50 events (whichever comes first)
- Send as POST to telemetry endpoint
- Retry failed batches (up to 3 attempts, 10s backoff)

### Privacy & GDPR
- User ID hashed before transmission
- IP address not stored
- Geographic region only (country-level)
- Event data retention: 90 days (configurable)
- User can opt-out of telemetry (local flag)

---

## Integration with Phase C Tasks

### C4.3 Telemetry Implementation
- [ ] Create telemetry event classes (TypeScript)
- [ ] Set up event queue and batching
- [ ] Integrate Firebase Analytics SDK
- [ ] Instrument all game events
- [ ] Dashboard setup (Looker Studio or custom)
- [ ] Real-time alerts for anomalies (high crash rate, FPS drops)

### Success Criteria
- ✅ Events fire correctly in all game modes
- ✅ Data reaches backend (no loss in transmission)
- ✅ Dashboard shows real-time metrics
- ✅ Win rates calculated and displayed accurately
- ✅ Balance team can pull move usage reports daily

---

## Data Retention & Analytics

**Short-term (Week 1):**
- Real-time event stream (all events)
- Live dashboard updates

**Medium-term (Month 1):**
- Hourly aggregated data
- Daily balance reports
- Weekly retention cohorts

**Long-term (6+ months):**
- Archived in cold storage
- Monthly summaries only
- Queryable for historical trends

---

## Example Dashboard Queries

```sql
-- Fighters ranked by win rate
SELECT fighter_id, COUNT(*) as total_matches, 
  SUM(CASE WHEN result = 'win' THEN 1 ELSE 0 END) / COUNT(*) as win_rate
FROM match_end
WHERE DATE = TODAY()
GROUP BY fighter_id
ORDER BY win_rate DESC;

-- Move success rate
SELECT move_id, 
  COUNT(*) as total_uses,
  SUM(CASE WHEN hit_target THEN 1 ELSE 0 END) / COUNT(*) as hit_rate,
  AVG(damage_dealt) as avg_damage
FROM move_used
WHERE DATE = TODAY()
GROUP BY move_id
ORDER BY total_uses DESC;

-- Daily active users trend
SELECT DATE, COUNT(DISTINCT user_id) as dau
FROM session_start
WHERE DATE >= TODAY() - 30
GROUP BY DATE
ORDER BY DATE;
```

---

## Sensitive Data Handling

**Do NOT collect:**
- Player location (precise coordinates)
- Payment info (only transaction ID)
- Personal identifiers (email, username in plaintext)
- Device identifiers (UDID, MAC address)

**Anonymization:**
- Hash user IDs with salt
- Use geographic region only (country)
- Truncate IP addresses (/24 subnet)
- Remove personally identifiable exceptions from error logs

---

## Next Steps

1. **Week 1 (C4.3):** Implement telemetry event classes
2. **Week 2:** Set up Firebase/Supabase backend
3. **Week 3:** Instrument all game events and test
4. **Week 4:** Deploy live telemetry and validate data
5. **Week 5+:** Monitor dashboards, generate balance reports

Balance team can begin using telemetry data by Week 4 of Phase C.
