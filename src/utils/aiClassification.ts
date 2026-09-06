// AI Classification Utilities for NagarSetu
// Classification is driven purely by the user's description text.
// Image URL hints are only used for the pre-seeded external URLs — never for blob: URLs.

export interface AIAnalysisResult {
  primaryIssue: string;
  confidence: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
  severity: number;
  suggestedDepartment: string;
  suggestedDeptCode: string;
  urgencyScore: number;
  riskFactors: string[];
  estimatedResolutionTime: string;
  keywords: string[];
}

export interface LocationContext {
  district: string;
  ward: string;
  coordinates: { lat: number; lng: number };
  nearbyLandmarks?: string[];
  trafficLevel?: 'low' | 'medium' | 'high';
  populationDensity?: 'low' | 'medium' | 'high';
}

// ── Issue patterns covering all 9 departments ─────────────────────────────────
const issuePatterns: Record<string, {
  // Primary keywords (strong signal — phrase-level matches)
  keywords: string[];
  // Secondary single-word hints (weaker signal)
  hints: string[];
  // Only used for pre-seeded external image URLs (never blob:)
  imageHints: string[];
  riskFactors: string[];
  department: string;
  deptCode: string;
  baseUrgency: number;
  resolutionTime: string;
}> = {
  road: {
    keywords: ['pothole', 'broken road', 'road damage', 'road crack', 'speed breaker', 'road repair', 'road hole', 'bad road', 'road condition'],
    hints: ['road', 'asphalt', 'pavement', 'divider', 'footpath', 'tarmac', 'crater', 'bump'],
    imageHints: ['pothole', 'road', 'asphalt', 'pavement'],
    riskFactors: ['vehicle damage', 'accident risk', 'traffic congestion'],
    department: 'Public Works Department',
    deptCode: 'PWD',
    baseUrgency: 6,
    resolutionTime: '3-5 days',
  },
  garbage: {
    keywords: ['garbage', 'waste', 'trash', 'garbage bin', 'overflowing bin', 'garbage dump', 'waste dump', 'litter', 'rubbish', 'filth', 'kachra', 'scrap'],
    hints: ['dump', 'bins', 'smell', 'stench', 'foul', 'pile', 'heap', 'collection', 'refuse'],
    imageHints: ['garbage', 'waste', 'trash', 'dump', 'litter'],
    riskFactors: ['health hazard', 'pest attraction', 'odor'],
    department: 'Municipal Solid Waste Mgmt',
    deptCode: 'MSWM',
    baseUrgency: 4,
    resolutionTime: '1-2 days',
  },
  water: {
    keywords: ['water supply', 'no water', 'water leak', 'pipe leak', 'water pipe', 'burst pipe', 'water contamination', 'dirty water', 'water board', 'water problem'],
    hints: ['water', 'pipe', 'leakage', 'supply', 'pressure', 'contamination', 'pipeline'],
    imageHints: ['water', 'pipe', 'leak', 'pipeline'],
    riskFactors: ['health risk', 'wastage', 'property damage'],
    department: 'Municipal Water Board',
    deptCode: 'MVB',
    baseUrgency: 7,
    resolutionTime: '1-3 days',
  },
  streetlight: {
    keywords: ['street light', 'streetlight', 'light not working', 'broken light', 'light pole', 'no lighting', 'dark road', 'light bulb', 'lamp post'],
    hints: ['lamp', 'pole', 'bulb', 'dark', 'night', 'light'],
    imageHints: ['streetlight', 'lamp', 'light', 'pole'],
    riskFactors: ['safety concern', 'crime risk', 'poor visibility'],
    department: 'Urban Street Light Department',
    deptCode: 'USLD',
    baseUrgency: 5,
    resolutionTime: '2-3 days',
  },
  drainage: {
    keywords: ['drainage', 'drain blocked', 'waterlogging', 'water logging', 'flooding road', 'blocked drain', 'clogged drain', 'nali', 'nala', 'stagnant water', 'road flooding'],
    hints: ['drain', 'flood', 'blocked', 'clog', 'overflow', 'gutter', 'waterlog'],
    imageHints: ['drainage', 'drain', 'flood', 'waterlog', 'nali'],
    riskFactors: ['flooding risk', 'disease breeding', 'property damage'],
    department: 'Drainage & Sewage Department',
    deptCode: 'DRAIN',
    baseUrgency: 8,
    resolutionTime: '1-2 days',
  },
  electricity: {
    keywords: ['power cut', 'no electricity', 'electricity problem', 'transformer fault', 'electric wire', 'live wire', 'power outage', 'short circuit', 'electrical fault', 'sparking wire'],
    hints: ['electricity', 'electric', 'power', 'transformer', 'wire', 'cable', 'current', 'shock', 'outage', 'sparking'],
    imageHints: ['electric', 'power', 'transformer', 'wire', 'cable', 'spark'],
    riskFactors: ['electrocution risk', 'fire hazard', 'power outage'],
    department: 'Electricity Department',
    deptCode: 'ELECT',
    baseUrgency: 8,
    resolutionTime: '1-2 days',
  },
  fire: {
    keywords: ['fire', 'burning', 'on fire', 'smoke', 'blaze', 'fire hazard', 'fire accident', 'chemical fire', 'gas leak fire'],
    hints: ['flame', 'fumes', 'arson', 'inferno'],
    imageHints: ['fire', 'burn', 'smoke', 'flame', 'blaze'],
    riskFactors: ['life threatening', 'property destruction', 'toxic fumes'],
    department: 'Fire & Emergency Services',
    deptCode: 'FIRE',
    baseUrgency: 10,
    resolutionTime: 'Immediate',
  },
  sewage: {
    keywords: ['sewage', 'sewer', 'raw sewage', 'sewage overflow', 'sewage pipe', 'manhole overflow', 'septic tank', 'sewer blockage'],
    hints: ['manhole', 'septic', 'toilet', 'foul smell'],
    imageHints: ['sewage', 'sewer', 'manhole', 'septic'],
    riskFactors: ['health emergency', 'disease spread', 'contamination'],
    department: 'Sewage Treatment Department',
    deptCode: 'SEWAGE',
    baseUrgency: 9,
    resolutionTime: '1 day',
  },
  animal: {
    keywords: ['stray dog', 'stray dogs', 'dog attack', 'dog bite', 'stray cattle', 'stray cow', 'animal menace', 'monkey menace', 'stray animal', 'rabies', 'dog nuisance'],
    hints: ['dog', 'stray', 'animal', 'cattle', 'cow', 'bite', 'attack', 'monkey', 'pig', 'buffalo'],
    imageHints: ['dog', 'stray', 'animal', 'cattle', 'cow', 'monkey'],
    riskFactors: ['bite risk', 'traffic hazard', 'disease transmission'],
    department: 'Animal Control & Welfare Dept',
    deptCode: 'ANIMAL',
    baseUrgency: 7,
    resolutionTime: '1-2 days',
  },
};

// ── Scoring ────────────────────────────────────────────────────────────────────
// Returns score for a type against description text only.
// Image URL hints are only applied when the URL is NOT a blob: URL.
function scoreType(
  type: string,
  descText: string,
  imageUrl: string,
): number {
  const p = issuePatterns[type];
  if (!p) return 0;

  let score = 0;

  // Primary keywords: full phrase match → 4 pts each
  for (const kw of p.keywords) {
    if (descText.includes(kw)) score += 4;
  }

  // Secondary hints: single word match → 1 pt each
  for (const hint of p.hints) {
    if (descText.includes(hint)) score += 1;
  }

  // Image URL hints: only for non-blob URLs (pre-seeded data)
  const isBlob = imageUrl.startsWith('blob:') || imageUrl.startsWith('data:');
  if (!isBlob) {
    const urlLower = imageUrl.toLowerCase();
    for (const hint of p.imageHints) {
      if (urlLower.includes(hint)) score += 2;
    }
  }

  return score;
}

// ── Main export ────────────────────────────────────────────────────────────────
export function analyzeImage(
  imageUrl: string,
  description: string,
  _location: LocationContext,
): AIAnalysisResult | null {
  const text = description.trim().toLowerCase();

  // ── Require at least a few characters of description ──────────────────────
  // Don't guess when there's nothing to go on — return null so the UI can show
  // "Add a description so AI can classify your issue" instead of a wrong result.
  if (text.length < 5) return null;

  // Score every type
  const scores: Record<string, number> = {};
  let highestScore = 0;

  for (const type of Object.keys(issuePatterns)) {
    scores[type] = scoreType(type, text, imageUrl);
    if (scores[type] > highestScore) highestScore = scores[type];
  }

  // If nothing matched at all even with text, we still can't confidently classify
  if (highestScore === 0) return null;

  // Pick the best matching type (highest score)
  const bestType = Object.keys(scores).reduce(
    (best, type) => scores[type] > scores[best] ? type : best,
    Object.keys(scores)[0],
  );

  const pattern = issuePatterns[bestType];

  // Confidence proportional to score, capped at 97
  const maxPossible = pattern.keywords.length * 4 + pattern.hints.length;
  const rawConf = Math.min(60 + (highestScore / Math.max(maxPossible, 1)) * 37, 97);
  const confidence = Math.floor(rawConf);

  // Urgency
  let urgencyScore = pattern.baseUrgency;
  if (text.includes('school'))   urgencyScore += 2;
  if (text.includes('hospital')) urgencyScore += 3;
  if (text.includes('market'))   urgencyScore += 1;
  urgencyScore = Math.min(urgencyScore, 10);

  let priority: 'low' | 'medium' | 'high' | 'critical';
  if (urgencyScore >= 9) priority = 'critical';
  else if (urgencyScore >= 7) priority = 'high';
  else if (urgencyScore >= 4) priority = 'medium';
  else priority = 'low';

  const matchedKeywords = [
    ...pattern.keywords.filter(kw => text.includes(kw)),
    ...pattern.hints.filter(h => text.includes(h)),
  ].slice(0, 5);

  return {
    primaryIssue: bestType.charAt(0).toUpperCase() + bestType.slice(1),
    confidence,
    priority,
    severity: urgencyScore,
    suggestedDepartment: pattern.department,
    suggestedDeptCode: pattern.deptCode,
    urgencyScore,
    riskFactors: pattern.riskFactors,
    estimatedResolutionTime: pattern.resolutionTime,
    keywords: matchedKeywords.length > 0 ? matchedKeywords : [bestType],
  };
}

export function calculatePriorityScore(
  issueType: string,
  severity: number,
  location: LocationContext,
  timeOfDay: number = new Date().getHours(),
): number {
  let score = severity;
  if (timeOfDay >= 22 || timeOfDay <= 6) {
    if (issueType === 'streetlight' || issueType === 'drainage') score += 2;
  }
  if (location.trafficLevel === 'high') score += 1;
  if (location.populationDensity === 'high') score += 1;
  return Math.min(score, 10);
}

export function generateInsights(reports: { status: string; type: string; ward: string }[]): {
  totalReports: number;
  resolvedPercentage: number;
  averageResolutionTime: string;
  topIssueTypes: Array<{ type: string; count: number; trend: 'up' | 'down' | 'stable' }>;
  criticalAreas: Array<{ ward: string; issueCount: number }>;
} {
  const totalReports = reports.length;
  const resolvedReports = reports.filter(r => r.status === 'resolved').length;
  const resolvedPercentage = totalReports > 0
    ? Math.floor((resolvedReports / totalReports) * 100) : 0;

  const issueTypeCounts = reports.reduce((acc, r) => {
    acc[r.type] = (acc[r.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topIssueTypes = Object.entries(issueTypeCounts)
    .map(([type, count]) => ({
      type, count,
      trend: (Math.random() > 0.5 ? 'up' : Math.random() > 0.5 ? 'down' : 'stable') as 'up' | 'down' | 'stable',
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const wardCounts = reports.reduce((acc, r) => {
    acc[r.ward] = (acc[r.ward] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const criticalAreas = Object.entries(wardCounts)
    .map(([ward, issueCount]) => ({ ward, issueCount }))
    .sort((a, b) => b.issueCount - a.issueCount)
    .slice(0, 3);

  return {
    totalReports,
    resolvedPercentage,
    averageResolutionTime: '2.3 days',
    topIssueTypes,
    criticalAreas,
  };
}
