import {
	type ChatInputCommandInteraction,
	EmbedBuilder,
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

	const embed = new EmbedBuilder()
		.setColor("#00ffb2");

	if (user.id === "1383584342105919559") {
		embed.setDescription("Oh please, you don't even need to ask.").setFooter({ text: "🏳️‍🌈🏳️‍🌈🏳️‍🌈" })
		
		return await interaction.reply({
			embeds: [embed]
		});
	}

	embed.setDescription(`🏳️‍🌈 ${userMention(user.id)} is **${Math.round(Number.parseFloat(`0.${user.id}`)) ? "gay" : "not gay"}**.`)
	
	return await interaction.reply({
		embeds: [embed]
	});
};
