const { execSync } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = parseInt(process.env.PORT || '5000', 10);
const DIST_DIR = path.join(__dirname, 'apps', 'web', 'dist');

const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.mjs': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.glb': 'model/gltf-binary',
  '.gltf': 'model/gltf+json',
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
  '.webp': 'image/webp',
  '.webm': 'video/webm',
};

const indexPath = path.join(DIST_DIR, 'index.html');
if (!fs.existsSync(indexPath)) {
  console.log('Building app...');
  try {
    const webDir = path.join(__dirname, 'apps', 'web');
    if (!fs.existsSync(path.join(webDir, 'node_modules'))) {
      console.log('Installing dependencies in apps/web...');
      execSync('npm install', { stdio: 'inherit', cwd: webDir });
    }
    execSync('npx vite build', { stdio: 'inherit', cwd: webDir });
  } catch (err) {
    console.error('Build failed:', err.message);
    process.exit(1);
  }
}

if (!fs.existsSync(indexPath)) {
  console.error('ERROR: Build output not found at', DIST_DIR);
  process.exit(1);
}

console.log('Serving from:', DIST_DIR);

const server = http.createServer((req, res) => {
  const rawUrl = req.url.split('?')[0] || '/';
  const requestPath = rawUrl === '/' ? '/index.html' : rawUrl;

  let filePath;
  try {
    // Resolve the requested path within DIST_DIR and ensure it cannot escape
    const resolvedPath = path.resolve(DIST_DIR, '.' + requestPath);
    const realPath = fs.realpathSync(resolvedPath);

    const distRoot = fs.realpathSync(DIST_DIR);
    if (!realPath.startsWith(distRoot + path.sep) && realPath !== distRoot) {
      // Forbidden path traversal attempt
      res.writeHead(403, { 'Content-Type': 'text/plain' });
      res.end('Forbidden');
      return;
    }

    filePath = realPath;
  } catch (e) {
    // If resolution or realpath fails, fall back to index.html
    filePath = path.join(DIST_DIR, 'index.html');
  }

  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    filePath = path.join(DIST_DIR, 'index.html');
  }

  try {
    const data = fs.readFileSync(filePath);
    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    const headers = { 'Content-Type': contentType };
    if (ext === '.glb' || ext === '.gltf' || ext === '.woff' || ext === '.woff2') {
      headers['Cache-Control'] = 'public, max-age=31536000, immutable';
    }

    res.writeHead(200, headers);
    res.end(data);
  } catch (err) {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});
