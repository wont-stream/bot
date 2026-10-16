import type {
	ChatInputCommandInteraction,
	SlashCommandBuilder,
} from "discord.js";
import { getResp } from "../../util/8ball";

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

export const execute = async (interaction: ChatInputCommandInteraction) => {
	const question = interaction.options.getString("question", true);
	const response = getResp(question);

	return await interaction.reply({
		content: `🎱 **${question}**\n\n> **${response}**`,
	});
};
