import { echo } from "@atums/echo";
import { Events } from "discord.js";

export const execute = async (client: CommandClient) => {
	client.once(Events.ClientReady, async () => {
		echo.custom("BOT", "Login", `Logged in as ${client.user?.tag}`);
	});
};
