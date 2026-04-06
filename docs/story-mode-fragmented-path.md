# Story Mode: Fragmented Path (WebGL/R3F)

This document maps the Story Mode architecture for a lightweight browser-first build using React Three Fiber. The focus is on streaming small **sectors** instead of one massive map, keeping draw calls and memory aligned with Chromebook and mobile browsers.

## Acts & Sectors
- **Act I – The Awakening (Tutorial Sector):** Simple geometry and short traversal to teach movement.
- **Act II – The Fractured Crossing (Open Zone):** The first open zone that blends emerald ridges with sky ruins and rewards exploration.
- **Act III – The Corruption (Boss Arena):** Compact arena built for a single high-stakes encounter.

## Movement Logic (The Feel)
- Use a **kinematic character** approach for platformer-like responsiveness; Rapier’s Kinematic Character Controller is a good fit if you add physics later.
- On mobile, map the **virtual joystick angle to the camera forward vector** so movement always feels intentional.
- Keep gravity/ground detection simple to reduce CPU cost.

## Rendering Strategy (Optimization)
- **Bubble Rule:** Only render assets within ~50m of the player. Cull distant props aggressively.
- **Instancing:** Forests, ruins, or repeated props should use `InstancedMesh` (one draw call for many objects).
- **Texture Atlas:** Merge small textures when possible to reduce network requests and state changes.

## Code Drop-in
- `client/src/story-mode/StoryModeLogic.tsx` includes:
  - **`useStoryStore`** for act state, dialogue, and objective completion.
  - **Player controller** with camera-relative inputs, facing rotation that follows movement, and basic jump/gravity.
  - **Level manager** that swaps sector geometry and triggers objectives per act.
  - A **HUD overlay** describing the sector, objectives, and the optimization reminders (bubble rule, instancing).
- Hook the component into your main `<Canvas>` or route to enable the Story Mode prototype.

### Swapping Heroes / GLB Avatars
- Pass a `heroConfig` prop to `StoryModeLogic` to use a specific `.glb` hero model.
- If a GLB URL is provided, the loader swaps the greybox capsule for the imported mesh; otherwise, the capsule remains as a fallback.
- Use `scale` to fit the model inside the controller’s capsule.

```tsx
<StoryModeLogic
  heroConfig={{
    id: "blur",
    name: "Cobalt Blur",
    glbUrl: "/assets/cobalt-blur.glb", // replace with your CDN/local path
    scale: 0.8,
    color: "#38bdf8", // used for fallback capsule + outlines
  }}
/>
```

## Minimal Hook Example
```tsx
// In a page or route
import { StoryModeLogic } from "../story-mode/StoryModeLogic";

export default function StoryModePage() {
  return <StoryModeLogic />;
}
```

## What To Build Next
- Replace placeholder meshes with instanced props and streamed glTF chunks per sector.
- Swap the simple controller for Rapier’s kinematic controller once physics is wired up.
- Add UI for manual sector selection and checkpointing for playtesting.
