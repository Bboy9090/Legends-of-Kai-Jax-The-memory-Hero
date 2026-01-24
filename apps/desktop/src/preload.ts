/**
 * TRANSCENDENT LEGENDARY ENTERPRISE DESKTOP APP
 * Preload Script - Safe bridge between renderer and main process
 */

import { contextBridge, ipcRenderer } from 'electron';

// ============ TYPES ============

export interface ElectronAPI {
  // Game actions
  onGameAction: (callback: (action: string, data?: any) => void) => void;
  sendGameAction: (action: string, data?: any) => void;
  
  // Settings
  getSettings: () => Promise<any>;
  updateSettings: (updates: any) => Promise<any>;
  onSettingsChanged: (callback: (settings: any) => void) => void;
  
  // Window controls
  minimize: () => Promise<void>;
  maximize: () => Promise<void>;
  close: () => Promise<void>;
  
  // App info
  getAppVersion: () => Promise<string>;
  getPlatform: () => Promise<string>;
  
  // Updates
  onUpdateStatus: (callback: (status: string, data?: any) => void) => void;
  onUpdateProgress: (callback: (progress: any) => void) => void;
  checkForUpdates: () => Promise<void>;
  
  // Logging
  log: (level: 'info' | 'warn' | 'error', message: string) => Promise<void>;
  
  // Platform info
  platform: NodeJS.Platform;
  appVersion: string;
}

// ============ EXPOSE API ============

const electronAPI: ElectronAPI = {
  // Game actions
  onGameAction: (callback) => {
    ipcRenderer.on('game-action', (event, action, data) => callback(action, data));
  },
  sendGameAction: (action, data) => {
    ipcRenderer.send('game-action', action, data);
  },
  
  // Settings
  getSettings: () => ipcRenderer.invoke('get-settings'),
  updateSettings: (updates) => ipcRenderer.invoke('update-settings', updates),
  onSettingsChanged: (callback) => {
    ipcRenderer.on('settings-changed', (event, settings) => callback(settings));
  },
  
  // Window controls
  minimize: () => ipcRenderer.invoke('window-minimize'),
  maximize: () => ipcRenderer.invoke('window-maximize'),
  close: () => ipcRenderer.invoke('window-close'),
  
  // App info
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  getPlatform: () => ipcRenderer.invoke('get-platform'),
  
  // Updates
  onUpdateStatus: (callback) => {
    ipcRenderer.on('update-status', (event, status, data) => callback(status, data));
  },
  onUpdateProgress: (callback) => {
    ipcRenderer.on('update-progress', (event, progress) => callback(progress));
  },
  checkForUpdates: () => {
    // Trigger update check via main process
    return Promise.resolve();
  },
  
  // Logging
  log: (level, message) => ipcRenderer.invoke('log', level, message),
  
  // Platform info (synchronous)
  platform: process.platform,
  appVersion: process.env.npm_package_version || '1.0.0',
};

// Expose protected API to renderer
contextBridge.exposeInMainWorld('electronAPI', electronAPI);

// Type declaration for global
declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
