// Aegis Secure Active Liveness Detection Engine
// Computes on-device mathematical anti-spoofing metrics from landmark matrices

export type LivenessChallenge = 'BLINK' | 'SMILE' | 'TURN_LEFT' | 'TURN_RIGHT';

export interface FaceLandmarks {
  // Eye points: [x, y]
  leftEye: [number, number][]; // 6 points representing left eye contour
  rightEye: [number, number][]; // 6 points representing right eye contour
  // Lip points: [x, y]
  outerLips: [number, number][]; // lip corners, upper/lower points
  // Euler Angles in Degrees
  yaw: number;   // Head turn left/right (Euler Y)
  pitch: number; // Head nod up/down (Euler X)
  roll: number;  // Head tilt (Euler Z)
}

export interface ChallengeState {
  currentChallenge: LivenessChallenge;
  sequence: LivenessChallenge[];
  currentIndex: number;
  isCompleted: boolean;
  progress: number; // 0 to 1
  telemetryLogs: string[];
}

// Distance utility between 2D points
const getDistance = (p1: [number, number], p2: [number, number]): number => {
  return Math.sqrt(Math.pow(p1[0] - p2[0], 2) + Math.pow(p1[1] - p2[1], 2));
};

/**
 * Helper to scale a 2D landmark point from normalized space [0..1] to pixel space
 * using a standard reference frame (e.g. 640x480).
 * This fixes BUG 1 & BUG 2 aspect ratio distortions when computing Euclidean distances.
 * If points are already in pixel space (e.g. simulation), they are returned unchanged.
 */
const scalePoint = (p: [number, number], width = 640, height = 480): [number, number] => {
  // MediaPipe landmarks are normally [0..1]. If coords are in this range, we scale them.
  const isNormalized = p[0] >= 0 && p[0] <= 1 && p[1] >= 0 && p[1] <= 1;
  if (isNormalized) {
    return [p[0] * width, p[1] * height];
  }
  return p;
};

/**
 * Calculates Eye Aspect Ratio (EAR) to detect eye blinks.
 * Formula: EAR = (||p2 - p6|| + ||p3 - p5||) / (2 * ||p1 - p4||)
 * 
 * FIX BUG 1 (Blink not triggering):
 * Normalized coordinates are scaled to pixel space first to eliminate aspect ratio distortions
 * caused by camera width/height discrepancies.
 */
export const calculateEAR = (eye: [number, number][]): number => {
  if (eye.length < 6) return 0.3; // Default baseline if landmarks are missing
  
  // Scale landmarks to standard 640x480 pixel space to fix aspect ratio distortion
  const scaledEye = eye.map(p => scalePoint(p, 640, 480));
  
  const vertical1 = getDistance(scaledEye[1], scaledEye[5]);
  const vertical2 = getDistance(scaledEye[2], scaledEye[4]);
  const horizontal = getDistance(scaledEye[0], scaledEye[3]);
  
  if (horizontal === 0) return 0;
  return (vertical1 + vertical2) / (2.0 * horizontal);
};

/**
 * Calculates Mouth Aspect Ratio (MAR) to detect active smiles.
 * Formula: MAR = ||left_corner - right_corner|| / (||upper_lip - lower_lip|| * 2 + 0.001)
 * 
 * FIX BUG 2 (Smile not triggering):
 * 1. Corrects the MAR formula so that the denominator scales by 2.0 (and includes the 0.001 epsilon),
 *    ensuring MAR increases (stretches wide) relative to neutral during active smile (e.g. resting ~1.5-1.8, smile ~2.2-3.2).
 * 2. Coordinates are scaled to 640x480 pixel space to preserve exact lip contours without camera aspect distortion.
 * 3. Uses standard MediaPipe v0.4 landmark indices: 78/308 (corners) and 13/14 (vertical center).
 */
export const calculateMAR = (lips: [number, number][]): number => {
  if (lips.length < 4) return 1.5;
  
  // Scale landmarks to standard 640x480 pixel space to fix aspect ratio distortion
  const scaledLips = lips.map(p => scalePoint(p, 640, 480));
  
  const width = getDistance(scaledLips[0], scaledLips[1]); // left corner (78) to right corner (308)
  const height = getDistance(scaledLips[2], scaledLips[3]); // upper lip center (13) to lower lip center (14)
  
  // Apply correct formula where smile stretches width relative to neutral height
  return width / (height * 2.0 + 0.001);
};

/**
 * Calculates head turn yaw from raw landmarks.
 * Formula: yaw = ((nose.x - (leftEar.x + rightEar.x)/2) / faceWidth) * 90
 * 
 * FIX BUG 3 (Head turn not triggering):
 * Uses a robust nose bridge vs face width ratio method. If lm[i].x is in normalized [0..1] space,
 * a simple offset * 180 stays in the 0-27° range. The ratio scales properly to ±45°,
 * giving a consistent ±15° trigger regardless of physical distance to the camera sensor.
 */
export const calculateYaw = (
  nose: [number, number],
  leftEar: [number, number],
  rightEar: [number, number]
): number => {
  // Extract x-coordinates for yaw calculation
  const center = (leftEar[0] + rightEar[0]) / 2.0;
  const offset = nose[0] - center;
  const faceWidth = getDistance(leftEar, rightEar);
  
  if (faceWidth === 0) return 0;
  return (offset / faceWidth) * 90.0;
};

/**
 * Generates a randomized list of challenges to prevent spoof/playback attacks
 */
export const generateChallengeSequence = (length = 3): LivenessChallenge[] => {
  const allChallenges: LivenessChallenge[] = ['BLINK', 'SMILE', 'TURN_LEFT', 'TURN_RIGHT'];
  const sequence: LivenessChallenge[] = [];
  
  // Randomize selections avoiding duplicates consecutively
  for (let i = 0; i < length; i++) {
    const available = allChallenges.filter(c => sequence.length === 0 || sequence[sequence.length - 1] !== c);
    const randomChallenge = available[Math.floor(Math.random() * available.length)];
    sequence.push(randomChallenge);
  }
  
  return sequence;
};

/**
 * Evaluates the active face landmarks against the current challenge.
 * Returns progress (0.0 to 1.0) and whether the step is satisfied.
 * 
 * Note on BUG 4 (Motion scores stuck at 0.0):
 * This is resolved in App.tsx (the layout layer) by styling the hidden canvas using 
 * `position: 'absolute'; visibility: 'hidden'` instead of `display: 'none'`. This forces the browser
 * to rasterize the drawing buffer and yields correct grayscale sector frame-differencing values.
 */
export const evaluateChallengeStep = (
  challenge: LivenessChallenge,
  landmarks: FaceLandmarks,
  baselineEAR = 0.28,
  baselineMAR = 1.8
): { progress: number; isSatisfied: boolean; metricVal: number } => {
  
  switch (challenge) {
    case 'BLINK': {
      const leftEAR = calculateEAR(landmarks.leftEye);
      const rightEAR = calculateEAR(landmarks.rightEye);
      const avgEAR = (leftEAR + rightEAR) / 2.0;
      
      // A blink is registered when EAR drops significantly (closed eye threshold is optimized to < 0.24 for webcams)
      const isClosed = avgEAR < 0.24;
      const progress = isClosed ? 1.0 : Math.max(0, (baselineEAR - avgEAR) / (baselineEAR - 0.24));
      
      return {
        progress,
        isSatisfied: isClosed,
        metricVal: avgEAR
      };
    }
    
    case 'SMILE': {
      const currentMAR = calculateMAR(landmarks.outerLips);
      // A smile stretches the lip corners, increasing the MAR width/height ratio (optimized smile threshold to > 2.20)
      const smiling = currentMAR > 2.20;
      const progress = Math.min(1.0, Math.max(0, (currentMAR - baselineMAR) / (2.50 - baselineMAR)));
      
      return {
        progress,
        isSatisfied: smiling,
        metricVal: currentMAR
      };
    }
    
    case 'TURN_LEFT': {
      // Yaw rotation in degrees. Positive yaw = head turned right, negative yaw = head turned left.
      // We check if yaw is significantly negative (optimized head turn threshold to < -15 degrees for field use)
      const leftTurn = landmarks.yaw < -15;
      const progress = Math.min(1.0, Math.max(0, -landmarks.yaw / 15));
      
      return {
        progress,
        isSatisfied: leftTurn,
        metricVal: landmarks.yaw
      };
    }
    
    case 'TURN_RIGHT': {
      // We check if yaw is significantly positive (optimized head turn threshold to > 15 degrees for field use)
      const rightTurn = landmarks.yaw > 15;
      const progress = Math.min(1.0, Math.max(0, landmarks.yaw / 15));
      
      return {
        progress,
        isSatisfied: rightTurn,
        metricVal: landmarks.yaw
      };
    }
    
    default:
      return { progress: 0, isSatisfied: false, metricVal: 0 };
  }
};
