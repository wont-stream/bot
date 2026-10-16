import { answers } from "./answers";

export const getResp = (question: string) => {
	const normalized = question.toLowerCase().trim();

	// Words that suggest a positive/hopeful question.
	const positiveWords = [
		"will",
		"can",
		"good",
		"success",
		"win",
		"work",
		"love",
		"happy",
		"pass",
		"yes",
		"best",
		"better",
		"help",
		"lucky",
	];

	// Words that suggest a negative/pessimistic question.
	const negativeWords = [
		"fail",
		"bad",
		"lose",
		"hate",
		"break",
		"wrong",
		"awful",
		"terrible",
		"no",
		"worst",
		"worse",
		"dead",
		"ruin",
		"failed",
	];

	const positive = positiveWords.reduce(
		(count, word) => count + (normalized.includes(word) ? 1 : 0),
		0,
	);

	const negative = negativeWords.reduce(
		(count, word) => count + (normalized.includes(word) ? 1 : 0),
		0,
	);

	const bias = positive - negative;

	let hash = 0;

	for (let i = 0; i < normalized.length; i++) {
		hash = (hash << 5) - hash + normalized.charCodeAt(i);
		hash |= 0;
	}

	// Convert the signed 32-bit hash into 0–1.
	const random = Math.abs(hash) / 2_147_483_647;

	const weightedAnswers = answers.map((answer) => {
		let weight = answer.weight;

		if (bias > 0 && answer.weight > 5) {
			weight *= 1 + Math.min(bias, 5) * 0.1;
		}

		if (bias < 0 && answer.weight < 5) {
			weight *= 1 + Math.min(Math.abs(bias), 5) * 0.1;
		}

		return {
			...answer,
			weight,
		};
	});

	const totalWeight = weightedAnswers.reduce(
		(total, answer) => total + answer.weight,
		0,
	);

	let value = random * totalWeight;

	for (const answer of weightedAnswers) {
		value -= answer.weight;

		if (value < 0) {
			return answer.text;
		}
	}

	return "You have 7 days left to live.";
};