import {
	type ChatInputCommandInteraction,
	EmbedBuilder,
	type SlashCommandBuilder,
	userMention,
} from "discord.js";
import { getTimezoneTimestamps } from "../../util/getTimezoneTimestamps";

type TimezoneResponse = {
	user?: { id: string; username: string };
	timezone: string;
	message?: string;
};

export const addSubcommand = (data: SlashCommandBuilder) => {
	data.addSubcommand((cmd) =>
		cmd
			.setName("timezone")
			.setDescription("Check someones timezone.")
			.addUserOption((option) =>
				option
					.setName("user")
					.setDescription("The user whose timezone you want to check.")
					.setRequired(true),
			),
	);
};
export const execute = async (interaction: ChatInputCommandInteraction) => {
	const user = interaction.options.getUser("user", true);

	await interaction.deferReply();

	const req = await fetch(
		`https://timezone.creations.works/v1/get?id=${user.id}`,
	);
	const res = (await req.json()) as TimezoneResponse;

	if (res?.message || !res?.user)
		return interaction.editReply({
			content: `${userMention(user.id)} isn't setup with TimezoneDB, tell them to signup and set their timezone!\n<https://timezone.creations.works/v1/auth/discord?redirect=/>`,
		});

	const timestmaps = getTimezoneTimestamps(res.timezone);

	const embed = new EmbedBuilder()
		.setTitle(`${user.globalName || user.username}'s Timezone`)
		.setURL(`https://discord.com/users/${user.id}`)
		.addFields(
			{
				name: "Timezone",
				value: res.timezone,
			},
			{
				name: "Midnight",
				value: timestmaps.midnight,
				inline: true,
			},
			{
				name: "Current Time",
				value: timestmaps.current,
				inline: true,
			},
		)
		.setThumbnail(user.avatarURL())
		.setFooter({
			text: "Powered by TimezoneDB",
			iconURL: "https://heliopolis.live/atums.png",
		})
		.setTimestamp();

	await interaction.editReply({ embeds: [embed] });
};
