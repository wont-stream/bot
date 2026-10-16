import { ChatInputCommandInteraction, EmbedBuilder } from "discord.js";

const embed = new EmbedBuilder()
    .setDescription("-# This command only works in DMs.");

export const userOnly = (interaction: ChatInputCommandInteraction) => {
    if (interaction.inGuild()) {
        return embed
    }
}