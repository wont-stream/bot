import {
	EmbedBuilder,
	type ChatInputCommandInteraction,
	type SlashCommandBuilder,
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

	const embed = new EmbedBuilder()
		.setAuthor({
			name: "The results are in 👀",
		})
		.setDescription(`🎱 **${question}**\n\n🔮 **${response}**`)
		.setTimestamp();

	return await interaction.reply({
		embeds: [embed]
	});
};
