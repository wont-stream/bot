import {
	type ChatInputCommandInteraction,
	EmbedBuilder,
	type SlashCommandBuilder,
	version,
} from "discord.js";

const sum = (values: unknown[]) =>
	values.reduce<number>((total, value) => total + Number(value), 0);

export const addSubcommand = (data: SlashCommandBuilder) => {
	data.addSubcommand((cmd) =>
		cmd.setName("botinfo").setDescription("Show information about the bot."),
	);
};

export const execute = async (interaction: ChatInputCommandInteraction) => {
	const { client } = interaction;

	await interaction.deferReply();

	const countMembers = (c: typeof client) =>
		c.guilds.cache.reduce((total, guild) => total + guild.memberCount, 0);

	const [guilds, users] = client.shard
		? await Promise.all([
				client.shard.fetchClientValues("guilds.cache.size"),
				client.shard.broadcastEval((c) =>
					c.guilds.cache.reduce((total, guild) => total + guild.memberCount, 0),
				),
			])
		: [[client.guilds.cache.size], [countMembers(client)]];

	const startedAt = Math.floor((Date.now() - (client.uptime ?? 0)) / 1000);
	const memory = (process.memoryUsage().rss / 1024 / 1024).toFixed(1);

	const embed = new EmbedBuilder()
		.setTitle(client.user.username)
		.setThumbnail(client.user.displayAvatarURL({ size: 512 }))
		.addFields(
			{ name: "Servers", value: sum(guilds).toLocaleString(), inline: true },
			{ name: "Users", value: sum(users).toLocaleString(), inline: true },
			{
				name: "Shards",
				value: String(client.shard?.count ?? 1),
				inline: true,
			},
			{ name: "Online Since", value: `<t:${startedAt}:R>`, inline: true },
			{ name: "Memory (this shard)", value: `${memory} MB`, inline: true },
			{
				name: "Runtime",
				value: `Bun ${Bun.version}\ndiscord.js v${version}`,
				inline: true,
			},
		)
		.setTimestamp();

	return await interaction.editReply({ embeds: [embed] });
};
