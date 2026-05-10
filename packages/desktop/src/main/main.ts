import { app, BrowserWindow, ipcMain, dialog } from 'electron'
import path from 'path'
import isDev from 'electron-is-dev'
import * as fs from 'fs'

const createWindow = () => {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, '../preload/preload.ts'),
      sandbox: true,
      webSecurity: true,
    },
  })

  const startUrl = isDev
    ? 'http://localhost:5173'
    : `file://${path.join(__dirname, '../../renderer/dist/index.html')}`

  mainWindow.loadURL(startUrl)

  if (isDev) {
    mainWindow.webContents.openDevTools()
  }

  return mainWindow
}

app.on('ready', createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  const allWindows = BrowserWindow.getAllWindows()
  if (allWindows.length === 0) {
    createWindow()
  }
})

// IPC handlers for file operations
ipcMain.handle('select-folder', async () => {
  const result = await dialog.showOpenDialog({
    properties: ['openDirectory'],
  })

  if (!result.canceled && result.filePaths.length > 0) {
    return result.filePaths[0]
  }

  return null
})

ipcMain.handle('save-file', async (_event, { filename, data }) => {
  const result = await dialog.showSaveDialog({
    defaultPath: filename,
  })

  if (!result.canceled && result.filePath) {
    const buffer = Buffer.from(data)
    fs.writeFileSync(result.filePath, buffer)
    return true
  }

  return false
})

