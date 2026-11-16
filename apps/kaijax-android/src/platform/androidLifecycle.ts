import { Capacitor } from '@capacitor/core';
import { App as CapApp } from '@capacitor/app';

export interface LifecycleHandlers {
  onBackground: () => void;
  onForeground: () => void;
  onBackButton: () => boolean;
}

/**
 * Registers Android Capacitor native lifecycle events (appStateChange & backButton)
 * plus standard browser visibilitychange / pagehide safety hooks so WebGL, Web Audio,
 * and autosave behave cleanly across Android backgrounding and screen locks.
 */
export function registerPlatformLifecycle(handlers: LifecycleHandlers): () => void {
  const onVisibility = () => {
    if (document.hidden) {
      handlers.onBackground();
    } else {
      handlers.onForeground();
    }
  };

  const onPageHide = () => {
    handlers.onBackground();
  };

  document.addEventListener('visibilitychange', onVisibility);
  window.addEventListener('pagehide', onPageHide);

  let removeStateListener: (() => Promise<void>) | undefined;
  let removeBackListener: (() => Promise<void>) | undefined;

  if (Capacitor.isNativePlatform()) {
    void CapApp.addListener('appStateChange', ({ isActive }) => {
      if (!isActive) {
        handlers.onBackground();
      } else {
        handlers.onForeground();
      }
    }).then((handle) => {
      removeStateListener = () => handle.remove();
    });

    void CapApp.addListener('backButton', ({ canGoBack }) => {
      const handledInApp = handlers.onBackButton();
      if (!handledInApp && !canGoBack) {
        void CapApp.minimizeApp();
      }
    }).then((handle) => {
      removeBackListener = () => handle.remove();
    });
  }

  return () => {
    document.removeEventListener('visibilitychange', onVisibility);
    window.removeEventListener('pagehide', onPageHide);
    void removeStateListener?.();
    void removeBackListener?.();
  };
}
