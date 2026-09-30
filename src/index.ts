import { Glob } from "bun";
import {
	type ChatInputCommandInteraction,
	Client,
	Collection,
	GatewayIntentBits,
	type SlashCommandBuilder,
} from "discord.js";

const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.DirectMessages,
		GatewayIntentBits.MessageContent,
	],
}) as CommandClient;
client.commands = new Collection();

const glob = new Glob("**/index.ts");

for await (const file of glob.scan({ cwd: "./src/commands" })) {
	const { data, execute } = (await import(`./commands/${file}`)) as {
		data?: SlashCommandBuilder;
		execute?: (interaction: ChatInputCommandInteraction) => Promise<void>;
	};

	if (data && execute) {
		client.commands.set(data.name, execute);
	}
}

for await (const file of glob.scan({ cwd: "./src/events" })) {
	const { execute } = (await import(`./events/${file}`)) as {
		execute?: (bot: typeof client) => Promise<void>;
	};

	if (execute) await execute(client);
}

await client.login(process.env.DISCORD_TOKEN);
