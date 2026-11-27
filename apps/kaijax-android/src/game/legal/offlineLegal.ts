/**
 * Offline-safe legal disclosures bundled inside the app (no external URLs)
 * per Source B commit 0db6eed316 for offline PWA & Capacitor Android readiness.
 */

export interface LegalDocument {
  id: 'privacy' | 'terms';
  title: string;
  updated: string;
  sections: { heading: string; body: string }[];
}

export const OFFLINE_LEGAL_DOCS: Record<'privacy' | 'terms', LegalDocument> = {
  privacy: {
    id: 'privacy',
    title: 'Privacy Policy (Offline Build)',
    updated: 'November 2026',
    sections: [
      {
        heading: '1. Local-Only Storage',
        body: 'Legends of Kai-Jax: The Memory Hero runs offline-first. Campaign save slots, accessibility preferences, and local combat tuning telemetry (parries, evades, hits taken, peak combo) are stored exclusively on your device via local storage and never transmitted to external analytics servers.',
      },
      {
        heading: '2. Permissions & Device Features',
        body: 'Touch haptics use standard Android/Web vibration APIs when enabled in Settings. No contacts, camera, microphone, location, or background advertising identifiers are requested or collected.',
      },
      {
        heading: '3. Export & Deletion',
        body: 'You can export any save slot as JSON or permanently clear save slots at any time inside Command Hub -> Settings & Saves.',
      },
    ],
  },
  terms: {
    id: 'terms',
    title: 'Terms of Use & Franchise Notice',
    updated: 'November 2026',
    sections: [
      {
        heading: '1. Intellectual Property & Original Canon',
        body: 'Legends of Kai-Jax: The Memory Hero, Kai, Jax, Kai-Jax, Bovar, Boryn, Borax, the Four Heritages (Myrr\'Kai, Pyraxis, Kar-Voth, Thryxen), and the Raging City districts are original franchise works. This release enforces authoritative Kai-Jax tri-tail canon.',
      },
      {
        heading: '2. Single-Player Offline License',
        body: 'Provided for personal interactive play and release QA evaluation. Save JSON exports remain user-controlled local backups.',
      },
      {
        heading: '3. Accessibility & Epileptic Safety',
        body: 'If you experience sensitivity to high-contrast flash effects or camera shake, enable Reduced Motion or Generous Parry Timing in Settings, or toggle OS-level reduced motion.',
      },
    ],
  },
};
