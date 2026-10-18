import {
	type ChatInputCommandInteraction,
	EmbedBuilder,
	MessageFlags,
	type SlashCommandBuilder,
	TimestampStyles,
	time,
	userMention,
} from "discord.js";
import { guildOnly } from "../../util/errors/guildOnly";

export const addSubcommand = (data: SlashCommandBuilder) => {
	data.addSubcommand((cmd) =>
		cmd
			.setName("serverinfo")
			.setDescription("Show information about this server."),
	);
};

export const execute = async (interaction: ChatInputCommandInteraction) => {
	const guildCommand = guildOnly(interaction);
	const { guild } = interaction;
	if (guildCommand || !guild)
		return await interaction.reply({
			embeds: [guildCommand || new EmbedBuilder()],
			flags: MessageFlags.Ephemeral,
		});

	const embed = new EmbedBuilder()
		.setTitle(guild.name)
		.setThumbnail(guild.iconURL({ size: 512 }))
		.addFields(
			{ name: "Owner", value: userMention(guild.ownerId), inline: true },
			{
				name: "Members",
				value: guild.memberCount.toLocaleString(),
				inline: true,
			},
			{
				name: "Channels",
				value: String(guild.channels.cache.size),
				inline: true,
			},
			{ name: "Roles", value: String(guild.roles.cache.size), inline: true },
			{
				name: "Boosts",
				value: `${guild.premiumSubscriptionCount ?? 0} (Tier ${guild.premiumTier})`,
				inline: true,
			},
			{
				name: "Created",
				value: `${time(guild.createdAt, TimestampStyles.LongDateTime)}\n${time(guild.createdAt, TimestampStyles.RelativeTime)}`,
			},
		)
		.setFooter({ text: `ID: ${guild.id}` });

	return await interaction.reply({ embeds: [embed] });
};
