import { contextBridge, ipcRenderer } from 'electron';

export interface IElectronAPI {
  apiCall: (method: string, ...args: unknown[]) => Promise<unknown>;
}

const electronAPI: IElectronAPI = {
  apiCall: async (method: string, ...args: unknown[]) => {
    return ipcRenderer.invoke('api-call', method, ...args);
  },
};

contextBridge.exposeInMainWorld('electronAPI', electronAPI);

declare global {
  interface Window {
    electronAPI: IElectronAPI;
  }
}
