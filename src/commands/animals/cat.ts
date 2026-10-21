import {
	type ChatInputCommandInteraction,
	EmbedBuilder,
	type SlashCommandBuilder,
} from "discord.js";
import { apiUnavailable, fetchJson } from "../../util/fetchJson";

const ORIGIN = "https://cataas.com";

interface CataasCat {
	id?: unknown;
	_id?: unknown;
	url?: unknown;
}

// CATAAS returns an ID. The picture URL is built from that ID.
const getImageUrl = (cat: CataasCat | null): string | null => {
	const id = cat?.id ?? cat?._id;
	if (typeof id === "string" && /^[\w-]+$/.test(id))
		return `${ORIGIN}/cat/${id}`;

	if (typeof cat?.url === "string") {
		const url = cat.url.startsWith("/") ? `${ORIGIN}${cat.url}` : cat.url;
		if (url.startsWith(`${ORIGIN}/`)) return url;
	}

	return null;
};

export const addSubcommand = (data: SlashCommandBuilder) => {
	data.addSubcommand((cmd) =>
		cmd.setName("cat").setDescription("Show a random cat picture."),
	);
};

export const execute = async (interaction: ChatInputCommandInteraction) => {
	await interaction.deferReply();

	const image = getImageUrl(await fetchJson<CataasCat>(`${ORIGIN}/cat?json=true`));
	if (!image) return await interaction.editReply({ embeds: [apiUnavailable] });

	const embed = new EmbedBuilder()
		.setTitle("🐱 Meow!")
		.setImage(image)
		.setFooter({ text: "Source: cataas.com" });

	return await interaction.editReply({ embeds: [embed] });
};
