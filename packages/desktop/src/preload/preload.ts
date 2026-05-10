import { contextBridge, ipcRenderer } from 'electron'

export interface IElectronAPI {
  selectFolder: () => Promise<string | null>
  saveFile: (options: { filename: string; data: ArrayBuffer }) => Promise<boolean>
}

const electronAPI: IElectronAPI = {
  selectFolder: async () => {
    return ipcRenderer.invoke('select-folder')
  },
  saveFile: async (options) => {
    return ipcRenderer.invoke('save-file', options)
  },
}

contextBridge.exposeInMainWorld('electron', electronAPI)

declare global {
  interface Window {
    electron?: IElectronAPI
  }
}

