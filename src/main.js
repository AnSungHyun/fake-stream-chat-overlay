const { app, BrowserWindow, ipcMain, screen } = require('electron');
const path = require('path');

let overlayWindow;
let donationWindow;
let controlWindow;
let isQuitting = false;

const defaultSettings = {
  viewerCount: 127,
  viewerVariance: 12,
  chatPopulation: 34,
  intervalMs: 900,
  animationSpeed: 420,
  maxMessages: 38,
  opacity: 72,
  fontSize: 15,
  compactMode: false,
  randomNameColors: true,
  alwaysOnTop: true,
  clickThrough: false,
  showViewerCount: true,
  showPlatformIcon: true,
  platforms: {
    youtube: true,
    chzzk: true,
    soop: true
  },
  tones: {
    hype: true,
    question: true,
    gameplay: true,
    casual: true
  },
  keywords: '보스전, 에임, 회피, 레전드, 클러치',
  streamerName: '형',
  donationEnabled: true,
  donationIntervalMinutes: 3,
  donationOpacity: 82,
  donationDurationSec: 6,
  donationMinAmount: 1000,
  donationMaxAmount: 20000
};

function createOverlayWindow() {
  const display = screen.getPrimaryDisplay();
  overlayWindow = new BrowserWindow({
    width: 430,
    height: 760,
    minWidth: 300,
    minHeight: 360,
    x: display.workAreaSize.width - 470,
    y: 70,
    frame: false,
    transparent: true,
    hasShadow: false,
    resizable: true,
    movable: true,
    alwaysOnTop: true,
    skipTaskbar: false,
    backgroundColor: '#00000000',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  });

  overlayWindow.setAlwaysOnTop(true, 'screen-saver');
  overlayWindow.loadFile(path.join(__dirname, 'overlay.html'));
}

function createDonationWindow() {
  donationWindow = new BrowserWindow({
    width: 390,
    height: 128,
    minWidth: 320,
    minHeight: 108,
    x: 80,
    y: 80,
    frame: false,
    transparent: true,
    hasShadow: false,
    resizable: true,
    movable: true,
    alwaysOnTop: true,
    skipTaskbar: false,
    backgroundColor: '#00000000',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  });

  donationWindow.setAlwaysOnTop(true, 'screen-saver');
  donationWindow.loadFile(path.join(__dirname, 'donation.html'));
}

function createControlWindow() {
  controlWindow = new BrowserWindow({
    width: 540,
    height: 820,
    minWidth: 470,
    minHeight: 640,
    title: 'Fake Stream Chat Control',
    backgroundColor: '#111318',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  });

  controlWindow.on('closed', () => {
    controlWindow = null;
    if (!isQuitting) app.quit();
  });

  controlWindow.loadFile(path.join(__dirname, 'control.html'));
}

function sendToOverlay(channel, payload) {
  if (overlayWindow && !overlayWindow.isDestroyed()) {
    overlayWindow.webContents.send(channel, payload);
  }
}

function sendToDonation(channel, payload) {
  if (donationWindow && !donationWindow.isDestroyed()) {
    donationWindow.webContents.send(channel, payload);
  }
}

app.whenReady().then(() => {
  createOverlayWindow();
  createDonationWindow();
  createControlWindow();

  ipcMain.handle('settings:get-defaults', () => defaultSettings);

  ipcMain.handle('overlay:get-bounds', () => {
    if (!overlayWindow || overlayWindow.isDestroyed()) return null;
    return overlayWindow.getBounds();
  });

  ipcMain.handle('donation:get-bounds', () => {
    if (!donationWindow || donationWindow.isDestroyed()) return null;
    return donationWindow.getBounds();
  });

  ipcMain.on('overlay:set-bounds', (_event, bounds) => {
    if (!overlayWindow || overlayWindow.isDestroyed()) return;
    overlayWindow.setBounds(bounds);
  });

  ipcMain.on('donation:set-bounds', (_event, bounds) => {
    if (!donationWindow || donationWindow.isDestroyed()) return;
    donationWindow.setBounds(bounds);
  });

  ipcMain.on('settings:update', (_event, settings) => {
    if (overlayWindow && !overlayWindow.isDestroyed()) {
      overlayWindow.setAlwaysOnTop(Boolean(settings.alwaysOnTop), 'screen-saver');
      overlayWindow.setIgnoreMouseEvents(Boolean(settings.clickThrough), { forward: true });
    }
    if (donationWindow && !donationWindow.isDestroyed()) {
      donationWindow.setAlwaysOnTop(Boolean(settings.alwaysOnTop), 'screen-saver');
      donationWindow.setIgnoreMouseEvents(Boolean(settings.clickThrough), { forward: true });
    }
    sendToOverlay('settings:apply', settings);
    sendToDonation('settings:apply', settings);
  });

  ipcMain.on('overlay:reset', () => {
    sendToOverlay('chat:reset');
  });

  ipcMain.on('overlay:sample-burst', () => {
    sendToOverlay('chat:sample-burst');
  });

  ipcMain.on('donation:manual', () => {
    sendToDonation('donation:show');
  });

  ipcMain.on('overlay:toggle-visibility', () => {
    if (!overlayWindow || overlayWindow.isDestroyed()) return;
    if (overlayWindow.isVisible()) overlayWindow.hide();
    else overlayWindow.show();
  });

  ipcMain.on('overlay:recenter', () => {
    if (!overlayWindow || overlayWindow.isDestroyed()) return;
    const display = screen.getPrimaryDisplay();
    overlayWindow.setBounds({
      width: 430,
      height: 760,
      x: display.workAreaSize.width - 470,
      y: 70
    });
  });

  ipcMain.on('donation:recenter', () => {
    if (!donationWindow || donationWindow.isDestroyed()) return;
    donationWindow.setBounds({
      width: 390,
      height: 128,
      x: 80,
      y: 80
    });
  });
});

app.on('before-quit', () => {
  isQuitting = true;
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createOverlayWindow();
    createDonationWindow();
    createControlWindow();
  }
});
