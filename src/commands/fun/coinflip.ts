import {
	type ChatInputCommandInteraction,
	EmbedBuilder,
	type SlashCommandBuilder,
} from "discord.js";

export const addSubcommand = (data: SlashCommandBuilder) => {
	data.addSubcommand((cmd) =>
		cmd.setName("coinflip").setDescription("Flip a coin."),
	);
};
export const execute = async (interaction: ChatInputCommandInteraction) => {
	const embed = new EmbedBuilder()
		.setDescription(
			`🪙 **${Math.round(Math.random()) ? "It's heads" : "It's tails"}**`,
		)
		.setColor("#ffff00");

	return await interaction.reply({
		embeds: [embed],
	});
};
