import { Events } from "discord.js";

export const execute = async (client: CommandClient) => {
	client.once(Events.ClientReady, async () => {
		console.log(`Ready! Logged in as ${client.user?.tag}`);
	});
};
