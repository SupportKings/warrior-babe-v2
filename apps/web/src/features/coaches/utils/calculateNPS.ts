/**
 * Calculate Net Promoter Score (NPS) from raw scores
 * 
 * NPS Scale:
 * - Detractors: 0-6
 * - Passives: 7-8
 * - Promoters: 9-10
 * 
 * Formula: NPS = % Promoters - % Detractors
 * Range: -100 to +100
 */

export interface NPSDistribution {
	detractors: number;
	passives: number;
	promoters: number;
}

export interface NPSResult {
	score: number; // -100 to +100
	distribution: NPSDistribution;
	percentages: {
		detractors: number;
		passives: number;
		promoters: number;
	};
	totalResponses: number;
}

/**
 * Calculate NPS from an array of scores (0-10)
 */
export function calculateNPSFromScores(scores: number[]): NPSResult {
	if (scores.length === 0) {
		return {
			score: 0,
			distribution: { detractors: 0, passives: 0, promoters: 0 },
			percentages: { detractors: 0, passives: 0, promoters: 0 },
			totalResponses: 0,
		};
	}

	const distribution: NPSDistribution = {
		detractors: 0,
		passives: 0,
		promoters: 0,
	};

	// Categorize each score
	scores.forEach((score) => {
		if (score <= 6) {
			distribution.detractors++;
		} else if (score <= 8) {
			distribution.passives++;
		} else {
			distribution.promoters++;
		}
	});

	const totalResponses = scores.length;

	// Calculate percentages
	const percentages = {
		detractors: (distribution.detractors / totalResponses) * 100,
		passives: (distribution.passives / totalResponses) * 100,
		promoters: (distribution.promoters / totalResponses) * 100,
	};

	// Calculate NPS score
	const npsScore = Math.round(percentages.promoters - percentages.detractors);

	return {
		score: npsScore,
		distribution,
		percentages,
		totalResponses,
	};
}

/**
 * Calculate NPS from a distribution of counts
 */
export function calculateNPSFromDistribution(distribution: NPSDistribution): NPSResult {
	const totalResponses = distribution.detractors + distribution.passives + distribution.promoters;

	if (totalResponses === 0) {
		return {
			score: 0,
			distribution,
			percentages: { detractors: 0, passives: 0, promoters: 0 },
			totalResponses: 0,
		};
	}

	// Calculate percentages
	const percentages = {
		detractors: (distribution.detractors / totalResponses) * 100,
		passives: (distribution.passives / totalResponses) * 100,
		promoters: (distribution.promoters / totalResponses) * 100,
	};

	// Calculate NPS score
	const npsScore = Math.round(percentages.promoters - percentages.detractors);

	return {
		score: npsScore,
		distribution,
		percentages,
		totalResponses,
	};
}

/**
 * Format NPS score for display
 */
export function formatNPSScore(score: number): string {
	if (score > 0) {
		return `+${score}`;
	}
	return score.toString();
}

/**
 * Get NPS rating category based on score
 */
export function getNPSCategory(score: number): "Excellent" | "Good" | "Needs Improvement" | "Critical" {
	if (score >= 70) return "Excellent";
	if (score >= 30) return "Good";
	if (score >= 0) return "Needs Improvement";
	return "Critical";
}