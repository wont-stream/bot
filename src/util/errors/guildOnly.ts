import { ChatInputCommandInteraction, EmbedBuilder } from "discord.js";

const embed = new EmbedBuilder()
    .setDescription("-# This command only works in servers.");

export const guildOnly = (interaction: ChatInputCommandInteraction) => {
    if (!interaction.inGuild()) {
        return embed
    }
}