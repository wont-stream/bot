import { ActivityType, Events } from "discord.js";

let currentDisplay = 0;

const updateActivity = (client: CommandClient) => {
	const serverCount = client.guilds.cache.size;
	const userCount = client.guilds.cache.reduce(
		(total, guild) => total + guild.memberCount,
		0,
	);

	const activities = [
		`${userCount} users`,
		`${serverCount} servers`,
		`${client.shard?.count ?? 1} shards`,
	];

	client.user?.setActivity(activities[currentDisplay] || "", {
		type: ActivityType.Watching,
	});

	currentDisplay = (currentDisplay + 1) % activities.length;
};

export const execute = (client: CommandClient) => {
	client.once(Events.ClientReady, () => {
		updateActivity(client);
		setInterval(() => updateActivity(client), 30_000);
	});
};
