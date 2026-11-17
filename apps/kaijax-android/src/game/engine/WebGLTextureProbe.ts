/**
 * Opt-in WebGL texture-error recorder for issue #396.
 *
 * NO changes to the normal rendering path. Installed only when ?gpuProbe=1.
 * Every observed error is attributed to the operation AFTER which the error
 * was read; WebGL errors can originate in earlier commands. This is a
 * diagnostic tool, not evidence that generateMipmap is the root cause.
 *
 * Records enum values and dimensions only, NEVER image pixels, URL contents,
 * framebuffers or credentials. Uses bounded memory and is safe to uninstall.
 */
export interface GlTextureOperation {
  operation: string;
  target: number | null;
  width?: number;
  height?: number;
  sourceType?: string;
}

export interface GlTextureAnomaly {
  errorCode: number;
  afterOperation: GlTextureOperation;
  precedingOperations: GlTextureOperation[];
}

export interface GlTextureProbeSnapshot {
  operationsObserved: number;
  errorsObserved: number;
  /** Hooks actually installed; an empty anomaly list is inconclusive without coverage. */
  hookedMethods: string[];
  unavailableMethods: string[];
  /** Minimal coverage of binding, upload, sampling parameters and mipmap creation. */
  coreHooksReady: boolean;
  anomalies: GlTextureAnomaly[];
}

export interface GlTextureProbeHandle {
  snapshot(): GlTextureProbeSnapshot;
  uninstall(): void;
}

type GlLike = Pick<WebGLRenderingContext, 'getError' | 'NO_ERROR'> & object;
const WATCHED = [
  'bindTexture',
  'texImage2D',
  'texSubImage2D',
  'texStorage2D',
  'compressedTexImage2D',
  'texParameteri',
  'generateMipmap',
] as const;

function number(value: unknown): number | undefined {
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined;
}

function operationSummary(name: string, args: unknown[]): GlTextureOperation {
  const summary: GlTextureOperation = {
    operation: name,
    target: number(args[0]) ?? null,
  };
  if (name === 'texImage2D' || name === 'compressedTexImage2D') {
    if (args.length >= 9 || name === 'compressedTexImage2D') {
      summary.width = number(args[3]);
      summary.height = number(args[4]);
    } else {
      const source = args[args.length - 1] as { width?: unknown; height?: unknown; videoWidth?: unknown; videoHeight?: unknown; constructor?: { name?: string } } | null;
      if (source && typeof source === 'object') {
        summary.width = number(source.videoWidth) ?? number(source.width);
        summary.height = number(source.videoHeight) ?? number(source.height);
        summary.sourceType = typeof source.constructor?.name === 'string' ? source.constructor.name.slice(0, 48) : 'image-source';
      }
    }
  } else if (name === 'texStorage2D') {
    summary.width = number(args[3]);
    summary.height = number(args[4]);
  } else if (name === 'texSubImage2D' && args.length >= 9) {
    summary.width = number(args[4]);
    summary.height = number(args[5]);
  }
  return summary;
}

/**
 * Observes errors after texture operations in an explicitly enabled diagnostic
 * session. getError() consumes the WebGL error state, so this MUST NOT run in
 * normal gameplay or production performance qualification.
 */
export function installWebGLTextureProbe(
  gl: GlLike,
  onError?: (anomaly: GlTextureAnomaly) => void,
): GlTextureProbeHandle {
  const context = gl as unknown as Record<string, unknown>;
  const originalGetError = gl.getError.bind(gl);
  const recent: GlTextureOperation[] = [];
  const anomalies: GlTextureAnomaly[] = [];
  const installed: { method: string; ownDescriptor?: PropertyDescriptor }[] = [];
  let operationsObserved = 0;
  let errorsObserved = 0;
  let active = true;

  for (const method of WATCHED) {
    const original = context[method];
    if (typeof original !== 'function') continue;
    const ownDescriptor = Object.getOwnPropertyDescriptor(gl, method);
    const wrapped = (...args: unknown[]) => {
      const op = operationSummary(method, args);
      operationsObserved++;
      recent.push(op);
      if (recent.length > 12) recent.shift();
      // Do not hide native WebGL exceptions.
      const result = Reflect.apply(original, gl, args);
      const errorCode = originalGetError();
      if (errorCode !== gl.NO_ERROR) {
        errorsObserved++;
        if (anomalies.length < 32) {
          const anomaly = {
            errorCode,
            afterOperation: op,
            precedingOperations: recent.slice(0, -1),
          };
          anomalies.push(anomaly);
          onError?.(anomaly);
        }
      }
      return result;
    };
    try {
      Object.defineProperty(gl, method, {
        value: wrapped,
        configurable: true,
        writable: true,
      });
      installed.push({ method, ownDescriptor });
    } catch {
      // Host WebGL objects may reject property overrides; don't break graphics.
    }
  }

  return {
    snapshot: () => ({
      operationsObserved,
      errorsObserved,
      hookedMethods: installed.map((entry) => entry.method),
      unavailableMethods: WATCHED.filter((method) => !installed.some((entry) => entry.method === method)),
      coreHooksReady: ['bindTexture', 'texImage2D', 'texParameteri', 'generateMipmap']
        .every((method) => installed.some((entry) => entry.method === method)),
      anomalies: anomalies.map((entry) => ({
        errorCode: entry.errorCode,
        afterOperation: { ...entry.afterOperation },
        precedingOperations: entry.precedingOperations.map((op) => ({ ...op })),
      })),
    }),
    uninstall: () => {
      if (!active) return;
      active = false;
      for (const { method, ownDescriptor } of installed) {
        try {
          if (ownDescriptor) Object.defineProperty(gl, method, ownDescriptor);
          else Reflect.deleteProperty(gl, method);
        } catch {
          // Never throw during renderer disposal.
        }
      }
    },
  };
}
