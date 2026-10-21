import {
	type ChatInputCommandInteraction,
	EmbedBuilder,
	type SlashCommandBuilder,
} from "discord.js";
import { apiUnavailable, fetchJson, isHttpsUrl } from "../../util/fetchJson";

export const addSubcommand = (data: SlashCommandBuilder) => {
	data.addSubcommand((cmd) =>
		cmd.setName("fox").setDescription("Show a random fox picture."),
	);
};

export const execute = async (interaction: ChatInputCommandInteraction) => {
	await interaction.deferReply();

	const data = await fetchJson<{ image?: unknown; link?: unknown }>(
		"https://randomfox.ca/floof/",
	);
	if (!isHttpsUrl(data?.image))
		return await interaction.editReply({ embeds: [apiUnavailable] });

	const embed = new EmbedBuilder()
		.setTitle("🦊 Floof!")
		.setImage(data.image)
		.setFooter({ text: "Source: randomfox.ca" });

	if (isHttpsUrl(data.link)) embed.setURL(data.link);

	return await interaction.editReply({ embeds: [embed] });
};
