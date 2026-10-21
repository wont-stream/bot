import {
	type ChatInputCommandInteraction,
	EmbedBuilder,
	type SlashCommandBuilder,
} from "discord.js";
import { apiUnavailable, fetchJson, isHttpsUrl } from "../../util/fetchJson";

interface Dog {
	image: string;
	source: string;
}

const IMAGE_PATTERN = /\.(jpe?g|png|gif|webp)$/i;

const fromRandomDog = async (): Promise<Dog | null> => {
	// The filter removes video files. Discord cannot show them in embeds.
	const data = await fetchJson<{ url?: unknown }>(
		"https://random.dog/woof.json?filter=mp4,webm",
	);
	if (!isHttpsUrl(data?.url) || !IMAGE_PATTERN.test(data.url)) return null;

	return { image: data.url, source: "random.dog" };
};

const fromDogApi = async (): Promise<Dog | null> => {
	const data = await fetchJson<{ message?: unknown }>(
		"https://dog.ceo/api/breeds/image/random",
	);
	if (!isHttpsUrl(data?.message)) return null;

	return { image: data.message, source: "dog.ceo" };
};

export const addSubcommand = (data: SlashCommandBuilder) => {
	data.addSubcommand((cmd) =>
		cmd.setName("dog").setDescription("Show a random dog picture."),
	);
};

export const execute = async (interaction: ChatInputCommandInteraction) => {
	await interaction.deferReply();

	const dog = (await fromRandomDog()) ?? (await fromDogApi());
	if (!dog) return await interaction.editReply({ embeds: [apiUnavailable] });

	const embed = new EmbedBuilder()
		.setTitle("🐶 Woof!")
		.setImage(dog.image)
		.setFooter({ text: `Source: ${dog.source}` });

	return await interaction.editReply({ embeds: [embed] });
};
