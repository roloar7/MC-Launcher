const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  platform: process.platform,
  send: (channel, data) => ipcRenderer.send(channel, data),
  receive: (channel, func) => ipcRenderer.on(channel, (event, ...args) => func(...args)),

  installModpackFile: (modpackId, fileName, fileBuffer) =>
    ipcRenderer.invoke('install-modpack-file', modpackId, fileName, fileBuffer),

  isModpackInstalled: (modpackId) =>
    ipcRenderer.invoke('is-modpack-installed', modpackId),

  markModpackInstalled: (modpackId, updatedAt, fileHash) =>
    ipcRenderer.invoke('mark-modpack-installed', modpackId, updatedAt, fileHash),

  getModpackStatus: (modpackId) =>
    ipcRenderer.invoke('get-modpack-status', modpackId),

  uninstallModpack: (modpackId) =>
    ipcRenderer.invoke('uninstall-modpack', modpackId),

  launchMinecraft: (modpackId, mcVersion, loader, username, memoryMin, memoryMax) =>
    ipcRenderer.invoke('launch-minecraft', modpackId, mcVersion, loader, username, memoryMin, memoryMax),

  onMcLog: (func) => ipcRenderer.on('mc-log', (event, data) => func(data)),
  onMcProgress: (func) => ipcRenderer.on('mc-progress', (event, data) => func(data)),
  onMcClosed: (func) => ipcRenderer.on('mc-closed', () => func()),
})
