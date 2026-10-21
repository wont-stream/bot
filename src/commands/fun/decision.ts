import {
	type ChatInputCommandInteraction,
	EmbedBuilder,
	type SlashCommandBuilder,
} from "discord.js";

type Answer = "yes" | "no" | "maybe";

interface Decision {
	answer: Answer;
	image: string | null;
	fallback: boolean;
}

const API_URL = "https://yesno.wtf/api";
const API_TIMEOUT_MS = 5000;
const FALLBACK_MAYBE_CHANCE = 0.01;

const COLORS: Record<Answer, `#${string}`> = {
	yes: "#57f287",
	no: "#ed4245",
	maybe: "#fee75c",
};

const isAnswer = (value: unknown): value is Answer =>
	value === "yes" || value === "no" || value === "maybe";

const fallbackDecision = (): Decision => {
	const roll = Math.random();
	const answer: Answer =
		roll < FALLBACK_MAYBE_CHANCE ? "maybe" : roll < 0.505 ? "yes" : "no";
	return { answer, image: null, fallback: true };
};

const getDecision = async (): Promise<Decision> => {
	try {
		const response = await fetch(API_URL, {
			signal: AbortSignal.timeout(API_TIMEOUT_MS),
		});
		if (!response.ok) return fallbackDecision();

		const data = (await response.json()) as {
			answer?: unknown;
			image?: unknown;
		};
		if (!isAnswer(data.answer)) return fallbackDecision();

		// Only accept images from yesno.wtf.
		const image =
			typeof data.image === "string" &&
			data.image.startsWith("https://yesno.wtf/")
				? data.image
				: null;

		return { answer: data.answer, image, fallback: false };
	} catch {
		return fallbackDecision();
	}
};

export const addSubcommand = (data: SlashCommandBuilder) => {
	data.addSubcommand((cmd) =>
		cmd
			.setName("decision")
			.setDescription("Let fate decide: yes, no, or maybe.")
			.addStringOption((option) =>
				option
					.setName("question")
					.setDescription("The question you want answered.")
					.setMaxLength(200)
					.setRequired(false),
			),
	);
};

export const execute = async (interaction: ChatInputCommandInteraction) => {
	const question = interaction.options.getString("question", false)?.trim();

	await interaction.deferReply();

	const decision = await getDecision();

	const embed = new EmbedBuilder()
		.setTitle(decision.answer.toUpperCase())
		.setColor(COLORS[decision.answer]);

	if (question) embed.setDescription(`**${question}**`);
	if (decision.image) embed.setImage(decision.image);
	if (decision.fallback)
		embed.setFooter({ text: "Offline mode: local answer" });

	return await interaction.editReply({ embeds: [embed] });
};
