import { echo } from "@atums/echo";
import { Glob } from "bun";

const glob = new Glob("**/*.ts");

export const execute = async (client: CommandClient) => {
	for await (const file of glob.scan({ cwd: "./src/events" })) {
		if (file === "index.ts") continue;

		const { execute } = (await import(`./${file}`)) as {
			execute: (client: CommandClient) => Promise<void>;
		};

		await execute(client);
		echo.custom("EVENT", file.replace(".ts", "") || "", "LOADED");
	}
};