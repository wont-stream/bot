import type {
	ChatInputCommandInteraction,
	SlashCommandBuilder,
} from "discord.js";

export const addSubcommand = (data: SlashCommandBuilder) => {
	data.addSubcommand((cmd) =>
		cmd.setName("coinflip").setDescription("Flip a coin."),
	);
};
export const execute = async (interaction: ChatInputCommandInteraction) => {
	return await interaction.reply({
		content: `🪙 **${Math.round(Math.random()) ? "It's heads" : "It's tails"}**`,
	});
};
