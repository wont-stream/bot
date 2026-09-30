import { Memory } from "@voctal/gamecord";
import type {
	ChatInputCommandInteraction,
	SlashCommandBuilder,
} from "discord.js";

export const addSubcommand = (data: SlashCommandBuilder) => {
	data.addSubcommand((cmd) =>
		cmd
			.setName("memorymatcher")
			.setDescription("A game where the player to find all the pairs."),
	);
};
export const execute = async (interaction: ChatInputCommandInteraction) => {
	const game = new Memory(interaction);

	await game.start();
};
