/**
 * Minimal event-bus contract the combat/FX systems depend on.
 * The concrete implementation lives in packages/game (`eventBus`) and satisfies this structurally,
 * so the systems no longer need the unresolved `@game/*` alias.
 */
export interface EventBus {
  subscribe(event: string, callback: (data: any) => void): () => void;
  emit(event: string, data?: unknown): void;
}
