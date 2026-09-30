import { FastType } from "@voctal/gamecord";
import type {
	ChatInputCommandInteraction,
	SlashCommandBuilder,
} from "discord.js";

export const addSubcommand = (data: SlashCommandBuilder) => {
	data.addSubcommand((cmd) =>
		cmd
			.setName("fasttype")
			.setDescription(
				"A game where the player needs to write a sentence as fast as possible.",
			),
	);
};
export const execute = async (interaction: ChatInputCommandInteraction) => {
	const game = new FastType(interaction);

	await game.start();
};
