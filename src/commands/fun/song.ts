import {
	type ChatInputCommandInteraction,
	type InteractionReplyOptions,
	MessageFlags,
	type SlashCommandBuilder,
} from "discord.js";
import { getAudio, Versions } from "../../util/getAudio";

const choices = [
	{ name: "Pink Blush HQ", value: "pbhq" },
	{ name: "Pink Blush LQ", value: "pblq" },
	{ name: "Rollerskate HQ", value: "rlrsk8hq" },
	{ name: "Rollerskate LQ", value: "rlrsk8lq" },
];

export const addSubcommand = (data: SlashCommandBuilder) => {
	data.addSubcommand((cmd) =>
		cmd
			.setName("song")
			.setDescription(
				"Get one of the wonderful song covers made by the bot creator",
			)
			.addStringOption((option) =>
				option
					.setName("version")
					.setDescription("Which version would you like to hear?")
					.setChoices(choices),
			),
	);
};

export const execute = async (interaction: ChatInputCommandInteraction) => {
	const version = (interaction.options.getString("version", false) ??
		"pblq") as (typeof Versions)[number];

	if (!Versions.includes(version)) {
		return interaction.reply({
			content: "Invalid Pink Blush version.",
			flags: MessageFlags.Ephemeral,
		});
	}

	return interaction.reply(
		(await getAudio(version)) as InteractionReplyOptions,
	);
};
