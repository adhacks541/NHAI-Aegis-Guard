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
 * Calculates Eye Aspect Ratio (EAR) to detect eye blinks
 * EAR = (||p2 - p6|| + ||p3 - p5||) / (2 * ||p1 - p4||)
 */
export const calculateEAR = (eye: [number, number][]): number => {
  if (eye.length < 6) return 0.3; // Default baseline if landmarks are missing
  
  const vertical1 = getDistance(eye[1], eye[5]);
  const vertical2 = getDistance(eye[2], eye[4]);
  const horizontal = getDistance(eye[0], eye[3]);
  
  if (horizontal === 0) return 0;
  return (vertical1 + vertical2) / (2.0 * horizontal);
};

/**
 * Calculates Mouth Aspect Ratio (MAR) to detect smiles
 * MAR = ||p_left_corner - p_right_corner|| / ||p_lip_upper - p_lip_lower||
 * An active smile increases mouth width relative to lip gap height compared to resting state
 */
export const calculateMAR = (lips: [number, number][]): number => {
  if (lips.length < 4) return 1.5;
  const width = getDistance(lips[0], lips[1]); // left to right corner
  const height = getDistance(lips[2], lips[3]); // upper to lower lip center
  
  if (height === 0) return 3.0; // Return high ratio if closed
  return width / height;
};

/**
 * Generates a randomized list of challenges to prevent playbacks
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
 */
export const evaluateChallengeStep = (
  challenge: LivenessChallenge,
  landmarks: FaceLandmarks,
  baselineEAR = 0.30,
  baselineMAR = 2.0
): { progress: number; isSatisfied: boolean; metricVal: number } => {
  
  switch (challenge) {
    case 'BLINK': {
      const leftEAR = calculateEAR(landmarks.leftEye);
      const rightEAR = calculateEAR(landmarks.rightEye);
      const avgEAR = (leftEAR + rightEAR) / 2.0;
      
      // A blink is registered when EAR drops significantly (closed eye is < 0.20)
      const isClosed = avgEAR < 0.21;
      const progress = isClosed ? 1.0 : Math.max(0, (baselineEAR - avgEAR) / (baselineEAR - 0.2));
      
      return {
        progress,
        isSatisfied: isClosed,
        metricVal: avgEAR
      };
    }
    
    case 'SMILE': {
      const currentMAR = calculateMAR(landmarks.outerLips);
      // A smile stretches the lip corners, increasing the MAR width/height ratio (MAR > 2.8)
      const smiling = currentMAR > 2.75;
      const progress = Math.min(1.0, Math.max(0, (currentMAR - baselineMAR) / (2.85 - baselineMAR)));
      
      return {
        progress,
        isSatisfied: smiling,
        metricVal: currentMAR
      };
    }
    
    case 'TURN_LEFT': {
      // Yaw rotation in degrees. Positive yaw = head turned right, negative yaw = head turned left.
      // We check if yaw is significantly negative (e.g. yaw < -18 degrees)
      const leftTurn = landmarks.yaw < -18;
      const progress = Math.min(1.0, Math.max(0, -landmarks.yaw / 18));
      
      return {
        progress,
        isSatisfied: leftTurn,
        metricVal: landmarks.yaw
      };
    }
    
    case 'TURN_RIGHT': {
      // We check if yaw is significantly positive (e.g. yaw > 18 degrees)
      const rightTurn = landmarks.yaw > 18;
      const progress = Math.min(1.0, Math.max(0, landmarks.yaw / 18));
      
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
