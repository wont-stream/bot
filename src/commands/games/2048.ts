import { Game2048 } from "@voctal/gamecord";
import type {
	ChatInputCommandInteraction,
	SlashCommandBuilder,
} from "discord.js";

export const addSubcommand = (data: SlashCommandBuilder) => {
	data.addSubcommand((cmd) =>
		cmd
			.setName("2048")
			.setDescription(
				"A game where the player needs to merge numbers until reaching 2048.",
			),
	);
};

export const execute = async (interaction: ChatInputCommandInteraction) => {
	const game = new Game2048(interaction);

	await game.start();
};
