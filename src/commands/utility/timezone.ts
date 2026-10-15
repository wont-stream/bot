import {
	type ChatInputCommandInteraction,
	EmbedBuilder,
	type SlashCommandBuilder,
	userMention,
} from "discord.js";

const getTimezoneTimestamps = (timeZone: string) => {
	const now = new Date();

	const dateParts = new Intl.DateTimeFormat("en-US", {
		timeZone,
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
	}).formatToParts(now);

	const date = Object.fromEntries(
		dateParts.map(({ type, value }) => [type, value]),
	);

	const midnightUtc = new Date(
		`${date.year}-${date.month}-${date.day}T00:00:00Z`,
	);

	const offsetParts = new Intl.DateTimeFormat("en-US", {
		timeZone,
		timeZoneName: "longOffset",
	}).formatToParts(midnightUtc);

	const offset = offsetParts.find(
		(part) => part.type === "timeZoneName",
	)?.value;

	const match = offset?.match(/GMT([+-])(\d{2}):(\d{2})/);

	let midnight = midnightUtc.getTime();

	if (match) {
		const [, sign, hours, minutes] = match;
		const offsetMs = (Number(hours) * 60 + Number(minutes)) * 60_000;

		midnight -= sign === "+" ? offsetMs : -offsetMs;
	}

	return {
		midnight: `<t:${Math.floor(midnight / 1000)}:t>`,
		current: `<t:${Math.floor(now.getTime() / 1000)}:t>`,
	};
};

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
				inline: true,
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
			iconURL:
				"https://wsrv.nl/?url=https://timezone.creations.works/favicon.ico&output=webp",
		})
		.setTimestamp();

	await interaction.editReply({ embeds: [embed] });
};
