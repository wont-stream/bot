import { echo } from "@atums/echo";
import { Events } from "discord.js";

import { Routes } from "discord.js";

interface DisplayNameStyles {
    font_id: number;
    effect_id: number;
    colors: number[];
}

const applyStyle = async (client: CommandClient, guildId: string): Promise<DisplayNameStyles | null> {
    const body = {
        "display_name_font_id": 10,
        "display_name_effect_id": 3,
        "display_name_colors": [
            16777215
        ]
    };
    const member = (await client.rest.patch(Routes.guildMember(guildId), { body })) as {
        display_name_styles: DisplayNameStyles | null;
    };
    return member.display_name_styles;
}

export const execute = async (client: CommandClient) => {
    client.on(Events.GuildCreate, async (guild) => {
        try { await applyStyle(client, guild.id) } catch (e) {
            echo.custom("BOT", "Name Style Error", e);
        }
    });
};
