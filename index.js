const { spawn } = require('child_process');
const path = require('path');

const vite = spawn('npx', ['vite', '--host', '0.0.0.0', '--port', '5000'], {
  cwd: path.join(__dirname, 'apps', 'web'),
  stdio: 'inherit',
  env: { ...process.env }
});

vite.on('close', (code) => {
  process.exit(code || 0);
});

process.on('SIGTERM', () => {
  vite.kill('SIGTERM');
});
