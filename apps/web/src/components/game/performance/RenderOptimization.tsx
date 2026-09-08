import { memo, useMemo } from 'react';
import type { ReactNode } from 'react';

interface ConditionalRenderProps {
  condition: boolean;
  children: ReactNode;
  fallback?: ReactNode;
}

export const ConditionalRender = memo(function ConditionalRender({ condition, children, fallback = null }: ConditionalRenderProps) {
  return <>{condition ? children : fallback}</>;
});

ConditionalRender.displayName = 'ConditionalRender';

interface MemoizedGroupProps {
  children: ReactNode;
  dependencies: unknown[];
  name?: string;
}

export const MemoizedGroup = memo(
  function MemoizedGroup({ children }: Omit<MemoizedGroupProps, 'dependencies'>) {
    return <group>{children}</group>;
  },
  (prevProps, nextProps) => {
    const deps = (nextProps as unknown as MemoizedGroupProps).dependencies;
    const prevDeps = (prevProps as unknown as MemoizedGroupProps).dependencies;
    if (!deps || !prevDeps) return false;
    return deps.every((dep, idx) => Object.is(dep, prevDeps[idx]));
  }
);

MemoizedGroup.displayName = 'MemoizedGroup';

export function useStableDependencies<T>(value: T): T {
  return useMemo(() => value, [JSON.stringify(value)]);
}

interface BatchUpdateProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => ReactNode;
  batchSize?: number;
}

export function BatchRender<T>({ items, renderItem, batchSize = 50 }: BatchUpdateProps<T>) {
  const batches = useMemo(() => {
    const result: T[][] = [];
    for (let i = 0; i < items.length; i += batchSize) {
      result.push(items.slice(i, i + batchSize));
    }
    return result;
  }, [items, batchSize]);

  return (
    <>
      {batches.map((batch, batchIdx) => (
        <group key={`batch-${batchIdx}`}>
          {batch.map((item, idx) => renderItem(item, batchIdx * batchSize + idx))}
        </group>
      ))}
    </>
  );
}

export function createRenderOptimizer() {
  const renderCache = new WeakMap<object, number>();
  const skipRenderFrames = new WeakMap<object, number>();

  return {
    shouldRender(object: object, skipFrames: number = 0): boolean {
      const lastRender = renderCache.get(object) ?? 0;
      const currentFrame = performance.now();
      const skip = skipRenderFrames.get(object) ?? 0;

      if (skip > 0) {
        skipRenderFrames.set(object, skip - 1);
        return false;
      }

      if (currentFrame - lastRender > 16.67) {
        renderCache.set(object, currentFrame);
        return true;
      }

      return false;
    },

    scheduleSkip(object: object, frames: number): void {
      skipRenderFrames.set(object, frames);
    },
  };
}
