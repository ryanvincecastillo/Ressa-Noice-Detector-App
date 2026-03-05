# Ressa Noise Detector App

Ressa Noise Detector App is a local desktop micro-app that monitors microphone volume in real time and visualizes noise with:
- a scrolling 15-second chart
- a live volume meter
- a cartoon face (Ressa) that reacts to sound level

No audio is recorded, saved, or transmitted.

## Stack
- Electron
- Vite
- React
- TypeScript
- Web Audio API (`getUserMedia`, `AudioContext`, `AnalyserNode`)
- HTML Canvas (live chart rendering)

## Quick Start
1. Install dependencies:
   ```bash
   npm install
   ```
2. Run in development:
   ```bash
   npm run dev
   ```
3. Build app assets:
   ```bash
   npm run build
   ```
4. Lint:
   ```bash
   npm run lint
   ```
5. Generate app icons (macOS/Windows):
   ```bash
   npm run generate:icons
   ```
6. Package installer/app bundle:
   ```bash
   npm run package
   ```

## MVP Features
- Mic permission flow with privacy tooltip and denied-access guidance.
- Live RMS noise measurement mapped into a 0-100 noise level.
- Scrolling line chart + live meter + numeric level + Quiet/Normal/Loud label.
- Ressa expression states:
  - Calm (quiet)
  - Annoyed (medium)
  - Angry (loud, with shake animation)
- Controls:
  - Start/Stop monitoring
  - Sensitivity slider
  - Threshold sliders (quiet/medium/loud boundaries)
  - Test mode (simulated noise)

## Privacy Statement
- Audio is processed in memory only.
- No recordings are written to disk.
- No network API calls, analytics, or telemetry.
- Stopping monitoring closes the audio stream and context.

See [PRIVACY.md](./PRIVACY.md) for explicit details.

## Microphone Permission Troubleshooting
If access is denied:
- macOS:
  1. Open System Settings.
  2. Go to Privacy & Security > Microphone.
  3. Enable access for `Ressa Noise Detector App`.
- Windows:
  1. Open Settings.
  2. Go to Privacy & Security > Microphone.
  3. Enable microphone access for desktop apps and this app.

Then restart monitoring from inside the app.

## Notes
- Best effort cross-platform packaging is configured for macOS and Windows via electron-builder.
- Threshold defaults:
  - Quiet: `0-35`
  - Medium: `36-65`
  - Loud: `66-100`


See `PACKAGING.md` for packaging QA and delivery checklist details.
