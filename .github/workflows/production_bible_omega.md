PRODUCTION BIBLE: PROJECT OMEGA
Status: Production-Ready / Legendary Tier
Core Directive: Transcend the limits of Smash Ultimate and Ultimate Alliance.
1. THE KINETIC PHILOSOPHY (MOVEMENT & FEEL)
If the game doesn't feel like a masterpiece in the first 5 seconds of moving the stick, we fail.
A. The "Zero-Latency" Protocol
• Input Polling: 1000Hz polling rate. Every millisecond counts.
• Input Buffering: Implement a 6-frame buffer window. This ensures that if a player is slightly early on a combo, the game "understands" the intent and executes.
• Coyote Time: 4 frames of "grace" after leaving a platform where a jump input is still valid.
• Animation Blending: Use "Motion Matching." Instead of static transitions, the AI picks the best frame to blend a walk into a run based on momentum.
B. Gravity & Friction
• Variable Gravity (g):
• Standard: g = 9.8m/s^2
• Fast-Fall: g = 15.0m/s^2 (Triggered by flicking down)
• Friction Coefficient: Implement "Grip Logic." Different surfaces in your book locations (Neon Wastes vs. Void Rifts) must change the stop-distance of a dash.
2. COMBAT ARCHITECTURE (THE "CRUNCH")
Fighting must be visceral. We are blending the 1v1 precision of Smash with the chaotic squad power of Ultimate Alliance.
A. The "Impact Engine"
• Hit-Stop (The Secret Sauce): - Light hits: 3 frames.
• Heavy/Legendary hits: 10-15 frames + screen desaturation.
• Dynamic Screen Shake: Vector-based shake. If a hit comes from the left, the screen jars to the right.
• Vector Knockback: K = (P \times W) + D, where P is power, W is weight-ratio, and D is current damage percentage.
B. The Combo State-Machine
• Canceling: Allow "Jump-Canceling" and "Dash-Canceling" for high-skill players to string together moves that weren't "intended" by the devs—this creates the "Future no one has seen."
3. VISUAL FIDELITY (THE "PAST AMAZING" STANDARD)
We are aiming for cinematic realism that stays true to the 9-book saga's grit.
A. Lighting & Materials
• PBR (Physically Based Rendering): Every material—obsidian armor, hard-light, Bronx concrete—must react to light accurately.
• Subsurface Scattering: Character skin must look alive, allowing light to bleed through ears and fingers.
• Global Volumetrics: Use "Aura-Lighting." When the Villain or Hero powers up, they become the primary light source for the environment.
B. Procedural Chaos
• Destruction: Real-time mesh slicing. No pre-baked rubble.
• Particle Systems: 10,000+ particles for "Legacy Summons." Use GPU-accelerated particles for zero performance hit.
4. CROSS-PLATFORM UX (CONTROLLER TO PHONE)
The game must feel "Native" on every device.
A. Adaptive UI/UX
• Mobile: Implement "Contextual Touch." A small swipe is a dash; a long press is a charge. The virtual joystick must have "Dynamic Centering"—wherever the thumb lands, that’s the center.
• Controller: Full utilization of haptic triggers. The "Villain’s" heavy steps should vibrate the left trigger; the "Hero’s" light zips vibrate the right.
B. Performance Parity
• Target: Locked 60FPS on iPhone 15+ and 120FPS on PC/Console.
• Dynamic Resolution Scaling: If the "Omega State" gets too chaotic, the resolution scales down by 10% to keep the frame rate perfect.
5. LORE & CHARACTER INTEGRATION
• The "Legacy" System: "The Kids" (Next-Gen) inherit "Echo Traits" from the Legends.
• The Original Villain: He is the "Technical Gatekeeper." His AI must be the most advanced, using machine learning to adapt to the player’s most-used combos.
6. PRODUCTION ROADMAP TO 100%
1. Phase Alpha (The Skeleton): Finalize Physics Engine & Global Gravity.
2. Phase Beta (The Flesh): Import 4 "Legend" characters and 2 "Next-Gen" characters. Complete the "Neon Wastes" stage.
3. Phase Gamma (The Polish): Implement the "Impact Engine" (Hit-stop/Shake). Add V-FX.
4. Phase Delta (The Optimization): Mobile porting, UI scaling, and 120FPS stress tests.
5. Phase Omega (The Launch): Full story-mode integration from the 9-book saga.
