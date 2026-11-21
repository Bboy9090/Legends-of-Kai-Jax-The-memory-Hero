import assert from 'node:assert/strict';
import { test } from 'node:test';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { DialogueOverlay } from '../DialogueOverlay';
import type { DialogueLine } from '../../game/types';

const lines = [
  { speaker: 'Kai', role: 'Memory Hero', text: 'We hold the line.', portraitHero: 'kai' },
  { speaker: 'Jax', role: 'Storm Guard', text: 'Then we hunt.', portraitHero: 'jax' },
] as unknown as DialogueLine[];

const render = (currentIndex: number, subtitleScale: 'normal' | 'large' = 'normal') =>
  renderToStaticMarkup(
    <DialogueOverlay lines={lines} currentIndex={currentIndex} subtitleScale={subtitleScale} onAdvance={() => {}} onSkip={() => {}} />,
  );

test('dialogue is a named dialog region', () => {
  const html = render(0);
  assert.match(html, /role="dialog"/);
  assert.match(html, /aria-label="Story dialogue"/);
});

test('the line is a polite, atomic live region that names the speaker for screen readers', () => {
  const html = render(0);
  assert.match(html, /role="status"/);
  assert.match(html, /aria-live="polite"/);
  assert.match(html, /aria-atomic="true"/);
  assert.match(html, /<span class="sr-only">Kai: <\/span>We hold the line\./);
});

test('progress counter has a spoken label, not bare numbers', () => {
  assert.match(render(1), /aria-label="Line 2 of 2"/);
});

test('primary action reflects the last line and both buttons have names', () => {
  assert.match(render(0), />Next</);
  assert.match(render(1), />Continue</);
  assert.match(render(0), /aria-label="Skip scene"/);
});

test('large subtitle scale still applies', () => {
  assert.match(render(0, 'large'), /text-base sm:text-lg/);
  assert.match(render(0, 'normal'), /text-sm sm:text-base/);
});

test('renders nothing for an out-of-range line', () => {
  assert.equal(render(5), '');
});
