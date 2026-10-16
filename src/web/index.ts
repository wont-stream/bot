import { echo } from "@atums/echo";
import {
	ApplicationCommandOptionType,
	type Client,
	OAuth2Scopes,
	PermissionFlagsBits,
	PermissionsBitField,
	type ShardingManager,
} from "discord.js";
import html from "./src/index.html";

type CommandOption = { type: number; options?: { type: number }[] };

type CommandClient = Client & {
	commands: Map<string, { data: { toJSON(): { options?: CommandOption[] } } }>;
};

type Stats = {
	guilds: number;
	users: number;
	commands: number;
	inviteUrl: string | null;
	uptime: string;
};

const STATS_TTL_MS = 60_000;
const FETCH_TIMEOUT_MS = 5_000;

const INVITE_SCOPES = [OAuth2Scopes.Bot, OAuth2Scopes.ApplicationsCommands];
const INVITE_PERMISSIONS = PermissionsBitField.resolve([
	PermissionFlagsBits.SendMessages,
	PermissionFlagsBits.SendVoiceMessages,
	PermissionFlagsBits.AttachFiles,
	PermissionFlagsBits.ManageNicknames,
]);

let shardManager: ShardingManager | null = null;
let cachedCommands = 0;
let cachedInviteUrl: string | null = null;
let cachedStats: { value: Stats; expires: number } | null = null;
let pendingStats: Promise<Stats> | null = null;

const sumNumbers = (values: unknown[]): number =>
	values.reduce<number>((sum, value) => sum + Number(value), 0);

const countSubcommands = async (): Promise<number> => {
	if (cachedCommands > 0) return cachedCommands;
	if (!shardManager) return 0;

	// Every shard loads the same commands. Query shard 0 only.
	// With the shard option, broadcastEval returns one value, not an array.
	const count = await shardManager.broadcastEval(
		(client, context) => {
			let n = 0;
			for (const command of (client as CommandClient).commands.values()) {
				for (const option of command.data.toJSON().options ?? []) {
					if (option.type === context.subcommand) {
						n++;
					} else if (option.type === context.group) {
						n +=
							option.options?.filter((o) => o.type === context.subcommand)
								.length ?? 0;
					}
				}
			}
			return n;
		},
		{
			shard: 0,
			context: {
				subcommand: ApplicationCommandOptionType.Subcommand,
				group: ApplicationCommandOptionType.SubcommandGroup,
			},
		},
	);

	cachedCommands = Number(count) || 0;
	return cachedCommands;
};

const getInviteUrl = async (): Promise<string | null> => {
	if (cachedInviteUrl) return cachedInviteUrl;
	if (!shardManager) return null;

	// BigInt does not serialize through IPC. Send it as a string.
	const url = await shardManager.broadcastEval(
		(client, context) =>
			client.generateInvite({
				scopes: context.scopes,
				permissions: BigInt(context.permissions),
			}),
		{
			shard: 0,
			context: {
				scopes: INVITE_SCOPES,
				permissions: INVITE_PERMISSIONS.toString(),
			},
		},
	);

	cachedInviteUrl = url ?? null;
	return cachedInviteUrl;
};

const fetchUptime = async (): Promise<string> => {
	try {
		const response = await fetch("https://status.ipv4.army/sections", {
			signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
		});
		if (!response.ok) return "?";

		const section = (await response.text()).split("Discord Bot")[1] ?? "";
		return section.match(/(\d+(?:\.\d+)?)%/)?.[1] ?? "?";
	} catch {
		return "?";
	}
};

const buildStats = async (): Promise<Stats> => {
	const [guildCounts, memberCounts, commands, inviteUrl, uptime] =
		await Promise.all([
			shardManager?.fetchClientValues("guilds.cache.size") ?? [],
			shardManager?.broadcastEval((client) =>
				client.guilds.cache.reduce((sum, guild) => sum + guild.memberCount, 0),
			) ?? [],
			countSubcommands(),
			getInviteUrl(),
			fetchUptime(),
		]);

	return {
		guilds: sumNumbers(guildCounts),
		users: sumNumbers(memberCounts),
		commands,
		inviteUrl,
		uptime,
	};
};

const getStats = async (): Promise<Stats> => {
	if (!shardManager) return buildStats();
	if (cachedStats && cachedStats.expires > Date.now()) return cachedStats.value;

	// Share one in-flight build between concurrent requests.
	pendingStats ??= buildStats()
		.then((value) => {
			cachedStats = { value, expires: Date.now() + STATS_TTL_MS };
			return value;
		})
		.finally(() => {
			pendingStats = null;
		});

	return pendingStats;
};

const server = Bun.serve({
	routes: {
		"/": html,
		"/api/stats": async () => {
			try {
				return Response.json(await getStats());
			} catch (error) {
				echo.error({ message: "Stats request failed", error });
				return Response.json({ error: "Stats unavailable" }, { status: 503 });
			}
		},
		"/api/ok": new Response(),
	},

	development: process.env.NODE_ENV !== "production" && {
		hmr: true,
		console: true,
	},
});

echo.custom("Webserver", "Ready", server.url.toString());

export const setManager = (manager: ShardingManager) => {
	shardManager = manager;
};
