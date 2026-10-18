import {
	type ChatInputCommandInteraction,
	EmbedBuilder,
	GuildMember,
	type SlashCommandBuilder,
	TimestampStyles,
	time,
} from "discord.js";

const formatBadge = (name: string) => name.replace(/([a-z0-9])([A-Z])/g, "$1 $2");

export const addSubcommand = (data: SlashCommandBuilder) => {
	data.addSubcommand((cmd) =>
		cmd
			.setName("userinfo")
			.setDescription("Show information about a user.")
			.addUserOption((option) =>
				option
					.setName("user")
					.setDescription("The user you want to look up. Defaults to you.")
					.setRequired(false),
			),
	);
};

export const execute = async (interaction: ChatInputCommandInteraction) => {
	const target = interaction.options.getUser("user", false) ?? interaction.user;

	await interaction.deferReply();

	// Fetch is REQUIRED to get the banner and accent color.
	const user = await target.fetch().catch(() => target);

	const member =
		target.id === interaction.user.id
			? interaction.member
			: interaction.options.getMember("user");

	const badges = user.flags?.toArray().map(formatBadge) ?? [];

	const embed = new EmbedBuilder()
		.setTitle(`${user.globalName || user.username}`)
		.setURL(`https://discord.com/users/${user.id}`)
		.setThumbnail(user.displayAvatarURL({ size: 512 }))
		.setColor(user.accentColor ?? null)
		.addFields(
			{ name: "Username", value: user.username, inline: true },
			{ name: "ID", value: user.id, inline: true },
			{ name: "Bot", value: user.bot ? "Yes" : "No", inline: true },
			{
				name: "Account Created",
				value: `${time(user.createdAt, TimestampStyles.LongDateTime)}\n${time(user.createdAt, TimestampStyles.RelativeTime)}`,
			},
		);

	if (member instanceof GuildMember && member.joinedAt) {
		embed.addFields(
			{
				name: "Joined Server",
				value: `${time(member.joinedAt, TimestampStyles.LongDateTime)}\n${time(member.joinedAt, TimestampStyles.RelativeTime)}`,
			},
			{
				name: "Roles",
				value: String(Math.max(member.roles.cache.size - 1, 0)),
				inline: true,
			},
		);
	}

	if (badges.length) {
		embed.addFields({ name: "Badges", value: badges.join(", ") });
	}

	const banner = user.bannerURL({ size: 1024 });
	if (banner) embed.setImage(banner);

	return await interaction.editReply({ embeds: [embed] });
};
