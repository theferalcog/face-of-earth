/**
 * NORMALIZATION ENGINE - Face of Earth v0.1
 * 
 * Converts raw planetary data into coherence scores (0-1.0)
 * 
 * Coherence Score Definition:
 * 1.0 = Perfect constraint satisfaction (system sustains indefinitely)
 * 0.5 = Moderate constraint violation (system degrading but manageable)
 * 0.0 = Complete constraint failure (system unsustainable)
 * 
 * All thresholds are science-based and documented.
 */

/**
 * CLIMATE COHERENCE
 * 
 * Constraints:
 * - Global temperature: <1.5°C above pre-industrial (Paris Agreement)
 * - CO2 concentration: <350 ppm (safe level, currently 420 ppm)
 * - Extreme weather events: Stable or declining frequency
 * 
 * @param {Object} data - {globalTempAnomalyC, co2ppm, extremeWeatherTrendPercent}
 * @returns {number} 0-1.0 coherence score
 */
export function normalizeClimate(data) {
  const { globalTempAnomalyC = 1.1, co2ppm = 420, extremeWeatherTrendPercent = 5 } = data;
  
  // Temperature component: 1.5°C is max acceptable
  const tempScore = Math.max(0, 1 - (globalTempAnomalyC / 1.5));
  
  // CO2 component: 350 ppm is safe, 420+ is dangerous
  const co2Score = Math.max(0, 1 - ((co2ppm - 350) / 100));
  
  // Extreme weather component: should be declining
  const extremeScore = Math.max(0, 1 - (extremeWeatherTrendPercent / 20));
  
  // Average the three components
  return (tempScore + co2Score + extremeScore) / 3;
}

/**
 * BIODIVERSITY COHERENCE
 * 
 * Constraints:
 * - Species extinction rate: <10x background rate (currently 100-1000x)
 * - Wildlife population trends: Stable or increasing
 * - Habitat loss: <10% annual decline (currently ~1% annually but accelerating)
 * 
 * @param {Object} data - {extinctionRateMultiple, wildlifePopulationTrend, habitatLossPercent}
 * @returns {number} 0-1.0 coherence score
 */
export function normalizeBiodiversity(data) {
  const { extinctionRateMultiple = 500, wildlifePopulationTrend = -2, habitatLossPercent = 0.8 } = data;
  
  // Extinction rate: 10x is acceptable, 1000x is catastrophic
  const extinctionScore = Math.max(0, 1 - (Math.log10(extinctionRateMultiple) - 1) / 3);
  
  // Wildlife trend: positive = improving, negative = declining
  // Range: -10% to +10% annually
  const wildlifeScore = Math.max(0, (wildlifePopulationTrend + 10) / 20);
  
  // Habitat loss: <1% annually is acceptable, >5% is catastrophic
  const habitatScore = Math.max(0, 1 - (habitatLossPercent / 5));
  
  return (extinctionScore + wildlifeScore + habitatScore) / 3;
}

/**
 * SOIL COHERENCE
 * 
 * Constraints:
 * - Soil degradation rate: <1% annually (currently ~1.3%)
 * - Soil organic matter: >2% (currently declining)
 * - Arable land loss: <0.5% annually (currently ~1%)
 * 
 * @param {Object} data - {soilDegradationPercent, soilOrganicMatterPercent, arableLandLossPercent}
 * @returns {number} 0-1.0 coherence score
 */
export function normalizeSoil(data) {
  const { soilDegradationPercent = 1.3, soilOrganicMatterPercent = 1.8, arableLandLossPercent = 1.0 } = data;
  
  // Degradation: <1% is acceptable, >3% is critical
  const degradationScore = Math.max(0, 1 - (soilDegradationPercent / 3));
  
  // Organic matter: 2% is minimum, 5%+ is healthy
  const organicScore = Math.max(0, (soilOrganicMatterPercent - 1) / 4);
  
  // Arable loss: <0.5% is acceptable, >2% is critical
  const arableScore = Math.max(0, 1 - (arableLandLossPercent / 2));
  
  return (degradationScore + organicScore + arableScore) / 3;
}

/**
 * WATER COHERENCE
 * 
 * Constraints:
 * - Aquifer depletion rate: Sustainable recharge (currently exceeds recharge by 2x)
 * - River flow: >80% of historical average
 * - Groundwater levels: Stable or rising
 * 
 * @param {Object} data - {aquiferDepletionRate, riverFlowPercentHistorical, groundwaterTrend}
 * @returns {number} 0-1.0 coherence score
 */
export function normalizeWater(data) {
  const { aquiferDepletionRate = 1.5, riverFlowPercentHistorical = 75, groundwaterTrend = -1 } = data;
  
  // Aquifer depletion: 1.0 = sustainable, >2.0 = critical
  const aquiferScore = Math.max(0, 1 / aquiferDepletionRate);
  
  // River flow: 100% = healthy, <60% = critical
  const riverScore = Math.max(0, riverFlowPercentHistorical / 100);
  
  // Groundwater trend: positive = rising, negative = falling
  // Range: -5% to +5% annually
  const groundwaterScore = Math.max(0, (groundwaterTrend + 5) / 10);
  
  return (aquiferScore + riverScore + groundwaterScore) / 3;
}

/**
 * ENERGY COHERENCE
 * 
 * Constraints:
 * - Fossil fuel dependency: <50% of total energy
 * - Renewable capacity growth: >10% annually
 * - Grid stability: >99% uptime, declining blackout risk
 * 
 * @param {Object} data - {fossilFuelPercent, renewableGrowthPercent, gridStabilityPercent}
 * @returns {number} 0-1.0 coherence score
 */
export function normalizeEnergy(data) {
  const { fossilFuelPercent = 81, renewableGrowthPercent = 8, gridStabilityPercent = 99 } = data;
  
  // Fossil fuel: 81% is current (bad), <50% is acceptable
  const fossilScore = Math.max(0, 1 - (fossilFuelPercent / 100));
  
  // Renewable growth: >10% is good, <5% is poor
  const renewableScore = Math.max(0, renewableGrowthPercent / 15);
  
  // Grid stability: 99%+ is good, <98% is concerning
  const gridScore = Math.max(0, (gridStabilityPercent - 98) / 2);
  
  return (fossilScore + renewableScore + gridScore) / 3;
}

/**
 * GOVERNANCE COHERENCE
 * 
 * Constraints:
 * - Institutional trust: >50% public confidence (currently 35-40% in democracies)
 * - Coordination capacity: Ability to make/implement collective decisions
 * - Decision-making speed: Matching pace of crises (currently lagging)
 * 
 * Measurement is difficult; uses proxy indicators:
 * - Press freedom index (90+ = healthy)
 * - Government effectiveness index (-1 to +2.5, 0.5+ is acceptable)
 * - Policy response speed (months to implement vs. crisis urgency)
 * 
 * @param {Object} data - {trustPercent, pressFreedomIndex, govEffectivenessIndex, policyResponseMonths}
 * @returns {number} 0-1.0 coherence score
 */
export function normalizeGovernance(data) {
  const { trustPercent = 38, pressFreedomIndex = 70, govEffectivenessIndex = 0.3, policyResponseMonths = 18 } = data;
  
  // Trust: >50% is healthy, <30% is critical
  const trustScore = Math.max(0, trustPercent / 70);
  
  // Press freedom: >80 is healthy, <50 is concerning
  const pressScore = Math.max(0, pressFreedomIndex / 100);
  
  // Government effectiveness: -1 to +2.5 scale, 0.5+ is acceptable
  const govScore = Math.max(0, (govEffectivenessIndex + 1) / 3.5);
  
  // Policy response: Should respond in <6 months for climate scale, currently 18+ months
  const responseScore = Math.max(0, 1 - (policyResponseMonths / 36));
  
  return (trustScore + pressScore + govScore + responseScore) / 4;
}

/**
 * AGGREGATE COHERENCE
 * Combine all 6 systems into overall planetary coherence
 * @param {Object} allData - Contains all raw metrics
 * @returns {Object} {allScores, meanCoherence, timestamp}
 */
export function aggregateCoherence(allData) {
  const scores = [
    normalizeClimate(allData.climate || {}),
    normalizeBiodiversity(allData.biodiversity || {}),
    normalizeSoil(allData.soil || {}),
    normalizeWater(allData.water || {}),
    normalizeEnergy(allData.energy || {}),
    normalizeGovernance(allData.governance || {})
  ];
  
  const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
  
  return {
    climate: scores[0],
    biodiversity: scores[1],
    soil: scores[2],
    water: scores[3],
    energy: scores[4],
    governance: scores[5],
    overall: mean,
    timestamp: new Date().toISOString()
  };
}

/**
 * MOMENTUM CALCULATION
 * Estimate rate of change based on historical data
 * @param {Array} historicalScores - Previous coherence values [score1, score2, ...]
 * @param {Array} historicalDates - Corresponding dates
 * @returns {number} Rate of change (d(coherence)/dt) per year
 */
export function calculateMomentum(historicalScores, historicalDates) {
  if (historicalScores.length < 2) {
    return 0;
  }
  
  const current = historicalScores[historicalScores.length - 1];
  const previous = historicalScores[0];
  const yearsSpan = (historicalDates[historicalDates.length - 1] - historicalDates[0]) / (365 * 24 * 60 * 60 * 1000);
  
  if (yearsSpan === 0) return 0;
  
  return (current - previous) / yearsSpan;
}

/**
 * TRAJECTORY PROJECTION
 * Simple linear extrapolation of momentum for 10 years
 * 
 * WARNING: This is a naive model. Real trajectory involves:
 * - Feedback loops (both stabilizing and destabilizing)
 * - Tipping points (non-linear transitions)
 * - Intervention effects (policies, technology)
 * - Unknown unknowns
 * 
 * This provides a directional estimate only.
 * 
 * @param {number} currentCoherence
 * @param {number} currentMomentum
 * @returns {number} Projected coherence at t+10 years (clamped 0-1.0)
 */
export function projectTrajectory(currentCoherence, currentMomentum) {
  const projection = currentCoherence + (currentMomentum * 10);
  return Math.max(0, Math.min(1.0, projection));
}
