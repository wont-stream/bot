import {
	type ChatInputCommandInteraction,
	EmbedBuilder,
	MessageFlags,
	type SlashCommandBuilder,
} from "discord.js";

const MAX_OPTIONS = 25;

const invalid = new EmbedBuilder()
	.setDescription(
		[
			"-# I need at least 2 options, separated by commas.",
			`-# Maximum: ${MAX_OPTIONS} options.`,
		].join("\n"),
	)
	.setColor("#800000");

export const addSubcommand = (data: SlashCommandBuilder) => {
	data.addSubcommand((cmd) =>
		cmd
			.setName("choose")
			.setDescription("Pick one option from a list.")
			.addStringOption((option) =>
				option
					.setName("options")
					.setDescription(
						"Options separated by commas, for example: pizza, tacos, sushi",
					)
					.setMaxLength(500)
					.setRequired(true),
			),
	);
};

export const execute = async (interaction: ChatInputCommandInteraction) => {
	const options = interaction.options
		.getString("options", true)
		.split(",")
		.map((option) => option.trim())
		.filter(Boolean);

	if (options.length < 2 || options.length > MAX_OPTIONS)
		return await interaction.reply({
			embeds: [invalid],
			flags: MessageFlags.Ephemeral,
		});

	const choice = options[Math.floor(Math.random() * options.length)];

	const embed = new EmbedBuilder()
		.setAuthor({ name: "I choose..." })
		.setDescription([`🤔 **${choice}**`,"","",`-# From: ${options.join(", ")}`].join("\n"))
		.setTimestamp();

	return await interaction.reply({ embeds: [embed] });
};
