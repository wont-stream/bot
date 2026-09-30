import { Glob } from "bun";
import { REST, Routes, type SlashCommandBuilder } from "discord.js";

const commands = [];
const glob = new Glob("**/**.ts");

for await (const file of glob.scan({ cwd: "./src/commands" })) {
	if (!file.endsWith("index.ts")) continue;
	const { data, execute } = (await import(`../src/commands/${file}`)) as {
		data?: SlashCommandBuilder;
		execute?: () => Promise<void>;
	};

	if (data && execute) {
		commands.push(data.toJSON());
	}
}
const rest = new REST().setToken(process.env.DISCORD_TOKEN || "");

console.log(`Started refreshing ${commands.length} application (/) commands.`);
// The put method is used to fully refresh all commands in the guild with the current set
/* */

let res: { id: string }[] = [];
let where = "guild-wide";

if (process.argv.includes("global")) {
	res = (await rest.put(
		Routes.applicationCommands(process.env.CLIENT_ID || ""),
		{
			body: [
				{
					name: "launch",
					description: "Launch the activity",
					type: 4,
					handler: 2,
				},
				...commands,
			],
		},
	)) as { id: string }[];
	where = "globally";
} else {
	res = (await rest.put(
		Routes.applicationGuildCommands(
			process.env.CLIENT_ID || "",
			process.env.TESTING_GUILD_ID || "",
		),
		{ body: commands },
	)) as { id: string }[];
}

console.log(`Refreshed ${res.length} application (/) commands ${where}.`);
