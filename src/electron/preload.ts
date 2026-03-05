import { contextBridge } from 'electron';

contextBridge.exposeInMainWorld('ressaApp', {
  name: 'Ressa Noise Detector App'
});
