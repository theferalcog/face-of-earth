# THE FACE OF EARTH v0.1 - METHODOLOGY

## Overview

The Face of Earth is a real-time planetary coherence diagnostic that renders Earth's system state as a living geometric symbol. This document specifies exactly how raw planetary data transforms into the visual representation.

**Version:** 0.1.0  
**Launch Date:** July 29, 2026  
**Status:** Public Challenge (Sigma Gamma Challenge)

---

## Philosophical Foundation

The Face of Earth is built on one core principle:

**Constraint violation → Geometric distortion**

Every system on Earth operates under physical and biological constraints. When a constraint is violated, the system becomes incoherent. This incoherence expresses geometrically.

A perfect circle represents perfect coherence (all constraints satisfied).  
A distorted hexagon represents actual state (constraints violated to various degrees).  
The gap between hexagon and circle = total constraint violation.

---

## The Visual Mapping

### HEXAGON (Planetary Structure)

The hexagon has 6 vertices, each representing a major planetary system:

1. **Vertex 1 (Top): Climate** - Temperature, atmospheric composition, extreme weather
2. **Vertex 2 (Upper-Right): Energy** - Energy throughput, fossil/renewable ratio, grid stability
3. **Vertex 3 (Lower-Right): Governance** - Institutional coordination, decision-making speed, trust
4. **Vertex 4 (Bottom): Biodiversity** - Species survival, population trends, ecosystem function
5. **Vertex 5 (Lower-Left): Soil** - Organic matter, degradation rate, fertility
6. **Vertex 6 (Upper-Left): Water** - Freshwater availability, distribution, quality

Each vertex's distance from center = that system's coherence score (0-1.0)

**Formula:** `vertex_distance = coherence_score × reference_radius`

- If system is perfectly coherent: vertex at full radius (circle)
- If system is 50% coherent: vertex at half radius
- If system is completely incoherent: vertex collapses toward center

### LEMNISCATE (The Eyes - 10-Year Trajectory)

The lemniscate (infinity symbol ∞) threading through the face encodes trajectory projection.

**What it represents:**
- Direction and speed of projected change over 10 years
- Confidence/volatility in that projection

**Visual encoding:**
- **Eyes up** (∞ tilted upward): Trajectory positive → headed toward recovery
- **Eyes down** (∞ tilted downward): Trajectory negative → headed toward collapse
- **Eyes level** (∞ horizontal): Trajectory flat → heading toward stable state
- **Eyes spinning fast**: High volatility → uncertain projection
- **Eyes steady**: Low volatility → confident projection

**Mathematical basis:**

```
trajectory_projection = current_coherence + (current_momentum × 10 years)
lemniscate_angle = arctan(projection_direction, projection_volatility)
```

The eyes encode what the future actually looks like, not what we hope it looks like.

**"The eyes never lie."**

### ASYMPTOTE (The Mouth - Current Momentum)

The asymptote curve (the second curve of the face geometry) encodes current momentum.

**What it represents:**
- Rate of change RIGHT NOW (this year)
- Direction and speed of immediate trajectory
- Whether things are improving or declining

**Visual encoding:**
- **Big smile** (steep upward curve): Rapid improvement (+0.05 or faster)
- **Slight smile**: Slow improvement
- **Flat line**: Stable (no significant change)
- **Grimace** (slight downward curve): Slow decline
- **FROWN** (steep downward curve): Rapid decline (-0.05 or faster)
- **Mouth off-frame** (catastrophic curve): System in free-fall (-0.2 or worse)

**Mathematical basis:**

```
current_momentum = d(coherence)/dt (this year)
mouth_curve = current_momentum × 90 degrees
mouth_color = catastrophic (red) | severe (orange-red) | stable (neutral)
```

The mouth shows HOW FAST things are changing NOW, independent of trajectory.

---

## Coherence Score Calculation

Each of the 6 systems transforms raw data into a coherence score (0-1.0).

### CLIMATE COHERENCE

**Constraints:**
- Global temperature rise capped at 1.5°C (Paris Agreement)
- CO₂ concentration under 350 ppm (safe level)
- Extreme weather events stable or declining

**Raw Data:**
- Global temperature anomaly (vs. pre-industrial): currently +1.15°C
- CO₂ concentration (Mauna Loa): currently 426 ppm
- Extreme weather trend (5-year): currently +7%/year

**Calculation:**

```
tempScore = max(0, 1 - (globalTempAnomalyC / 1.5))
           = max(0, 1 - (1.15 / 1.5))
           = 0.23

co2Score = max(0, 1 - ((co2ppm - 350) / 100))
          = max(0, 1 - ((426 - 350) / 100))
          = max(0, 1 - 0.76)
          = 0.24

extremeScore = max(0, 1 - (extremeWeatherTrendPercent / 20))
             = max(0, 1 - (7 / 20))
             = 0.65

climateCoherence = (0.23 + 0.24 + 0.65) / 3 = 0.37
```

**Interpretation:** Climate system at 37% coherence. Multiple constraints violated. Severe distortion.

---

### BIODIVERSITY COHERENCE

**Constraints:**
- Species extinction <10x background rate (currently 500-1000x)
- Wildlife populations stable or increasing
- Habitat loss <1% annually (currently ~0.8%)

**Raw Data:**
- Extinction rate multiple: 650x
- Wildlife population trend: -2.4% annually
- Habitat loss: 0.95% annually

**Calculation:**

```
extinctionScore = max(0, 1 - (log10(650) - 1) / 3)
                = max(0, 1 - (2.81 - 1) / 3)
                = max(0, 1 - 0.60)
                = 0.40

wildlifeScore = max(0, (-2.4 + 10) / 20)
              = max(0, 7.6 / 20)
              = 0.38

habitatScore = max(0, 1 - (0.95 / 5))
             = max(0, 1 - 0.19)
             = 0.81

biodiversityCoherence = (0.40 + 0.38 + 0.81) / 3 = 0.53
```

**Interpretation:** Biodiversity at 53% coherence. Multiple pathways to extinction. Moderate-to-severe distortion.

---

### SOIL COHERENCE

**Constraints:**
- Soil degradation <1% annually (currently 1.3%)
- Organic matter >2% (currently 1.8%)
- Arable land loss <0.5% annually (currently 1.0%)

**Calculation:**

```
degradationScore = max(0, 1 - (1.3 / 3)) = 0.57
organicScore = max(0, (1.8 - 1) / 4) = 0.20
arableScore = max(0, 1 - (1.0 / 2)) = 0.50

soilCoherence = (0.57 + 0.20 + 0.50) / 3 = 0.42
```

**Interpretation:** Soil at 42% coherence. Fertility declining. Foundation degrading.

---

### WATER COHERENCE

**Constraints:**
- Aquifer recharge >= aquifer depletion
- River flow >80% of historical baseline
- Groundwater levels stable or rising

**Calculation:**

```
aquiferScore = max(0, 1 / depletion_rate)
             = max(0, 1 / 1.65)
             = 0.61

riverScore = max(0, riverFlowPercentHistorical / 100)
           = max(0, 72 / 100)
           = 0.72

groundwaterScore = max(0, (trend + 5) / 10)
                 = max(0, (-1.2 + 5) / 10)
                 = 0.38

waterCoherence = (0.61 + 0.72 + 0.38) / 3 = 0.57
```

**Interpretation:** Water at 57% coherence. Aquifers depleting. Rivers shrinking. Moderate distortion.

---

### ENERGY COHERENCE

**Constraints:**
- Fossil fuel <50% of total energy (currently 81%)
- Renewable growth >10% annually (currently 8.5%)
- Grid stability >99% uptime (currently 99.2%)

**Calculation:**

```
fossilScore = max(0, 1 - (81 / 100))
            = 0.19

renewableScore = max(0, 8.5 / 15)
               = 0.57

gridScore = max(0, (99.2 - 98) / 2)
          = 0.60

energyCoherence = (0.19 + 0.57 + 0.60) / 3 = 0.45
```

**Interpretation:** Energy at 45% coherence. Fossil dependency severe. Transition underway but insufficient. Moderate-to-severe distortion.

---

### GOVERNANCE COHERENCE

**Constraints:**
- Institutional trust >50% (currently 36%)
- Government effectiveness >0.5 on -1 to +2.5 scale (currently 0.25)
- Policy response <6 months for climate-scale decisions (currently 18+ months)
- Press freedom index >80 (currently 68)

**Calculation:**

```
trustScore = max(0, 36 / 70) = 0.51
pressScore = max(0, 68 / 100) = 0.68
govScore = max(0, (0.25 + 1) / 3.5) = 0.36
responseScore = max(0, 1 - (18 / 36)) = 0.50

governanceCoherence = (0.51 + 0.68 + 0.36 + 0.50) / 4 = 0.51
```

**Interpretation:** Governance at 51% coherence. Trust eroding. Decision-making too slow for crisis response. Moderate distortion.

---

## Momentum Calculation

**Current momentum** = rate of change (coherence per year)

Calculated by comparing coherence scores across 4-5 year historical span:

```
momentum = (current_score - historical_score) / years_elapsed
```

If momentum is positive: system improving  
If momentum is negative: system degrading  
If momentum is near zero: system stable

**Example:**

```
Climate coherence 2022: 0.48
Climate coherence 2026: 0.37
Span: 4 years

Climate momentum = (0.37 - 0.48) / 4 = -0.0275 per year
```

Interpretation: Climate coherence declining at 2.75% per year.

---

## Trajectory Projection

Simple 10-year linear extrapolation:

```
projected_score_2036 = current_score + (momentum × 10 years)
```

**Limitations:**

This is a naive model. Real trajectory involves:
- Feedback loops (both stabilizing and destabilizing)
- Tipping points (non-linear phase transitions)
- Intervention effects (policies, technology breakthroughs)
- Unknown unknowns

This provides directional estimate only, not prediction.

---

## Geometric Rendering Rules

All coordinates are deterministic given input data.

### Hexagon Positioning

```
For each system i (0-5):
  angle = (i × 60°) - 90°
  distance = coherence_score × radius
  x = cos(angle) × distance
  y = sin(angle) × distance
```

This places vertices symmetrically, with distance encoding coherence.

### Eye (Lemniscate) Angle

```
trajectory_momentum = projected_coherence_2036 - current_coherence
eye_angle = arctan(trajectory_momentum) in degrees
  = trajectory_momentum × 45°

If trajectory_momentum > 0: eyes tilt up
If trajectory_momentum < 0: eyes tilt down
If trajectory_momentum ≈ 0: eyes level
```

### Mouth (Asymptote) Curve

```
current_momentum_rate = d(coherence)/dt this year
mouth_curve = current_momentum_rate × 90 degrees

If rate > 0.05: BIG SMILE
If 0 < rate ≤ 0.05: SLIGHT SMILE
If rate ≈ 0: FLAT LINE
If -0.05 ≤ rate < 0: GRIMACE
If rate < -0.05: FROWN
If rate < -0.2: OFF-FRAME (catastrophic)
```

---

## Data Sources

All data sourced from public, auditable repositories:

**Climate:**
- NOAA Global Monitoring Laboratory (CO₂, temperature)
- UN WMO (extreme weather indices)

**Biodiversity:**
- IUCN Red List (extinction rates)
- WWF Living Planet Index (population trends)
- FAO Forest Resources Assessment (habitat loss)

**Soil:**
- UN Land Degradation Neutrality assessment
- USDA/FAO soil databases
- Global soil surveys

**Water:**
- USGS Groundwater Data Portal
- FAO AQUASTAT (water availability)
- Global glacier monitoring

**Energy:**
- IEA World Energy Outlook
- IRENA Renewable Capacity Statistics
- IEEE Grid Reliability Data

**Governance:**
- Edelman Trust Barometer
- World Bank Governance Indicators
- Reporters Without Borders Press Freedom Index

---

## Uncertainty and Limitations

### Known Issues

1. **Governance metrics are proxies** - Direct measurement of coordination capacity is hard. We use trust/effectiveness/response speed as approximations.

2. **Linear momentum doesn't capture tipping points** - Real systems have non-linear phase transitions. Linear extrapolation will miss these.

3. **Sub-system interactions not modeled** - Systems influence each other (climate ↔ water, soil ↔ biodiversity, etc.). This version treats them independently.

4. **Data quality varies by region** - Some parts of Earth have excellent data; others have almost none. Global average may hide severe regional disparities.

5. **Temporal lag** - Some data reflects conditions 6-12 months in the past. Current Face may not capture the most recent changes.

### How This Changes

Future versions will:
- Add regional/zoomable granularity
- Model system interactions
- Include tipping point thresholds
- Increase data update frequency
- Add confidence intervals

---

## The Sigma Gamma Challenge

**This is v0.1. It's incomplete. We built it to be challenged.**

If you can:
- Integrate better data sources
- Improve coherence calculations
- Add system interactions
- Better predict trajectories
- Model tipping points
- Capture regional variation

**Your version runs here.**

Rules:
- Mathematics only (no narrative, no framing disputes)
- Data must be verifiable and current
- Geometric representation must be auditable
- Historical validation: Your Face predicts system behavior better than ours
- Transparent methodology (code, data, assumptions public)

Winner: The version that best explains Earth's past and most accurately predicts its near future.

---

## Using This Data

### For Policymakers

The Face shows which constraints are most violated. Focus restoration efforts there. Watch the mouth—if it stops frowning, your policy is working.

### For Researchers

Treat this as an open research problem. If your data and model beat ours, you're closer to truth. Build on this, improve this, replace this.

### For Scientists

This is falsifiable. If the Face ever gets better at prediction than this model, that model wins. That's how truth moves forward.

### For Everyone

The eyes never lie. The mouth can be fooled by short-term changes. But where you're actually headed? The eyes show that. Look at the eyes.

---

## Methodology Version History

**v0.1.0** (July 29, 2026)
- Initial release
- Six systems, hexagonal structure
- Linear momentum projection
- Public challenge mode (Sigma Gamma Challenge)

---

## Contact & Attribution

**Framework:** Idris Bailey  
**Version:** Face of Earth v0.1  
**License:** Public Domain (all methodology, calculations, and data sources are openly auditable)

**To improve this:**
Contact via Sigma Gamma Challenge submission.
