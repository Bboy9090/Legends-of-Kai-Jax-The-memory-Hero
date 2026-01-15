TECHNICAL DESIGN DOC: THE EVOLVING STAGE ENGINE
1. THE ESSENCE: THE LIVING BATTLEFIELD
Stages in this game are not platforms; they are "Reactive Narratives." Every stage is a specific fan-favorite location from the 9-book saga. As the "Resonance" or "Stakes" increase, the stage must physically transition through three distinct phases.
2. PHASED TRANSITION LOGIC
• Phase 1: The Calm (0-30% Damage/Time): Clean, high-fidelity environment. Standard gravity.
• Phase 2: The Fracture (31-70% Damage/Time): Dynamic destruction kicks in. Platforms break, lighting shifts to high-contrast/gritty, and "Bronx-style" resilience shows in the debris.
• Phase 3: The Omega State (71-100% Damage/Time): The lore takes over. The reality of the stage tears open. Gravity fluctuates (Low G or High G shifts). The environment becomes a "Cinematic Chaos" zone.
3. MECHANICAL FEATURES (THE VIRGO DETAIL)
• Procedural Destruction: Don't use pre-baked animations. Use "Mesh Slicing." If the Villain hits a pillar, it should break exactly where the impact occurs.
• Lore-Grounded Hazards: Instead of generic fire or spikes, use "Book-Specific Anomalies" (e.g., Spectral Winds, Time Leaks, or Void Rifts) that force players to adapt their movement.
• The "Impact Mirror": The stage "reflects" the damage. If a character is slammed into a wall, that wall stays dented for the rest of the match.
4. TECHNICAL SPECIFICATIONS (FOR THE AGENTS)
• Collision Layers: Every stage must have a "Deformation Layer" that stores vertex displacement data from character impacts.
• Global Illumination: Real-time lighting shifts. As the Villain enters Phase 3, the "Static Decay" aura should cast shadows that move independently of the light source.
• Optimization: Use "Occlusion Culling" so the AI only calculates physics for the debris currently on screen, keeping the game at a locked 60FPS.
5. STAGE EXAMPLE: "THE NEON WASTES" (BRONX EVOLVED)
• Phase 1: Futuristic cityscape with high-rises.
• Phase 2: Buildings start collapsing, creating new diagonal platforms.
• Phase 3: The city floats into the atmosphere. The background shows the "Original Antagonist" watching from the stars.
6. CODE DIRECTIVE (DESTRUCTION SCRIPT) // Logic for Stage Deformation on Legendary Impact
function onLegendaryImpact(impactPoint, powerScale) {
    if (powerScale > 0.8) {
        stage.deformGeometry(impactPoint, powerScale);
        triggerCameraShake(powerScale * 2);
        playVFX('reality_tear_particles');
    }
}
