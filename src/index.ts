import { echo } from "@atums/echo";
import { Glob } from "bun";
import {
	type ChatInputCommandInteraction,
	Client,
	Collection,
	GatewayIntentBits,
	type SlashCommandBuilder,
} from "discord.js";
import { setClient } from "./web";

const client = new Client({
	intents: [GatewayIntentBits.Guilds],
}) as CommandClient;
client.commands = new Collection();

echo.custom("Webserver", "Configuring", "Client");
setClient(client);

const glob = new Glob("**/index.ts");

echo.custom("EVENTS", "Loading", "Started");
for await (const file of glob.scan({ cwd: "./src/events" })) {
	const { execute } = (await import(`./events/${file}`)) as {
		execute?: (bot: typeof client) => Promise<void>;
	};

	if (execute) await execute(client);
}
echo.custom("EVENTS", "Loading", "Finished");

echo.custom("COMMANDS", "Loading", "Started");
for await (const file of glob.scan({ cwd: "./src/commands" })) {
	const { data, execute } = (await import(`./commands/${file}`)) as {
		data?: SlashCommandBuilder;
		execute?: (interaction: ChatInputCommandInteraction) => Promise<void>;
	};

	if (data && execute) {
		client.commands.set(data.name, { data, execute });
	}
}
echo.custom("COMMANDS", "Loading", "Finished");

echo.custom("BOT", "Login", "Started");
await client.login(process.env.DISCORD_TOKEN);
echo.custom("BOT", "Login", "Finished");
