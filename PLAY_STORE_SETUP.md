# Google Play Store Setup & Submission Guide
## Legends of Kai-Jax: The Memory Hero

Complete guide for creating, configuring, and submitting your app to Google Play Store.

---

## Section 1: Google Play Developer Account Setup

### 1.1 Create Developer Account

1. Go to [Google Play Console](https://play.google.com/console)
2. Sign in with your Google account (or create one if needed)
3. Accept developer agreement and pay one-time fee ($25 USD)
4. Complete your developer profile:
   - Developer name
   - Contact email
   - Website (optional)
   - Phone number

### 1.2 Enable Two-Factor Authentication

For account security:
1. Go to Settings → Account
2. Enable 2FA on your Google account
3. Generate app-specific password if using Google Authenticator
4. Store recovery codes securely

### 1.3 Setup Payment Method

1. Settings → Payment methods
2. Add valid payment method for developer fee
3. Verify billing address

---

## Section 2: Create App Listing

### 2.1 Create New App

1. Go to [Google Play Console](https://play.google.com/console)
2. Click "Create app"
3. Fill in:
   - **App name**: "Legends of Kai-Jax: The Memory Hero"
   - **Default language**: English
   - **App category**: Games → Action
   - **Free or paid**: Free (select based on your plan)
4. Accept declaration and create

### 2.2 Store Listing Information

Navigate to: **Store listing**

#### Short description (80 characters max)
```
Master memory and combat in this mythic platform fighter
```

#### Full description (4,000 characters max)
```
Legends of Kai-Jax: The Memory Hero

Journey through the mythic realm as Kai-Jax, the legendary Memory Hero. 
Master the ancient art of memory combat in this fast-paced platform fighter 
where every gesture, every memory matters.

FEATURES:
• Memory-based combat mechanics - Remember patterns to execute powerful moves
• Epic boss battles - Face legendary opponents with unique challenge patterns
• Smooth fluid animations - Powered by Three.js for stunning 3D visuals
• Responsive touch controls - Optimized for phones and tablets
• Mythic storyline - Uncover the secrets of Kai-Jax's twin nature
• Training Lab - Practice your memory and combat skills
• Cross-device sync - Play on phone or tablet seamlessly

GAMEPLAY:
Test your memory as you face increasingly difficult opponents. Each battle 
challenges you to remember and execute memory patterns. Victory comes to those 
who can combine strategic thinking with precise timing.

Perfect for casual players and hardcore gamers alike!

MINIMUM REQUIREMENTS:
Android 7.0 (API 24) or higher
2GB RAM recommended

No ads. No in-app purchases. Just pure gaming experience.
```

#### Promotional description (80 characters max)
```
Master memory combat in this mythic platform fighter
```

---

## Section 3: Graphics & Media

### 3.1 App Icon (512×512 PNG)

Location: **Store listing → Graphics**

- **Format**: PNG (with alpha channel)
- **Size**: 512×512 pixels
- **File size**: < 1MB
- **Requirements**:
  - No text on icon
  - Avoid transparency on outer edges
  - Ensure quality at small sizes (192px)

**Upload process**:
1. Click "App icon" section
2. Upload your 512×512 PNG
3. Google Play will auto-generate smaller sizes
4. Review preview at different sizes
5. Save and continue

### 3.2 Screenshots

Location: **Store listing → Graphics → Screenshots**

Create at least 2 screenshots for each device type:

**Phone Screenshots (1080×1920)**:
1. Main menu/title screen
2. Gameplay - combat in action
3. Character selection or training mode
4. Boss battle showcase
5. Victory/story progression

**Tablet Screenshots (1600×2560)**:
- Same content but optimized for tablet aspect ratio
- Show UI scaling on larger screens

**Best practices**:
- Use in-game footage only
- Add text overlays explaining features
- Show diverse gameplay aspects
- Keep consistent branding
- Ensure text is readable

**Tools**:
- Android Studio Emulator with screenshot feature
- `adb shell screencap` for device screenshots
- Graphic design tools for text overlays

### 3.3 Feature Graphic (1024×500 PNG)

Location: **Store listing → Graphics → Feature graphic**

Used on Play Store discovery page:
- **Size**: 1024×500 pixels exactly
- **Format**: PNG or JPG
- **Content**: Showcase your game's best features
- **Text**: Large, readable, centered text
- **Example**:
  ```
  [Game screenshot with overlay text]
  "Master Memory Combat"
  "Play Legends of Kai-Jax"
  ```

### 3.4 Promo Video (Optional)

Location: **Store listing → Graphics → Video thumbnail**

- Upload to YouTube (unlisted/private)
- Link YouTube video in Play Console
- 15-30 second gameplay video recommended
- Shows combat, graphics, and core gameplay

### 3.5 Privacy Policy Link

Location: **Store listing → Store Settings → App content**

**Create privacy policy**:

Example template:
```
Privacy Policy for Legends of Kai-Jax

Effective Date: [DATE]

Our Privacy Policy

Legends of Kai-Jax ("App") respects your privacy. This policy explains 
how we handle information:

1. Information We Collect
   - No personal data collection
   - No user accounts required
   - Game progress stored locally on device

2. Data Usage
   - No tracking
   - No advertising networks
   - No third-party analytics

3. Security
   - No network transmission of personal data
   - Game data stored securely on device

4. Children's Privacy
   - App is suitable for all ages
   - No data collection from minors

5. Changes to Policy
   - Updates will be posted to: [URL]

Contact: [your-email@example.com]
```

**Host the policy**:
- Create simple HTML page on your website
- Or use privacy policy generator:
  - [Termly Privacy Policy Generator](https://termly.io/)
  - [Privacypolicies.com](https://www.privacypolicies.com/)
  - [Free Privacy Policy](https://www.freeprivacypolicy.com/)

**Add to Play Console**:
1. Settings → Store Settings → App content
2. Paste or link privacy policy URL
3. Save

---

## Section 4: Content Rating

### 4.1 Fill Questionnaire

Location: **Setup → Content Rating**

Answer questions about your game:

**Violence**:
- Q: Does your app contain any violent content?
- A: No

**Profanity/Crude Language**:
- Q: Does your app contain profanity or crude language?
- A: No

**Sexual Content**:
- Q: Does your app contain sexual content?
- A: No

**Alcohol/Tobacco/Drugs**:
- Q: Does your app contain references to alcohol, tobacco, or drugs?
- A: No

**Gambling**:
- Q: Does your app contain gambling content?
- A: No

**User-Generated Content**:
- Q: Does your app contain user-generated content?
- A: No

### 4.2 Get Rating Certificate

After answering questionnaire:
1. Click "Save answers"
2. Automatic review generates rating
3. You'll receive IARC rating certificate
4. Ratings apply to:
   - Google Play
   - Amazon Appstore (if submitted)
   - Automatically applied

---

## Section 5: App Content & Pricing

### 5.1 App Access

Location: **Setup → App access**

Select:
- "This app is not restricted to any devices" (unless you have limitations)
- Check if any specific Android versions are excluded

### 5.2 Categories

Location: **Setup → Categories**

- **Primary category**: Games
- **Category**: Action

### 5.3 Content Rating

Location: **Setup → Content rating**

- **Rating board**: IARC (automatic)
- **Min age**: Suitable for all ages (or as determined by your content)

### 5.4 Target Countries

Location: **Setup → Target countries**

Select all countries where you want to distribute:
- Default: All countries
- Or select specific regions if needed

---

## Section 6: Test Release (Internal Testing)

### 6.1 Create Testing Track

1. Go to **Release → Internal testing**
2. Click "Create release"
3. Upload your signed AAB file:
   - `app-release.aab` from `apps/web/android/app/build/outputs/bundle/release/`
4. Add release notes (internal only)
5. Click "Save"

### 6.2 Add Test Users

1. Go to **Release → Internal testing → Testers**
2. Click "Add testers"
3. Create email list (Google Group recommended):
   - Add your test team emails
   - Include yourself
4. Share testing link with testers
5. Testers can install via Play Store

### 6.3 Testing Checklist

Distribute test build to:
- [ ] Android phone (API 24-29)
- [ ] Android phone (API 30-33)
- [ ] Android phone (API 34+)
- [ ] Tablet (if applicable)
- [ ] Various screen sizes

**Verification**:
- [ ] App installs successfully
- [ ] Splashscreen displays correctly
- [ ] App launches without crashes
- [ ] Three.js rendering works
- [ ] Touch input responsive
- [ ] Memory patterns execute correctly
- [ ] No console errors (check logcat)
- [ ] No performance issues
- [ ] Works offline
- [ ] All text is readable

### 6.4 Fix Issues

1. Create new build for any bugs found
2. Increment versionCode
3. Upload updated AAB to testing track
4. Ask testers to update and re-test

---

## Section 7: Prepare Production Release

### 7.1 Final Checks

Before uploading to production:

**Code quality**:
- [ ] All tests passing: `pnpm test`
- [ ] No TypeScript errors: `pnpm typecheck`
- [ ] No lint warnings: `pnpm lint`
- [ ] Performance tested and optimized

**Assets**:
- [ ] All icons present and correct sizes
- [ ] Splash screens for all densities
- [ ] Screenshots high quality and accurate
- [ ] Privacy policy live and accessible
- [ ] Feature graphic created

**Configuration**:
- [ ] Min SDK set to 24
- [ ] Target SDK set to 34
- [ ] Permissions correct in manifest
- [ ] App signing configured
- [ ] Version code incremented

### 7.2 Build Final Release

```bash
cd apps/web
pnpm build
npx cap sync android
cd android
./gradlew bundleRelease
```

Output: `apps/web/android/app/build/outputs/bundle/release/app-release.aab`

### 7.3 Verify Signing

```bash
# Verify the AAB is properly signed
jarsigner -verify -verbose apps/web/android/app/build/outputs/bundle/release/app-release.aab
```

---

## Section 8: Submit to Production

### 8.1 Create Production Release

1. Go to **Release → Production**
2. Click "Create release"
3. Upload signed AAB file
4. Add release notes:
   ```
   Version 1.0.0 - Initial Release
   
   - Launch of Legends of Kai-Jax: The Memory Hero
   - Full campaign with 10+ boss battles
   - Training mode for skill practice
   - Optimized performance for all Android devices
   ```

### 8.2 Configure Rollout

For safer launch, use gradual rollout:

1. In release configuration, enable "Staged rollout"
2. Start with **5% rollout**
3. Set schedule:
   - Day 1: 5%
   - Day 2: 10%
   - Day 3: 25%
   - Day 4: 50%
   - Day 5: 100%

**Alternative**: Full rollout immediately (only if thoroughly tested)

### 8.3 Review & Submit

Before clicking submit:
- [ ] All required fields filled
- [ ] AAB file uploaded
- [ ] Release notes added
- [ ] No validation errors shown
- [ ] Privacy policy link works
- [ ] Content rating selected
- [ ] Screenshots accurate

Click **"Review release"** then **"Start rollout"**

---

## Section 9: Monitor Review & Launch

### 9.1 Review Status

After submission:

1. Go to **Release → Production**
2. Monitor review status:
   - **In review**: Google is testing (2-24 hours typical)
   - **Ready to roll out**: Approved, waiting for you
   - **Rolled out**: Published to selected percentage
   - **Halted**: Issue found, address and resubmit

**Review criteria checked**:
- [ ] Complies with policies
- [ ] No crashes or errors
- [ ] Content matches rating
- [ ] Proper permissions usage
- [ ] No malware detected

### 9.2 Post-Launch Monitoring

Once live:

1. **Check daily for first week**:
   - Go to **Release → Production → Rollout**
   - Monitor crash rate and reviews
   - Check in-app crash reports

2. **Monitor metrics**:
   - **Statistics → Overview**
   - Installs, crashes, uninstalls
   - User ratings
   - Performance metrics

3. **Review feedback**:
   - **Reviews → Rating distribution**
   - Read user reviews
   - Respond to negative feedback
   - Track common issues

### 9.3 If Issues Found

If critical issue found during rollout:

1. Halt rollout: **Release → Rollout → Halt**
2. Fix issue in code
3. Build new version with incremented versionCode
4. Test thoroughly
5. Submit new release
6. Google re-reviews updated version

---

## Section 10: Maintenance & Updates

### 10.1 Monitor & Support

**Monthly tasks**:
- [ ] Review new crash reports
- [ ] Check user feedback
- [ ] Monitor rating trends
- [ ] Check for new Android warnings

**Quarterly tasks**:
- [ ] Update dependencies
- [ ] Review and update privacy policy
- [ ] Check Google Play policy changes
- [ ] Plan next feature release

### 10.2 Release Updates

For each new version:

1. **Increment version**:
   ```gradle
   versionCode 2  // Must always increase
   versionName "1.1.0"  // Semantic versioning
   ```

2. **Update changes**:
   - Create new build
   - Test thoroughly
   - Write release notes

3. **Staged rollout**:
   - Start with 5% again
   - Monitor for issues
   - Expand gradually

4. **Maintain schedule**:
   - Update every 4-8 weeks ideal
   - Shows active development
   - Keeps app visible in store

### 10.3 Version History

Maintain version log:

```
v1.0.0 - Sept 12, 2024
  versionCode: 1
  Changes: Initial release

v1.1.0 - Oct 15, 2024
  versionCode: 2
  Changes:
  - Fixed memory pattern bug
  - Optimized performance for older devices
  - Improved touch responsiveness

v1.2.0 - Nov 20, 2024
  versionCode: 3
  Changes:
  - Added new boss battle
  - New visual effects
  - Better tablet support
```

---

## Section 11: Marketing & Growth

### 11.1 Optimize Store Listing

**Improve discoverability**:

1. **Keywords**:
   - Memory game
   - Platform fighter
   - 3D action game
   - Combat game
   - Pattern recognition

2. **Update screenshot text**:
   - Include key features
   - Show game mechanics
   - Use engaging language

3. **A/B Testing**:
   - Test different descriptions
   - Monitor which converts better
   - Update accordingly

### 11.2 Gather Reviews

**Encourage ratings**:

1. Add in-game prompt after completing first level:
   ```
   "Enjoying Legends of Kai-Jax?"
   [Rate us] [Later] [No thanks]
   ```

2. Use Firebase In-App Messaging:
   - Track user progress
   - Prompt at natural break points
   - Link to Play Store review page

3. Respond to reviews:
   - Thank positive reviews
   - Address concerns in negative reviews
   - Show you're actively developing

### 11.3 Social Media

Share on:
- Twitter/X with `#indiegames` `#mobilegames`
- TikTok with gameplay clips
- YouTube with trailers/playthroughs
- Reddit communities (`r/androidgaming`, etc.)
- Discord gaming communities

---

## Troubleshooting

### "AAB won't upload"

**Solution**:
- Verify versionCode incremented
- Check AAB is properly signed
- Ensure AAB file not corrupted
- Try different browser

### "App crashes on user devices"

**Solution**:
1. Check Google Play Console crash reports
2. Review `adb logcat` from affected device
3. Focus on crashes with highest frequency
4. Create fix and test
5. Submit new version with incremented versionCode

### "App store listing pending for days"

**Solution**:
- Typical review: 2-24 hours
- Holiday delays possible
- Check email for violations
- Re-review if policy change detected
- Contact support if over 5 days

### "Low ratings/negative reviews"

**Solution**:
- Read all negative reviews carefully
- Identify common issues
- Create fix with detailed changelog
- Submit new version
- Respond to reviews explaining improvements
- Ask satisfied users to review

---

## Resources

- [Google Play Console Help](https://support.google.com/googleplay/android-developer)
- [Play Store Policies](https://play.google.com/about/developer-content-policy/)
- [Android Best Practices](https://developer.android.com/docs/quality-guidelines/core-app-quality)
- [App Signing Requirements](https://developer.android.com/studio/publish/app-signing)
- [Performance Guidelines](https://developer.android.com/topic/performance)

---

## Checklist for Launch

- [ ] Developer account created
- [ ] App listing completed
- [ ] All graphics uploaded
- [ ] Content rating questionnaire filled
- [ ] Privacy policy live and linked
- [ ] App signed with release keystore
- [ ] Internal testing completed (no crashes)
- [ ] Version code set correctly
- [ ] AAB file built and verified
- [ ] Release notes written
- [ ] Rollout strategy decided
- [ ] Team aware of launch date
- [ ] Crash monitoring enabled
- [ ] Marketing materials prepared
- [ ] Support email configured

---

## Support

For questions or issues:
1. Check Google Play Console help
2. Review submission error messages
3. Check app crash reports
4. Read user reviews for common issues
5. Contact Google Play support (account holder only)

Good luck with your launch!
