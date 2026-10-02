# MyBoard — Digital Whiteboard for Teaching Code

![MyBoard Banner](https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1200&q=80)

**MyBoard** is a production-grade digital whiteboard web application designed specifically for software educators and YouTube creators. It bridges the tactile ease of **Microsoft Whiteboard & Excalidraw** with code-teaching superpowers: syntax-highlighted code blocks, pen tablet pressure sensitivity, teaching backgrounds, multi-lesson curricula, YouTube recording mode, real-time autosave, high-DPI export, and instant URL sharing.

---

## Key Features

- **Stylus & Pen Tablet Optimized**: Native Pointer Events supporting pressure sensitivity, palm rejection, and smooth bezier curves with `perfect-freehand`.
- **Teaching Code Blocks**: Embedded code windows with real Prism.js syntax highlighting across 9 languages (JavaScript, TypeScript, Python, React/JSX, HTML, CSS, JSON, SQL, Bash), editable live on canvas with 1-click clipboard copy.
- **Teaching Backgrounds**: 12 custom backgrounds including Graph paper, Dotted grid, Ruled notebook, Wide ruled, Engineering grid, Blueprint, Chalkboard, and Solid themes.
- **YouTube Recording Mode (`Ctrl + Shift + F`)**: Instantly hides app chrome and sidebar, maximizes canvas for 1080p/1440p 16:9 OBS screen recording, and introduces an unobtrusive floating teaching toolbar.
- **Lessons & Board Hierarchy**: Organize course playlists into boards and lesson pages (e.g., *JavaScript Complete* with *01. Variables*, *02. Operators*, *03. Conditions*, etc.).
- **Debounced Autosave**: Automatic 1.5s background persistence to PostgreSQL with local cache recovery so work is never lost.
- **Export System**: 1-click high-resolution PNG, SVG, or multi-page PDF generation without application UI chrome.
- **URL Sharing**: Create secure public share links with view-only or edit permissions.
- **100% Free Hosting Ready**: Pre-configured for deployment on Render, Vercel, Neon.tech, and Cloudflare R2 at $0 total cost.

---

## Tech Stack

### Frontend
- **Framework**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS v4 + Lucide React icons
- **State Management**: Zustand
- **Drawing Engine**: `perfect-freehand` + SVG Vector Rendering
- **Code Highlighting**: Prism.js
- **Exporting**: jsPDF + Canvas rasterizer

### Backend
- **Framework**: Python 3.11 + Flask REST API
- **ORM & Database**: SQLAlchemy + PostgreSQL (with automatic zero-config SQLite local fallback)
- **Security**: PyJWT token authentication + Werkzeug password hashing
- **Storage**: AWS S3 / Cloudflare R2 protocol via Boto3 + local filesystem fallback

---

## Keyboard Shortcuts

| Shortcut | Action |
| :--- | :--- |
| `V` | Select tool |
| `H` | Hand / Pan tool |
| `P` | Pen tool |
| `E` | Eraser tool |
| `T` | Text tool |
| `R` | Rectangle |
| `C` | Circle |
| `L` | Line |
| `A` | Arrow |
| `Ctrl + Z` | Undo |
| `Ctrl + Shift + Z` | Redo |
| `Ctrl + Shift + F` | YouTube Presentation Mode |
| `Delete` / `Backspace` | Delete selected element |
| `Space + Drag` | Pan canvas |
| `Ctrl + Scroll` | Zoom in / Zoom out |

---

## Quickstart (Local Development)

### 1. Start the Flask Backend
```bash
cd backend
python run.py
```
*API starts on `http://localhost:5000` with pre-seeded JavaScript Complete lesson notes.*

### 2. Start the Frontend
```bash
cd frontend
npm install
npm run dev
```
*Access the whiteboard at `http://localhost:5173`.*

---

## Automated Tests

Run backend pytest suite:
```bash
cd backend
python -m pytest tests/test_api.py -v
```

Test frontend build:
```bash
cd frontend
npm run build
```

---

## Free Cloud Deployment

Refer to [`DEPLOYMENT.md`](./DEPLOYMENT.md) for 1-click deploy blueprints on Render, Vercel, and Neon.tech ($0 cost).
