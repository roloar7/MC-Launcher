const { Launch } = require('minecraft-java-core')
const path = require('path')
const fs = require('fs')
const crypto = require('crypto')

let MC_DIR = null

function getMCDir() {
  if (!MC_DIR) {
    const { app } = require('electron')
    MC_DIR = path.join(app.getPath('userData'), 'minecraft')
  }
  if (!fs.existsSync(MC_DIR)) {
    fs.mkdirSync(MC_DIR, { recursive: true })
  }
  return MC_DIR
}

function getModpackDir(modpackId) {
  const dir = path.join(getMCDir(), 'modpacks', modpackId)
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
  return dir
}

function isModpackInstalled(modpackId) {
  try {
    return fs.existsSync(path.join(getMCDir(), 'modpacks', modpackId, '.installed'))
  } catch {
    return false
  }
}

function markModpackInstalled(modpackId, updatedAt, fileHash) {
  const marker = path.join(getModpackDir(modpackId), '.installed')
  fs.writeFileSync(marker, JSON.stringify({ installedAt: new Date().toISOString(), updatedAt: updatedAt || null, fileHash: fileHash || null }))
}

function getModpackStatus(modpackId) {
  const markerPath = path.join(getMCDir(), 'modpacks', modpackId, '.installed')
  try {
    if (!fs.existsSync(markerPath)) return { installed: false, fileHash: null }
    const content = fs.readFileSync(markerPath, 'utf-8')
    let data
    try { data = JSON.parse(content) } catch { data = { fileHash: null } }
    return { installed: true, fileHash: data.fileHash || null }
  } catch {
    return { installed: false, fileHash: null }
  }
}

async function installModpackFile(modpackId, fileName, fileBuffer) {
  const modpackDir = getModpackDir(modpackId)
  const filePath = path.join(modpackDir, fileName)
  const dir = path.dirname(filePath)

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }

  fs.writeFileSync(filePath, Buffer.from(fileBuffer))
  return { success: true }
}

async function launchMinecraft(modpackId, mcVersion, loader, username, event, memoryMin = '2G', memoryMax = '4G') {
  const root = getModpackDir(modpackId)

  const fakeUuid = crypto.randomUUID().replace(/-/g, '')

  const authenticator = {
    access_token: fakeUuid,
    client_token: fakeUuid,
    uuid: fakeUuid,
    name: username,
    user_properties: '{}',
    meta: {
      type: 'Mojang',
    },
  }

  const loaderConfig = { enable: false }

  if (loader === 'forge') {
    loaderConfig.enable = true
    loaderConfig.type = 'forge'
    loaderConfig.build = 'latest'
  } else if (loader === 'fabric') {
    loaderConfig.enable = true
    loaderConfig.type = 'fabric'
    loaderConfig.build = 'latest'
  } else if (loader === 'quilt') {
    loaderConfig.enable = true
    loaderConfig.type = 'quilt'
    loaderConfig.build = 'latest'
  } else if (loader === 'neoforge') {
    loaderConfig.enable = true
    loaderConfig.type = 'neoforge'
    loaderConfig.build = 'latest'
  }

  const options = {
    path: root,
    authenticator: authenticator,
    version: mcVersion,
    loader: loaderConfig,
    memory: {
      min: memoryMin,
      max: memoryMax,
    },
    detached: false,
    downloadFileMultiple: 5,
    verify: false,
  }

  const launcher = new Launch()

  launcher.on('progress', (progress, size) => {
    if (event) {
      event.sender.send('mc-progress', {
        type: 'download',
        data: { type: 'bytes', current: progress, total: size },
      })
    }
  })

  launcher.on('data', (line) => {
    if (event) event.sender.send('mc-log', line)
  })

  launcher.on('close', () => {
    if (event) event.sender.send('mc-closed')
  })

  launcher.on('error', (err) => {
    if (event) event.sender.send('mc-log', `Error: ${err.message || err}`)
  })

  try {
    await launcher.Launch(options)
    return { success: true }
  } catch (err) {
    return { error: err.message || String(err) }
  }
}

function uninstallModpack(modpackId) {
  const dir = path.join(getMCDir(), 'modpacks', modpackId)
  if (fs.existsSync(dir)) {
    fs.rmSync(dir, { recursive: true, force: true })
  }
  return { success: true }
}

module.exports = {
  installModpackFile,
  isModpackInstalled,
  markModpackInstalled,
  getModpackStatus,
  uninstallModpack,
  launchMinecraft,
  getModpackDir,
  getMCDir,
}
