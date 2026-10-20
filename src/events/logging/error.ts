import { echo } from "@atums/echo";
import { Events } from "discord.js";

export const execute = async (client: CommandClient) => {
	client.on(Events.Error, async (info) => {
		echo.custom("BOT", "ERROR", info);
	});
};
