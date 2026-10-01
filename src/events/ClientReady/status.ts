import { Events } from "discord.js";

let currentDisplay: "users" | "servers" = "users";

export const execute = async (client: CommandClient) => {
	client.on(Events.ClientReady, async () => {
		setInterval(() => {
			const serverCount = client.guilds.cache.size;
			const userCount = client.guilds.cache.reduce(
				(total, guild) => total + guild.memberCount,
				0,
			);

			switch (currentDisplay) {
				case "users":
					{
						client.user?.setActivity(`${serverCount} servers`, {
							type: 3,
						});
						currentDisplay = "servers";
					}
					break;
				case "servers":
					{
						client.user?.setActivity(`${userCount} users`, {
							type: 3,
						});
						currentDisplay = "users";
					}
					break;
			}
		}, 60_000);
	});
};
