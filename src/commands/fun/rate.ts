import {
	type ChatInputCommandInteraction,
	EmbedBuilder,
	type SlashCommandBuilder,
} from "discord.js";

// Simple djb2 hash. The same input always gives the same rating.
const hash = (input: string) => {
	let value = 5381;
	for (const char of input) {
		value = ((value << 5) + value + char.charCodeAt(0)) >>> 0;
	}
	return value;
};

export const addSubcommand = (data: SlashCommandBuilder) => {
	data.addSubcommand((cmd) =>
		cmd
			.setName("rate")
			.setDescription("Rate anything from 1 to 10.")
			.addStringOption((option) =>
				option
					.setName("thing")
					.setDescription("What should I rate?")
					.setMaxLength(100)
					.setRequired(true),
			),
	);
};

export const execute = async (interaction: ChatInputCommandInteraction) => {
	const thing = interaction.options.getString("thing", true).trim();
	const rating = (hash(thing.toLowerCase()) % 10) + 1;

	const embed = new EmbedBuilder()
		.setDescription(`⭐ I rate **${thing}** a **${rating}/10**.`)
		.setColor("#ffd700");

	return await interaction.reply({ embeds: [embed] });
};
