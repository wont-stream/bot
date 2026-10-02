import type {
	ChatInputCommandInteraction,
	Client,
	Collection,
	SlashCommandBuilder,
} from "discord.js";

declare global {
	type CommandClient = Client & {
		commands: Collection<
			string,
			{
				data: SlashCommandBuilder;
				execute: (interaction: ChatInputCommandInteraction) => Promise<void>;
			}
		>;
	};
}
