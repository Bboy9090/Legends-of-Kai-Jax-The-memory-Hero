import express from 'express';
import type { Request, Response } from 'express';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT || 3000);
const CANON_ROOT = path.join(__dirname, 'public', 'canon-drive');
const MANIFEST_PATH = path.join(CANON_ROOT, 'manifest.json');
const ART_INDEX_PATH = path.join(CANON_ROOT, 'drive-art-index.json');

type CanonCategory = 'character' | 'arena' | 'model' | 'lore';

interface DriveRawFile {
  id: string;
  name: string;
  mimeType: string;
  size?: string;
  modifiedTime?: string;
  parents?: string[];
  thumbnailLink?: string;
}

interface DiscoveredItem {
  id: string;
  name: string;
  mimeType: string;
  sizeBytes: number;
  modifiedTime: string;
  folderPath: string;
  isFolder: boolean;
  category: CanonCategory;
  subjectTag: string;
}

interface ArtPackageCandidate {
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

interface ImportedAsset {
  driveId: string;
  name: string;
  mimeType: string;
  category: CanonCategory;
  subjectTag: string;
  folderPath: string;
  localUrl: string;
  sizeBytes: number;
  importedAt: string;
}

interface VaultManifest {
  updatedAt: string;
  sourceAccount: string;
  assets: ImportedAsset[];
}

function readManifest(): VaultManifest {
  try {
    if (fs.existsSync(MANIFEST_PATH)) {
      return JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8')) as VaultManifest;
    }
  } catch {
    // ignore corrupt manifest
  }
  return { updatedAt: '', sourceAccount: '', assets: [] };
}

function writeManifest(manifest: VaultManifest): void {
  fs.mkdirSync(CANON_ROOT, { recursive: true });
  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2), { encoding: 'utf8', mode: 0o644 });
}

function extractBearerToken(req: Request): string | null {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) return null;
  const token = header.slice('Bearer '.length).trim();
  return token.length > 10 ? token : null;
}

function scoreArtPackageTitle(name: string, customFilter = ''): { score: number; badges: string[] } {
  const norm = name.toLowerCase().replace(/[_-]+/g, ' ');
  const compact = norm.replace(/\s+/g, '');
  let score = 0;
  const badges: string[] = [];

  if (customFilter) {
    const qNorm = customFilter.toLowerCase().trim();
    if (norm.includes(qNorm) || compact.includes(qNorm.replace(/\s+/g, ''))) {
      score += 120;
      badges.push('Search Match');
    }
  }

  const hasLegends = norm.includes('legend');
  const hasKaiJax = compact.includes('kaijax') || (norm.includes('kai') && norm.includes('jax'));
  const hasKaiOrJax = norm.includes('kai') || norm.includes('jax');
  const hasArt = /\bart\b|artwork|artpack|concept|sheet|visual|illustration/i.test(norm) || compact.includes('artprod');
  const hasProd = /prod|production|asset|master|canon|pack|studio/i.test(norm);
  const isDraft = /\bdraft\b|\bold\b|\barchive\b|\bbackup\b/i.test(norm);

  if (hasLegends) {
    score += 35;
    badges.push('Legends');
  }
  if (hasKaiJax) {
    score += 45;
    badges.push('Kai-Jax');
  } else if (hasKaiOrJax) {
    score += 20;
    badges.push('Kai/Jax');
  }
  if (hasArt) {
    score += 50;
    badges.push('Art');
  }
  if (hasProd) {
    score += 40;
    badges.push('Production');
  }
  if (hasArt && hasProd) {
    score += 45; // Strong boost for "Art Production" together
  }
  if ((hasLegends || hasKaiJax) && hasArt) {
    score += 50; // Strong boost for "Legends of Kai-Jax Art..."
  }
  if (isDraft) {
    score -= 15;
    badges.push('Draft');
  }

  // Penalize obvious code/node repos that aren't art folders
  if (/node_modules|\.git|android|gradle|server|src|dist|build/i.test(norm) && !hasArt) {
    score -= 60;
  }

  return { score, badges };
}

function classifyCanonFile(
  name: string,
  mimeType: string,
  folderPath: string
): { category: CanonCategory; subjectTag: string } {
  const combined = `${folderPath}/${name}`.toLowerCase();

  if (/\.(glb|gltf|fbx|obj|blend)$/i.test(name) || mimeType.includes('gltf')) {
    return { category: 'model', subjectTag: detectSubjectTag(combined, 'model') };
  }

  if (
    !mimeType.startsWith('image/') &&
    (mimeType.startsWith('application/vnd.google-apps.document') ||
      mimeType.startsWith('application/pdf') ||
      /\.(md|txt|pdf|docx?)$/i.test(name))
  ) {
    return { category: 'lore', subjectTag: detectSubjectTag(combined, 'lore') };
  }

  const isArena =
    /\b(area|areas|arena|arenas|world|worlds|district|stage|map|city|ashblock|sector[-_ ]?7|neon[-_ ]?ward|iron[-_ ]?market|undercrown|zenith|erasure|nexus|environment|rooftop|alley|spire|landscape|background|forgotten[-_ ]?roads|stormfall|zone|biome)\b/i.test(
      combined
    );

  if (isArena) {
    return { category: 'arena', subjectTag: detectArenaTag(combined) };
  }

  return { category: 'character', subjectTag: detectSubjectTag(combined, 'character-sheet') };
}

function detectSubjectTag(text: string, fallback: string): string {
  if (/\b(mentor|mentors|father|fathers|elder[_ -]?fang|vharok|boryn.*borax)\b/i.test(text)) {
    return 'mentors-sheet';
  }
  if (/\b(allies|ally|fracture[_ -]?circle)\b/i.test(text)) return 'allies-sheet';
  if (/\b(enemies|enemy|villain|villains|fang[_ -]?syndicate|boss|bosses)\b/i.test(text)) {
    return 'boss-or-faction';
  }
  if (/\bfirst[_ -]?sabertooth[_ -]?gods\b/i.test(text)) return 'sabertooth-gods-sheet';
  if (/\b(character[_ -]?visual[_ -]?library|roster|group)\b/i.test(text)) {
    return 'character-roster-sheet';
  }
  if (/\bkai[-_ ]?jax\b/i.test(text) || /\bfusion\b/i.test(text) || /\bmemory[-_ ]?hero\b/i.test(text)) {
    return 'kaijax';
  }
  if (/\bbovar\b/i.test(text)) return 'bovar';
  if (/\bboryn\b/i.test(text)) return 'boryn';
  if (/\bborax\b/i.test(text)) return 'borax';
  if (/\bkai\b/i.test(text) && !/\bjax\b/i.test(text)) return 'kai';
  if (/\bjax\b/i.test(text) && !/\bkai\b/i.test(text)) return 'jax';
  return fallback;
}

function detectArenaTag(text: string): string {
  if (/ashblock/i.test(text)) return 'ashblock-heights';
  if (/sector[-_ ]?7/i.test(text)) return 'sector-7';
  if (/neon/i.test(text)) return 'neon-ward';
  if (/iron[-_ ]?market/i.test(text)) return 'iron-market';
  if (/undercrown/i.test(text)) return 'undercrown';
  if (/zenith/i.test(text)) return 'zenith-spires';
  if (/erasure/i.test(text)) return 'erasure-fields';
  if (/nexus/i.test(text)) return 'memory-nexus';
  return 'raging-city-world';
}

async function driveGetJson<T>(url: string, token: string): Promise<T> {
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const txt = await res.text();
    const err = new Error(`Drive API ${res.status}: ${txt.slice(0, 240)}`) as Error & {
      status?: number;
    };
    err.status = res.status;
    throw err;
  }
  return (await res.json()) as T;
}

async function listDriveQuery(
  q: string,
  token: string,
  pageSize = 100,
  orderBy = 'modifiedTime desc'
): Promise<DriveRawFile[]> {
  const params = new URLSearchParams({
    q: `(${q}) and trashed = false`,
    pageSize: String(pageSize),
    includeItemsFromAllDrives: 'true',
    supportsAllDrives: 'true',
    fields: 'files(id,name,mimeType,size,modifiedTime,parents,thumbnailLink)',
    orderBy,
  });
  const data = await driveGetJson<{ files?: DriveRawFile[] }>(
    `https://www.googleapis.com/drive/v3/files?${params.toString()}`,
    token
  );
  return data.files ?? [];
}

function sanitizeFileName(raw: string): string {
  return raw.replace(/[^a-zA-Z0-9._-]+/g, '_').replace(/^_+|_+$/g, '').slice(0, 96) || 'asset';
}

function walkFilesRecursive(dir: string): string[] {
  const out: string[] = [];
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...walkFilesRecursive(full));
    } else if (entry.isFile()) {
      out.push(full);
    }
  }
  return out;
}

function isVisualOrModelAsset(name: string, mimeType: string): boolean {
  if (mimeType.startsWith('image/') || mimeType === 'application/vnd.google-apps.drawing') {
    return true;
  }
  return /\.(png|jpe?g|webp|gif|svg|glb|gltf)$/i.test(name);
}

async function collectVisualFilesInDriveFolder(
  rootFolderId: string,
  rootFolderName: string,
  token: string,
  maxDepth = 4
): Promise<Array<{ meta: DriveRawFile; folderPath: string }>> {
  const collected: Array<{ meta: DriveRawFile; folderPath: string }> = [];
  let currentLevel: Array<{ id: string; pathLabel: string }> = [
    { id: rootFolderId, pathLabel: rootFolderName },
  ];

  for (let depth = 0; depth < maxDepth && currentLevel.length > 0; depth++) {
    const nextLevel: Array<{ id: string; pathLabel: string }> = [];
    for (let i = 0; i < currentLevel.length; i += 15) {
      const chunk = currentLevel.slice(i, i + 15);
      const parentMap = new Map(chunk.map((c) => [c.id, c.pathLabel]));
      const parentClause = chunk.map((c) => `'${c.id.replace(/'/g, "\\'")}' in parents`).join(' or ');
      const children = await listDriveQuery(parentClause, token, 100);

      for (const item of children) {
        const pId = item.parents?.[0] || '';
        const parentPath = parentMap.get(pId) || rootFolderName;
        if (item.mimeType === 'application/vnd.google-apps.folder') {
          nextLevel.push({ id: item.id, pathLabel: `${parentPath}/${item.name}` });
        } else if (isVisualOrModelAsset(item.name, item.mimeType) || /\.zip$/i.test(item.name)) {
          collected.push({ meta: item, folderPath: parentPath });
        }
      }
    }
    currentLevel = nextLevel;
  }

  return collected;
}

async function createServer() {
  const app = express();
  app.use(express.json({ limit: '60mb' }));

  // 1. Local Vault Status (reads local synced manifest)
  app.get('/api/canon-drive/status', (_req: Request, res: Response) => {
    res.json(readManifest());
  });

  // 2. Targeted Finder for "Legends of Kai-Jax Art Production" Folders & ZIP Archives
  app.get('/api/canon-drive/art-packages', async (req: Request, res: Response) => {
    const token = extractBearerToken(req);
    if (!token) {
      res.status(401).json({ error: 'Missing Google Drive Bearer token' });
      return;
    }

    const customFilter = typeof req.query.q === 'string' ? req.query.q.trim() : '';

    try {
      const about = await driveGetJson<{ user?: { emailAddress?: string } }>(
        'https://www.googleapis.com/drive/v3/about?fields=user(emailAddress)',
        token
      );
      const accountEmail = about.user?.emailAddress || 'Connected Google Drive';

      // Fetch (A) all ZIPs, (B) keyword folders, (C) recent folders, AND (D) sheet/area images to locate their parent folders!
      const [allZips, keywordFolders, recentFolders, sheetImages] = await Promise.all([
        listDriveQuery(
          `mimeType contains 'zip' or mimeType contains 'compressed' or name contains '.zip'`,
          token,
          100
        ),
        listDriveQuery(
          `mimeType = 'application/vnd.google-apps.folder' and (name contains 'art' or name contains 'prod' or name contains 'legend' or name contains 'kai' or name contains 'jax' or name contains 'canon' or name contains 'character' or name contains 'sheet' or name contains 'area' or name contains 'arena')`,
          token,
          100
        ),
        listDriveQuery(`mimeType = 'application/vnd.google-apps.folder'`, token, 100),
        listDriveQuery(
          `mimeType contains 'image/' and (name contains 'sheet' or name contains 'area' or name contains 'kai' or name contains 'jax' or name contains 'mentor' or name contains 'allies' or name contains 'enemies' or name contains 'art')`,
          token,
          100
        ),
      ]);

      const sheetCountByParent = new Map<string, number>();
      for (const img of sheetImages) {
        const pId = img.parents?.[0];
        if (pId) {
          sheetCountByParent.set(pId, (sheetCountByParent.get(pId) || 0) + 1);
        }
      }

      const dedup = new Map<string, DriveRawFile>();
      for (const item of [...allZips, ...keywordFolders, ...recentFolders]) {
        dedup.set(item.id, item);
      }

      // Fetch metadata for any parent folder containing sheet/area images that wasn't already in dedup
      const missingParentIds = Array.from(sheetCountByParent.keys())
        .filter((pid) => !dedup.has(pid))
        .slice(0, 12);
      if (missingParentIds.length > 0) {
        const parentMetas = await Promise.all(
          missingParentIds.map((pid) =>
            driveGetJson<DriveRawFile>(
              `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(pid)}?fields=id,name,mimeType,modifiedTime,parents&supportsAllDrives=true`,
              token
            ).catch(() => null)
          )
        );
        const grandParentIds: string[] = [];
        for (const pm of parentMetas) {
          if (pm && pm.mimeType === 'application/vnd.google-apps.folder') {
            dedup.set(pm.id, pm);
            if (pm.parents?.[0] && !dedup.has(pm.parents[0])) {
              grandParentIds.push(pm.parents[0]);
            }
          }
        }
        // Also resolve grandparent root folder (e.g. "Legends of Kai-Jax Art Production" -> "Character Sheets")
        const uniqueGrandParents = Array.from(new Set(grandParentIds)).slice(0, 8);
        if (uniqueGrandParents.length > 0) {
          const gpMetas = await Promise.all(
            uniqueGrandParents.map((gpid) =>
              driveGetJson<DriveRawFile>(
                `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(gpid)}?fields=id,name,mimeType,modifiedTime,parents&supportsAllDrives=true`,
                token
              ).catch(() => null)
            )
          );
          for (const gpm of gpMetas) {
            if (gpm && gpm.mimeType === 'application/vnd.google-apps.folder') {
              dedup.set(gpm.id, gpm);
              sheetCountByParent.set(gpm.id, (sheetCountByParent.get(gpm.id) || 0) + 3);
            }
          }
        }
      }

      const candidates: ArtPackageCandidate[] = [];
      for (const item of dedup.values()) {
        const isFolder = item.mimeType === 'application/vnd.google-apps.folder';
        const isZip = !isFolder && (item.mimeType.includes('zip') || /\.zip$/i.test(item.name));
        if (!isFolder && !isZip) continue;

        const { score: titleScore, badges } = scoreArtPackageTitle(item.name, customFilter);
        const sheetCount = sheetCountByParent.get(item.id) || 0;
        let totalScore = titleScore;
        const allBadges = [...badges];

        if (sheetCount > 0) {
          totalScore += Math.min(80, sheetCount * 15);
          allBadges.unshift(`${sheetCount}+ Character/Area Sheets`);
        }

        if (totalScore > 0 || (customFilter && item.name.toLowerCase().includes(customFilter.toLowerCase()))) {
          candidates.push({
            id: item.id,
            name: item.name,
            mimeType: item.mimeType,
            isFolder,
            isZip,
            sizeBytes: Number(item.size || 0),
            modifiedTime: item.modifiedTime || '',
            score: totalScore,
            sheetCount,
            matchBadges: allBadges,
          });
        }
      }

      candidates.sort(
        (a, b) => b.score - a.score || (b.modifiedTime || '').localeCompare(a.modifiedTime || '')
      );

      const topPackages = candidates.slice(0, 40);

      fs.mkdirSync(CANON_ROOT, { recursive: true });
      fs.writeFileSync(
        ART_INDEX_PATH,
        JSON.stringify(
          {
            scannedAt: new Date().toISOString(),
            accountEmail,
            packages: topPackages,
          },
          null,
          2
        ),
        { encoding: 'utf8', mode: 0o644 }
      );

      res.json({
        accountEmail,
        packages: topPackages,
      });
    } catch (err: unknown) {
      const status = (err as { status?: number })?.status || 500;
      const message = err instanceof Error ? err.message : 'Failed to search Drive folders and ZIPs';
      res.status(status).json({ error: message });
    }
  });

  // 3. Clean Manual Folder Browser (ZERO auto-selecting)
  app.get('/api/canon-drive/scan', async (req: Request, res: Response) => {
    const token = extractBearerToken(req);
    if (!token) {
      res.status(401).json({ error: 'Missing Google Drive Bearer token' });
      return;
    }

    try {
      const about = await driveGetJson<{ user?: { emailAddress?: string; displayName?: string } }>(
        'https://www.googleapis.com/drive/v3/about?fields=user(emailAddress,displayName)',
        token
      );
      const accountEmail = about.user?.emailAddress || 'Connected Google Drive';

      const folderId = typeof req.query.folderId === 'string' && req.query.folderId ? req.query.folderId : 'root';
      const searchQuery = typeof req.query.q === 'string' ? req.query.q.trim() : '';
      const imagesOnly = req.query.imagesOnly !== 'false';

      const mediaFilter = imagesOnly
        ? ` and (mimeType = 'application/vnd.google-apps.folder' or mimeType contains 'image/' or mimeType = 'application/vnd.google-apps.drawing' or name contains '.glb' or name contains '.zip')`
        : '';

      let browseRaw: DriveRawFile[] = [];
      let currentFolder = { id: folderId, name: folderId === 'root' ? 'My Drive' : 'Selected Folder' };

      if (searchQuery) {
        const escaped = searchQuery.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
        browseRaw = await listDriveQuery(`name contains '${escaped}'${mediaFilter}`, token, 100);
        currentFolder = { id: 'search', name: `Search: "${searchQuery}"` };
      } else {
        if (folderId !== 'root') {
          try {
            const meta = await driveGetJson<{ id: string; name: string }>(
              `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(folderId)}?fields=id,name&supportsAllDrives=true`,
              token
            );
            currentFolder = { id: meta.id, name: meta.name };
          } catch {
            // fallback label
          }
        }
        browseRaw = await listDriveQuery(
          `'${folderId.replace(/'/g, "\\'")}' in parents${mediaFilter}`,
          token,
          100,
          'folder,modifiedTime desc'
        );
      }

      const browseItems: DiscoveredItem[] = browseRaw.map((item) => {
        const isFolder = item.mimeType === 'application/vnd.google-apps.folder';
        const cls = classifyCanonFile(item.name, item.mimeType, currentFolder.name);
        return {
          id: item.id,
          name: item.name,
          mimeType: item.mimeType,
          sizeBytes: Number(item.size || 0),
          modifiedTime: item.modifiedTime || '',
          folderPath: currentFolder.name,
          isFolder,
          category: cls.category,
          subjectTag: cls.subjectTag,
        };
      });

      browseItems.sort((a, b) => Number(b.isFolder) - Number(a.isFolder) || a.name.localeCompare(b.name));

      res.json({
        accountEmail,
        browseItems,
        currentFolder,
      });
    } catch (err: unknown) {
      const status = (err as { status?: number })?.status || 500;
      const message = err instanceof Error ? err.message : 'Drive browse error';
      res.status(status).json({ error: message });
    }
  });

  // 4. Secure Drive Preview Proxy (uses Bearer header from client fetch)
  app.get('/api/canon-drive/preview/:fileId', async (req: Request, res: Response) => {
    const token = extractBearerToken(req);
    if (!token) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const fileId = req.params.fileId;
    try {
      const meta = await driveGetJson<DriveRawFile>(
        `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(fileId)}?fields=id,name,mimeType,thumbnailLink&supportsAllDrives=true`,
        token
      );

      let downloadUrl = `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(fileId)}?alt=media&supportsAllDrives=true`;
      if (meta.mimeType === 'application/vnd.google-apps.drawing') {
        downloadUrl = `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(fileId)}/export?mimeType=image/png`;
      } else if (!meta.mimeType.startsWith('image/') && meta.thumbnailLink) {
        const thumbRes = await fetch(meta.thumbnailLink, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (thumbRes.ok) {
          const buf = Buffer.from(await thumbRes.arrayBuffer());
          res.setHeader('Content-Type', thumbRes.headers.get('content-type') || 'image/jpeg');
          res.send(buf);
          return;
        }
      }

      const mediaRes = await fetch(downloadUrl, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!mediaRes.ok) {
        res.status(mediaRes.status).end();
        return;
      }
      const buf = Buffer.from(await mediaRes.arrayBuffer());
      res.setHeader(
        'Content-Type',
        mediaRes.headers.get('content-type') || meta.mimeType || 'application/octet-stream'
      );
      res.send(buf);
    } catch {
      res.status(500).end();
    }
  });

  // 5. Import Explicitly Chosen Files, Art Folder, or Art ZIP into Local Vault (Read-Only on Google Drive)
  app.post('/api/canon-drive/import', async (req: Request, res: Response) => {
    const token = extractBearerToken(req);
    if (!token) {
      res.status(401).json({ error: 'Missing Google Drive Bearer token' });
      return;
    }

    const items: Array<{
      id: string;
      category?: CanonCategory;
      subjectTag?: string;
      folderPath?: string;
    }> = Array.isArray(req.body?.items) ? req.body.items : [];

    if (items.length === 0) {
      res.status(400).json({ error: 'No Drive files or folders specified for import' });
      return;
    }

    try {
      const about = await driveGetJson<{ user?: { emailAddress?: string } }>(
        'https://www.googleapis.com/drive/v3/about?fields=user(emailAddress)',
        token
      );
      const sourceAccount = about.user?.emailAddress || 'Google Drive';

      const manifest = readManifest();
      const byDriveId = new Map<string, ImportedAsset>();
      for (const existing of manifest.assets) {
        byDriveId.set(existing.driveId, existing);
      }

      const saveProgressManifest = () => {
        const current: VaultManifest = {
          updatedAt: new Date().toISOString(),
          sourceAccount,
          assets: Array.from(byDriveId.values()),
        };
        writeManifest(current);
        return current;
      };

      const fileQueue: Array<{
        meta: DriveRawFile;
        category?: CanonCategory;
        subjectTag?: string;
        folderPath: string;
      }> = [];

      for (const reqItem of items) {
        const meta = await driveGetJson<DriveRawFile>(
          `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(reqItem.id)}?fields=id,name,mimeType,size&supportsAllDrives=true`,
          token
        );

        if (meta.mimeType === 'application/vnd.google-apps.folder') {
          const folderVisuals = await collectVisualFilesInDriveFolder(meta.id, meta.name, token, 4);
          for (const fv of folderVisuals) {
            fileQueue.push({
              meta: fv.meta,
              folderPath: fv.folderPath,
            });
          }
        } else {
          fileQueue.push({
            meta,
            category: reqItem.category,
            subjectTag: reqItem.subjectTag,
            folderPath: reqItem.folderPath || 'Google Drive',
          });
        }
      }

      for (const entry of fileQueue) {
        const { meta } = entry;
        let fetchUrl = `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(meta.id)}?alt=media&supportsAllDrives=true`;
        let extOverride = '';
        let outMime = meta.mimeType;

        if (meta.mimeType === 'application/vnd.google-apps.document') {
          fetchUrl = `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(meta.id)}/export?mimeType=text/plain`;
          extOverride = '.txt';
          outMime = 'text/plain';
        } else if (meta.mimeType === 'application/vnd.google-apps.drawing') {
          fetchUrl = `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(meta.id)}/export?mimeType=image/png`;
          extOverride = '.png';
          outMime = 'image/png';
        } else if (meta.mimeType === 'application/vnd.google-apps.presentation') {
          fetchUrl = `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(meta.id)}/export?mimeType=application/pdf`;
          extOverride = '.pdf';
          outMime = 'application/pdf';
        }

        const dlRes = await fetch(fetchUrl, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!dlRes.ok) continue;

        const buffer = Buffer.from(await dlRes.arrayBuffer());

        // Unpack explicitly chosen .zip art archives into individual sheets
        if (/\.zip$/i.test(meta.name) || meta.mimeType.includes('zip')) {
          const tmpZipDir = fs.mkdtempSync(path.join(os.tmpdir(), 'kaijax-artzip-'));
          const tmpZipPath = path.join(tmpZipDir, 'archive.zip');
          try {
            fs.writeFileSync(tmpZipPath, buffer);
            execFileSync('unzip', ['-o', '-q', tmpZipPath, '-d', path.join(tmpZipDir, 'out')]);
            const extractedFiles = walkFilesRecursive(path.join(tmpZipDir, 'out'));
            for (const extFile of extractedFiles) {
              const extName = path.basename(extFile);
              if (extName.startsWith('._') || extFile.includes('__MACOSX')) continue;
              if (!/\.(png|jpe?g|webp|glb|gltf)$/i.test(extName)) continue;

              const relDir = path.relative(path.join(tmpZipDir, 'out'), path.dirname(extFile));
              const entryBuf = fs.readFileSync(extFile);
              const isGlb = /\.(glb|gltf)$/i.test(extName);
              const entryMime = isGlb
                ? 'model/gltf-binary'
                : /\.png$/i.test(extName)
                  ? 'image/png'
                  : /\.webp$/i.test(extName)
                    ? 'image/webp'
                    : 'image/jpeg';
              const autoCls = classifyCanonFile(extName, entryMime, `${meta.name}/${relDir}`);
              const subdir =
                autoCls.category === 'arena'
                  ? 'arenas'
                  : autoCls.category === 'model'
                    ? 'models'
                    : 'characters';
              const destDir = path.join(CANON_ROOT, subdir);
              fs.mkdirSync(destDir, { recursive: true });
              const cleanEntryName = `${meta.id.slice(0, 6)}_${sanitizeFileName(
                relDir ? `${relDir}_${extName}` : extName
              )}`;
              fs.writeFileSync(path.join(destDir, cleanEntryName), entryBuf, { mode: 0o644 });

              const syntheticId = `${meta.id}::${relDir ? `${relDir}/` : ''}${extName}`;
              byDriveId.set(syntheticId, {
                driveId: syntheticId,
                name: extName,
                mimeType: entryMime,
                category: autoCls.category,
                subjectTag: autoCls.subjectTag,
                folderPath: relDir ? `${meta.name}/${relDir}` : meta.name,
                localUrl: `/canon-drive/${subdir}/${cleanEntryName}`,
                sizeBytes: entryBuf.byteLength,
                importedAt: new Date().toISOString(),
              });
            }
            saveProgressManifest();
          } finally {
            fs.rmSync(tmpZipDir, { recursive: true, force: true });
          }
          continue;
        }

        const autoCls = classifyCanonFile(meta.name, outMime, entry.folderPath);
        const category: CanonCategory = entry.category || autoCls.category;
        const subjectTag = entry.subjectTag || autoCls.subjectTag;

        const subdir =
          category === 'arena'
            ? 'arenas'
            : category === 'model'
              ? 'models'
              : category === 'lore'
                ? 'lore'
                : 'characters';

        const destDir = path.join(CANON_ROOT, subdir);
        fs.mkdirSync(destDir, { recursive: true });

        const baseClean = sanitizeFileName(meta.name);
        const finalFileName =
          extOverride && !baseClean.toLowerCase().endsWith(extOverride)
            ? `${meta.id.slice(0, 6)}_${baseClean}${extOverride}`
            : `${meta.id.slice(0, 6)}_${baseClean}`;

        const destPath = path.join(destDir, finalFileName);
        fs.writeFileSync(destPath, buffer, { mode: 0o644 });

        byDriveId.set(meta.id, {
          driveId: meta.id,
          name: meta.name,
          mimeType: outMime,
          category,
          subjectTag,
          folderPath: entry.folderPath,
          localUrl: `/canon-drive/${subdir}/${finalFileName}`,
          sizeBytes: buffer.byteLength,
          importedAt: new Date().toISOString(),
        });

        saveProgressManifest();
      }

      const nextManifest = saveProgressManifest();
      res.json(nextManifest);
    } catch (err: unknown) {
      const status = (err as { status?: number })?.status || 500;
      const message = err instanceof Error ? err.message : 'Failed to import Google Drive canon files';
      res.status(status).json({ error: message });
    }
  });

  // 6. Update Role Tag on a Locally Synced Asset (Local Vault Only — Does NOT touch Google Drive)
  app.patch('/api/canon-drive/asset/:driveId', (req: Request, res: Response) => {
    const driveId = req.params.driveId;
    const nextCategory = req.body?.category as CanonCategory | undefined;
    const nextSubjectTag = typeof req.body?.subjectTag === 'string' ? req.body.subjectTag : undefined;

    const manifest = readManifest();
    const target = manifest.assets.find((a) => a.driveId === driveId);
    if (!target) {
      res.status(404).json({ error: 'Local vault asset not found' });
      return;
    }

    if (nextCategory) target.category = nextCategory;
    if (nextSubjectTag) target.subjectTag = nextSubjectTag;
    manifest.updatedAt = new Date().toISOString();
    writeManifest(manifest);
    res.json(manifest);
  });

  // 7. Remove Single Synced File from Local Vault (Local Vault Only — Does NOT touch Google Drive)
  app.delete('/api/canon-drive/asset/:driveId', (req: Request, res: Response) => {
    const driveId = req.params.driveId;
    const manifest = readManifest();
    const target = manifest.assets.find((a) => a.driveId === driveId);
    if (target && target.localUrl.startsWith('/canon-drive/')) {
      const rel = target.localUrl.replace(/^\/canon-drive\//, '');
      const localFile = path.join(CANON_ROOT, rel);
      if (fs.existsSync(localFile)) {
        fs.rmSync(localFile, { force: true });
      }
    }

    const updated: VaultManifest = {
      updatedAt: new Date().toISOString(),
      sourceAccount: manifest.sourceAccount,
      assets: manifest.assets.filter((a) => a.driveId !== driveId),
    };
    writeManifest(updated);
    res.json(updated);
  });

  // 8. Clear Local Synced Vault (Preserves Official /assets/aistudio/ Visual Library Sheets)
  app.post('/api/canon-drive/clear', (_req: Request, res: Response) => {
    const current = readManifest();
    for (const sub of ['characters', 'arenas', 'models', 'lore', 'collector-art-pack']) {
      const p = path.join(CANON_ROOT, sub);
      if (fs.existsSync(p)) {
        fs.rmSync(p, { recursive: true, force: true });
      }
    }
    const preservedOfficial = current.assets.filter((a) => a.localUrl.startsWith('/assets/aistudio/'));
    const nextManifest: VaultManifest = {
      updatedAt: new Date().toISOString(),
      sourceAccount: preservedOfficial.length > 0 ? 'Official Legends of Kai-Jax Visual Library' : '',
      assets: preservedOfficial,
    };
    writeManifest(nextManifest);
    res.json(nextManifest);
  });

  // 9. P1-I Character Reconstruction & Headless Blender 3.4.1 Auto-Rig Pipeline Status
  const APPROVED_CHAR_IDS = ['kai', 'jax', 'kaijax', 'boryn', 'borax'] as const;
  const CHAR_MODELS_ROOT = path.join(__dirname, 'public', 'models', 'characters');
  const RECON_SHEETS_ROOT = path.join(__dirname, 'public', 'models', 'reconstruction-sheets');

  function inspectCharacterPipelineAvailability() {
    const characters: Record<
      string,
      { p1i: boolean; p1g: boolean; meshy: boolean; multiviewSheet: boolean }
    > = {};
    for (const id of APPROVED_CHAR_IDS) {
      characters[id] = {
        p1i:
          fs.existsSync(path.join(CHAR_MODELS_ROOT, `${id}_master.glb`)) &&
          fs.existsSync(path.join(CHAR_MODELS_ROOT, `${id}_lod1.glb`)),
        p1g:
          fs.existsSync(path.join(CHAR_MODELS_ROOT, 'p1g', `${id}_master.glb`)) &&
          fs.existsSync(path.join(CHAR_MODELS_ROOT, 'p1g', `${id}_lod1.glb`)),
        meshy:
          fs.existsSync(path.join(CHAR_MODELS_ROOT, 'meshy', `${id}_master.glb`)) &&
          fs.existsSync(path.join(CHAR_MODELS_ROOT, 'meshy', `${id}_lod1.glb`)),
        multiviewSheet: fs.existsSync(path.join(RECON_SHEETS_ROOT, id, 'turnaround_4view.jpg')),
      };
    }
    return {
      meshyConfigured: Boolean(process.env.MESHY_API_KEY && process.env.MESHY_API_KEY.trim().length > 0),
      blenderAvailable: fs.existsSync('/usr/bin/blender'),
      blenderVersion: '3.4.1',
      characters,
    };
  }

  app.get('/api/character-pipeline/status', (_req: Request, res: Response) => {
    res.json(inspectCharacterPipelineAvailability());
  });

  // 10. Import & Auto-Rig External Meshy / Blender 3D Mesh (.glb, .gltf, .fbx, .obj) via Headless Blender 3.4.1
  app.post('/api/character-pipeline/import-glb', (req: Request, res: Response) => {
    const characterId = typeof req.body?.characterId === 'string' ? req.body.characterId.toLowerCase().trim() : '';
    const fileName = typeof req.body?.fileName === 'string' ? req.body.fileName.trim() : 'imported.glb';
    const base64Data = typeof req.body?.base64Data === 'string' ? req.body.base64Data.trim() : '';

    if (!APPROVED_CHAR_IDS.includes(characterId as (typeof APPROVED_CHAR_IDS)[number])) {
      res.status(400).json({
        error: `Character '${characterId}' is invalid or gated pending official visual approval.`,
      });
      return;
    }
    const extMatch = fileName.toLowerCase().match(/\.(glb|gltf|fbx|obj)$/);
    if (!extMatch || !base64Data) {
      res.status(400).json({ error: 'Provide a non-empty .glb, .gltf, .fbx, or .obj file.' });
      return;
    }

    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'kaijax-autorig-'));
    try {
      const cleanPayload = base64Data.includes(',') ? base64Data.split(',')[1] : base64Data;
      const inputPath = path.join(tmpDir, `source${extMatch[0]}`);
      fs.writeFileSync(inputPath, Buffer.from(cleanPayload, 'base64'));

      const outDir = path.join(CHAR_MODELS_ROOT, 'meshy');
      fs.mkdirSync(outDir, { recursive: true });

      execFileSync(
        'blender',
        [
          '-b',
          '--factory-startup',
          '--python-exit-code',
          '1',
          '-P',
          path.join(__dirname, 'scripts', 'blender_autorig_external_glb.py'),
          '--',
          inputPath,
          characterId,
          outDir,
        ],
        { stdio: 'pipe', timeout: 300000 }
      );

      res.json({
        ok: true,
        characterId,
        masterGlbUrl: `/models/characters/meshy/${characterId}_master.glb`,
        lod1GlbUrl: `/models/characters/meshy/${characterId}_lod1.glb`,
        pipelineStatus: inspectCharacterPipelineAvailability(),
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Headless Blender auto-rigging failed';
      res.status(500).json({ error: msg.slice(0, 400) });
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  // 11. Server-Side Meshy Multi-Image-to-3D Reconstruction Proxy (Requires MESHY_API_KEY in Server Secrets)
  app.post('/api/character-pipeline/meshy/reconstruct', async (req: Request, res: Response) => {
    const meshyKey = process.env.MESHY_API_KEY?.trim();
    if (!meshyKey) {
      res.status(503).json({
        error:
          'MESHY_API_KEY is not configured in server Secrets. Configure MESHY_API_KEY in AI Studio Secrets or import any Meshy/Blender .glb directly via the local Blender 3.4.1 Auto-Rig Importer.',
      });
      return;
    }

    const characterId = typeof req.body?.characterId === 'string' ? req.body.characterId.toLowerCase().trim() : '';
    if (!APPROVED_CHAR_IDS.includes(characterId as (typeof APPROVED_CHAR_IDS)[number])) {
      res.status(400).json({ error: `Character '${characterId}' is invalid or gated.` });
      return;
    }

    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'kaijax-meshy-'));
    try {
      const viewFiles = ['front.png', 'side.png', 'back.png'].map((f) =>
        path.join(RECON_SHEETS_ROOT, characterId, f)
      );
      const imageUrls = viewFiles
        .filter((fp) => fs.existsSync(fp))
        .map((fp) => `data:image/png;base64,${fs.readFileSync(fp).toString('base64')}`);

      const createResp = await fetch('https://api.meshy.ai/openapi/v1/multi-image-to-3d', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${meshyKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image_urls: imageUrls,
          should_remesh: true,
          should_texture: true,
          enable_pbr: true,
        }),
      });
      if (!createResp.ok) {
        const errText = await createResp.text();
        res.status(createResp.status).json({ error: `Meshy API ${createResp.status}: ${errText.slice(0, 240)}` });
        return;
      }
      const created = (await createResp.json()) as { result?: string };
      const taskId = created.result;
      if (!taskId) {
        res.status(502).json({ error: 'Meshy API did not return a task ID.' });
        return;
      }

      let glbDownloadUrl = '';
      for (let attempt = 0; attempt < 60; attempt++) {
        await new Promise((r) => setTimeout(r, 5000));
        const pollResp = await fetch(
          `https://api.meshy.ai/openapi/v1/multi-image-to-3d/${encodeURIComponent(taskId)}`,
          { headers: { Authorization: `Bearer ${meshyKey}` } }
        );
        if (!pollResp.ok) continue;
        const pollJson = (await pollResp.json()) as {
          status?: string;
          model_urls?: { glb?: string };
          task_error?: { message?: string };
        };
        if (pollJson.status === 'SUCCEEDED' && pollJson.model_urls?.glb) {
          glbDownloadUrl = pollJson.model_urls.glb;
          break;
        }
        if (pollJson.status === 'FAILED' || pollJson.status === 'CANCELED') {
          res.status(502).json({ error: pollJson.task_error?.message || `Meshy task ${pollJson.status}` });
          return;
        }
      }

      if (!glbDownloadUrl) {
        res.status(504).json({ error: 'Meshy 3D generation timed out waiting for completion.' });
        return;
      }

      const glbResp = await fetch(glbDownloadUrl);
      if (!glbResp.ok) {
        res.status(502).json({ error: `Failed downloading Meshy GLB (${glbResp.status})` });
        return;
      }
      const rawCacheDir = path.join(__dirname, 'data', 'meshy-raw');
      fs.mkdirSync(rawCacheDir, { recursive: true });
      const rawGlbPath = path.join(rawCacheDir, `${characterId}_meshy_raw.glb`);
      fs.writeFileSync(rawGlbPath, Buffer.from(await glbResp.arrayBuffer()));

      const outDir = path.join(CHAR_MODELS_ROOT, 'meshy');
      fs.mkdirSync(outDir, { recursive: true });
      execFileSync(
        'blender',
        [
          '-b',
          '--factory-startup',
          '--python-exit-code',
          '1',
          '-P',
          path.join(__dirname, 'scripts', 'blender_autorig_external_glb.py'),
          '--',
          rawGlbPath,
          characterId,
          outDir,
        ],
        { stdio: 'pipe', timeout: 300000 }
      );

      res.json({
        ok: true,
        characterId,
        masterGlbUrl: `/models/characters/meshy/${characterId}_master.glb`,
        lod1GlbUrl: `/models/characters/meshy/${characterId}_lod1.glb`,
        pipelineStatus: inspectCharacterPipelineAvailability(),
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Meshy reconstruction request failed';
      res.status(500).json({ error: msg.slice(0, 400) });
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  // Mount Vite middleware in dev (with HMR & WebSocket server disabled for Cloud Run / iframe stability), or serve static dist/ in production
  if (process.env.NODE_ENV !== 'production') {
    const VITE_NO_WS_CLIENT_SHIM = `
const sheetsMap = new Map();
export class ErrorOverlay extends HTMLElement {}
if (typeof customElements !== 'undefined' && !customElements.get('vite-error-overlay')) {
  customElements.define('vite-error-overlay', ErrorOverlay);
}
export function updateStyle(id, content) {
  if (typeof document === 'undefined') return;
  let style = sheetsMap.get(id);
  if (!style) {
    style = document.createElement('style');
    style.setAttribute('type', 'text/css');
    style.setAttribute('data-vite-dev-id', id);
    style.textContent = content;
    document.head.appendChild(style);
  } else if (style.textContent !== content) {
    style.textContent = content;
  }
  sheetsMap.set(id, style);
}
export function removeStyle(id) {
  const style = sheetsMap.get(id);
  if (style && style.parentNode) {
    style.parentNode.removeChild(style);
  }
  sheetsMap.delete(id);
}
export function createHotContext() {
  return {
    data: {},
    accept() {},
    acceptExports() {},
    dispose() {},
    prune() {},
    invalidate() {},
    decline() {},
    on() {},
    off() {},
    send() {},
  };
}
export function injectQuery(url, queryToInject) {
  if (!queryToInject || (url[0] !== '.' && url[0] !== '/')) return url;
  const pathname = url.replace(/[?#].*$/, '');
  const { search, hash } = new URL(url, 'http://vite.dev');
  return \`\${pathname}?\${queryToInject}\${search ? '&' + search.slice(1) : ''}\${hash || ''}\`;
}
`;
    app.get('/@vite/client', (_req: Request, res: Response) => {
      res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
      res.setHeader('Cache-Control', 'no-store');
      res.send(VITE_NO_WS_CLIENT_SHIM);
    });

    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: false, ws: false, forwardConsole: false },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.join(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Kai-Jax Server] Running on http://0.0.0.0:${PORT}`);
  });
}

createServer();
