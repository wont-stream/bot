import {
	type ChatInputCommandInteraction,
	type SlashCommandBuilder,
	userMention,
} from "discord.js";
export const addSubcommand = (data: SlashCommandBuilder) => {
	data.addSubcommand((cmd) =>
		cmd
			.setName("isgay")
			.setDescription("Flip a coin.")
			.addUserOption((option) =>
				option
					.setName("user")
					.setDescription("The user you wanna question")
					.setRequired(true),
			),
	);
};
export const execute = async (interaction: ChatInputCommandInteraction) => {
	const user = interaction.options.getUser("user", true);
	if (user.id === "1383584342105919559") {
		return await interaction.reply({
			content: "Oh please you even don't need to ask me. 🏳️‍🌈🏳️‍🌈🏳️‍🌈",
		});
	}
	return await interaction.reply({
		content: `🏳️‍🌈 ${userMention(user.id)} is **${Math.round(Number.parseFloat(`0.${user.id}`)) ? "gay" : "not gay"}**.`,
	});
};
