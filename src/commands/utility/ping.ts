import {
	type ChatInputCommandInteraction,
	EmbedBuilder,
	MessageFlags,
	type SlashCommandBuilder,
} from "discord.js";

export const addSubcommand = (data: SlashCommandBuilder) => {
	data.addSubcommand((cmd) =>
		cmd.setName("ping").setDescription("Check the bot's latency."),
	);
};
export const execute = async (interaction: ChatInputCommandInteraction) => {
	
	const embed = new EmbedBuilder()
	.setDescription("🏓 Pinging...")

	
	const start = Date.now();

	await interaction.reply({
		embeds: [embed],
		flags: MessageFlags.Ephemeral,
	});

	const latency = Date.now() - start;

	embed.setDescription([
			"🏓 **Pong!**",
			"",
			`**API:** ${latency}ms`,
			`**WebSocket:** ${interaction.client.ws.ping}ms`,
		].join("\n"))

	await interaction.editReply({
		embeds: [embed],
	});
};
