import { Connect4 } from "@voctal/gamecord";
import type {
	ChatInputCommandInteraction,
	SlashCommandBuilder,
} from "discord.js";

export const addSubcommand = (data: SlashCommandBuilder) => {
	data.addSubcommand((cmd) =>
		cmd
			.setName("connectfour")
			.setDescription("The Connect 4 game.")
			.addUserOption((option) =>
				option
					.setName("user")
					.setDescription("The user you wanna play against")
					.setRequired(true),
			),
	);
};
export const execute = async (interaction: ChatInputCommandInteraction) => {
	const user = interaction.options.getUser("user", true);

	const game = new Connect4(interaction, {
		versus: { opponent: user },
	});

	await game.start();
};
