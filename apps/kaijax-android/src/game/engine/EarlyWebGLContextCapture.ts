/**
 * Scoped, opt-in WebGL2 context interception during renderer construction.
 *
 * Three.js requests its WebGL2 context synchronously from a canvas before
 * initializing textures. Attach diagnostics at that boundary without editing
 * the frozen, checksummed GameEngine source.
 *
 * The prototype is restored in finally on success AND constructor failure.
 * Never call this helper in the normal gameplay/rendering path.
 */
export function withEarlyWebGL2ContextCapture<T>(
  create: () => T,
  onContext: (gl: WebGL2RenderingContext) => void,
  onUnavailable?: (reason: string) => void,
): T {
  if (typeof HTMLCanvasElement === 'undefined') {
    onUnavailable?.('HTMLCanvasElement is unavailable; early GPU probing disabled');
    return create();
  }

  const proto = HTMLCanvasElement.prototype;
  const original = proto.getContext;
  if (typeof original !== 'function') {
    onUnavailable?.('Canvas getContext is unavailable; early GPU probing disabled');
    return create();
  }

  const descriptor = Object.getOwnPropertyDescriptor(proto, 'getContext');
  let captured = false;
  let patched = false;

  try {
    Object.defineProperty(proto, 'getContext', {
      configurable: true,
      writable: true,
      enumerable: descriptor?.enumerable ?? false,
      value: function (this: HTMLCanvasElement, ...args: unknown[]) {
        const context = Reflect.apply(original, this, args);
        if (!captured && args[0] === 'webgl2' && context) {
          captured = true;
          try {
            onContext(context as WebGL2RenderingContext);
          } catch {
            onUnavailable?.('Initial WebGL2 diagnostic attachment failed; rendering continues');
          }
        }
        return context;
      },
    });
    patched = true;
  } catch {
    onUnavailable?.('Canvas getContext cannot be instrumented; using late diagnostic fallback');
  }

  try {
    return create();
  } finally {
    if (patched) {
      // Restore the exact descriptor and inherited-property behavior.
      if (descriptor) Object.defineProperty(proto, 'getContext', descriptor);
      else Reflect.deleteProperty(proto, 'getContext');
    }
  }
}
