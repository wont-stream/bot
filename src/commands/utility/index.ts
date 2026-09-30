import { Glob } from "bun";
import {
	ApplicationIntegrationType,
	type ChatInputCommandInteraction,
	Collection,
	InteractionContextType,
	SlashCommandBuilder,
} from "discord.js";

export const data = new SlashCommandBuilder()
	.setName("utility")
	.setDescription("Snoop around.")
	.setIntegrationTypes(
		ApplicationIntegrationType.GuildInstall,
		ApplicationIntegrationType.UserInstall,
	)
	.setContexts(
		InteractionContextType.BotDM,
		InteractionContextType.Guild,
		InteractionContextType.PrivateChannel,
	);

const glob = new Glob("**/*.ts");

const exe: Collection<
	string,
	(interaction: ChatInputCommandInteraction) => Promise<void>
> = new Collection();

for await (const file of glob.scan({ cwd: "./src/commands/utility" })) {
	if (file === "index.ts") continue;

	const { addSubcommand, execute } = (await import(`./${file}`)) as {
		addSubcommand: (cmd: SlashCommandBuilder) => void;
		execute: (interaction: ChatInputCommandInteraction) => Promise<void>;
	};

	addSubcommand(data);

	exe.set(file.replace(".ts", ""), execute);
}

export const execute = async (interaction: ChatInputCommandInteraction) => {
	const execute = exe.get(interaction.options.getSubcommand());
	if (!execute) return interaction.reply("Something went wrong!");

	return await execute(interaction);
};
