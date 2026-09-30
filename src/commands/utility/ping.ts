import {
	type ChatInputCommandInteraction,
	MessageFlags,
	type SlashCommandBuilder,
} from "discord.js";

export const addSubcommand = (data: SlashCommandBuilder) => {
	data.addSubcommand((cmd) =>
		cmd.setName("ping").setDescription("Check the bot's latency."),
	);
};
export const execute = async (interaction: ChatInputCommandInteraction) => {
	const start = Date.now();

	await interaction.reply({
		content: "🏓 Pinging...",
		flags: MessageFlags.Ephemeral,
	});

	const latency = Date.now() - start;

	await interaction.editReply({
		content: [
			"🏓 **Pong!**",
			"",
			`**API:** ${latency}ms`,
			`**WebSocket:** ${interaction.client.ws.ping}ms`,
		].join("\n"),
	});
};
