/**
 * Offline Mode System
 * Handles offline gameplay, asset caching, and online sync
 */

export type SyncStatus = 'synced' | 'pending' | 'failed' | 'offline';

export interface OfflineGameState {
  missionId: string;
  progress: number; // 0-100
  playerHP: number;
  playerMaxHP: number;
  opponent: {
    id: string;
    hp: number;
    maxHP: number;
  };
  actions: GameAction[]; // recorded player actions
  timestamp: number;
  completed: boolean;
  result?: 'win' | 'loss' | 'abandoned';
}

export interface GameAction {
  type: 'attack' | 'dodge' | 'block' | 'ultimate' | 'heal' | 'move';
  timestamp: number;
  data: Record<string, unknown>;
}

export interface OfflineDataCache {
  missions: Record<string, boolean>; // cached mission data
  characters: Record<string, boolean>; // cached character models
  assets: Record<string, number>; // asset size tracking
  lastUpdated: number;
  totalSize: number; // bytes
}

export interface SyncQueueItem {
  id: string;
  type: 'save' | 'progress' | 'achievement';
  data: unknown;
  timestamp: number;
  retryCount: number;
  maxRetries: number;
}

// Assets to cache for offline play (in priority order)
export const OFFLINE_CACHE_PRIORITY = [
  // Core mission data
  'missions-act1-assets',
  'missions-act2-assets',
  'missions-act3-assets',

  // Character models (GLB files)
  'character-kai-jax',
  'character-kaison',
  'character-jaxon',

  // UI assets
  'ui-fonts',
  'ui-icons',

  // Audio
  'audio-effects',
  'audio-music-act1',
];

// Maximum cache size (100MB)
const MAX_CACHE_SIZE = 100 * 1024 * 1024;

/**
 * Register service worker for offline support
 */
export async function registerServiceWorker(): Promise<boolean> {
  if (!('serviceWorker' in navigator)) {
    console.warn('Service Worker not supported');
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js');
    console.log('Service Worker registered:', registration);
    return true;
  } catch (error) {
    console.error('Service Worker registration failed:', error);
    return false;
  }
}

/**
 * Check if browser is online
 */
export function isOnline(): boolean {
  return navigator.onLine;
}

/**
 * Preload assets for offline play
 */
export async function preloadOfflineAssets(): Promise<OfflineDataCache> {
  const cache: OfflineDataCache = {
    missions: {},
    characters: {},
    assets: {},
    lastUpdated: Date.now(),
    totalSize: 0,
  };

  try {
    const cacheStorage = await caches.open('kai-jax-offline-v1');

    for (const asset of OFFLINE_CACHE_PRIORITY) {
      try {
        const response = await fetch(`/assets/${asset}`);
        if (response.ok) {
          const blob = await response.blob();
          cache.assets[asset] = blob.size;
          cache.totalSize += blob.size;

          // Stop if approaching cache limit
          if (cache.totalSize > MAX_CACHE_SIZE) {
            console.warn('Offline cache size limit reached');
            break;
          }

          // Track which types are cached
          if (asset.includes('mission')) cache.missions[asset] = true;
          if (asset.includes('character')) cache.characters[asset] = true;
        }
      } catch (error) {
        console.warn(`Failed to preload asset: ${asset}`, error);
      }
    }

    console.log('Offline cache preload complete:', cache);
    return cache;
  } catch (error) {
    console.error('Offline asset preload failed:', error);
    return cache;
  }
}

/**
 * Save offline game state to IndexedDB
 */
export async function saveOfflineGameState(state: OfflineGameState): Promise<boolean> {
  try {
    const db = await openIndexedDB();
    const transaction = db.transaction('offlineGames', 'readwrite');
    const store = transaction.objectStore('offlineGames');

    await new Promise((resolve, reject) => {
      const request = store.put(state, state.missionId);
      request.onsuccess = resolve;
      request.onerror = reject;
    });

    console.log('Offline game state saved:', state.missionId);
    return true;
  } catch (error) {
    console.error('Failed to save offline game state:', error);
    return false;
  }
}

/**
 * Load offline game state
 */
export async function loadOfflineGameState(missionId: string): Promise<OfflineGameState | null> {
  try {
    const db = await openIndexedDB();
    const transaction = db.transaction('offlineGames', 'readonly');
    const store = transaction.objectStore('offlineGames');

    return new Promise((resolve, reject) => {
      const request = store.get(missionId);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = reject;
    });
  } catch (error) {
    console.error('Failed to load offline game state:', error);
    return null;
  }
}

/**
 * Clear old offline game saves (keep last 5)
 */
export async function cleanupOfflineGameStates(): Promise<void> {
  try {
    const db = await openIndexedDB();
    const transaction = db.transaction('offlineGames', 'readwrite');
    const store = transaction.objectStore('offlineGames');

    const allGames = await new Promise<OfflineGameState[]>((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = reject;
    });

    // Sort by timestamp and keep only last 5
    const sorted = allGames.sort((a, b) => b.timestamp - a.timestamp);
    const toDelete = sorted.slice(5);

    for (const game of toDelete) {
      await new Promise<void>((resolve, reject) => {
        const request = store.delete(game.missionId);
        request.onsuccess = () => resolve();
        request.onerror = reject;
      });
    }

    console.log('Cleaned up offline game saves');
  } catch (error) {
    console.error('Failed to cleanup offline game states:', error);
  }
}

/**
 * Queue data for syncing when back online
 */
export async function queueForSync(item: SyncQueueItem): Promise<void> {
  try {
    const db = await openIndexedDB();
    const transaction = db.transaction('syncQueue', 'readwrite');
    const store = transaction.objectStore('syncQueue');

    await new Promise<void>((resolve, reject) => {
      const request = store.put(item);
      request.onsuccess = () => resolve();
      request.onerror = reject;
    });

    console.log('Queued for sync:', item.id);
  } catch (error) {
    console.error('Failed to queue for sync:', error);
  }
}

/**
 * Get pending sync items
 */
export async function getPendingSyncItems(): Promise<SyncQueueItem[]> {
  try {
    const db = await openIndexedDB();
    const transaction = db.transaction('syncQueue', 'readonly');
    const store = transaction.objectStore('syncQueue');

    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = reject;
    });
  } catch (error) {
    console.error('Failed to get pending sync items:', error);
    return [];
  }
}

/**
 * Remove synced item from queue
 */
export async function removeSyncItem(itemId: string): Promise<void> {
  try {
    const db = await openIndexedDB();
    const transaction = db.transaction('syncQueue', 'readwrite');
    const store = transaction.objectStore('syncQueue');

    await new Promise<void>((resolve, reject) => {
      const request = store.delete(itemId);
      request.onsuccess = () => resolve();
      request.onerror = reject;
    });
  } catch (error) {
    console.error('Failed to remove sync item:', error);
  }
}

/**
 * Helper: Open or create IndexedDB for offline data
 */
function openIndexedDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('kai-jax-offline', 1);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // Create object stores
      if (!db.objectStoreNames.contains('offlineGames')) {
        db.createObjectStore('offlineGames', { keyPath: 'missionId' });
      }

      if (!db.objectStoreNames.contains('syncQueue')) {
        db.createObjectStore('syncQueue', { keyPath: 'id' });
      }

      if (!db.objectStoreNames.contains('playerProgress')) {
        db.createObjectStore('playerProgress', { keyPath: 'characterId' });
      }
    };
  });
}

/**
 * Detect connectivity changes
 */
export function setupConnectivityListener(
  onlineCallback: () => void,
  offlineCallback: () => void
): () => void {
  const handleOnline = () => {
    console.log('Back online!');
    onlineCallback();
  };

  const handleOffline = () => {
    console.log('Going offline');
    offlineCallback();
  };

  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);

  // Return cleanup function
  return () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
  };
}

/**
 * Estimate current cache size
 */
export async function estimateCacheSize(): Promise<number> {
  try {
    if ('estimate' in navigator.storage) {
      const estimate = await navigator.storage.estimate();
      return estimate.usage || 0;
    }
    return 0;
  } catch {
    return 0;
  }
}
