# Architecture - Ressa Noise Detector App

## High-Level Flow

```text
Electron Main Process
  -> Creates desktop window
  -> Loads React renderer

React Renderer (UI)
  -> Permission flow + controls + state
  -> Starts/stops monitoring loop

Web Audio Pipeline (Renderer)
  getUserMedia({ audio: true })
    -> MediaStreamAudioSourceNode
    -> AnalyserNode (time-domain samples)
    -> RMS + dB-like mapping
    -> Normalized level 0-100

Visualization (Renderer)
  -> Canvas: grid + scrolling 15s history line + current marker
  -> Meter bar + numeric level + Quiet/Normal/Loud label
  -> Ressa face state (calm/annoyed/angry) + shake when loud
```

## Components
- `src/electron/main.ts`
  - Electron app bootstrap and BrowserWindow creation.
- `src/electron/preload.ts`
  - Isolated preload bridge placeholder.
- `src/App.tsx`
  - App state, permission flow, analyzer lifecycle, controls.
- `src/components/NoiseCanvas.tsx`
  - Live canvas rendering.
- `src/components/RessaFace.tsx`
  - Expression state rendering from local SVG assets.

## Privacy-First Design
- Audio processing runs only in renderer memory.
- No persistence path for audio.
- No remote services in runtime code.

## Runtime Update Loop
- `requestAnimationFrame` drives measurement + chart updates.
- Effective refresh range is typically 30-60 FPS depending on hardware.
