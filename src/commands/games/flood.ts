import { Flood } from "@voctal/gamecord";
import type {
	ChatInputCommandInteraction,
	SlashCommandBuilder,
} from "discord.js";

export const addSubcommand = (data: SlashCommandBuilder) => {
	data.addSubcommand((cmd) =>
		cmd
			.setName("flood")
			.setDescription(
				"A game where the player needs to make the whole board a single emoji.",
			),
	);
};
export const execute = async (interaction: ChatInputCommandInteraction) => {
	const game = new Flood(interaction);

	await game.start();
};
