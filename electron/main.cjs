const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')
const { initUpdater } = require('./updater.cjs')
const {
  installModpackFile,
  isModpackInstalled,
  markModpackInstalled,
  getModpackStatus,
  uninstallModpack,
  launchMinecraft,
} = require('./launcher.cjs')

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
    },
    icon: path.join(__dirname, '..', 'build', 'icon.ico'),
    title: 'MC-Launcher',
    autoHideMenuBar: true,
  })

  if (app.isPackaged) {
    win.loadFile(path.join(__dirname, '..', 'dist', 'index.html'))
    initUpdater(win)
  } else {
    win.loadURL('http://localhost:5173')
    win.webContents.openDevTools()
  }

  ipcMain.handle('install-modpack-file', async (event, modpackId, fileName, fileBuffer) => {
    return installModpackFile(modpackId, fileName, fileBuffer)
  })

  ipcMain.handle('is-modpack-installed', async (event, modpackId) => {
    return isModpackInstalled(modpackId)
  })

  ipcMain.handle('mark-modpack-installed', async (event, modpackId, updatedAt, fileHash) => {
    markModpackInstalled(modpackId, updatedAt, fileHash)
    return { success: true }
  })

  ipcMain.handle('get-modpack-status', async (event, modpackId) => {
    return getModpackStatus(modpackId)
  })

  ipcMain.handle('uninstall-modpack', async (event, modpackId) => {
    return uninstallModpack(modpackId)
  })

  ipcMain.handle('launch-minecraft', async (event, modpackId, mcVersion, loader, username, memoryMin, memoryMax) => {
    return launchMinecraft(modpackId, mcVersion, loader, username, event, memoryMin, memoryMax)
  })
}

app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
