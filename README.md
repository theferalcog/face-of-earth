# THE FACE OF EARTH v0.1

**A real-time planetary coherence diagnostic**

This is the source code for The Face of Earth—a geometric rendering of Earth's current system state based on real planetary data.

---

## What Is This?

The Face of Earth renders six major planetary systems as a hexagon:

- **Climate** (top)
- **Energy** (upper right)
- **Governance** (lower right)
- **Biodiversity** (bottom)
- **Soil** (lower left)
- **Water** (upper left)

Each vertex's distance from center = that system's coherence score (0-1.0).

The **eyes** (lemniscate) show where Earth is headed in 10 years.  
The **mouth** (asymptote) shows how fast things are changing right now.

Perfect coherence = circle. Current state = distorted hexagon. The gap shows constraint violations.

---

## Quick Start

### Prerequisites

- Node.js 16+ and npm
- Git
- GitHub account (for hosting)
- Vercel account (for deployment)

### Installation

```bash
# Clone or navigate to the project
cd face-of-earth

# Install dependencies
npm install

# Run development server
npm run dev

# Visit http://localhost:3000
```

### Deployment to Vercel

1. **Push to GitHub:**

```bash
git init
git add .
git commit -m "Initial commit: Face of Earth v0.1"
git remote add origin https://github.com/YOUR_USERNAME/face-of-earth.git
git branch -M main
git push -u origin main
```

2. **Deploy via Vercel:**

- Go to vercel.com
- Click "Import Project"
- Select your GitHub repo
- Click "Deploy"
- Vercel auto-deploys on every push to main

Your Face of Earth goes live at `face-of-earth.vercel.app` (or your custom domain).

---

## Project Structure

```
face-of-earth/
├── pages/
│   ├── api/
│   │   └── coherence.js          # API endpoint: calculates planetary coherence
│   ├── index.js                  # Main page: renders the Face
│   └── _app.js                   # Next.js app wrapper
│
├── components/
│   └── FaceRenderer.js           # Three.js visualization component
│
├── lib/
│   ├── geometry.js               # Geometric calculations (hexagon, eyes, mouth)
│   └── normalization.js          # Raw data → coherence scores (0-1.0)
│
├── styles/
│   ├── globals.css               # Global styling
│   └── index.module.css          # Page-specific styling
│
├── METHODOLOGY.md                # Complete scientific methodology
├── README.md                     # This file
├── package.json                  # Dependencies
└── next.config.js                # Next.js configuration
```

---

## How It Works

### Data Pipeline

1. **API Route** (`/api/coherence`):
   - Pulls current planetary data from public sources
   - Calculates coherence scores for all 6 systems
   - Computes current momentum (rate of change)
   - Projects 10-year trajectory
   - Returns JSON with all metrics

2. **Geometry Engine** (`lib/geometry.js`):
   - Transforms coherence scores into hexagon coordinates
   - Calculates lemniscate (eye) angle from trajectory
   - Calculates asymptote (mouth) curve from momentum
   - Returns scene-ready 3D coordinates

3. **Visualization** (`components/FaceRenderer.js`):
   - Renders Three.js 3D scene
   - Draws hexagon with six vertices
   - Draws infinity loops (eyes)
   - Draws mouth curve
   - Interactive, real-time updateable

4. **Interface** (`pages/index.js`):
   - Fetches coherence data
   - Passes to renderer
   - Shows info panel with metrics
   - Real-time updates

---

## Customization

### Changing Data Sources

Edit `pages/api/coherence.js`:

```javascript
const CURRENT_DATA = {
  climate: {
    globalTempAnomalyC: YOUR_DATA,  // Replace with real data
    co2ppm: YOUR_DATA,
    extremeWeatherTrendPercent: YOUR_DATA
  },
  // ... etc for other systems
};
```

All data sources are documented in `METHODOLOGY.md`.

### Changing Calculation Formulas

Edit `lib/normalization.js`:

Each function (e.g., `normalizeClimate()`) converts raw data to coherence score (0-1.0).

Change thresholds, weights, or calculation logic here.

### Customizing Visualization

Edit `components/FaceRenderer.js`:

Change colors, sizes, materials, animation speeds, etc.

The Three.js library gives full control over 3D rendering.

---

## Understanding the Metrics

### Coherence Score (0-1.0)

- **1.0** = Perfect constraint satisfaction (sustainable indefinitely)
- **0.5** = Moderate constraint violation (degrading but manageable)
- **0.0** = Complete constraint failure (unsustainable)

Each system is scored independently based on specific constraints (documented in `METHODOLOGY.md`).

### Momentum

Rate of change in coherence per year.

- **Positive** = system improving
- **Negative** = system degrading
- **≈0** = stable

### Trajectory

10-year linear projection based on current momentum.

**Warning:** This is a naive model. Real systems have tipping points and feedback loops. Use for directional estimates only.

---

## The Sigma Gamma Challenge

**This is v0.1. It's incomplete.**

If you can build a more accurate Face of Earth:

1. Improve data integration
2. Better coherence calculations
3. Model system interactions
4. Capture regional variation
5. Better predict trajectories

Your version runs here.

**Rules:**
- Mathematics only
- Data verifiable and auditable
- Transparent methodology
- Historical validation (your Face predicts better than ours)

---

## API Reference

### GET `/api/coherence`

Returns current planetary coherence state.

**Response:**

```json
{
  "timestamp": "2026-07-29T12:00:00.000Z",
  "version": "0.1.0",
  "current": {
    "scores": {
      "climate": 0.37,
      "biodiversity": 0.53,
      "soil": 0.42,
      "water": 0.57,
      "energy": 0.45,
      "governance": 0.51,
      "overall": 0.47
    },
    "momentum": {
      "overall": -0.027,
      "bySystem": {
        "climate": -0.028,
        "biodiversity": -0.025,
        ...
      }
    }
  },
  "projected": {
    "timestamp2036": "2036-01-01T00:00:00.000Z",
    "scores": {
      "climate": 0.10,
      "biodiversity": 0.28,
      ...
    },
    "trajectoryMomentum": -0.027,
    "trajectoryVolatility": 0.015
  },
  "dataQuality": {
    "note": "Face of Earth v0.1",
    "sources": [...]
  }
}
```

---

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 15+
- Mobile browsers (iOS Safari 15+, Chrome Android)

Requires WebGL support.

---

## Performance

- **Initial load:** ~2-3 seconds
- **Data updates:** Every hour (configurable)
- **Frame rate:** 60 FPS (with GPU acceleration)
- **Bundle size:** ~1.2 MB (including Three.js)

---

## License

This code is in the public domain. Use, modify, deploy freely.

---

## Maintenance

### Data Updates

Data is cached hourly. To force refresh:

```javascript
// In browser console:
fetch('/api/coherence?cache=bust')
```

### Monitoring

Check `/api/coherence` response for:
- `dataQuality.note` (version and timestamp)
- `dataQuality.limitations` (known issues)
- Error messages

---

## Future Roadmap

- [ ] Regional/zoomable granularity (zoom into countries, regions)
- [ ] Historical archive (compare past Faces)
- [ ] System interaction modeling (interdependencies)
- [ ] Tipping point detection
- [ ] Intervention scenarios ("if we did X, Face would look like Y")
- [ ] Multi-language support
- [ ] Mobile app version

---

## Contributing

For Sigma Gamma Challenge submissions:

1. Fork this repo
2. Improve the methodology
3. Update data pipelines
4. Test against historical accuracy
5. Submit pull request with detailed explanation

Best submissions get integrated and deployed here.

---

## Questions?

See `METHODOLOGY.md` for complete scientific documentation.

All calculations are open and auditable. All data sources are cited.

The eyes never lie.
