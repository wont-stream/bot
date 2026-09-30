import { Glob } from "bun";
import type { Client } from "discord.js";

const glob = new Glob("**/*.ts");

export const execute = async (client: CommandClient) => {
	for await (const file of glob.scan({ cwd: "./src/events" })) {
		if (file === "index.ts") continue;

		const { execute } = (await import(`./${file}`)) as {
			execute: (client: Client) => Promise<void>;
		};

		await execute(client);
	}
};
