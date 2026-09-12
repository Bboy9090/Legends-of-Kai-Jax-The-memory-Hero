# Legends of Kai-Jax: App Store Submission Checklist

Complete checklist for submitting the iOS app to the Apple App Store.

## Pre-Submission Checklist

### Project Setup
- [ ] Web app builds successfully: `pnpm build`
- [ ] Build output is in `apps/web/dist/`
- [ ] All assets are included (images, models, sounds)
- [ ] No development code or debugging enabled
- [ ] Environment variables configured for production
- [ ] API endpoints point to production servers

### Code Quality
- [ ] No console errors or warnings
- [ ] TypeScript compiles without errors: `pnpm typecheck`
- [ ] ESLint passes: `pnpm lint`
- [ ] All tests pass: `pnpm test`
- [ ] No hardcoded credentials or secrets
- [ ] Performance optimized (Three.js renderer tuned)
- [ ] Memory usage stable (no leaks)

### iOS Configuration
- [ ] Capacitor installed and configured
- [ ] iOS project synced: `pnpm cap sync ios`
- [ ] Info.plist updated with privacy descriptions
- [ ] App icons prepared and added
- [ ] Splash screens prepared and added
- [ ] Version number set correctly
- [ ] Bundle ID configured: `com.bobbyblanco.legendsofkaijax`
- [ ] Minimum iOS version set to 15.0

### Assets and Content
- [ ] App Icon (1024x1024 PNG)
  - [ ] No rounded corners (Apple adds them)
  - [ ] No transparent areas
  - [ ] High contrast and clear
  - [ ] Represents app well at small sizes

- [ ] Home Screen Icons (iPhone & iPad)
  - [ ] 120x120 (iPhone 2x)
  - [ ] 180x180 (iPhone 3x)
  - [ ] 152x152 (iPad 2x)
  - [ ] 167x167 (iPad Pro)
  - [ ] All sizes match design

- [ ] Splash Screens
  - [ ] Covers all device sizes
  - [ ] Matches app branding
  - [ ] Loads quickly
  - [ ] No animation in splash

- [ ] Screenshots (5-10 images per device)
  - [ ] iPhone 6.7" or larger (required)
  - [ ] iPad (recommended)
  - [ ] No UI overlays in screenshots
  - [ ] Show key app features
  - [ ] Include text descriptions
  - [ ] Professional quality

- [ ] App Preview Video (optional but recommended)
  - [ ] 15-30 seconds long
  - [ ] Shows core gameplay
  - [ ] No external audio (use app audio)
  - [ ] 1920x1080 or higher resolution
  - [ ] MP4 format

### Testing on Devices

#### iOS 15+ Simulator Testing
- [ ] App launches without crashes
- [ ] Three.js rendering works
- [ ] Touch controls responsive
- [ ] All game features functional
- [ ] UI scales correctly
- [ ] No memory leaks
- [ ] Performance acceptable (60 FPS)
- [ ] All device sizes tested (iPhone SE, 12 Pro, 12 Pro Max, iPad)

#### Physical Device Testing (if available)
- [ ] App launches and runs smoothly
- [ ] Touch input responsive
- [ ] Audio works
- [ ] Camera/microphone permissions request properly
- [ ] Network connectivity works
- [ ] Battery usage reasonable
- [ ] No overheating during gameplay
- [ ] Works in low light conditions

#### Gameplay Testing
- [ ] All game features work
- [ ] Combat mechanics functional
- [ ] Character selection works
- [ ] Settings/options accessible
- [ ] Save/load functionality works
- [ ] Multiplayer features work (if applicable)
- [ ] No hardcoded test data
- [ ] Proper error messages for failures

### Code Signing and Provisioning

- [ ] Apple Developer Account active
- [ ] Certificate created:
  - [ ] "Apple Distribution" certificate downloaded
  - [ ] Certificate imported into Keychain
  - [ ] Certificate valid for App Store distribution
  
- [ ] Provisioning Profile created:
  - [ ] App Store distribution profile
  - [ ] Profile downloaded and imported
  - [ ] Profile includes correct App ID
  - [ ] Profile includes distribution certificate
  - [ ] Profile not expired
  
- [ ] Xcode Configuration:
  - [ ] Team ID set correctly
  - [ ] Bundle ID matches certificate
  - [ ] Signing certificate selected: "Apple Distribution"
  - [ ] Provisioning profile selected
  - [ ] Automatic code signing disabled (manual selected)

### Privacy and Security
- [ ] Privacy Policy written and published
- [ ] GDPR compliant (if serving EU users)
- [ ] Data handling documented
- [ ] Third-party libraries reviewed for privacy
- [ ] No tracking without consent
- [ ] Camera/microphone permissions justified
- [ ] Network communication encrypted (HTTPS)
- [ ] No hardcoded API keys or secrets

### App Store Connect Setup

#### App Information
- [ ] App name: "Legends of Kai-Jax"
- [ ] Subtitle: "The Memory Hero - A Mythic Platform Fighter"
- [ ] Category: Games > Action (or appropriate category)
- [ ] Subcategory: Games > Action > Fighting
- [ ] Bundle ID: com.bobbyblanco.legendsofkaijax
- [ ] SKU: legendsofkaijax-1 (or unique identifier)

#### Description
- [ ] Description (4000 character max):
  - [ ] Engaging opening paragraph
  - [ ] Lists main features
  - [ ] Explains gameplay
  - [ ] Mentions requirements (iOS 15+)
  - [ ] Clear and professional language
  - [ ] No promotional claims

- [ ] Keywords (100 characters max):
  - [ ] Include: game, action, platform fighter, mythology
  - [ ] Relevant to gameplay
  - [ ] Searchable terms

- [ ] Support URL: https://your-website.com/support
- [ ] Privacy Policy URL: https://your-website.com/privacy
- [ ] Support Email: support@your-company.com

#### Version Information
- [ ] Version: 1.0.0 (3-part version number)
- [ ] Build: Matches Xcode build number
- [ ] Release Notes: 
  - [ ] Describes what's new
  - [ ] Credits contributors
  - [ ] Professional tone
  - [ ] 4000 character max

#### Pricing and Availability
- [ ] Price: Free or $X.99
- [ ] Release Date: When app goes live
- [ ] Territories: Select countries
- [ ] Make Available: Immediately or scheduled date

#### Content Rating
- [ ] Completed questionnaire:
  - [ ] Describe violence (if any)
  - [ ] Describe gambling (if any)
  - [ ] Describe horror (if any)
  - [ ] Describe alcohol/tobacco (if any)
  - [ ] Rate for all age groups
  - [ ] ESRB/PEGI rating assigned

#### Rating and Review
- [ ] Enabled user ratings and reviews
- [ ] Monitored negative reviews
- [ ] Prepared response for common feedback

#### Review Information
- [ ] Demo account (if needed):
  - [ ] Email address
  - [ ] Password
  - [ ] Instructions for testing
  
- [ ] Review Notes:
  - [ ] Special testing instructions
  - [ ] Known limitations
  - [ ] Required features for testing
  - [ ] Demo account login (if applicable)
  
- [ ] Sign In Required: Set if game requires account
- [ ] Geolocation: Describe if used
- [ ] Uses Health/Fitness: Set if applicable

#### Export Compliance
- [ ] Encryption: Declare if using encryption
  - [ ] No custom encryption (use standard TLS)
  - [ ] Standard encryption is acceptable
- [ ] Exempt from ARF: Check if applicable

#### Build Selection
- [ ] Build uploaded successfully
- [ ] Build number matches IPA
- [ ] Build passes validation
- [ ] Build completes processing
- [ ] Build appears in Build section

### Pre-Submission Quality Checks

#### Functionality
- [ ] App does not crash on launch
- [ ] All screens load correctly
- [ ] Text is readable (not cut off)
- [ ] Buttons and controls responsive
- [ ] No broken links or assets
- [ ] Network calls successful
- [ ] Error handling works

#### Performance
- [ ] App launches in < 5 seconds
- [ ] Smooth scrolling and animations
- [ ] No lag during gameplay
- [ ] Memory usage stable
- [ ] Battery drain acceptable
- [ ] No crashes on low memory
- [ ] Works on slow networks

#### Usability
- [ ] Intuitive navigation
- [ ] Clear instructions/tutorial
- [ ] Settings easy to access
- [ ] Back buttons work correctly
- [ ] Standard iOS gestures work
- [ ] Keyboard not obscuring content
- [ ] Text size readable

#### Compliance
- [ ] No private APIs used
- [ ] No unauthorized system resources accessed
- [ ] App does not modify device settings
- [ ] No background execution without permission
- [ ] Uses proper API permissions
- [ ] Complies with App Store guidelines
- [ ] No objectionable content

### Final Checks Before Submission

- [ ] All checklist items completed
- [ ] No pending issues or TODOs
- [ ] Code review completed
- [ ] QA testing finished
- [ ] Performance optimized
- [ ] Security reviewed
- [ ] Privacy policy finalized
- [ ] Screenshots and preview videos uploaded
- [ ] Build uploaded and validated
- [ ] App Store Connect entry complete
- [ ] Review information provided
- [ ] Export compliance set
- [ ] Content rating assigned

### Submission Execution

1. [ ] Log into App Store Connect
2. [ ] Select app
3. [ ] Navigate to "Prepare for Submission" > current version
4. [ ] Review all information one final time
5. [ ] Confirm build selection
6. [ ] Add release notes
7. [ ] Set version number
8. [ ] Click "Add for Review"
9. [ ] Confirm submission
10. [ ] Receive submission confirmation email

### Post-Submission

- [ ] Monitor submission status
- [ ] Check email for review updates
- [ ] Respond to any review questions
- [ ] Have updated builds ready if rejected
- [ ] Plan for marketing and launch
- [ ] Monitor user ratings and reviews
- [ ] Plan future updates

## Common Rejection Reasons

### Functionality
- [ ] App crashes or has bugs
- [ ] Core features don't work
- [ ] Performance issues
- [ ] Not following iOS standards

### Content
- [ ] Objectionable content
- [ ] Misleading information
- [ ] Outdated information
- [ ] Copyright/trademark issues

### Privacy/Security
- [ ] Excessive data collection
- [ ] No privacy policy
- [ ] Suspicious network calls
- [ ] Hardcoded credentials

### Design/UX
- [ ] UI doesn't follow iOS guidelines
- [ ] Poor user experience
- [ ] Unclear instructions
- [ ] Missing required screens

### Guidelines
- [ ] Violates App Store guidelines
- [ ] Uses private APIs
- [ ] Conflicts with Apple services
- [ ] Illegal content

## If Your App is Rejected

1. **Read the rejection reason carefully**
   - Apple provides specific guidelines
   - Note the exact section violated

2. **Make required changes**
   - Fix the identified issues
   - Test thoroughly before resubmission
   - Document the changes

3. **Prepare resubmission**
   - Increment build number
   - Update version notes explaining fix
   - Provide detailed explanation in Review Notes

4. **Resubmit**
   - Build new IPA
   - Upload to App Store Connect
   - Add new build to version
   - Submit for review again

5. **Follow up (if needed)**
   - If rejected multiple times, contact Apple support
   - Provide detailed explanation of changes
   - Request clarification if needed

## Successful Submission

Once approved:
1. App appears on App Store
2. Can schedule release date
3. Monitor initial reviews and ratings
4. Plan and develop next version
5. Gather user feedback
6. Plan future updates based on feedback

## Contact Information

- **Apple Developer Support**: https://developer.apple.com/contact/
- **App Store Connect**: https://appstoreconnect.apple.com
- **App Store Review Guidelines**: https://developer.apple.com/app-store/review/guidelines/
- **App Store Connect Help**: https://help.apple.com/app-store-connect/

---

**Version**: 1.0
**Last Updated**: 2026-09-12
**Status**: Ready for Submission
