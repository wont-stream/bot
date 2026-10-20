import { type Client, Routes } from "discord.js";

interface DisplayNameStyles {
	font_id: number;
	effect_id: number;
	colors: number[];
}

export const applyStyle = async (
	client: CommandClient | Client<true>,
	guildId: string,
): Promise<DisplayNameStyles | null> => {
	const body = {
		display_name_font_id: 10,
		display_name_effect_id: 3,
		display_name_colors: [16777215],
	};
	const member = (await client.rest.patch(Routes.guildMember(guildId), {
		body,
	})) as {
		display_name_styles: DisplayNameStyles | null;
	};
	return member.display_name_styles;
};