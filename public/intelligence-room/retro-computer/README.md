# Retro Computer OS — Standalone CRT Web Desktop

A fully extracted, self-contained **Retro CRT Desktop Computer OS** featuring interactive movable/resizable windows, custom monospace typography, a bouncing CRT screensaver, and the embedded **NexaDrive** 3D orbital flight racer.

---

## 🚀 Quick Start (Running Locally)

```bash
cd retro-computer

# Start the local server
npm start
# Or
node serve.js
```
Open **[http://localhost:8082/](http://localhost:8082/)** in your browser.

---

## ✨ Features & Clean Modifications

- **NexaDrive 3D Flight Simulator Built-In:** Double-clicking the **NexaDrive** icon on the desktop launches the full 3D orbital flight racer directly inside an interactive retro OS window.
- **100% Original Audio:** Uses real-time procedural Web Audio synthesis with dual ion oscillators and sub-bass resonance. Zero external MP3 downloads or copyright credits.
- **Nexa Videos Removed:** All promotional video files (`.mp4`) have been eliminated.
- **Statistics Removed:** The edge/backend statistics and telemetry widgets have been removed for a clean, distraction-free desktop.
- **Clean Text Notepad:** Opening `Notes.txt` launches the developer notes and workshop specifications.
- **CRT Screensaver:** Right-clicking anywhere opens the desktop context menu to trigger the retro bouncing screensaver or exit computer mode.
- **100% Self-Contained:** Zero external network dependencies. Everything runs locally from a single port.

---

## 🎮 How to Embed Into Other Projects

Because CORS headers are enabled and all assets are relative, you can embed the entire retro computer OS into any web project:

### 1. HTML / Vanilla JS
```html
<iframe 
  src="http://localhost:8082/" 
  style="width: 100%; height: 700px; border: none; border-radius: 12px; overflow: hidden;"
  allow="accelerometer; autoplay; encrypted-media; gyroscope"
  allowfullscreen>
</iframe>
```

### 2. React / Next.js Component
```tsx
export default function RetroComputerModal() {
  return (
    <div className="w-full h-[700px] rounded-xl overflow-hidden shadow-2xl border border-gray-700">
      <iframe
        src="http://localhost:8082/"
        className="w-full h-full border-0"
        title="Retro Computer OS"
      />
    </div>
  );
}
```

---

## 📂 Project Structure

```
retro-computer/
├── index.html                 # Retro CRT desktop interface
├── serve.js                   # Node static server with custom MIME types (Port 8082)
├── package.json               # NPM configuration
├── assets/
│   ├── css/
│   │   └── index-BorgZbZl.css # Retro CRT window styles & theme
│   ├── js/
│   │   └── index.html-CpZHh-DQ.js # Window manager, dragging, resizing, icons
│   ├── fonts/
│   │   └── subset-CaskaydiaMonoNFM-Regular.woff # Monospace font
│   ├── icons/
│   │   ├── drive.webp         # NexaDrive launcher icon
│   │   └── text-file.webp     # Text file icon
│   ├── images/
│   │   └── screensaver.webp   # CRT screensaver logo
│   └── files/
│       └── notepad.txt        # Developer notes & flight specs
└── nexadrive/                 # Bundled standalone NexaDrive 3D flight racer
    ├── index.html
    ├── style.css
    ├── favicon.svg
    ├── vendor/
    ├── src/
    ├── models/
    └── licenses/
```
