import { echo } from "@atums/echo";
import { Events } from "discord.js";
import { applyStyle } from "../../util/style/applyStyle";

export const execute = async (client: CommandClient) => {
	client.on(Events.GuildCreate, async (guild) => {
		try {
			await applyStyle(client, guild.id);
		} catch (e) {
			echo.custom("BOT", "Name Style Error", e);
		}
	});
};
