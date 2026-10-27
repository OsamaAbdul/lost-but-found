import { Item, MatchCandidate, MatchScoreBreakdown } from '@/types';

export interface MatchingWeights {
  categoryWeight: number;      // default: 35
  textSimilarityWeight: number; // default: 30
  dateProximityWeight: number;  // default: 20
  locationWeight: number;       // default: 15
  minimumThreshold: number;     // default: 25
}

export const DEFAULT_MATCHING_WEIGHTS: MatchingWeights = {
  categoryWeight: 35,
  textSimilarityWeight: 30,
  dateProximityWeight: 20,
  locationWeight: 15,
  minimumThreshold: 25,
};

// Common English stopwords to ignore in text similarity
const STOPWORDS = new Set([
  'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from',
  'has', 'he', 'in', 'is', 'it', 'its', 'of', 'on', 'that', 'the',
  'to', 'was', 'were', 'will', 'with', 'my', 'i', 'found', 'lost',
  'item', 'left', 'near', 'some', 'this', 'there'
]);

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((word) => word.length > 2 && !STOPWORDS.has(word));
}

function calculateJaccardSimilarity(tokensA: string[], tokensB: string[]): { score: number; overlap: string[] } {
  if (tokensA.length === 0 || tokensB.length === 0) {
    return { score: 0, overlap: [] };
  }

  const setA = new Set(tokensA);
  const setB = new Set(tokensB);
  const intersection: string[] = [];

  for (const token of setA) {
    if (setB.has(token)) {
      intersection.push(token);
    }
  }

  const union = new Set([...tokensA, ...tokensB]);
  const score = union.size === 0 ? 0 : intersection.length / union.size;
  return { score, overlap: intersection };
}

function calculateDateProximityScore(dateStrA: string, dateStrB: string, maxPoints: number): { score: number; daysDiff: number } {
  try {
    const dateA = new Date(dateStrA).getTime();
    const dateB = new Date(dateStrB).getTime();
    const diffMs = Math.abs(dateA - dateB);
    const daysDiff = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (daysDiff === 0) return { score: maxPoints, daysDiff };
    if (daysDiff <= 2) return { score: Math.round(maxPoints * 0.8), daysDiff };
    if (daysDiff <= 5) return { score: Math.round(maxPoints * 0.6), daysDiff };
    if (daysDiff <= 10) return { score: Math.round(maxPoints * 0.35), daysDiff };
    if (daysDiff <= 21) return { score: Math.round(maxPoints * 0.15), daysDiff };
    return { score: 0, daysDiff };
  } catch {
    return { score: 0, daysDiff: 999 };
  }
}

/**
 * Evaluates match compatibility between a target item and a pool of opposite-type items.
 * Lost items match against Found items, and vice versa.
 */
export function calculateItemMatch(
  targetItem: Item,
  candidateItem: Item,
  weights: MatchingWeights = DEFAULT_MATCHING_WEIGHTS
): MatchScoreBreakdown {
  const explanation: string[] = [];

  // 1. Type validation: must be opposite types (lost vs found)
  const typeMatch = targetItem.type !== candidateItem.type;
  if (!typeMatch) {
    return {
      typeMatch: false,
      categoryScore: 0,
      textSimilarityScore: 0,
      dateProximityScore: 0,
      locationScore: 0,
      totalScore: 0,
      explanation: ['Items have the same reporting type (cannot match lost with lost or found with found).'],
    };
  }

  // 2. Category Match
  let categoryScore = 0;
  if (targetItem.category.toLowerCase() === candidateItem.category.toLowerCase()) {
    categoryScore = weights.categoryWeight;
    explanation.push(`Exact category match: "${targetItem.category}" (+${categoryScore} pts)`);
  } else {
    explanation.push(`Categories do not match: "${targetItem.category}" vs "${candidateItem.category}" (0 pts)`);
  }

  // 3. Text Similarity (Title & Description)
  const targetTokens = tokenize(`${targetItem.title} ${targetItem.description}`);
  const candidateTokens = tokenize(`${candidateItem.title} ${candidateItem.description}`);
  const textSim = calculateJaccardSimilarity(targetTokens, candidateTokens);
  
  // Scale text similarity to weight
  const textSimilarityScore = Math.round(Math.min(1, textSim.score * 2.5) * weights.textSimilarityWeight);
  if (textSim.overlap.length > 0) {
    explanation.push(
      `Shared keywords (${textSim.overlap.slice(0, 5).join(', ')}): (+${textSimilarityScore} pts)`
    );
  } else {
    explanation.push('No significant shared descriptive keywords (0 pts)');
  }

  // 4. Date Proximity
  const dateResult = calculateDateProximityScore(
    targetItem.incident_date,
    candidateItem.incident_date,
    weights.dateProximityWeight
  );
  const dateProximityScore = dateResult.score;
  explanation.push(
    `Incident dates are ${dateResult.daysDiff} day(s) apart (${targetItem.incident_date} vs ${candidateItem.incident_date}) (+${dateProximityScore} pts)`
  );

  // 5. Location Similarity
  const targetLocTokens = tokenize(targetItem.location);
  const candidateLocTokens = tokenize(candidateItem.location);
  const locSim = calculateJaccardSimilarity(targetLocTokens, candidateLocTokens);
  const locationScore = Math.round(Math.min(1, locSim.score * 2.0) * weights.locationWeight);
  
  if (locSim.overlap.length > 0) {
    explanation.push(
      `Location overlap (${locSim.overlap.join(', ')}): (+${locationScore} pts)`
    );
  } else {
    explanation.push(`Different locations specified (${targetItem.location} vs ${candidateItem.location}) (0 pts)`);
  }

  const totalScore = Math.min(100, categoryScore + textSimilarityScore + dateProximityScore + locationScore);

  return {
    typeMatch: true,
    categoryScore,
    textSimilarityScore,
    dateProximityScore,
    locationScore,
    totalScore,
    explanation,
  };
}

/**
 * Searches for all viable matches for an item from a list of candidate items,
 * returning candidates sorted by matching score descending.
 */
export function findMatchesForItem(
  targetItem: Item,
  allCandidates: Item[],
  weights: MatchingWeights = DEFAULT_MATCHING_WEIGHTS
): MatchCandidate[] {
  const matches: MatchCandidate[] = [];

  for (const candidate of allCandidates) {
    if (candidate.id === targetItem.id) continue;
    // Don't match with archived or returned items
    if (candidate.status === 'archived' || candidate.status === 'returned') continue;

    const breakdown = calculateItemMatch(targetItem, candidate, weights);
    if (breakdown.totalScore >= weights.minimumThreshold) {
      matches.push({
        item: candidate,
        score: breakdown.totalScore,
        breakdown,
      });
    }
  }

  return matches.sort((a, b) => b.score - a.score);
}
