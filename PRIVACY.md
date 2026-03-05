# Privacy Policy - Ressa Noise Detector App

## Summary
Ressa Noise Detector App is local-only. It does not record, save, upload, or transmit microphone audio.

## What The App Does
- Requests microphone permission to read live audio samples.
- Computes real-time loudness using RMS math in memory.
- Displays only derived values (0-100 level and status label).

## What The App Does Not Do
- No audio recording.
- No audio file generation.
- No cloud upload.
- No analytics.
- No telemetry.
- No user tracking.

## Data Handling
- Microphone samples are read into memory only for immediate calculations.
- Samples are not persisted.
- Stopping monitoring closes audio tracks.

## Network Behavior
- No external API calls are required for app functionality.
- The packaged app performs all processing locally.

## Test Mode
- Test mode uses synthetic values only.
- Test mode does not access the microphone.
