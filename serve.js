const { execSync } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 5000;
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
    execSync('cd apps/web && npx vite build', { stdio: 'inherit', cwd: __dirname });
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
  const url = req.url.split('?')[0];
  let filePath = path.join(DIST_DIR, url === '/' ? 'index.html' : url);

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
