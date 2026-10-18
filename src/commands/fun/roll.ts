import {
	type ChatInputCommandInteraction,
	EmbedBuilder,
	MessageFlags,
	type SlashCommandBuilder,
} from "discord.js";

const DICE_PATTERN = /^(\d{1,2})d(\d{1,4})([+-]\d{1,4})?$/i;

const invalid = new EmbedBuilder()
	.setDescription(
		[
			"-# Invalid dice format.",
			"-# Use `NdM` with an optional modifier, for example `2d6` or `1d20+3`.",
			"-# Limits: 1-20 dice, 2-1000 sides.",
		].join("\n"),
	)
	.setColor("#800000");

export const addSubcommand = (data: SlashCommandBuilder) => {
	data.addSubcommand((cmd) =>
		cmd
			.setName("roll")
			.setDescription("Roll dice, for example 2d6 or 1d20+3.")
			.addStringOption((option) =>
				option
					.setName("dice")
					.setDescription("Dice to roll. Defaults to 1d6.")
					.setMaxLength(12)
					.setRequired(false),
			),
	);
};

export const execute = async (interaction: ChatInputCommandInteraction) => {
	const input = (interaction.options.getString("dice", false) ?? "1d6")
		.replace(/\s/g, "")
		.toLowerCase();

	const match = DICE_PATTERN.exec(input);
	if (!match)
		return await interaction.reply({
			embeds: [invalid],
			flags: MessageFlags.Ephemeral,
		});

	const count = Number(match[1]);
	const sides = Number(match[2]);
	const modifier = Number(match[3] ?? 0);

	if (count < 1 || count > 20 || sides < 2 || sides > 1000)
		return await interaction.reply({
			embeds: [invalid],
			flags: MessageFlags.Ephemeral,
		});

	const rolls = Array.from(
		{ length: count },
		() => Math.floor(Math.random() * sides) + 1,
	);
	const total = rolls.reduce((a, b) => a + b, 0) + modifier;

	const lines = [`🎲 **${input}**`, "", `**Rolls:** ${rolls.join(", ")}`];
	if (modifier)
		lines.push(`**Modifier:** ${modifier > 0 ? "+" : ""}${modifier}`);
	lines.push(`**Total:** ${total}`);

	const embed = new EmbedBuilder()
		.setDescription(lines.join("\n"))
		.setColor("#ffffff");

	return await interaction.reply({ embeds: [embed] });
};
