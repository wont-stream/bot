import {
	type ChatInputCommandInteraction,
	EmbedBuilder,
	type SlashCommandBuilder,
} from "discord.js";

type Source = "whatthecommit" | "local repo" | "default";

interface CommitMessage {
	message: string;
	source: Source;
}

const API_URL = "https://whatthecommit.com/index.txt";
const API_TIMEOUT_MS = 5000;
const MAX_LOCAL_COMMITS = 500;
const MAX_LENGTH = 500;
const LAST_RESORT = "fix stuff";

const clean = (text: string) =>
	text.replaceAll("```", "'''").trim().slice(0, MAX_LENGTH);

const fromApi = async (): Promise<string | null> => {
	try {
		const response = await fetch(API_URL, {
			signal: AbortSignal.timeout(API_TIMEOUT_MS),
		});
		if (!response.ok) return null;

		const message = clean(await response.text());
		return message || null;
	} catch {
		return null;
	}
};

const fromLocalRepo = async (): Promise<string | null> => {
	try {
		const output = await Bun.$`git log --pretty=format:%s -n ${MAX_LOCAL_COMMITS}`
			.quiet()
			.text();

		const messages = output
			.split("\n")
			.map((line) => clean(line))
			.filter(Boolean);
		if (!messages.length) return null;

		return messages[Math.floor(Math.random() * messages.length)] ?? null;
	} catch {
		return null;
	}
};

const getCommitMessage = async (): Promise<CommitMessage> => {
	const api = await fromApi();
	if (api) return { message: api, source: "whatthecommit" };

	const local = await fromLocalRepo();
	if (local) return { message: local, source: "local repo" };

	return { message: LAST_RESORT, source: "default" };
};

export const addSubcommand = (data: SlashCommandBuilder) => {
	data.addSubcommand((cmd) =>
		cmd.setName("commit").setDescription("Get a random git commit message."),
	);
};

export const execute = async (interaction: ChatInputCommandInteraction) => {
	await interaction.deferReply();

	const { message, source } = await getCommitMessage();

	const embed = new EmbedBuilder()
		.setDescription(`\`\`\`\ngit commit -m "${message.replaceAll('"', "'")}"\n\`\`\``)
		.setFooter({ text: `Source: ${source}` });

	return await interaction.editReply({ embeds: [embed] });
};