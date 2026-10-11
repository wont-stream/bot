import { echo } from "@atums/echo";
import { Events } from "discord.js";

export const execute = async (client: CommandClient) => {
	client.on(Events.Warn, async (info) => {
		echo.custom("BOT", "WARN", info);
	});
};
