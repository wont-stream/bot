import { Minesweeper } from "@voctal/gamecord";
import type {
	ChatInputCommandInteraction,
	SlashCommandBuilder,
} from "discord.js";

export const addSubcommand = (data: SlashCommandBuilder) => {
	data.addSubcommand((cmd) =>
		cmd
			.setName("minesweeper")
			.setDescription(
				"A game where the player needs to click on all tiles except the mines.",
			),
	);
};
export const execute = async (interaction: ChatInputCommandInteraction) => {
	const game = new Minesweeper(interaction);

	await game.start();
};
