# Landing Page (Production)

The landing page is now production-oriented and tailored for office deployment use cases.

## Location
- `landing/index.html`
- `landing/styles.css`
- `landing/script.js`
- `landing/assets/ressa-calm.svg`
- `landing/assets/ressa-angry.svg`

## What's Updated
- Production messaging (no pilot wording)
- Modern SaaS structure and visual style
- Real product screenshots integrated into the layout:
  - `landing/assets/WakeScreen.png`
  - `landing/assets/MonitoringScreen.png`
- Stronger feature copy focused on office deployment outcomes
- Feature sections for reporting and Teams posting
- Privacy-focused positioning
- Deployment CTA and contact action
- Auto platform-aware download links (`.dmg` for macOS, `.exe` for Windows)
- Theme aligned with Ressa app colors:
  - Accent Pink: `#f06ea2`
  - Deep Blue: `#304861`
  - Meter Gradient: `#54c7b4 -> #ffa35a -> #ff6767`

## Vercel Deploy
1. Import the repository in Vercel.
2. Use framework preset: **Other**.
3. Deploy.

Routing is handled via `vercel.json` and points all paths to `landing/index.html`.

## Notes
- Form/CTA currently uses mailto or placeholder interactions.
- Connect to your CRM, Slack/Teams workflow, or backend endpoint as needed.
- Update installer URLs in `landing/script.js` under the `DOWNLOADS` constant after each new release.
