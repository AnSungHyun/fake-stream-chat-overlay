const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('streamChat', {
  getDefaults: () => ipcRenderer.invoke('settings:get-defaults'),
  getOverlayBounds: () => ipcRenderer.invoke('overlay:get-bounds'),
  getDonationBounds: () => ipcRenderer.invoke('donation:get-bounds'),
  setOverlayBounds: (bounds) => ipcRenderer.send('overlay:set-bounds', bounds),
  setDonationBounds: (bounds) => ipcRenderer.send('donation:set-bounds', bounds),
  updateSettings: (settings) => ipcRenderer.send('settings:update', settings),
  resetOverlay: () => ipcRenderer.send('overlay:reset'),
  sampleBurst: () => ipcRenderer.send('overlay:sample-burst'),
  manualDonation: () => ipcRenderer.send('donation:manual'),
  recenterDonation: () => ipcRenderer.send('donation:recenter'),
  toggleVisibility: () => ipcRenderer.send('overlay:toggle-visibility'),
  recenterOverlay: () => ipcRenderer.send('overlay:recenter'),
  onApplySettings: (callback) => ipcRenderer.on('settings:apply', (_event, settings) => callback(settings)),
  onResetChat: (callback) => ipcRenderer.on('chat:reset', callback),
  onSampleBurst: (callback) => ipcRenderer.on('chat:sample-burst', callback),
  onManualDonation: (callback) => ipcRenderer.on('donation:show', callback)
});
