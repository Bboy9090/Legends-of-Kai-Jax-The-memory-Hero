import { adminFetch, isAdminDenial } from './adminSession';
import { getApps, initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  User,
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

export const SCOPES = [
  'https://www.googleapis.com/auth/drive.readonly',
  'https://www.googleapis.com/auth/drive.file',
  'https://www.googleapis.com/auth/drive.metadata.readonly',
] as const;

const app = getApps().length > 0 ? getApps()[0] : initializeApp(firebaseConfig);
const auth = getAuth(app);

function buildGoogleProvider(): GoogleAuthProvider {
  const provider = new GoogleAuthProvider();
  for (const scope of SCOPES) {
    provider.addScope(scope);
  }
  provider.setCustomParameters({ prompt: 'select_account' });
  return provider;
}

let isSigningIn = false;
// Access token is cached strictly in memory (never localStorage or sessionStorage)
let cachedAccessToken: string | null = null;

export const initAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (cachedAccessToken) {
        onAuthSuccess?.(user, cachedAccessToken);
      } else if (!isSigningIn) {
        cachedAccessToken = null;
        onAuthFailure?.();
      }
    } else {
      cachedAccessToken = null;
      onAuthFailure?.();
    }
  });
};

export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, buildGoogleProvider());
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Google Drive access token was not granted. Please ensure Drive permissions are checked.');
    }
    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } finally {
    isSigningIn = false;
  }
};

export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

export const logout = async (): Promise<void> => {
  await auth.signOut();
  cachedAccessToken = null;
};

// Minimal TypeScript declarations for Google Picker client widget
interface GooglePickerDoc {
  id: string;
  name: string;
  mimeType: string;
  sizeBytes?: number;
  parentId?: string;
}

interface GooglePickerCallbackData {
  action: string;
  docs?: GooglePickerDoc[];
}

interface GoogleDocsViewInstance {
  setIncludeFolders(val: boolean): GoogleDocsViewInstance;
  setSelectFolderEnabled(val: boolean): GoogleDocsViewInstance;
  setMimeTypes(mimeTypes: string): GoogleDocsViewInstance;
  setMode(mode: string): GoogleDocsViewInstance;
  setQuery(query: string): GoogleDocsViewInstance;
}

interface GooglePickerBuilderInstance {
  addView(view: unknown): GooglePickerBuilderInstance;
  enableFeature(feature: string): GooglePickerBuilderInstance;
  setTitle(title: string): GooglePickerBuilderInstance;
  setOAuthToken(token: string): GooglePickerBuilderInstance;
  setCallback(cb: (data: GooglePickerCallbackData) => void): GooglePickerBuilderInstance;
  setOrigin(origin: string): GooglePickerBuilderInstance;
  build(): { setVisible(visible: boolean): void };
}

interface WindowWithGooglePicker extends Window {
  gapi?: {
    load(apiName: string, options: { callback: () => void; onerror?: () => void }): void;
  };
  google?: {
    picker?: {
      PickerBuilder: new () => GooglePickerBuilderInstance;
      DocsView: new (viewId?: string) => GoogleDocsViewInstance;
      DocsViewMode?: {
        GRID: string;
        LIST: string;
      };
      ViewId: {
        DOCS: string;
        DOCS_IMAGES: string;
        FOLDERS: string;
      };
      Feature: {
        MULTISELECT_ENABLED: string;
      };
      Action: {
        PICKED: string;
        CANCEL: string;
      };
    };
  };
}

let pickerScriptPromise: Promise<void> | null = null;

function ensureGooglePickerLoaded(): Promise<void> {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('Google Picker requires a browser window'));
  }
  const win = window as WindowWithGooglePicker;
  if (win.google?.picker) {
    return Promise.resolve();
  }
  if (pickerScriptPromise) {
    return pickerScriptPromise;
  }

  pickerScriptPromise = new Promise<void>((resolve, reject) => {
    const loadPickerModule = () => {
      if (!win.gapi) {
        pickerScriptPromise = null;
        reject(new Error('Google API loader (gapi) unavailable'));
        return;
      }
      win.gapi.load('picker', {
        callback: () => resolve(),
        onerror: () => {
          pickerScriptPromise = null;
          reject(new Error('Failed to initialize Google Picker module'));
        },
      });
    };

    if (win.gapi) {
      loadPickerModule();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://apis.google.com/js/api.js';
    script.async = true;
    script.onload = loadPickerModule;
    script.onerror = () => {
      pickerScriptPromise = null;
      reject(new Error('Failed to load https://apis.google.com/js/api.js'));
    };
    document.head.appendChild(script);
  });

  return pickerScriptPromise;
}

export interface PickedDriveDocument {
  id: string;
  name: string;
  mimeType: string;
  sizeBytes: number;
}

/**
 * Opens Google Picker widget (no developer key; uses ancestorOrigins + OAuth access token).
 * Includes (1) Folders & ZIPs view so you can pick "Legends of Kai-Jax Art Production" directly,
 * and (2) Visual Images Grid view for picking individual sheets.
 */
export async function openGoogleDrivePicker(): Promise<PickedDriveDocument[]> {
  let token = await getAccessToken();
  if (!token) {
    const authRes = await googleSignIn();
    token = authRes?.accessToken ?? null;
  }
  if (!token) {
    throw new Error('NEEDS_AUTH');
  }

  await ensureGooglePickerLoaded();
  const win = window as WindowWithGooglePicker;
  const gpicker = win.google?.picker;
  if (!gpicker) {
    throw new Error('Google Picker widget failed to load');
  }

  const pickerOrigin =
    window.location.ancestorOrigins && window.location.ancestorOrigins.length > 0
      ? window.location.ancestorOrigins[window.location.ancestorOrigins.length - 1]
      : window.location.origin;

  return new Promise<PickedDriveDocument[]>((resolve) => {
    // View 1: All Folders & ZIP Archives (supports selecting a folder or .zip directly)
    const foldersAndZipsView = new gpicker.DocsView(gpicker.ViewId.DOCS)
      .setIncludeFolders(true)
      .setSelectFolderEnabled(true);

    // View 2: Visual Image Grid
    const imagesView = new gpicker.DocsView(gpicker.ViewId.DOCS_IMAGES)
      .setIncludeFolders(true)
      .setSelectFolderEnabled(false);
    if (gpicker.DocsViewMode?.GRID) {
      imagesView.setMode(gpicker.DocsViewMode.GRID);
    }

    const picker = new gpicker.PickerBuilder()
      .addView(foldersAndZipsView)
      .addView(imagesView)
      .enableFeature(gpicker.Feature.MULTISELECT_ENABLED)
      .setTitle('Select Kai-Jax Art Production Folder, ZIP, or Character Sheets')
      .setOAuthToken(token)
      .setOrigin(pickerOrigin)
      .setCallback((data: GooglePickerCallbackData) => {
        if (data.action === gpicker.Action.PICKED && Array.isArray(data.docs)) {
          resolve(
            data.docs.map((d) => ({
              id: d.id,
              name: d.name,
              mimeType: d.mimeType,
              sizeBytes: Number(d.sizeBytes || 0),
            }))
          );
        } else if (data.action === gpicker.Action.CANCEL) {
          resolve([]);
        }
      })
      .build();

    picker.setVisible(true);
  });
}

export type CanonAssetCategory = 'character' | 'arena' | 'model' | 'lore';

export interface ArtPackageCandidate {
  id: string;
  name: string;
  mimeType: string;
  isFolder: boolean;
  isZip: boolean;
  sizeBytes: number;
  modifiedTime: string;
  score: number;
  sheetCount: number;
  matchBadges: string[];
}

export interface ArtPackagesResponse {
  accountEmail: string;
  packages: ArtPackageCandidate[];
}

export interface DriveDiscoveredItem {
  id: string;
  name: string;
  mimeType: string;
  sizeBytes: number;
  modifiedTime: string;
  folderPath: string;
  isFolder: boolean;
  category: CanonAssetCategory;
  subjectTag: string;
}

export interface DriveFolderBreadcrumb {
  id: string;
  name: string;
}

export interface DriveBrowseResponse {
  accountEmail: string;
  browseItems: DriveDiscoveredItem[];
  currentFolder: DriveFolderBreadcrumb;
}

export interface ImportedCanonAsset {
  driveId: string;
  name: string;
  mimeType: string;
  category: CanonAssetCategory;
  subjectTag: string;
  folderPath: string;
  localUrl: string;
  sizeBytes: number;
  importedAt: string;
}

export interface CanonVaultManifest {
  updatedAt: string;
  sourceAccount: string;
  assets: ImportedCanonAsset[];
}

export async function fetchLocalCanonManifest(): Promise<CanonVaultManifest> {
  const res = await fetch('/api/canon-drive/status');
  if (!res.ok) {
    return { updatedAt: '', sourceAccount: '', assets: [] };
  }
  return (await res.json()) as CanonVaultManifest;
}

export async function findKaiJaxArtPackages(customQuery = ''): Promise<ArtPackagesResponse> {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('NEEDS_AUTH');
  }

  const params = new URLSearchParams();
  if (customQuery.trim()) params.set('q', customQuery.trim());

  const res = await fetch(`/api/canon-drive/art-packages?${params.toString()}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (await isAdminDenial(res)) {
    throw new Error('Administrator sign-in is required to import into the local vault.');
  }
  if (res.status === 401 || res.status === 403) {
    cachedAccessToken = null;
    throw new Error('NEEDS_AUTH');
  }
  if (!res.ok) {
    const errBody = await res.json().catch(() => ({ error: 'Art package search failed' }));
    throw new Error(errBody.error || 'Failed to find Art Production folders or ZIPs');
  }

  return (await res.json()) as ArtPackagesResponse;
}

export async function browseGoogleDriveFolder(options?: {
  folderId?: string;
  searchQuery?: string;
  imagesOnly?: boolean;
}): Promise<DriveBrowseResponse> {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('NEEDS_AUTH');
  }

  const params = new URLSearchParams();
  if (options?.folderId) params.set('folderId', options.folderId);
  if (options?.searchQuery) params.set('q', options.searchQuery);
  params.set('imagesOnly', options?.imagesOnly === false ? 'false' : 'true');

  const res = await fetch(`/api/canon-drive/scan?${params.toString()}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (await isAdminDenial(res)) {
    throw new Error('Administrator sign-in is required to import into the local vault.');
  }
  if (res.status === 401 || res.status === 403) {
    cachedAccessToken = null;
    throw new Error('NEEDS_AUTH');
  }
  if (!res.ok) {
    const errBody = await res.json().catch(() => ({ error: 'Drive browse failed' }));
    throw new Error(errBody.error || 'Failed to browse Google Drive folder');
  }

  return (await res.json()) as DriveBrowseResponse;
}

export async function fetchDrivePreviewObjectUrl(fileId: string): Promise<string | null> {
  const token = await getAccessToken();
  if (!token) return null;

  const res = await fetch(`/api/canon-drive/preview/${encodeURIComponent(fileId)}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) return null;
  const blob = await res.blob();
  return URL.createObjectURL(blob);
}

export async function importDriveAssetsToRigPipeline(
  items: Array<{
    id: string;
    category?: CanonAssetCategory;
    subjectTag?: string;
    folderPath?: string;
  }>
): Promise<CanonVaultManifest> {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('NEEDS_AUTH');
  }

  const res = await adminFetch('/api/canon-drive/import', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ items }),
  });

  if (await isAdminDenial(res)) {
    throw new Error('Administrator sign-in is required to import into the local vault.');
  }
  if (res.status === 401 || res.status === 403) {
    cachedAccessToken = null;
    throw new Error('NEEDS_AUTH');
  }
  if (!res.ok) {
    const errBody = await res.json().catch(() => ({ error: 'Import failed' }));
    throw new Error(errBody.error || 'Failed to import selected character sheets');
  }

  return (await res.json()) as CanonVaultManifest;
}

export async function updateLocalCanonAssetTag(
  driveId: string,
  category: CanonAssetCategory,
  subjectTag: string
): Promise<CanonVaultManifest> {
  const res = await adminFetch(`/api/canon-drive/asset/${encodeURIComponent(driveId)}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ category, subjectTag }),
  });
  if (!res.ok) {
    throw new Error('Failed to update local asset role tag');
  }
  return (await res.json()) as CanonVaultManifest;
}

export async function removeLocalCanonAsset(driveId: string): Promise<CanonVaultManifest> {
  const res = await adminFetch(`/api/canon-drive/asset/${encodeURIComponent(driveId)}`, {
    method: 'DELETE',
  });
  if (!res.ok) {
    throw new Error('Failed to remove local vault asset');
  }
  return (await res.json()) as CanonVaultManifest;
}

export async function clearLocalCanonVault(): Promise<CanonVaultManifest> {
  const res = await adminFetch('/api/canon-drive/clear', {
    method: 'POST',
  });
  if (!res.ok) {
    throw new Error('Failed to clear local rigging vault');
  }
  return (await res.json()) as CanonVaultManifest;
}
