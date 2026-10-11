import { echo } from "@atums/echo";
import { Glob } from "bun";
import {
	type ChatInputCommandInteraction,
	Client,
	Collection,
	GatewayIntentBits,
	Options,
	type SlashCommandBuilder,
} from "discord.js";
import { setClient } from "./web";

const client = new Client({
	intents: [GatewayIntentBits.Guilds],
	makeCache: Options.cacheWithLimits({
		  ApplicationCommandManager: 0,
  ApplicationEmojiManager: 0,
AutoModerationRuleManager: 0,
BaseGuildEmojiManager: 0,
// TODO: ChannelManager: 0,
DMMessageManager: 0,
EntitlementManager: 0,
GuildBanManager: 0,
// TODO: GuildChannelManager: 0,
GuildEmojiManager: 0,
GuildForumThreadManager: 0,
GuildInviteManager: 0,
// TODO: GuildManager: 0,
GuildMemberManager: 0,
GuildMessageManager: 0,
GuildScheduledEventManager: 0,
GuildStickerManager: 0,
GuildTextThreadManager: 0,
MessageManager: 0,
// TODO: PermissionOverwriteManager: 0,
PresenceManager: 0,
ReactionManager: 0,
ReactionUserManager: 0,
// TODO: RoleManager: 0,
StageInstanceManager: 0,
ThreadManager: 0,
ThreadMemberManager: 0,
UserManager: 0,
VoiceStateManager: 0,
	})
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