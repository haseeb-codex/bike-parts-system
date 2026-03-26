# Custom Urdu Font

To use **Jameel Noori Nastaleeq** directly from the application without requiring system installation,
place these files in this folder:

- `JameelNooriNastaleeq.woff2` (recommended)
- `JameelNooriNastaleeq.woff` (optional fallback)

The app CSS is already configured to load them from:

- `/fonts/JameelNooriNastaleeq.woff2`
- `/fonts/JameelNooriNastaleeq.woff`

If these files are not present, the app automatically falls back to:

- `Noto Nastaliq Urdu` (webfont)
- `Noto Naskh Arabic`
- system sans-serif fonts
