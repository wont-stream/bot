import type { Client, Collection } from "discord.js";

declare global {
	type CommandClient = Client & {
		commands: Collection<string, unknown>;
	};
}