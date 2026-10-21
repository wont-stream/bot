import {
	type ChatInputCommandInteraction,
	EmbedBuilder,
	type SlashCommandBuilder,
} from "discord.js";
import { apiUnavailable, fetchJson } from "../../util/fetchJson";

export const addSubcommand = (data: SlashCommandBuilder) => {
	data.addSubcommand((cmd) =>
		cmd.setName("catfact").setDescription("Get a random cat fact."),
	);
};

export const execute = async (interaction: ChatInputCommandInteraction) => {
	await interaction.deferReply();

	const data = await fetchJson<{ fact?: unknown }>("https://catfact.ninja/fact");
	const fact = typeof data?.fact === "string" ? data.fact.trim() : "";
	if (!fact) return await interaction.editReply({ embeds: [apiUnavailable] });

	const embed = new EmbedBuilder()
		.setTitle("🐈 Cat Fact")
		.setDescription(fact.slice(0, 4000))
		.setFooter({ text: "Source: catfact.ninja" });

	return await interaction.editReply({ embeds: [embed] });
};
