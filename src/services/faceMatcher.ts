// Aegis Secure Face Matching & Recognition Engine
// Performs mathematical vector comparison (Cosine Similarity & Euclidean Distance)

export interface Personnel {
  id: string;
  name: string;
  role: string;
  siteId: string;
  registeredDate: string;
  avatarColor: string;
  faceEmbedding: number[]; // 128-dimensional vector
  accuracyScore: number; // reference validation accuracy
}

// Pre-populate realistic diverse Indian demographics profiles with 128-D Unit Vectors
const generateUnitEmbedding = (seed: number): number[] => {
  const embedding = Array.from({ length: 128 }, (_, i) => {
    // Deterministic pseudo-random number generator based on index and seed
    const value = Math.sin(seed + i) * Math.cos(seed * i);
    return value;
  });
  
  // Normalize vector to unit length
  const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
  return embedding.map(val => val / (magnitude || 1));
};

export const INITIAL_PERSONNEL_DATABASE: Personnel[] = [
  {
    id: "EMP-04192",
    name: "Rajesh Kumar",
    role: "Project Manager",
    siteId: "NHAI-SITE-DEL-3",
    registeredDate: "2026-03-12",
    avatarColor: "#00D4FF",
    faceEmbedding: generateUnitEmbedding(101),
    accuracyScore: 98.4
  },
  {
    id: "EMP-04205",
    name: "Anjali Sharma",
    role: "Chief Site Engineer",
    siteId: "NHAI-SITE-DEL-3",
    registeredDate: "2026-03-15",
    avatarColor: "#00FF9D",
    faceEmbedding: generateUnitEmbedding(202),
    accuracyScore: 97.2
  },
  {
    id: "EMP-03884",
    name: "Amit Patel",
    role: "Lead Safety Officer",
    siteId: "NHAI-SITE-DEL-3",
    registeredDate: "2026-02-18",
    avatarColor: "#FFB800",
    faceEmbedding: generateUnitEmbedding(303),
    accuracyScore: 96.8
  },
  {
    id: "EMP-04510",
    name: "Priya Nair",
    role: "Land Surveyor",
    siteId: "NHAI-SITE-DEL-3",
    registeredDate: "2026-04-05",
    avatarColor: "#FF007A",
    faceEmbedding: generateUnitEmbedding(404),
    accuracyScore: 97.5
  }
];

/**
 * Calculates Dot Product between two vectors
 */
export const calculateDotProduct = (v1: number[], v2: number[]): number => {
  if (v1.length !== v2.length) return 0;
  return v1.reduce((sum, val, i) => sum + val * v2[i], 0);
};

/**
 * Calculates Vector Magnitude (Norm)
 */
export const calculateMagnitude = (v: number[]): number => {
  return Math.sqrt(v.reduce((sum, val) => sum + val * val, 0));
};

/**
 * Calculates Cosine Similarity between two 128D embeddings
 * Formula: CosSim = (A · B) / (||A|| ||B||)
 * Value range: [-1, 1], where 1 is identical.
 */
export const calculateCosineSimilarity = (v1: number[], v2: number[]): number => {
  if (v1.length !== v2.length) return 0;
  const dotProduct = calculateDotProduct(v1, v2);
  const mag1 = calculateMagnitude(v1);
  const mag2 = calculateMagnitude(v2);
  
  if (mag1 === 0 || mag2 === 0) return 0;
  return dotProduct / (mag1 * mag2);
};

/**
 * Calculates Euclidean Distance between two 128D embeddings
 * Formula: sqrt(sum((A_i - B_i)^2))
 * Value range: [0, 2] for unit-normalized vectors. Smaller means closer.
 */
export const calculateEuclideanDistance = (v1: number[], v2: number[]): number => {
  if (v1.length !== v2.length) return 2.0;
  const sumSquaredDiffs = v1.reduce((sum, val, i) => sum + Math.pow(val - v2[i], 2), 0);
  return Math.sqrt(sumSquaredDiffs);
};

/**
 * Matches an input face embedding against the registered personnel database.
 * Returns the closest match if it satisfies the similarity threshold.
 */
export const matchFaceInDatabase = (
  inputEmbedding: number[],
  database: Personnel[],
  cosineThreshold = 0.76, // Matches are valid above this
  euclideanThreshold = 0.65 // Matches are valid below this
): { match: Personnel | null; confidence: number; cosineSim: number; euclideanDist: number } => {
  let bestMatch: Personnel | null = null;
  let maxCosine = -1.0;
  let minEuclidean = 2.0;

  for (const person of database) {
    const cosSim = calculateCosineSimilarity(inputEmbedding, person.faceEmbedding);
    const eucDist = calculateEuclideanDistance(inputEmbedding, person.faceEmbedding);

    if (cosSim > maxCosine) {
      maxCosine = cosSim;
      minEuclidean = eucDist;
      
      // Verification condition: must exceed cosine threshold or be below Euclidean distance
      if (cosSim >= cosineThreshold && eucDist <= euclideanThreshold) {
        bestMatch = person;
      }
    }
  }

  // Convert Cosine Similarity range to a human-readable confidence percentage (95%+)
  const confidence = maxCosine > 0 
    ? Math.min(99.9, Math.max(50.0, 50.0 + (maxCosine * 50.0)))
    : 0;

  return {
    match: bestMatch,
    confidence,
    cosineSim: maxCosine,
    euclideanDist: minEuclidean
  };
};

/**
 * Generates a mock face embedding vector.
 * If targetPersonnel is provided, it generates a vector close to the target profile
 * (with added controlled Gaussian noise) to simulate a matching face scan.
 * Otherwise, it generates a random face embedding.
 */
export const generateFaceEmbeddingMock = (
  targetPersonnel?: Personnel,
  shouldMatch = true
): number[] => {
  if (targetPersonnel && shouldMatch) {
    // Generate embedding with tiny noise (highly similar, e.g. Cosine Similarity ~ 0.88-0.95)
    const base = targetPersonnel.faceEmbedding;
    const noisy = base.map(val => val + (Math.random() - 0.5) * 0.12);
    const mag = calculateMagnitude(noisy);
    return noisy.map(val => val / (mag || 1));
  } else if (targetPersonnel && !shouldMatch) {
    // Generate highly dissimilar embedding (e.g. Cosine Similarity ~ 0.1 - 0.3)
    const base = targetPersonnel.faceEmbedding;
    const noisy = base.map((val, i) => (i % 2 === 0 ? -val : val) + (Math.random() - 0.5) * 0.5);
    const mag = calculateMagnitude(noisy);
    return noisy.map(val => val / (mag || 1));
  }
  
  // Random new embedding for enrollment
  return generateUnitEmbedding(Math.random() * 1000);
};
