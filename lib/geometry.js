/**
 * GEOMETRY ENGINE - Face of Earth v0.1
 * 
 * Transforms coherence data into geometric representation:
 * - HEXAGON: System health structure
 * - LEMNISCATE (Eyes): 10-year trajectory projection
 * - ASYMPTOTE (Mouth): Current momentum
 * 
 * All calculations are deterministic and auditable.
 */

const HEXAGON_RADIUS = 100; // Reference radius (pixels)
const CIRCLE_RADIUS = 100; // Perfect coherence circle
const PI = Math.PI;

/**
 * Generate hexagon vertices based on coherence scores
 * @param {Array} coherenceScores - [climate, biodiversity, soil, water, energy, governance]
 * @returns {Array} Array of {x, y, system, score}
 */
export function calculateHexagonVertices(coherenceScores) {
  const systemNames = [
    'Climate',
    'Energy',
    'Governance',
    'Biodiversity',
    'Soil',
    'Water'
  ];

  const vertices = [];
  
  for (let i = 0; i < 6; i++) {
    // Angle for each vertex (0° = top, 60° intervals)
    const angle = (i * PI / 3) - (PI / 2); // Start from top
    
    // Distance from center = coherence score × reference radius
    const distance = coherenceScores[i] * HEXAGON_RADIUS;
    
    const vertex = {
      x: Math.cos(angle) * distance,
      y: Math.sin(angle) * distance,
      system: systemNames[i],
      score: coherenceScores[i],
      angle: angle,
      distanceFromCircle: CIRCLE_RADIUS - distance // How far from perfect coherence
    };
    
    vertices.push(vertex);
  }
  
  return vertices;
}

/**
 * Calculate hexagon overall distortion and asymmetry
 * @param {Array} coherenceScores
 * @returns {Object} {meanRadius, asymmetry, worstSystem, bestSystem}
 */
export function calculateHexagonState(coherenceScores) {
  const meanScore = coherenceScores.reduce((a, b) => a + b, 0) / coherenceScores.length;
  const meanRadius = meanScore * HEXAGON_RADIUS;
  
  // Asymmetry = standard deviation of scores
  const variance = coherenceScores.reduce((sum, score) => {
    return sum + Math.pow(score - meanScore, 2);
  }, 0) / coherenceScores.length;
  const asymmetry = Math.sqrt(variance);
  
  const worstScore = Math.min(...coherenceScores);
  const worstIndex = coherenceScores.indexOf(worstScore);
  const worstSystem = ['Climate', 'Energy', 'Governance', 'Biodiversity', 'Soil', 'Water'][worstIndex];
  
  const bestScore = Math.max(...coherenceScores);
  const bestIndex = coherenceScores.indexOf(bestScore);
  const bestSystem = ['Climate', 'Energy', 'Governance', 'Biodiversity', 'Soil', 'Water'][bestIndex];
  
  return {
    meanRadius,
    asymmetry,
    worstSystem,
    worstScore,
    bestSystem,
    bestScore,
    overallCoherence: meanScore
  };
}

/**
 * Calculate lemniscate (eyes) orientation based on trajectory
 * 
 * Input: 10-year projected coherence change
 * Output: Eye angle, spin speed, tilt
 * 
 * Eyes up = improving (trajectory positive)
 * Eyes down = declining (trajectory negative)
 * Eyes level = stable
 * 
 * @param {number} momentumMagnitude - rate of change (d(coherence)/dt)
 * @param {number} momentumDirection - direction (-1 to +1)
 * @param {number} volatility - uncertainty in projection
 * @returns {Object} {eyeAngle, spinSpeed, meaning}
 */
export function calculateLemniscate(momentumMagnitude, momentumDirection, volatility = 0) {
  // Momentum direction: positive = improving, negative = declining
  
  // Eye tilt angle (in degrees, from horizontal)
  // Positive = up (recovery), Negative = down (collapse)
  const eyeAngle = momentumDirection * 45; // Max 45° up or down
  
  // Spin speed encodes volatility/uncertainty
  // High volatility = fast darting eyes
  // Low volatility = steady gaze
  const spinSpeed = volatility * 360; // Rotation speed in degrees/second
  
  const meaning = 
    momentumDirection > 0.1 ? "Eyes up - trajectory toward recovery" :
    momentumDirection < -0.1 ? "Eyes down - trajectory toward collapse" :
    "Eyes level - stable trajectory";
  
  return {
    eyeAngle,      // -45 to +45 degrees (vertical tilt)
    spinSpeed,     // rotation speed
    volatility,    // uncertainty
    meaning,
    rawMomentum: momentumDirection
  };
}

/**
 * Calculate asymptote (mouth) based on current momentum
 * 
 * Input: Current rate of change
 * Output: Mouth curve (smile/frown)
 * 
 * Big smile = rapid improvement (+0.05 or higher)
 * Frown = rapid decline (-0.05 or lower)
 * Flat = stable (near 0)
 * Off-frame = catastrophic (-0.2 or worse)
 * 
 * @param {number} currentMomentum - d(coherence)/dt this year
 * @returns {Object} {mouthCurve, steepness, meaning, isOffFrame}
 */
export function calculateAsymptote(currentMomentum) {
  // Clamp momentum to meaningful range
  const clamped = Math.max(-0.3, Math.min(0.3, currentMomentum));
  
  // Mouth curve angle (in degrees)
  // Positive = smile (upward curve)
  // Negative = frown (downward curve)
  const mouthCurve = clamped * 90; // -90 to +90 degrees
  
  // Steepness = magnitude of curve
  const steepness = Math.abs(clamped);
  
  // Check if trajectory is catastrophic (off-frame)
  const isOffFrame = currentMomentum < -0.2;
  
  const meaning =
    currentMomentum > 0.05 ? "BIG SMILE - Rapid improvement" :
    currentMomentum > 0 ? "Slight smile - Slow improvement" :
    Math.abs(currentMomentum) < 0.02 ? "Neutral - Stable" :
    currentMomentum > -0.05 ? "Grimace - Slow decline" :
    currentMomentum > -0.2 ? "FROWN - Rapid decline" :
    "CATASTROPHIC - Trajectory off-frame";
  
  return {
    mouthCurve,      // -90 to +90 degrees (vertical curve)
    steepness,       // magnitude
    isOffFrame,      // boolean
    meaning,
    rawMomentum: currentMomentum
  };
}

/**
 * Combine all face elements into complete representation
 * @param {Array} coherenceScores - [climate, biodiversity, soil, water, energy, governance]
 * @param {number} currentMomentum - rate of change now
 * @param {number} trajectoryMomentum - projected 10-year direction
 * @param {number} trajectoryVolatility - uncertainty in projection
 * @returns {Object} Complete face state
 */
export function calculateFace(
  coherenceScores,
  currentMomentum,
  trajectoryMomentum,
  trajectoryVolatility
) {
  const vertices = calculateHexagonVertices(coherenceScores);
  const hexagonState = calculateHexagonState(coherenceScores);
  const lemniscate = calculateLemniscate(trajectoryMomentum, trajectoryVolatility);
  const asymptote = calculateAsymptote(currentMomentum);
  
  return {
    timestamp: new Date().toISOString(),
    hexagon: {
      vertices,
      ...hexagonState
    },
    eyes: lemniscate,
    mouth: asymptote,
    interpretation: {
      structure: hexagonState.worstSystem + " is failing (" + hexagonState.worstScore.toFixed(2) + ")",
      momentum: asymptote.meaning,
      trajectory: lemniscate.meaning,
      overallState: asymptote.isOffFrame ? "CRITICAL" : 
                   asymptote.steepness > 0.15 ? "SEVERE" :
                   asymptote.steepness > 0.05 ? "CONCERNING" :
                   "STABLE"
    }
  };
}

/**
 * Render face to Three.js scene coordinates
 * Converts geometric calculations into renderable positions
 * @param {Object} faceData - output from calculateFace()
 * @returns {Object} Scene-ready coordinates
 */
export function renderFaceGeometry(faceData) {
  const { hexagon, eyes, mouth } = faceData;
  
  // Convert hexagon vertices to Three.js coordinates
  const hexagonPoints = hexagon.vertices.map(v => ({
    x: v.x,
    y: v.y,
    z: 0,
    system: v.system,
    score: v.score
  }));
  
  // Eyes (lemniscate) positioning
  const eyeRadius = 30;
  const eyeLeftX = -40;
  const eyeRightX = 40;
  const eyeY = 40; // Above center
  
  // Apply eye tilt to simulate looking up/down
  const eyeTiltRadians = (eyes.eyeAngle * PI) / 180;
  
  const eyeLeft = {
    x: eyeLeftX,
    y: eyeY + Math.sin(eyeTiltRadians) * eyeRadius,
    z: Math.cos(eyeTiltRadians) * 20,
    radius: eyeRadius,
    rotation: eyes.spinSpeed
  };
  
  const eyeRight = {
    x: eyeRightX,
    y: eyeY + Math.sin(eyeTiltRadians) * eyeRadius,
    z: Math.cos(eyeTiltRadians) * 20,
    radius: eyeRadius,
    rotation: eyes.spinSpeed
  };
  
  // Mouth (asymptote) positioning
  const mouthMidX = 0;
  const mouthMidY = -40; // Below center
  const mouthWidth = 60;
  
  // Apply mouth curve to simulate smile/frown
  const mouthCurveRadians = (mouth.mouthCurve * PI) / 180;
  
  const mouth3D = {
    midX: mouthMidX,
    midY: mouthMidY,
    width: mouthWidth,
    curve: mouthCurveRadians,
    steepness: mouth.steepness,
    isOffFrame: mouth.isOffFrame
  };
  
  return {
    hexagon: hexagonPoints,
    eyeLeft,
    eyeRight,
    mouth: mouth3D,
    scale: hexagon.meanRadius / HEXAGON_RADIUS
  };
}
