import { echo } from "@atums/echo";
import {
	type ChatInputCommandInteraction,
	Events,
	MessageFlags,
} from "discord.js";

export const execute = async (client: CommandClient) => {
	client.on(Events.InteractionCreate, async (interaction) => {
		if (!interaction.isChatInputCommand()) return echo.custom("INTERACTION", "Non chat input interaction ran", interaction);
		console.log(interaction.command, Date.now())
		const command = client.commands.get(interaction.commandName) as (
			interaction: ChatInputCommandInteraction,
		) => Promise<void>;
		if (!command) {
			return echo.custom("INTERACTION", "Command not found", {
				interaction,
				commandName: interaction.commandName,
			});
		}
		try {
			return await command(interaction);
		} catch (error) {
			echo.custom("INTERACTION", "Error", {interaction, error});
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
