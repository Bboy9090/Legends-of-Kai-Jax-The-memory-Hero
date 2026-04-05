/**
 * TRANSCENDENT LEGENDARY ENTERPRISE DESKTOP APP
 * Legends of Kai-Jax: The Memory Hero
 * 
 * Enterprise-grade Electron application with:
 * - TypeScript architecture
 * - System tray integration
 * - Advanced auto-updater
 * - Settings management
 * - Crash reporting
 * - Performance monitoring
 * - Multi-window support
 * - Native notifications
 * - Window state persistence
 * - Splash screen
 * - Comprehensive logging
 */

import { app, BrowserWindow, Menu, Tray, nativeImage, shell, ipcMain, dialog, Notification, screen } from 'electron';
import { autoUpdater } from 'electron-updater';
import * as path from 'path';
import * as fs from 'fs';
import { EventEmitter } from 'events';

// ============ TYPES ============

interface AppSettings {
  windowState: {
    width: number;
    height: number;
    x?: number;
    y?: number;
    maximized: boolean;
    fullscreen: boolean;
  };
  general: {
    startMinimized: boolean;
    minimizeToTray: boolean;
    closeToTray: boolean;
    autoStart: boolean;
    checkForUpdates: boolean;
  };
  performance: {
    hardwareAcceleration: boolean;
    backgroundThrottling: boolean;
    frameRateLimit: number;
  };
  audio: {
    masterVolume: number;
    musicVolume: number;
    sfxVolume: number;
  };
  graphics: {
    vsync: boolean;
    antialiasing: boolean;
    shadowQuality: 'low' | 'medium' | 'high' | 'ultra';
  };
}

interface WindowState {
  width: number;
  height: number;
  x?: number;
  y?: number;
  maximized: boolean;
  fullscreen: boolean;
}

// ============ CONSTANTS ============

const APP_NAME = 'Legends of Kai-Jax';
const APP_VERSION = app.getVersion();
const SETTINGS_FILE = path.join(app.getPath('userData'), 'settings.json');
const LOG_FILE = path.join(app.getPath('userData'), 'app.log');

const DEFAULT_SETTINGS: AppSettings = {
  windowState: {
    width: 1920,
    height: 1080,
    maximized: false,
    fullscreen: false,
  },
  general: {
    startMinimized: false,
    minimizeToTray: false,
    closeToTray: false,
    autoStart: false,
    checkForUpdates: true,
  },
  performance: {
    hardwareAcceleration: true,
    backgroundThrottling: false,
    frameRateLimit: 60,
  },
  audio: {
    masterVolume: 1.0,
    musicVolume: 0.8,
    sfxVolume: 1.0,
  },
  graphics: {
    vsync: true,
    antialiasing: true,
    shadowQuality: 'high',
  },
};

// ============ GLOBAL STATE ============

let mainWindow: BrowserWindow | null = null;
let splashWindow: BrowserWindow | null = null;
let tray: Tray | null = null;
let settings: AppSettings = DEFAULT_SETTINGS;
let isQuitting = false;
const eventEmitter = new EventEmitter();

// ============ LOGGING SYSTEM ============

class Logger {
  private logStream: fs.WriteStream | null = null;

  constructor() {
    try {
      this.logStream = fs.createWriteStream(LOG_FILE, { flags: 'a' });
    } catch (error) {
      console.error('Failed to create log file:', error);
    }
  }

  private formatMessage(level: string, message: string): string {
    const timestamp = new Date().toISOString();
    return `[${timestamp}] [${level}] ${message}\n`;
  }

  info(message: string) {
    const formatted = this.formatMessage('INFO', message);
    console.log(formatted.trim());
    this.logStream?.write(formatted);
  }

  error(message: string, error?: Error) {
    const formatted = this.formatMessage('ERROR', `${message}${error ? `: ${error.stack}` : ''}`);
    console.error(formatted.trim());
    this.logStream?.write(formatted);
  }

  warn(message: string) {
    const formatted = this.formatMessage('WARN', message);
    console.warn(formatted.trim());
    this.logStream?.write(formatted);
  }

  debug(message: string) {
    if (process.env.NODE_ENV === 'development') {
      const formatted = this.formatMessage('DEBUG', message);
      console.debug(formatted.trim());
      this.logStream?.write(formatted);
    }
  }
}

const logger = new Logger();

// ============ SETTINGS MANAGEMENT ============

function loadSettings(): AppSettings {
  try {
    if (fs.existsSync(SETTINGS_FILE)) {
      const data = fs.readFileSync(SETTINGS_FILE, 'utf-8');
      const loaded = JSON.parse(data);
      return { ...DEFAULT_SETTINGS, ...loaded };
    }
  } catch (error) {
    logger.error('Failed to load settings', error as Error);
  }
  return { ...DEFAULT_SETTINGS };
}

function saveSettings(newSettings: AppSettings) {
  try {
    settings = newSettings;
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2));
    logger.info('Settings saved');
    eventEmitter.emit('settings-changed', settings);
  } catch (error) {
    logger.error('Failed to save settings', error as Error);
  }
}

function updateSettings(updates: Partial<AppSettings>) {
  saveSettings({ ...settings, ...updates });
}

// ============ WINDOW STATE PERSISTENCE ============

function saveWindowState() {
  if (!mainWindow) return;

  const bounds = mainWindow.getBounds();
  const isMaximized = mainWindow.isMaximized();
  const isFullscreen = mainWindow.isFullScreen();

  updateSettings({
    windowState: {
      width: bounds.width,
      height: bounds.height,
      x: bounds.x,
      y: bounds.y,
      maximized: isMaximized,
      fullscreen: isFullscreen,
    },
  });
}

function restoreWindowState(): WindowState {
  return settings.windowState;
}

// ============ SPLASH SCREEN ============

function createSplashScreen() {
  splashWindow = new BrowserWindow({
    width: 600,
    height: 400,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    resizable: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  const splashPath = path.join(__dirname, 'splash.html');
  if (fs.existsSync(splashPath)) {
    splashWindow.loadFile(splashPath);
  } else {
    // Fallback: Create simple splash HTML
    splashWindow.loadURL(`data:text/html;charset=utf-8,
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body {
              margin: 0;
              padding: 0;
              background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
              display: flex;
              align-items: center;
              justify-content: center;
              height: 100vh;
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
              color: #88d0ff;
            }
            .splash-content {
              text-align: center;
            }
            .logo {
              font-size: 48px;
              font-weight: bold;
              margin-bottom: 20px;
              text-shadow: 0 0 20px rgba(136, 208, 255, 0.5);
            }
            .loading {
              width: 200px;
              height: 4px;
              background: rgba(136, 208, 255, 0.2);
              border-radius: 2px;
              overflow: hidden;
              margin: 20px auto;
            }
            .loading-bar {
              height: 100%;
              background: linear-gradient(90deg, #88d0ff, #ffd700);
              animation: loading 2s infinite;
            }
            @keyframes loading {
              0% { width: 0%; }
              50% { width: 100%; }
              100% { width: 0%; }
            }
          </style>
        </head>
        <body>
          <div class="splash-content">
            <div class="logo">⚡ KAI-JAX</div>
            <div class="loading">
              <div class="loading-bar"></div>
            </div>
            <div>Loading...</div>
          </div>
        </body>
      </html>
    `);
  }

  splashWindow.on('closed', () => {
    splashWindow = null;
  });
}

function closeSplashScreen() {
  if (splashWindow) {
    splashWindow.close();
    splashWindow = null;
  }
}

// ============ MAIN WINDOW ============

function createMainWindow() {
  const windowState = restoreWindowState();
  const { width, height, x, y, maximized, fullscreen } = windowState;

  // Get primary display bounds for centering
  const primaryDisplay = screen.getPrimaryDisplay();
  const displayBounds = primaryDisplay.bounds;

  mainWindow = new BrowserWindow({
    width: width || 1920,
    height: height || 1080,
    x: x !== undefined ? x : Math.floor((displayBounds.width - (width || 1920)) / 2),
    y: y !== undefined ? y : Math.floor((displayBounds.height - (height || 1080)) / 2),
    minWidth: 1280,
    minHeight: 720,
    backgroundColor: '#1a1a1a',
    show: false, // Don't show until ready
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: true,
      backgroundThrottling: !settings.performance.backgroundThrottling,
    },
    icon: path.join(__dirname, '..', 'build', 'icon.png'),
  });

  // Restore window state
  if (maximized) {
    mainWindow.maximize();
  }
  if (fullscreen) {
    mainWindow.setFullScreen(true);
  }

  // Load the app
  const isDev = process.env.NODE_ENV === 'development';
  const indexPath = isDev
    ? 'http://localhost:5173'
    : `file://${path.join(__dirname, '..', 'web', 'dist', 'index.html')}`;

  mainWindow.loadURL(indexPath);

  // Show window when ready
  mainWindow.once('ready-to-show', () => {
    closeSplashScreen();
    mainWindow?.show();
    mainWindow?.focus();

    if (process.platform === 'darwin') {
      app.dock.show();
    }

    logger.info('Main window ready');
  });

  // Save window state on move/resize
  mainWindow.on('moved', saveWindowState);
  mainWindow.on('resized', saveWindowState);
  mainWindow.on('maximize', saveWindowState);
  mainWindow.on('unmaximize', saveWindowState);
  mainWindow.on('enter-full-screen', saveWindowState);
  mainWindow.on('leave-full-screen', saveWindowState);

  // Handle window closed
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Handle window close (with tray option)
  mainWindow.on('close', (event) => {
    if (!isQuitting && settings.general.closeToTray) {
      event.preventDefault();
      mainWindow?.hide();
      showNotification('Legends of Kai-Jax', 'Running in background. Click tray icon to restore.');
    } else {
      saveWindowState();
    }
  });

  // Open DevTools in development
  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  // Handle external links
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  // Prevent navigation to external URLs
  mainWindow.webContents.on('will-navigate', (event, navigationUrl) => {
    const parsedUrl = new URL(navigationUrl);
    if (parsedUrl.origin !== 'http://localhost:5173' && !navigationUrl.startsWith('file://')) {
      event.preventDefault();
      shell.openExternal(navigationUrl);
    }
  });

  // Handle crashes
  mainWindow.webContents.on('render-process-gone', (event, details) => {
    logger.error('Render process crashed', new Error(details.reason));
    dialog.showErrorBox(
      'Application Crashed',
      `The application has crashed: ${details.reason}\n\nWould you like to restart?`
    );
  });

  // Performance monitoring
  mainWindow.webContents.on('did-finish-load', () => {
    logger.info('Page loaded successfully');
  });

  return mainWindow;
}

// ============ SYSTEM TRAY ============

function createTray() {
  const iconPath = path.join(__dirname, '..', 'build', 'icon.png');
  const icon = nativeImage.createFromPath(iconPath);
  
  if (icon.isEmpty()) {
    // Fallback: Create a simple icon
    const fallbackIcon = nativeImage.createEmpty();
    tray = new Tray(fallbackIcon);
  } else {
    tray = new Tray(icon);
  }

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Show Window',
      click: () => {
        if (mainWindow) {
          mainWindow.show();
          mainWindow.focus();
        } else {
          createMainWindow();
        }
      },
    },
    {
      label: 'New Game',
      click: () => {
        mainWindow?.webContents.send('game-action', 'new-game');
        mainWindow?.show();
      },
    },
    { type: 'separator' },
    {
      label: 'Settings',
      click: () => {
        mainWindow?.webContents.send('game-action', 'settings');
        mainWindow?.show();
      },
    },
    { type: 'separator' },
    {
      label: 'Check for Updates',
      click: () => {
        autoUpdater.checkForUpdatesAndNotify();
      },
    },
    { type: 'separator' },
    {
      label: 'Quit',
      click: () => {
        isQuitting = true;
        app.quit();
      },
    },
  ]);

  tray.setToolTip(APP_NAME);
  tray.setContextMenu(contextMenu);

  tray.on('click', () => {
    if (mainWindow) {
      if (mainWindow.isVisible()) {
        mainWindow.hide();
      } else {
        mainWindow.show();
        mainWindow.focus();
      }
    } else {
      createMainWindow();
    }
  });

  logger.info('System tray created');
}

// ============ NATIVE NOTIFICATIONS ============

function showNotification(title: string, body: string) {
  if (Notification.isSupported()) {
    new Notification({
      title,
      body,
      icon: path.join(__dirname, '..', 'build', 'icon.png'),
    }).show();
  }
}

// ============ APPLICATION MENU ============

function createMenu() {
  const template: Electron.MenuItemConstructorOptions[] = [
    {
      label: 'File',
      submenu: [
        {
          label: 'New Game',
          accelerator: 'CmdOrCtrl+N',
          click: () => {
            mainWindow?.webContents.send('game-action', 'new-game');
          },
        },
        {
          label: 'Load Game',
          accelerator: 'CmdOrCtrl+O',
          click: () => {
            mainWindow?.webContents.send('game-action', 'load-game');
          },
        },
        { type: 'separator' },
        {
          label: 'Settings',
          accelerator: 'CmdOrCtrl+,',
          click: () => {
            mainWindow?.webContents.send('game-action', 'settings');
          },
        },
        { type: 'separator' },
        {
          label: 'Exit',
          accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
          click: () => {
            isQuitting = true;
            app.quit();
          },
        },
      ],
    },
    {
      label: 'View',
      submenu: [
        {
          label: 'Reload',
          accelerator: 'CmdOrCtrl+R',
          click: (item, focusedWindow) => {
            if (focusedWindow) focusedWindow.reload();
          },
        },
        {
          label: 'Force Reload',
          accelerator: 'CmdOrCtrl+Shift+R',
          click: (item, focusedWindow) => {
            if (focusedWindow) focusedWindow.webContents.reloadIgnoringCache();
          },
        },
        {
          label: 'Toggle Developer Tools',
          accelerator: process.platform === 'darwin' ? 'Alt+Cmd+I' : 'Ctrl+Shift+I',
          click: (item, focusedWindow) => {
            if (focusedWindow) focusedWindow.webContents.toggleDevTools();
          },
        },
        { type: 'separator' },
        {
          label: 'Actual Size',
          accelerator: 'CmdOrCtrl+0',
          click: (item, focusedWindow) => {
            if (focusedWindow) focusedWindow.webContents.setZoomLevel(0);
          },
        },
        {
          label: 'Zoom In',
          accelerator: 'CmdOrCtrl+Plus',
          click: (item, focusedWindow) => {
            if (focusedWindow) {
              const current = focusedWindow.webContents.getZoomLevel();
              focusedWindow.webContents.setZoomLevel(current + 0.5);
            }
          },
        },
        {
          label: 'Zoom Out',
          accelerator: 'CmdOrCtrl+-',
          click: (item, focusedWindow) => {
            if (focusedWindow) {
              const current = focusedWindow.webContents.getZoomLevel();
              focusedWindow.webContents.setZoomLevel(current - 0.5);
            }
          },
        },
        { type: 'separator' },
        {
          label: 'Toggle Fullscreen',
          accelerator: process.platform === 'darwin' ? 'Ctrl+Cmd+F' : 'F11',
          click: (item, focusedWindow) => {
            if (focusedWindow) focusedWindow.setFullScreen(!focusedWindow.isFullScreen());
          },
        },
      ],
    },
    {
      label: 'Game',
      submenu: [
        {
          label: 'Pause',
          accelerator: 'Space',
          click: () => {
            mainWindow?.webContents.send('game-action', 'pause');
          },
        },
        {
          label: 'Restart',
          accelerator: 'CmdOrCtrl+Shift+R',
          click: () => {
            mainWindow?.webContents.send('game-action', 'restart');
          },
        },
        { type: 'separator' },
        {
          label: 'Screenshot',
          accelerator: 'CmdOrCtrl+Shift+S',
          click: () => {
            mainWindow?.webContents.send('game-action', 'screenshot');
          },
        },
      ],
    },
    {
      label: 'Window',
      submenu: [
        {
          label: 'Minimize',
          accelerator: 'CmdOrCtrl+M',
          click: () => {
            mainWindow?.minimize();
          },
        },
        {
          label: 'Close',
          accelerator: 'CmdOrCtrl+W',
          click: () => {
            if (settings.general.closeToTray) {
              mainWindow?.hide();
            } else {
              isQuitting = true;
              app.quit();
            }
          },
        },
      ],
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'About',
          click: () => {
            dialog.showMessageBox(mainWindow!, {
              type: 'info',
              title: 'About',
              message: APP_NAME,
              detail: `Version ${APP_VERSION}\n\nThe Memory Hero`,
            });
          },
        },
        {
          label: 'Keyboard Shortcuts',
          click: () => {
            mainWindow?.webContents.send('game-action', 'shortcuts');
          },
        },
        { type: 'separator' },
        {
          label: 'Check for Updates',
          click: () => {
            autoUpdater.checkForUpdatesAndNotify();
          },
        },
        {
          label: 'Report Issue',
          click: () => {
            shell.openExternal('https://github.com/your-repo/issues');
          },
        },
      ],
    },
  ];

  // macOS specific menu adjustments
  if (process.platform === 'darwin') {
    template.unshift({
      label: app.getName(),
      submenu: [
        { label: 'About ' + app.getName(), role: 'about' },
        { type: 'separator' },
        { label: 'Services', role: 'services', submenu: [] },
        { type: 'separator' },
        { label: 'Hide ' + app.getName(), accelerator: 'Command+H', role: 'hide' },
        { label: 'Hide Others', accelerator: 'Command+Shift+H', role: 'hideOthers' },
        { label: 'Show All', role: 'unhide' },
        { type: 'separator' },
        { label: 'Quit', accelerator: 'Command+Q', click: () => {
          isQuitting = true;
          app.quit();
        }},
      ],
    });
  }

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// ============ AUTO-UPDATER ============

function setupAutoUpdater() {
  if (process.env.NODE_ENV !== 'production') {
    logger.info('Auto-updater disabled in development');
    return;
  }

  if (!settings.general.checkForUpdates) {
    logger.info('Auto-updater disabled by user');
    return;
  }

  autoUpdater.checkForUpdatesAndNotify();

  autoUpdater.on('checking-for-update', () => {
    logger.info('Checking for updates...');
    mainWindow?.webContents.send('update-status', 'checking');
  });

  autoUpdater.on('update-available', (info) => {
    logger.info('Update available:', info.version);
    mainWindow?.webContents.send('update-status', 'available', info);
    showNotification('Update Available', `Version ${info.version} is available!`);
  });

  autoUpdater.on('update-not-available', () => {
    logger.info('No updates available');
    mainWindow?.webContents.send('update-status', 'not-available');
  });

  autoUpdater.on('error', (error) => {
    logger.error('Update error', error);
    mainWindow?.webContents.send('update-status', 'error', error.message);
  });

  autoUpdater.on('download-progress', (progress) => {
    mainWindow?.webContents.send('update-progress', progress);
  });

  autoUpdater.on('update-downloaded', (info) => {
    logger.info('Update downloaded:', info.version);
    mainWindow?.webContents.send('update-status', 'downloaded', info);
    
    dialog.showMessageBox(mainWindow!, {
      type: 'info',
      title: 'Update Ready',
      message: 'Update downloaded. Restart now?',
      buttons: ['Restart Now', 'Later'],
      defaultId: 0,
    }).then((result) => {
      if (result.response === 0) {
        autoUpdater.quitAndInstall();
      }
    });
  });

  // Check for updates every 4 hours
  setInterval(() => {
    if (settings.general.checkForUpdates) {
      autoUpdater.checkForUpdatesAndNotify();
    }
  }, 4 * 60 * 60 * 1000);
}

// ============ IPC HANDLERS ============

function setupIpcHandlers() {
  // Settings
  ipcMain.handle('get-settings', () => settings);
  ipcMain.handle('update-settings', (event, updates: Partial<AppSettings>) => {
    updateSettings(updates);
    return settings;
  });

  // Window controls
  ipcMain.handle('window-minimize', () => {
    mainWindow?.minimize();
  });
  ipcMain.handle('window-maximize', () => {
    if (mainWindow?.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow?.maximize();
    }
  });
  ipcMain.handle('window-close', () => {
    if (settings.general.closeToTray) {
      mainWindow?.hide();
    } else {
      isQuitting = true;
      app.quit();
    }
  });

  // App info
  ipcMain.handle('get-app-version', () => APP_VERSION);
  ipcMain.handle('get-platform', () => process.platform);

  // Logging
  ipcMain.handle('log', (event, level: string, message: string) => {
    if (level === 'error') {
      logger.error(message);
    } else if (level === 'warn') {
      logger.warn(message);
    } else {
      logger.info(message);
    }
  });
}

// ============ APP INITIALIZATION ============

app.whenReady().then(() => {
  logger.info(`${APP_NAME} v${APP_VERSION} starting...`);

  // Load settings
  settings = loadSettings();
  logger.info('Settings loaded');

  // Create splash screen
  createSplashScreen();

  // Create main window
  createMainWindow();

  // Create system tray
  createTray();

  // Create menu
  createMenu();

  // Setup IPC handlers
  setupIpcHandlers();

  // Setup auto-updater
  setupAutoUpdater();

  // Handle app activation (macOS)
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    } else {
      mainWindow?.show();
      mainWindow?.focus();
    }
  });

  logger.info('Application ready');
});

// Handle all windows closed
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    if (!settings.general.closeToTray) {
      app.quit();
    }
  }
});

// Security: Prevent new window creation
app.on('web-contents-created', (event, contents) => {
  contents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });
});

// Handle app quit
app.on('before-quit', () => {
  isQuitting = true;
  saveWindowState();
  logger.info('Application quitting');
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught exception', error);
  dialog.showErrorBox('Uncaught Exception', error.message);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled rejection', new Error(String(reason)));
});
