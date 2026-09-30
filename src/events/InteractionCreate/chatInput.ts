import {
	type ChatInputCommandInteraction,
	Events,
	MessageFlags,
} from "discord.js";
import type { CommandClient } from "../../types/Client";

export const execute = async (client: CommandClient) => {
	client.once(Events.InteractionCreate, async (interaction) => {
		if (!interaction.isChatInputCommand()) return;

		const command = client.commands.get(interaction.commandName) as (
			interaction: ChatInputCommandInteraction,
		) => Promise<void>;
		if (!command) {
			return console.error(
				`No command matching ${interaction.commandName} was found.`,
			);
		}
		try {
			return await command(interaction);
		} catch (error) {
			console.error(error);
			if (interaction.replied || interaction.deferred) {
				return await interaction.followUp({
					content: "There was an error while executing this command!",
					flags: MessageFlags.Ephemeral,
				});
			} else {
				return await interaction.reply({
					content: "There was an error while executing this command!",
					flags: MessageFlags.Ephemeral,
				});
			}
		}
	});
};
