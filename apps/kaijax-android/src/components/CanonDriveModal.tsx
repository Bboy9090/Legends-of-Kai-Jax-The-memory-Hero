import React, { useCallback, useEffect, useState } from 'react';
import {
  Archive,
  Check,
  CloudDownload,
  Eye,
  Folder,
  FolderOpen,
  Image as ImageIcon,
  Layers,
  LogOut,
  RefreshCw,
  Search,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react';
import {
  ArtPackageCandidate,
  browseGoogleDriveFolder,
  CanonAssetCategory,
  CanonVaultManifest,
  clearLocalCanonVault,
  DriveDiscoveredItem,
  fetchDrivePreviewObjectUrl,
  fetchLocalCanonManifest,
  findKaiJaxArtPackages,
  getAccessToken,
  googleSignIn,
  ImportedCanonAsset,
  importDriveAssetsToRigPipeline,
  initAuth,
  logout,
  openGoogleDrivePicker,
  removeLocalCanonAsset,
  updateLocalCanonAssetTag,
} from '../services/googleDriveAuth';

interface CanonDriveModalProps {
  onClose: () => void;
  onManifestUpdated?: (manifest: CanonVaultManifest) => void;
}

const SUBJECT_TAG_OPTIONS: Array<{
  value: string;
  label: string;
  category: CanonAssetCategory;
}> = [
  { value: 'kai', label: 'Solo Character Sheet: Kai', category: 'character' },
  { value: 'jax', label: 'Solo Character Sheet: Jax', category: 'character' },
  { value: 'kaijax', label: 'Kai-Jax (3-Tail Fusion Sheet)', category: 'character' },
  { value: 'character-roster-sheet', label: 'Group Sheet: Kai-Jax & Main Roster', category: 'character' },
  { value: 'mentors-sheet', label: 'Group Sheet: Mentors & Fathers (Boryn, Borax, Bovar)', category: 'character' },
  { value: 'allies-sheet', label: 'Group Sheet: Allies', category: 'character' },
  { value: 'boss-or-faction', label: 'Group Sheet: Enemies & Factions', category: 'character' },
  { value: 'sabertooth-gods-sheet', label: 'Group Sheet: First Sabertooth Gods', category: 'character' },
  { value: 'boryn', label: 'Character Sheet: Boryn', category: 'character' },
  { value: 'borax', label: 'Character Sheet: Borax', category: 'character' },
  { value: 'bovar', label: 'Character Sheet: Bovar', category: 'character' },
  { value: 'character-sheet', label: 'Character Sheet (Other)', category: 'character' },
  { value: 'raging-city-world', label: 'Area / World Sheet (General)', category: 'arena' },
  { value: 'ashblock-heights', label: 'Area Sheet: Ashblock Heights', category: 'arena' },
  { value: 'sector-7', label: 'Area Sheet: Sector-7', category: 'arena' },
  { value: 'neon-ward', label: 'Area Sheet: Neon Ward', category: 'arena' },
  { value: 'iron-market', label: 'Area Sheet: Iron Market', category: 'arena' },
  { value: 'undercrown', label: 'Area Sheet: Undercrown', category: 'arena' },
  { value: 'zenith-spires', label: 'Area Sheet: Zenith Spires / Stormfall', category: 'arena' },
  { value: 'erasure-fields', label: 'Area Sheet: Forgotten Roads / Erasure', category: 'arena' },
  { value: 'memory-nexus', label: 'Area Sheet: Memory Nexus / Citadel', category: 'arena' },
  { value: 'model', label: '3D Model (.glb/.gltf)', category: 'model' },
  { value: 'lore', label: 'Canon Reference Doc', category: 'lore' },
];

function resolveCategoryForSubject(subjectValue: string): CanonAssetCategory {
  const found = SUBJECT_TAG_OPTIONS.find((opt) => opt.value === subjectValue);
  return found ? found.category : 'character';
}

const DriveThumbnail: React.FC<{ fileId: string; mimeType: string; alt: string }> = ({
  fileId,
  mimeType,
  alt,
}) => {
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    let createdUrl: string | null = null;
    if (mimeType.startsWith('image/') || mimeType === 'application/vnd.google-apps.drawing') {
      fetchDrivePreviewObjectUrl(fileId).then((url) => {
        if (!active) {
          if (url) URL.revokeObjectURL(url);
          return;
        }
        createdUrl = url;
        setSrc(url);
      });
    }
    return () => {
      active = false;
      if (createdUrl) URL.revokeObjectURL(createdUrl);
    };
  }, [fileId, mimeType]);

  if (src) {
    return (
      <img
        src={src}
        alt={alt}
        className="w-full h-40 object-contain rounded-lg bg-[#090b10] border border-slate-800/80"
      />
    );
  }

  return (
    <div className="w-full h-40 rounded-lg bg-[#090b10] border border-slate-800 flex flex-col items-center justify-center text-slate-400 gap-1">
      <ImageIcon className="w-6 h-6 text-slate-500" />
      <span className="text-[11px] px-2 truncate max-w-full">{mimeType.split('/').pop()}</span>
    </div>
  );
};

export const CanonDriveModal: React.FC<CanonDriveModalProps> = ({
  onClose,
  onManifestUpdated,
}) => {
  const [needsAuth, setNeedsAuth] = useState(true);
  const [accountEmail, setAccountEmail] = useState<string>('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isSearchingPackages, setIsSearchingPackages] = useState(false);
  const [isBrowsing, setIsBrowsing] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [confirmClearAll, setConfirmClearAll] = useState(false);
  const [previewAsset, setPreviewAsset] = useState<ImportedCanonAsset | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [statusBanner, setStatusBanner] = useState<string | null>(null);

  const [viewTab, setViewTab] = useState<'packages' | 'vault' | 'browse'>('packages');
  const [packageQuery, setPackageQuery] = useState('');
  const [artPackages, setArtPackages] = useState<ArtPackageCandidate[]>([]);

  const [imagesOnly, setImagesOnly] = useState(true);
  const [browseItems, setBrowseItems] = useState<DriveDiscoveredItem[]>([]);
  const [folderHistory, setFolderHistory] = useState<Array<{ id: string; name: string }>>([
    { id: 'root', name: 'My Drive' },
  ]);
  const [searchInput, setSearchInput] = useState('');

  // Strictly manual selection ONLY — never pre-checked automatically
  const [selectedIds, setSelectedIds] = useState<Record<string, boolean>>({});
  const [itemPool, setItemPool] = useState<Record<string, DriveDiscoveredItem>>({});
  const [tagOverrides, setTagOverrides] = useState<
    Record<string, { category: CanonAssetCategory; subjectTag: string }>
  >({});

  const [manifest, setManifest] = useState<CanonVaultManifest>({
    updatedAt: '',
    sourceAccount: '',
    assets: [],
  });

  useEffect(() => {
    fetchLocalCanonManifest().then((m) => {
      setManifest(m);
      if (m.assets.length > 0) {
        setViewTab('vault');
      }
      onManifestUpdated?.(m);
    });

    const unsub = initAuth(
      (user) => {
        setNeedsAuth(false);
        setAccountEmail(user.email || '');
      },
      () => {
        setNeedsAuth(true);
      }
    );
    return () => unsub();
  }, [onManifestUpdated]);

  const runArtPackageFinder = useCallback(async (q = '') => {
    const token = await getAccessToken();
    if (!token) {
      setNeedsAuth(true);
      return;
    }

    setIsSearchingPackages(true);
    setErrorMsg(null);
    try {
      const data = await findKaiJaxArtPackages(q);
      setAccountEmail(data.accountEmail);
      setArtPackages(data.packages);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unable to search Drive folders and ZIPs';
      if (msg === 'NEEDS_AUTH') setNeedsAuth(true);
      else setErrorMsg(msg);
    } finally {
      setIsSearchingPackages(false);
    }
  }, []);

  useEffect(() => {
    if (!needsAuth) {
      runArtPackageFinder('');
    }
  }, [needsAuth, runArtPackageFinder]);

  const loadFolderContents = useCallback(
    async (folderId = 'root', query = '', filterImages = imagesOnly) => {
      const token = await getAccessToken();
      if (!token) {
        setNeedsAuth(true);
        return;
      }

      setIsBrowsing(true);
      setErrorMsg(null);
      try {
        const data = await browseGoogleDriveFolder({
          folderId,
          searchQuery: query,
          imagesOnly: filterImages,
        });
        setAccountEmail(data.accountEmail);
        setBrowseItems(data.browseItems);

        setItemPool((prev) => {
          const next = { ...prev };
          for (const item of data.browseItems) {
            if (!item.isFolder) {
              next[item.id] = item;
            }
          }
          return next;
        });
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Unable to browse Google Drive folder';
        if (msg === 'NEEDS_AUTH') setNeedsAuth(true);
        else setErrorMsg(msg);
      } finally {
        setIsBrowsing(false);
      }
    },
    [imagesOnly]
  );

  const handleGoogleLogin = async () => {
    setIsLoggingIn(true);
    setErrorMsg(null);
    try {
      const res = await googleSignIn();
      if (res) {
        setAccountEmail(res.user.email || '');
        setNeedsAuth(false);
        setViewTab('packages');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Sign-in cancelled or failed';
      setErrorMsg(msg);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleSignOut = async () => {
    await logout();
    setNeedsAuth(true);
    setAccountEmail('');
    setArtPackages([]);
    setBrowseItems([]);
    setSelectedIds({});
  };

  const handleLaunchGooglePicker = async () => {
    setErrorMsg(null);
    setStatusBanner(null);
    try {
      const picked = await openGoogleDrivePicker();
      setNeedsAuth(false);
      if (picked.length === 0) return;

      setIsImporting(true);
      const updated = await importDriveAssetsToRigPipeline(
        picked.map((doc) => ({
          id: doc.id,
          folderPath: 'Google Picker',
        }))
      );
      setManifest(updated);
      if (updated.sourceAccount) setAccountEmail(updated.sourceAccount);
      onManifestUpdated?.(updated);
      setStatusBanner(
        `Imported ${picked.length} Google Picker selection(s) (${updated.assets.length} total sheets in vault).`
      );
      setViewTab('vault');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Google Picker failed';
      if (msg === 'NEEDS_AUTH') setNeedsAuth(true);
      else setErrorMsg(msg);
    } finally {
      setIsImporting(false);
    }
  };

  const handleOpenPackageFolder = (pkg: ArtPackageCandidate) => {
    setSearchInput('');
    setFolderHistory([
      { id: 'root', name: 'My Drive' },
      { id: pkg.id, name: pkg.name },
    ]);
    setViewTab('browse');
    loadFolderContents(pkg.id, '', true);
  };

  const handleImportWholePackage = async (pkg: ArtPackageCandidate) => {
    setIsImporting(true);
    setErrorMsg(null);
    setStatusBanner(null);
    try {
      const updated = await importDriveAssetsToRigPipeline([
        {
          id: pkg.id,
          folderPath: pkg.name,
        },
      ]);
      setManifest(updated);
      onManifestUpdated?.(updated);
      setStatusBanner(
        `Imported character & area sheets from "${pkg.name}" (${updated.assets.length} total sheets in vault). Review or adjust tags below.`
      );
      setViewTab('vault');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to import art folder/ZIP';
      if (msg === 'NEEDS_AUTH') setNeedsAuth(true);
      else setErrorMsg(msg);
    } finally {
      setIsImporting(false);
    }
  };

  const toggleManualCheck = (item: DriveDiscoveredItem) => {
    setItemPool((prev) => ({ ...prev, [item.id]: item }));
    setSelectedIds((prev) => {
      const next = { ...prev };
      if (next[item.id]) {
        delete next[item.id];
      } else {
        next[item.id] = true;
      }
      return next;
    });
  };

  const handleCheckAllCurrentFolder = () => {
    const filesHere = browseItems.filter((i) => !i.isFolder);
    setItemPool((prev) => {
      const next = { ...prev };
      for (const f of filesHere) next[f.id] = f;
      return next;
    });
    setSelectedIds((prev) => {
      const next = { ...prev };
      for (const f of filesHere) next[f.id] = true;
      return next;
    });
  };

  const handleClearManualSelection = () => {
    setSelectedIds({});
  };

  const handleBrowseTagOverride = (item: DriveDiscoveredItem, nextSubject: string) => {
    const nextCat = resolveCategoryForSubject(nextSubject);
    setItemPool((prev) => ({ ...prev, [item.id]: item }));
    setTagOverrides((prev) => ({
      ...prev,
      [item.id]: { category: nextCat, subjectTag: nextSubject },
    }));
  };

  const handleOpenFolder = (folder: DriveDiscoveredItem) => {
    setSearchInput('');
    setFolderHistory((prev) => [...prev, { id: folder.id, name: folder.name }]);
    loadFolderContents(folder.id, '', imagesOnly);
  };

  const handleBreadcrumbClick = (index: number) => {
    const target = folderHistory[index];
    setSearchInput('');
    setFolderHistory((prev) => prev.slice(0, index + 1));
    loadFolderContents(target.id, '', imagesOnly);
  };

  const handlePackageSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    runArtPackageFinder(packageQuery);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setViewTab('browse');
    const currentFolderId = folderHistory[folderHistory.length - 1]?.id || 'root';
    loadFolderContents(currentFolderId, searchInput, imagesOnly);
  };

  const handleToggleImagesOnly = () => {
    const nextVal = !imagesOnly;
    setImagesOnly(nextVal);
    const currentFolderId = folderHistory[folderHistory.length - 1]?.id || 'root';
    loadFolderContents(currentFolderId, searchInput, nextVal);
  };

  const handleImportManuallyChecked = async () => {
    const checkedIds = Object.keys(selectedIds).filter((id) => selectedIds[id]);
    const chosen = checkedIds.map((id) => itemPool[id]).filter(Boolean);

    if (chosen.length === 0) {
      setErrorMsg('Click the sheets you want first.');
      return;
    }

    setIsImporting(true);
    setErrorMsg(null);
    setStatusBanner(null);
    try {
      const payload = chosen.map((item) => {
        const override = tagOverrides[item.id];
        return {
          id: item.id,
          category: override?.category ?? item.category,
          subjectTag: override?.subjectTag ?? item.subjectTag,
          folderPath: item.folderPath,
        };
      });
      const updated = await importDriveAssetsToRigPipeline(payload);
      setManifest(updated);
      onManifestUpdated?.(updated);
      setSelectedIds({});
      setStatusBanner(`Imported ${chosen.length} manually selected sheet(s) into your Canon Vault.`);
      setViewTab('vault');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to import checked sheets';
      if (msg === 'NEEDS_AUTH') setNeedsAuth(true);
      else setErrorMsg(msg);
    } finally {
      setIsImporting(false);
    }
  };

  const handleVaultTagChange = async (asset: ImportedCanonAsset, nextSubject: string) => {
    setErrorMsg(null);
    try {
      const nextCat = resolveCategoryForSubject(nextSubject);
      const updated = await updateLocalCanonAssetTag(asset.driveId, nextCat, nextSubject);
      setManifest(updated);
      onManifestUpdated?.(updated);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Could not update role tag');
    }
  };

  const handleRemoveVaultAsset = async (asset: ImportedCanonAsset) => {
    setErrorMsg(null);
    try {
      const updated = await removeLocalCanonAsset(asset.driveId);
      setManifest(updated);
      onManifestUpdated?.(updated);
      if (previewAsset?.driveId === asset.driveId) {
        setPreviewAsset(null);
      }
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Could not remove sheet from local vault');
    }
  };

  const handleClearVaultConfirmed = async () => {
    setErrorMsg(null);
    try {
      const updated = await clearLocalCanonVault();
      setManifest(updated);
      onManifestUpdated?.(updated);
      setConfirmClearAll(false);
      setStatusBanner('Cleared local Canon Sheet Vault (your Google Drive files remain untouched).');
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Could not clear local vault');
    }
  };

  const selectedCount = Object.values(selectedIds).filter(Boolean).length;
  const characterSheetCount = manifest.assets.filter((a) => a.category === 'character').length;
  const areaSheetCount = manifest.assets.filter((a) => a.category === 'arena').length;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-2 sm:p-6 safe-area-pad pointer-events-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="canon-drive-title"
    >
      <div className="w-full max-w-6xl h-[92vh] rounded-2xl bg-[#0d1018] border border-amber-500/50 flex flex-col overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 border-b border-slate-800 bg-[#0a0b10]">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-amber-300">
              Art Production Folder &amp; ZIP Finder · Solo Kai/Jax + Group Sheets + Area Sheets
            </p>
            <h2 id="canon-drive-title" className="font-display text-2xl font-bold text-slate-50">
              Legends of Kai-Jax — Canon Art Production Vault
            </h2>
          </div>

          <div className="flex items-center gap-2">
            {!needsAuth && accountEmail && (
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#131620] border border-slate-700 text-xs text-slate-200">
                <span className="truncate max-w-[190px]">{accountEmail}</span>
                <button
                  type="button"
                  onClick={handleSignOut}
                  aria-label="Disconnect Google Drive session"
                  className="text-slate-400 hover:text-amber-300"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={onClose}
              className="min-h-[44px] inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#171b28] hover:bg-slate-800 border border-slate-600 text-slate-100 text-xs font-semibold"
            >
              <X className="w-4 h-4" />
              <span>Close</span>
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto custom-scroll p-4 sm:p-6 space-y-5">
          {errorMsg && (
            <div className="rounded-xl bg-red-950/70 border border-red-500/60 p-3.5 text-xs text-red-200 flex items-center justify-between gap-3">
              <span>{errorMsg}</span>
              <button
                type="button"
                onClick={() => setErrorMsg(null)}
                className="text-red-300 hover:text-white font-semibold"
              >
                Dismiss
              </button>
            </div>
          )}

          {statusBanner && (
            <div className="rounded-xl bg-emerald-950/70 border border-emerald-500/60 p-3.5 text-xs text-emerald-200 font-medium">
              {statusBanner}
            </div>
          )}

          {needsAuth ? (
            <div className="rounded-2xl bg-[#131620] border border-amber-500/40 p-6 sm:p-8 text-center max-w-2xl mx-auto space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-400/40 flex items-center justify-center mx-auto text-amber-300">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="font-display text-2xl font-bold text-white">
                Locate Your &ldquo;Legends of Kai-Jax Art Production&rdquo; Folder or ZIP
              </h3>
              <p className="text-sm text-slate-200 leading-relaxed">
                Sign in once below so we can immediately surface your Google Drive <strong>Art Production</strong> folder or ZIP containing the solo Kai &amp; Jax sheets, group sheets (Kai-Jax, Mentors, Allies, Enemies), and Area sheets. Nothing is auto-imported until you click the folder or sheets you want.
              </p>

              <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={isLoggingIn}
                  className="gsi-material-button"
                >
                  <div className="gsi-material-button-content-wrapper">
                    <div className="gsi-material-button-icon">
                      <svg
                        version="1.1"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 48 48"
                        className="block w-5 h-5"
                      >
                        <path
                          fill="#EA4335"
                          d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                        />
                        <path
                          fill="#4285F4"
                          d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                        />
                        <path
                          fill="#34A853"
                          d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                        />
                        <path fill="none" d="M0 0h48v48H0z" />
                      </svg>
                    </div>
                    <span className="gsi-material-button-contents">
                      {isLoggingIn ? 'Searching Drive...' : 'Sign in & Find Art Production Folder'}
                    </span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={handleLaunchGooglePicker}
                  disabled={isImporting}
                  className="min-h-[44px] inline-flex items-center gap-2 px-5 rounded-full bg-amber-500 hover:bg-amber-400 text-slate-950 text-sm font-bold transition-colors"
                >
                  <Folder className="w-4 h-4" />
                  <span>{isImporting ? 'Importing...' : 'Or Open Google Picker'}</span>
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Top Mode Switcher */}
              <div className="flex flex-wrap items-center justify-between gap-3 bg-[#131620] border border-slate-800 rounded-xl p-3">
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setViewTab('packages')}
                    className={`min-h-[40px] px-4 py-1.5 rounded-lg text-xs font-bold ${
                      viewTab === 'packages'
                        ? 'bg-amber-500 text-slate-950'
                        : 'bg-[#0d1018] text-slate-200 hover:bg-slate-800'
                    }`}
                  >
                    Art Production Folders &amp; ZIPs ({artPackages.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewTab('vault')}
                    className={`min-h-[40px] px-4 py-1.5 rounded-lg text-xs font-bold ${
                      viewTab === 'vault'
                        ? 'bg-emerald-500 text-slate-950'
                        : 'bg-[#0d1018] text-slate-200 hover:bg-slate-800'
                    }`}
                  >
                    My Chosen Sheets ({manifest.assets.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setViewTab('browse');
                      if (browseItems.length === 0) {
                        loadFolderContents(folderHistory[folderHistory.length - 1]?.id || 'root', '', imagesOnly);
                      }
                    }}
                    className={`min-h-[40px] px-4 py-1.5 rounded-lg text-xs font-semibold ${
                      viewTab === 'browse'
                        ? 'bg-amber-500 text-slate-950'
                        : 'bg-[#0d1018] text-slate-200 hover:bg-slate-800'
                    }`}
                  >
                    Browse Inside Folder
                  </button>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={handleLaunchGooglePicker}
                    disabled={isImporting}
                    className="min-h-[40px] inline-flex items-center gap-1.5 px-4 rounded-lg bg-amber-500 hover:bg-amber-400 disabled:bg-slate-700 text-slate-950 text-xs font-bold"
                  >
                    <ImageIcon className="w-3.5 h-3.5" />
                    <span>{isImporting ? 'Importing...' : 'Open Google Picker'}</span>
                  </button>
                </div>
              </div>

              {/* TAB 1: Ranked Art Production Folders & ZIPs */}
              {viewTab === 'packages' && (
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3 bg-[#111521] border border-slate-800 rounded-xl p-3">
                    <p className="text-xs text-slate-300">
                      Showing Google Drive <strong>Folders</strong> and <strong>ZIP archives</strong> ranked for <em>Legends of Kai-Jax Art Production</em> &amp; Character/Area Sheets:
                    </p>
                    <form onSubmit={handlePackageSearchSubmit} className="flex items-center gap-1.5">
                      <input
                        type="text"
                        value={packageQuery}
                        onChange={(e) => setPackageQuery(e.target.value)}
                        placeholder="Filter folder or ZIP title..."
                        className="min-h-[38px] w-48 sm:w-60 rounded-lg bg-[#0d1018] border border-slate-700 px-3 text-xs text-slate-100 placeholder:text-slate-400"
                      />
                      <button
                        type="submit"
                        className="min-h-[38px] px-3 rounded-lg bg-[#1c2233] hover:bg-slate-700 text-slate-100 text-xs font-semibold inline-flex items-center gap-1"
                      >
                        <Search className="w-3.5 h-3.5" />
                        <span>Search</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => runArtPackageFinder(packageQuery)}
                        disabled={isSearchingPackages}
                        className="min-h-[38px] px-3 rounded-lg bg-[#1c2233] hover:bg-slate-700 text-slate-200 text-xs font-semibold inline-flex items-center gap-1"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${isSearchingPackages ? 'animate-spin' : ''}`} />
                      </button>
                    </form>
                  </div>

                  {isSearchingPackages ? (
                    <div className="rounded-xl bg-[#131620] border border-slate-800 p-8 text-center text-sm text-slate-300">
                      Searching Google Drive for &ldquo;Legends of Kai-Jax Art Production&rdquo; folders and ZIP archives...
                    </div>
                  ) : artPackages.length === 0 ? (
                    <div className="rounded-xl bg-[#131620] border border-slate-800 p-8 text-center space-y-3">
                      <p className="text-sm text-slate-200">
                        No folders or ZIPs matched that filter yet. Click <strong>Open Google Picker</strong> or <strong>Browse Inside Folder</strong> to select your art folder directly.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                      {artPackages.map((pkg, idx) => (
                        <div
                          key={pkg.id}
                          className={`rounded-xl border p-4 flex flex-col justify-between gap-3 ${
                            idx === 0
                              ? 'bg-[#171d2e] border-amber-400/80'
                              : 'bg-[#121622] border-slate-800 hover:border-slate-700'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div
                              className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                                pkg.isFolder
                                  ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                                  : 'bg-sky-500/15 text-sky-400 border border-sky-500/30'
                              }`}
                            >
                              {pkg.isFolder ? <Folder className="w-5 h-5" /> : <Archive className="w-5 h-5" />}
                            </div>
                            <div className="min-w-0 flex-1 space-y-1">
                              <div className="text-sm font-bold text-white break-words">{pkg.name}</div>
                              <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-400">
                                <span>{pkg.isFolder ? 'Google Drive Folder' : 'ZIP Archive'}</span>
                                {pkg.sizeBytes > 0 && (
                                  <span>· {(pkg.sizeBytes / (1024 * 1024)).toFixed(1)} MB</span>
                                )}
                                {pkg.modifiedTime && <span>· {pkg.modifiedTime.slice(0, 10)}</span>}
                              </div>
                              {pkg.matchBadges.length > 0 && (
                                <div className="flex flex-wrap gap-1.5 pt-1">
                                  {pkg.matchBadges.map((b) => (
                                    <span
                                      key={b}
                                      className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-[10px] font-semibold text-amber-200"
                                    >
                                      {b}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-2 pt-1">
                            {pkg.isFolder && (
                              <button
                                type="button"
                                onClick={() => handleOpenPackageFolder(pkg)}
                                className="min-h-[38px] px-3.5 rounded-lg bg-[#1d2436] hover:bg-slate-700 border border-slate-600 text-slate-100 text-xs font-semibold inline-flex items-center gap-1.5"
                              >
                                <FolderOpen className="w-3.5 h-3.5 text-amber-300" />
                                <span>Open &amp; Pick Specific Sheets</span>
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => handleImportWholePackage(pkg)}
                              disabled={isImporting}
                              className="min-h-[38px] px-4 rounded-lg bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-700 text-slate-950 text-xs font-bold inline-flex items-center gap-1.5"
                            >
                              <CloudDownload className="w-3.5 h-3.5" />
                              <span>
                                {pkg.isFolder
                                  ? 'Import All Character & Area Sheets Inside'
                                  : 'Unpack All Sheets From ZIP'}
                              </span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: My Chosen Canon Sheets */}
              {viewTab === 'vault' && (
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3 bg-[#111521] border border-slate-800 rounded-xl px-4 py-3">
                    <div className="text-xs text-slate-200">
                      <strong>{characterSheetCount}</strong> Character Sheet(s) (Solo Kai/Jax + Group Sheets) ·{' '}
                      <strong>{areaSheetCount}</strong> Area / Arena Sheet(s)
                    </div>
                    {manifest.assets.length > 0 && (
                      <div>
                        {!confirmClearAll ? (
                          <button
                            type="button"
                            onClick={() => setConfirmClearAll(true)}
                            className="min-h-[36px] px-3 rounded-lg bg-[#1c2233] hover:bg-red-950/70 border border-slate-700 hover:border-red-500/60 text-slate-300 hover:text-red-200 text-xs font-semibold inline-flex items-center gap-1.5"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Clear Chosen List</span>
                          </button>
                        ) : (
                          <div className="flex items-center gap-2 bg-red-950/70 border border-red-500/60 rounded-lg px-2.5 py-1">
                            <span className="text-[11px] text-red-200">Clear local list?</span>
                            <button
                              type="button"
                              onClick={handleClearVaultConfirmed}
                              className="px-2.5 py-1 rounded bg-red-500 text-slate-950 text-[11px] font-bold"
                            >
                              Yes, Clear
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmClearAll(false)}
                              className="px-2 py-1 rounded bg-slate-800 text-slate-200 text-[11px]"
                            >
                              Cancel
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {manifest.assets.length === 0 ? (
                    <div className="rounded-2xl bg-[#111521] border border-slate-800 p-8 text-center space-y-3">
                      <ImageIcon className="w-9 h-9 text-amber-400 mx-auto" />
                      <h3 className="font-display text-xl font-bold text-white">
                        No Sheets Imported Yet
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-300 max-w-lg mx-auto">
                        Open the <strong>Art Production Folders &amp; ZIPs</strong> tab to select your Kai-Jax art folder or ZIP.
                      </p>
                      <button
                        type="button"
                        onClick={() => setViewTab('packages')}
                        className="min-h-[40px] px-4 rounded-lg bg-amber-500 text-slate-950 text-xs font-bold"
                      >
                        View Art Production Folders &amp; ZIPs
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {manifest.assets.map((asset) => (
                        <div
                          key={asset.driveId}
                          className="rounded-xl bg-[#131620] border border-emerald-500/40 p-3.5 flex flex-col justify-between gap-3"
                        >
                          <div className="space-y-2.5">
                            <div className="relative">
                              {asset.mimeType.startsWith('image/') ? (
                                <img
                                  src={asset.localUrl}
                                  alt={asset.name}
                                  className="w-full h-52 object-contain rounded-lg bg-[#090b10] border border-slate-800"
                                />
                              ) : (
                                <div className="w-full h-52 rounded-lg bg-[#090b10] border border-slate-800 flex items-center justify-center text-xs text-slate-300 px-3 text-center">
                                  {asset.category.toUpperCase()} · {asset.name}
                                </div>
                              )}

                              {asset.mimeType.startsWith('image/') && (
                                <button
                                  type="button"
                                  onClick={() => setPreviewAsset(asset)}
                                  aria-label={`Inspect ${asset.name}`}
                                  className="absolute top-2 right-2 px-2.5 py-1.5 rounded-lg bg-black/80 hover:bg-amber-500 text-slate-100 hover:text-slate-950 text-[11px] font-semibold inline-flex items-center gap-1 border border-slate-700"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                  <span>Zoom</span>
                                </button>
                              )}
                            </div>

                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0">
                                <div className="text-xs font-bold text-white truncate" title={asset.name}>
                                  {asset.name}
                                </div>
                                <div className="text-[11px] text-slate-400 truncate" title={asset.folderPath}>
                                  {asset.folderPath}
                                </div>
                              </div>

                              <button
                                type="button"
                                onClick={() => handleRemoveVaultAsset(asset)}
                                aria-label={`Remove ${asset.name} from chosen vault`}
                                title="Remove from local rigging vault (does not delete from Google Drive)"
                                className="min-h-[34px] min-w-[34px] rounded-lg bg-[#1b2030] hover:bg-red-950/80 border border-slate-700 hover:border-red-500/60 text-slate-300 hover:text-red-300 flex items-center justify-center shrink-0"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          <div className="space-y-1">
                            <label className="block text-[10px] font-semibold uppercase tracking-wider text-emerald-300">
                              Sheet Classification
                            </label>
                            <select
                              value={asset.subjectTag}
                              onChange={(e) => handleVaultTagChange(asset, e.target.value)}
                              aria-label={`Assign canon role for ${asset.name}`}
                              className="w-full min-h-[38px] rounded-lg bg-[#0d1018] border border-slate-700 px-2.5 text-xs text-slate-100"
                            >
                              {SUBJECT_TAG_OPTIONS.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                  {opt.label}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: Browse Inside Folder */}
              {viewTab === 'browse' && (
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-3 bg-[#131620] border border-slate-800 rounded-xl p-3">
                    <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-300">
                      <Layers className="w-3.5 h-3.5 text-amber-400" />
                      {folderHistory.map((crumb, idx) => (
                        <React.Fragment key={`${crumb.id}-${idx}`}>
                          {idx > 0 && <span className="text-slate-500">/</span>}
                          <button
                            type="button"
                            onClick={() => handleBreadcrumbClick(idx)}
                            className="hover:text-amber-300 font-medium"
                          >
                            {crumb.name}
                          </button>
                        </React.Fragment>
                      ))}
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <label className="inline-flex items-center gap-1.5 text-xs text-slate-200 cursor-pointer px-2.5 py-1.5 rounded-lg bg-[#0d1018] border border-slate-700">
                        <input
                          type="checkbox"
                          checked={imagesOnly}
                          onChange={handleToggleImagesOnly}
                          className="accent-amber-500"
                        />
                        <span>Images &amp; ZIPs Only</span>
                      </label>

                      <form onSubmit={handleSearchSubmit} className="flex items-center gap-1.5">
                        <input
                          type="text"
                          value={searchInput}
                          onChange={(e) => setSearchInput(e.target.value)}
                          placeholder="Filter filename..."
                          className="min-h-[38px] w-40 sm:w-52 rounded-lg bg-[#0d1018] border border-slate-700 px-3 text-xs text-slate-100 placeholder:text-slate-400"
                        />
                        <button
                          type="submit"
                          className="min-h-[38px] px-3 rounded-lg bg-[#1c2233] hover:bg-slate-700 text-slate-100 text-xs font-semibold inline-flex items-center gap-1"
                        >
                          <Search className="w-3.5 h-3.5" />
                        </button>
                      </form>

                      {browseItems.some((i) => !i.isFolder) && (
                        <button
                          type="button"
                          onClick={handleCheckAllCurrentFolder}
                          className="min-h-[38px] px-3 rounded-lg bg-[#1c2233] hover:bg-slate-700 text-amber-200 text-xs font-semibold"
                        >
                          Check All Here
                        </button>
                      )}

                      {selectedCount > 0 && (
                        <button
                          type="button"
                          onClick={handleClearManualSelection}
                          className="min-h-[38px] px-3 rounded-lg bg-[#1c2233] hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                        >
                          Uncheck ({selectedCount})
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={handleImportManuallyChecked}
                        disabled={isImporting || selectedCount === 0}
                        className="min-h-[38px] px-4 rounded-lg bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-800 disabled:text-slate-500 text-slate-950 text-xs font-bold inline-flex items-center gap-1.5"
                      >
                        <CloudDownload className="w-4 h-4" />
                        <span>
                          {isImporting ? 'Importing...' : `Import Checked (${selectedCount})`}
                        </span>
                      </button>
                    </div>
                  </div>

                  {isBrowsing ? (
                    <div className="rounded-xl bg-[#131620] border border-slate-800 p-8 text-center text-sm text-slate-300">
                      Loading folder contents...
                    </div>
                  ) : browseItems.length === 0 ? (
                    <div className="rounded-xl bg-[#131620] border border-slate-800 p-8 text-center text-sm text-slate-300">
                      No matching images or subfolders in this folder.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                      {browseItems.map((item) => {
                        if (item.isFolder) {
                          return (
                            <button
                              key={item.id}
                              type="button"
                              onClick={() => handleOpenFolder(item)}
                              className="rounded-xl bg-[#131620] hover:bg-[#1a2030] border border-slate-700 p-4 flex items-center gap-3 text-left transition-colors"
                            >
                              <Folder className="w-6 h-6 text-amber-400 shrink-0" />
                              <div className="min-w-0">
                                <div className="text-xs font-semibold text-white truncate">{item.name}</div>
                                <div className="text-[11px] text-slate-400">Open Subfolder</div>
                              </div>
                            </button>
                          );
                        }

                        const checked = Boolean(selectedIds[item.id]);
                        const activeSubject = tagOverrides[item.id]?.subjectTag ?? item.subjectTag;
                        return (
                          <div
                            key={item.id}
                            className={`rounded-xl border p-3 flex flex-col justify-between gap-2.5 transition-colors ${
                              checked
                                ? 'bg-[#171d2e] border-amber-400'
                                : 'bg-[#121622] border-slate-800 hover:border-slate-700'
                            }`}
                          >
                            <div
                              onClick={() => toggleManualCheck(item)}
                              className="space-y-2 cursor-pointer"
                            >
                              <DriveThumbnail fileId={item.id} mimeType={item.mimeType} alt={item.name} />
                              <div className="flex items-start justify-between gap-2">
                                <div className="min-w-0">
                                  <div className="text-xs font-semibold text-white truncate" title={item.name}>
                                    {item.name}
                                  </div>
                                  <div className="text-[11px] text-slate-400 truncate">
                                    {(item.sizeBytes / 1024).toFixed(0)} KB
                                  </div>
                                </div>
                                <div
                                  className={`min-h-[30px] min-w-[30px] rounded-lg flex items-center justify-center border shrink-0 ${
                                    checked
                                      ? 'bg-amber-500 border-amber-400 text-slate-950'
                                      : 'bg-[#0d1018] border-slate-700 text-transparent'
                                  }`}
                                >
                                  <Check className="w-4 h-4" />
                                </div>
                              </div>
                            </div>

                            <select
                              value={activeSubject}
                              onChange={(e) => handleBrowseTagOverride(item, e.target.value)}
                              aria-label={`Assign canon role for ${item.name}`}
                              className="w-full min-h-[36px] rounded-lg bg-[#0d1018] border border-slate-700 px-2 text-[11px] text-slate-100"
                            >
                              {SUBJECT_TAG_OPTIONS.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                  {opt.label}
                                </option>
                              ))}
                            </select>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Full-Resolution Sheet Lightbox Preview */}
      {previewAsset && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex flex-col items-center justify-center p-4"
          onClick={() => setPreviewAsset(null)}
        >
          <div className="max-w-5xl w-full flex items-center justify-between pb-3">
            <span className="text-sm font-bold text-white truncate">{previewAsset.name}</span>
            <button
              type="button"
              onClick={() => setPreviewAsset(null)}
              className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold inline-flex items-center gap-1"
            >
              <X className="w-4 h-4" />
              <span>Close Preview</span>
            </button>
          </div>
          <img
            src={previewAsset.localUrl}
            alt={previewAsset.name}
            onClick={(e) => e.stopPropagation()}
            className="max-h-[82vh] max-w-full object-contain rounded-xl border border-slate-700"
          />
        </div>
      )}
    </div>
  );
};
