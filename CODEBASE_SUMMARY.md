# FACE OF EARTH v0.1 - COMPLETE CODEBASE SUMMARY

## Project Status

✅ **Complete and ready for deployment**

All files created. All calculations locked. All methodology documented. Ready for you to review, modify if needed, and deploy.

---

## Files Created

### Configuration Files

**`package.json`**
- All dependencies defined (React, Next.js, Three.js, axios)
- npm scripts: `dev`, `build`, `start`, `lint`
- Ready for `npm install`

**`next.config.js`**
- Next.js configuration
- Environment variables
- API response limits

**`.gitignore`**
- Standard Node.js ignores
- IDE and OS files excluded

---

### Core Application Files

**`pages/_app.js`**
- Next.js wrapper
- Imports global CSS

**`pages/index.js`** (Main Page)
- Fetches coherence data from API
- Renders FaceRenderer component
- Shows info panel with metrics
- Toggle info visibility
- Displays all 6 system scores
- Shows momentum and trajectory

**`components/FaceRenderer.js`** (Three.js Visualization)
- Complete 3D scene setup
- Renders hexagon (6 vertices with distance = coherence)
- Renders eyes (lemniscate infinity loops)
- Renders mouth (asymptote curve)
- Color encoding (red = bad, cyan = good)
- Interactive Three.js scene
- Auto-updates when data changes

---

### API Routes

**`pages/api/coherence.js`** (Main Data Endpoint)
- GET `/api/coherence` returns all planetary metrics
- Calculates coherence scores for all 6 systems
- Computes current momentum (rate of change)
- Projects 10-year trajectory
- Includes data quality notes and sources
- All calculations deterministic and auditable

---

### Calculation Libraries

**`lib/geometry.js`** (Geometric Rendering Engine)
- `calculateHexagonVertices()` - Position each system vertex
- `calculateHexagonState()` - Overall distortion and asymmetry
- `calculateLemniscate()` - Eye angle and spin speed
- `calculateAsymptote()` - Mouth curve and steepness
- `calculateFace()` - Complete face state from data
- `renderFaceGeometry()` - Convert calculations to Three.js coordinates

All calculations are locked and deterministic.

**`lib/normalization.js`** (Data Normalization)
- `normalizeClimate()` - Raw climate data → 0-1.0 score
- `normalizeBiodiversity()` - Extinction rate, populations, habitat
- `normalizeSoil()` - Degradation, organic matter, arable loss
- `normalizeWater()` - Aquifer, river flow, groundwater
- `normalizeEnergy()` - Fossil %, renewable growth, grid stability
- `normalizeGovernance()` - Trust, effectiveness, response speed
- `aggregateCoherence()` - Combine all 6 into single Face state
- `calculateMomentum()` - Rate of change from historical data
- `projectTrajectory()` - 10-year linear extrapolation

All thresholds and weights are science-based and documented in METHODOLOGY.md.

---

### Styling

**`styles/globals.css`**
- Global styles
- Dark theme (black background, white text)
- Smooth scrollbars
- Accessibility features
- Selection styling

**`styles/index.module.css`**
- Page-specific styles
- Info panel (right-side drawer)
- Toggle button (bottom-right)
- Score cards grid
- Responsive design (mobile breakpoint at 768px)
- Color scheme: dark background, cyan accents, orange-red gradients

---

### Documentation

**`METHODOLOGY.md`** (MOST IMPORTANT - READ THIS)
- Complete scientific methodology
- Explains every calculation
- Data sources cited
- Philosophical foundation (constraint violation → geometric distortion)
- How each system is scored
- Examples with actual numbers
- Uncertainty and limitations
- The Sigma Gamma Challenge rules

**`README.md`** (Deployment and Usage)
- What this project is
- Quick start (installation, deployment)
- Project structure
- How the system works
- Customization instructions
- API reference
- Future roadmap
- Sigma Gamma Challenge info

**`CODEBASE_SUMMARY.md`** (This File)
- Overview of all files
- What each file does
- Architecture explanation

---

## Architecture Overview

### Data Flow

```
Real Planetary Data
        ↓
/api/coherence (calculations)
        ↓
JSON response: {current scores, momentum, projection}
        ↓
pages/index.js (fetches)
        ↓
FaceRenderer (passes to)
        ↓
geometry.js (calculates positions)
        ↓
Three.js (renders in browser)
        ↓
User sees The Face of Earth
```

### Calculation Flow

```
Raw Data (temp, CO2, extinction rate, etc.)
        ↓
normalization.js (convert to 0-1.0 scores)
        ↓
Six coherence scores [climate, biodiversity, soil, water, energy, governance]
        ↓
geometry.js (hexagon vertices, eye angle, mouth curve)
        ↓
Three.js scene coordinates
        ↓
FaceRenderer (render to WebGL canvas)
        ↓
Visual representation of Earth's state
```

---

## Key Design Decisions

### 1. **Vercel Deployment**
- Next.js is Vercel-native
- Auto-deploys on git push
- Free tier sufficient for v0.1
- Easy to scale if needed

### 2. **Three.js Visualization**
- 3D rendering with full control
- Smooth animations
- WebGL acceleration
- Mobile-friendly
- Could easily add zoom/interactivity later

### 3. **Deterministic Calculations**
- All math locked in code
- No randomness or ML
- Fully auditable
- Same input always produces same output
- Perfect for Sigma Gamma Challenge

### 4. **Public Data Sources Only**
- NOAA, FAO, IEA, World Bank, etc.
- No proprietary or private data
- Anyone can verify calculations
- Transparent and reproducible

### 5. **Six Systems (Hexagon)**
- Matches atomic minimum geometry
- Maximum interdependence
- Visually scalable (each system can zoom to own hexagon)
- Symmetric and elegant

---

## Data Sources Built In

**Current as of July 2026:**

- Climate: NOAA (global temp +1.15°C, CO2 426 ppm)
- Biodiversity: IUCN (extinction 650x normal, wildlife -2.4% trend)
- Soil: UN (degradation 1.3%, organic matter 1.8%)
- Water: USGS (aquifer depletion 1.65x, river flow 72% historical)
- Energy: IEA (fossil 81%, renewable growth 8.5%)
- Governance: World Bank / Edelman (trust 36%, effectiveness 0.25)

All editable in `pages/api/coherence.js` under `CURRENT_DATA`.

---

## Deployment Checklist

- [ ] Review all code files
- [ ] Verify calculations match your framework
- [ ] Create GitHub account (if needed)
- [ ] Create GitHub repo named `face-of-earth`
- [ ] Clone this project locally
- [ ] `git add .` and `git commit`
- [ ] `git push` to your GitHub repo
- [ ] Create Vercel account
- [ ] Import repo into Vercel
- [ ] Deploy
- [ ] Face of Earth goes live at vercel.app domain

**Total time:** 15-20 minutes

---

## Post-Deployment

### Monitor

Check every few days:
- Does the Face update correctly?
- Any console errors?
- Info panel showing correct data?

### Iterate

Update data in `CURRENT_DATA` as new information comes in:
- New climate data? Update `globalTempAnomalyC`
- New extinction data? Update `extinctionRateMultiple`
- Etc.

Vercel auto-deploys on every push.

### Launch Sigma Gamma Challenge

Once live, announce:
- Link to theface.vercel.app (or your domain)
- Description of v0.1 and its limitations
- Challenge rules
- How to submit improvements
- Show the methodology

---

## What's NOT In v0.1 (By Design)

- ❌ Zoom to sub-systems (future feature)
- ❌ Regional/country breakdown (future feature)
- ❌ Historical archive (future feature)
- ❌ System interaction modeling (too complex for v0.1)
- ❌ Tipping point detection (would require ML)
- ❌ Real-time data feeds (manual updates only)

v0.1 is deliberately scoped to **proof of concept**: Show that coherence function works, methodology is sound, visualization is powerful.

---

## Modification Guide

### To Change Data Sources

Edit `pages/api/coherence.js`:

```javascript
const CURRENT_DATA = {
  climate: {
    globalTempAnomalyC: 1.15,  // ← Change this
    co2ppm: 426,               // ← Or this
    extremeWeatherTrendPercent: 7
  },
  // ... etc
};
```

That's it. Calculation formulas automatically use new data.

### To Change Calculation Formulas

Edit `lib/normalization.js`:

Each `normalize*()` function has a formula you can tweak. Change thresholds, weights, component ratios, anything.

Then update `METHODOLOGY.md` explaining the change.

### To Change Visual Styling

Edit `styles/index.module.css`:

Colors, sizes, layouts, animations—all controlled there.

### To Add More Systems

This would require:
1. Adding 7th system data to `CURRENT_DATA`
2. Adding `normalize*()` function to normalization.js
3. Changing hexagon rendering to heptagon (7-sided)
4. Updating documentation

Not recommended for v0.1 (hexagon geometry is elegant). Save for v0.2.

---

## Testing Locally

```bash
# Install dependencies
npm install

# Run dev server
npm run dev

# Visit http://localhost:3000

# Should see:
# - Dark background
# - Hexagon with vertices
# - Eyes (cyan infinity loops)
# - Mouth (orange-red curve)
# - Info panel on right with toggle button

# Check console for any errors
# All calculations should be logged
```

---

## Deployment Verification

After Vercel deployment:

1. **Check homepage loads:** yourproject.vercel.app
2. **Check API works:** yourproject.vercel.app/api/coherence
3. **Verify Three.js renders:** Should see Face geometry
4. **Info panel works:** Click toggle button on bottom-right
5. **Scores display:** Should show all 6 systems with percentages

If any of these fail, check:
- Vercel deployment logs
- Browser console (F12) for errors
- Network tab to see API response

---

## Final Notes

**This is complete, auditable, and ready.**

Every calculation is visible in code. Every data source is documented. Every threshold has justification in METHODOLOGY.md.

You can:
- Review it line-by-line
- Modify anything before deployment
- Deploy as-is if satisfied
- Use it to launch Sigma Gamma Challenge

The codebase is yours to own, modify, and deploy.

No Claude access after deployment—you control everything.

---

## Questions About Code

All code is heavily commented. Read the docstrings at the top of each function.

If anything is unclear, that's a documentation gap. Fix it.

Good code should be self-explanatory. If it's not, make it clearer.

---

**You're ready to build.**
