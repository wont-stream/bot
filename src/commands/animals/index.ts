import { echo } from "@atums/echo";
import { Glob } from "bun";
import {
	ApplicationIntegrationType,
	type ChatInputCommandInteraction,
	Collection,
	InteractionContextType,
	MessageFlags,
	SlashCommandBuilder,
} from "discord.js";
import { somethingWentWrong } from "../../util/errors/generic";

export const data = new SlashCommandBuilder()
	.setName("animals")
	.setDescription("All animal commands.")
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

const exec: Collection<
	string,
	(interaction: ChatInputCommandInteraction) => Promise<unknown>
> = new Collection();

for await (const file of glob.scan({ cwd: "./src/commands/animals" })) {
	if (file === "index.ts") continue;

	const { addSubcommand, execute } = (await import(`./${file}`)) as {
		addSubcommand: (cmd: SlashCommandBuilder) => void;
		execute: (interaction: ChatInputCommandInteraction) => Promise<unknown>;
	};

	addSubcommand(data);

	const name = file.replace(/\.ts$/, "");
	exec.set(name, execute);
	echo.custom("COMMAND", name, "LOADED");
}

export const execute = async (interaction: ChatInputCommandInteraction) => {
	const subcommand = exec.get(interaction.options.getSubcommand());
	if (!subcommand)
		return await interaction.reply({
			embeds: [somethingWentWrong],
			flags: MessageFlags.Ephemeral,
		});

	return await subcommand(interaction);
};
