# Packaging & Delivery Guide

This document tracks icon generation and installer packaging for **Ressa Noise Detector App**.

## Current Status
- [x] Electron Builder setup for macOS (`dmg`) and Windows (`nsis`)
- [x] App icon generation script
- [x] macOS icon output (`build/icons/icon.icns`)
- [x] Windows icon output (`build/icons/icon.ico`)
- [x] Generic PNG icon (`build/icons/icon.png`)

## Files
- Icon source input: `src/assets/ressa/calm.svg`
- Icon generator: `scripts/generate-icons.cjs`
- Output directory: `build/icons/`

## Commands
1. Generate icons:
   ```bash
   npm run generate:icons
   ```
2. Build app bundles:
   ```bash
   npm run build
   ```
3. Package installer artifacts:
   ```bash
   npm run package
   ```

## Electron Builder Config
Configured in `package.json`:
- `build.mac.icon`: `build/icons/icon.icns`
- `build.win.icon`: `build/icons/icon.ico`
- `build.directories.buildResources`: `build`

## QA Checklist (Per Release)
- [ ] Launch packaged app on macOS
- [ ] Launch packaged app on Windows
- [ ] App icon appears in installer and app window/taskbar
- [ ] Microphone permission flow works
- [ ] Start/Stop + settings modal works
- [ ] No audio recording behavior remains unchanged

## Notes
- `scripts/generate-icons.cjs` currently uses macOS tooling (`sips`, `iconutil`) for `.icns` generation.
- `.ico` generation is handled through `png-to-ico`.
