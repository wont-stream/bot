import {
	type ChatInputCommandInteraction,
	EmbedBuilder,
	MessageFlags,
	type SlashCommandBuilder,
} from "discord.js";
import { applyStyle } from "../../util/style/applyStyle";
import { guildOnly } from "../../util/errors/guildOnly";

export const addSubcommand = (data: SlashCommandBuilder) => {
	data.addSubcommand((cmd) =>
		cmd.setName("apply-style").setDescription("Apply the bot's custom name style"),
	);
};
export const execute = async (interaction: ChatInputCommandInteraction) => {
	const guildCommand = guildOnly(interaction);
	if (guildCommand)
		return await interaction.reply({
			embeds: [guildCommand],
			flags: MessageFlags.Ephemeral,
		});

	await interaction.deferReply({
		flags: MessageFlags.Ephemeral
	});

	const res = await applyStyle(interaction.client, interaction.guild?.id || "0");

	const embed = new EmbedBuilder()
		.setTitle("Something went wrong!")
		.setDescription(`Send this error in the [support server](https://discord.gg/)\n\n${Buffer.from(JSON.stringify(res)).toBase64()}`)

	if (res?.colors && res.effect_id && res.font_id) {
		embed.setTitle(null)
			.setDescription("Done!")
	}

	await interaction.reply({
		embeds: [embed],
		flags: MessageFlags.Ephemeral,
	});
};
