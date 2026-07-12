const { autoUpdater } = require('electron-updater')
const { BrowserWindow, dialog } = require('electron')

autoUpdater.autoDownload = true
autoUpdater.autoInstallOnAppQuit = true

function initUpdater(mainWindow) {
  autoUpdater.on('update-available', () => {
    dialog.showMessageBox(mainWindow, {
      type: 'info',
      title: 'Actualizacion disponible',
      message: 'Hay una nueva version disponible. Se descargara automaticamente.',
      buttons: ['OK'],
    })
  })

  autoUpdater.on('update-downloaded', () => {
    dialog.showMessageBox(mainWindow, {
      type: 'info',
      title: 'Actualizacion lista',
      message: 'La actualizacion se ha descargado. Se instalara al reiniciar la app.',
      buttons: ['Reiniciar ahora', 'Mas tarde'],
    }).then(({ response }) => {
      if (response === 0) {
        autoUpdater.quitAndInstall()
      }
    })
  })

  autoUpdater.on('error', (err) => {
    console.error('Error en actualizacion:', err.message)
  })

  autoUpdater.checkForUpdates().catch(() => {})
}

module.exports = { initUpdater }
