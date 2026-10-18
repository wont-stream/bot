import {
	type ChatInputCommandInteraction,
	EmbedBuilder,
	type SlashCommandBuilder,
} from "discord.js";

export const addSubcommand = (data: SlashCommandBuilder) => {
	data.addSubcommand((cmd) =>
		cmd
			.setName("avatar")
			.setDescription("Show a user's avatar.")
			.addUserOption((option) =>
				option
					.setName("user")
					.setDescription("The user whose avatar you want. Defaults to you.")
					.setRequired(false),
			),
	);
};

export const execute = async (interaction: ChatInputCommandInteraction) => {
	const user = interaction.options.getUser("user", false) ?? interaction.user;

	const links = (["png", "jpg", "webp"] as const).map(
		(extension) =>
			`[${extension.toUpperCase()}](${user.displayAvatarURL({ extension, size: 4096 })})`,
	);

	const embed = new EmbedBuilder()
		.setTitle(`${user.globalName || user.username}'s Avatar`)
		.setDescription(links.join(" • "))
		.setImage(user.displayAvatarURL({ size: 1024 }));

	return await interaction.reply({ embeds: [embed] });
};
