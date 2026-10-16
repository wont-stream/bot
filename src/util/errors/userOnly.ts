import { ChatInputCommandInteraction, EmbedBuilder, MessageFlags } from "discord.js";

const embed = new EmbedBuilder()
    .setDescription("-# This command only works in DMs.");

export const guildOnly = (interaction: ChatInputCommandInteraction) => {
    if (interaction.inGuild()) {
        return interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral })
    }
}