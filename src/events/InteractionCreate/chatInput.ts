import {
	type ChatInputCommandInteraction,
	Events,
	MessageFlags,
} from "discord.js";

export const execute = async (client: CommandClient) => {
	client.on(Events.InteractionCreate, async (interaction) => {
		if (!interaction.isChatInputCommand()) return console.log("non chat input");
		console.log(interaction.command, Date.now())
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
