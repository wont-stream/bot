import { echo } from "@atums/echo";
import { ApplicationCommandOptionType, OAuth2Scopes } from "discord.js";
import html from "./src/index.html";

let client: CommandClient | null = null;

let total = 0;

const countSubcommands = (): number => {
	if (total > 0) return total;
	for (const { data } of client?.commands.values() ?? []) {
		for (const option of data.toJSON().options ?? []) {
			if (option.type === ApplicationCommandOptionType.Subcommand) total++;
			else if (option.type === ApplicationCommandOptionType.SubcommandGroup)
				total += option.options?.length ?? 0;
		}
	}
	return total;
};

const notReady = Response.json({ error: "Bot not ready" }, { status: 503 });
const middleware = () => {
	if (!client?.isReady()) return notReady.clone();
	return null;
};

Bun.serve({
	routes: {
		"/": html,
		"/api/user": async () => {
			const middlewareResult = middleware();
			if (middlewareResult) return middlewareResult;

			return Response.json(client?.user);
		},
		"/api/stats": async () => {
			const middlewareResult = middleware();
			if (middlewareResult) return middlewareResult;

			return Response.json({
				guilds: client?.guilds.cache.size,
				users: client?.guilds.cache.reduce(
					(sum, guild) => sum + guild.memberCount,
					0,
				),
				commands: client?.commands.size,
				subcommands: countSubcommands(),
				inviteUrl: client?.generateInvite({
					scopes: [OAuth2Scopes.Bot, OAuth2Scopes.ApplicationsCommands],
				}),
			});
		},
		"/api/ok": new Response(),
	},

	development: process.env.NODE_ENV !== "production" && {
		hmr: true,
		console: true,
	},
});

echo.custom("Webserver", "Ready", "http://localhost:3000");

export const setClient = (newClient: CommandClient) => {
	client = newClient;
};
