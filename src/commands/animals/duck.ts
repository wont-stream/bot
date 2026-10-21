import {
	type ChatInputCommandInteraction,
	EmbedBuilder,
	type SlashCommandBuilder,
} from "discord.js";
import { apiUnavailable, fetchJson, isHttpsUrl } from "../../util/fetchJson";

export const addSubcommand = (data: SlashCommandBuilder) => {
	data.addSubcommand((cmd) =>
		cmd.setName("duck").setDescription("Show a random duck picture."),
	);
};

export const execute = async (interaction: ChatInputCommandInteraction) => {
	await interaction.deferReply();

	const data = await fetchJson<{ url?: unknown }>(
		"https://random-d.uk/api/v2/random",
	);
	if (!isHttpsUrl(data?.url))
		return await interaction.editReply({ embeds: [apiUnavailable] });

	const embed = new EmbedBuilder()
		.setTitle("🦆 Quack!")
		.setImage(data.url)
		.setFooter({ text: "Source: random-d.uk" });

	return await interaction.editReply({ embeds: [embed] });
};
