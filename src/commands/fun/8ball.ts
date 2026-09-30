import type {
	ChatInputCommandInteraction,
	SlashCommandBuilder,
} from "discord.js";

export const addSubcommand = (data: SlashCommandBuilder) => {
	data.addSubcommand((cmd) =>
		cmd
			.setName("8ball")
			.setDescription("Shake the magic 8ball")
			.addStringOption((option) =>
				option
					.setName("question")
					.setDescription("Ask the magic 8-ball a question")
					.setRequired(true),
			),
	);
};
const answers = [
	// Very positive
	{ text: "It is certain", weight: 10 },
	{ text: "It is decidedly so", weight: 10 },
	{ text: "Without a doubt", weight: 10 },
	{ text: "Yes definitely", weight: 9 },
	{ text: "You may rely on it", weight: 9 },
	{ text: "As I see it, yes", weight: 9 },
	{ text: "Most likely", weight: 8 },
	{ text: "Outlook good", weight: 8 },
	{ text: "Signs point to yes", weight: 8 },
	{ text: "Absolutely", weight: 8 },
	{ text: "It is inevitable", weight: 7 },
	{ text: "Positive", weight: 7 },
	{ text: "The odds are in your favor", weight: 7 },
	{ text: "Highly probable", weight: 7 },
	{ text: "Yes, indeed", weight: 6 },
	{ text: "Almost certainly", weight: 6 },
	{ text: "It appears so", weight: 6 },
	{ text: "Yes", weight: 6 },

	// Neutral
	{ text: "Ask again later", weight: 5 },
	{ text: "Better not tell you now", weight: 5 },
	{ text: "Cannot predict now", weight: 5 },
	{ text: "Concentrate and ask again", weight: 5 },
	{ text: "The stars are clouded", weight: 5 },
	{ text: "Unclear for now", weight: 5 },
	{ text: "Wait and see", weight: 5 },

	// Negative
	{ text: "Don't count on it", weight: 4 },
	{ text: "My reply is no", weight: 4 },
	{ text: "My sources say no", weight: 4 },
	{ text: "Outlook not so good", weight: 4 },
	{ text: "Very doubtful", weight: 4 },
	{ text: "Computer says no", weight: 3 },
	{ text: "Nope", weight: 3 },
	{ text: "Highly unlikely", weight: 3 },
	{ text: "Prospects look grim", weight: 3 },
	{ text: "Definitely not", weight: 3 },
	{ text: "Not in a million years", weight: 2 },
	{ text: "Negative", weight: 2 },
	{ text: "Out of the question", weight: 2 },
	{ text: "The answer is no", weight: 2 },
	{ text: "Dream on", weight: 1 },
];

const getResp = (question: string) => {
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

export const execute = async (interaction: ChatInputCommandInteraction) => {
	const question = interaction.options.getString("question", true);
	const response = getResp(question);

	return await interaction.reply({
		content: `🎱 **${question}**\n\n> **${response}**`,
	});
};
