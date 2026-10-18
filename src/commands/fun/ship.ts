import {
	type ChatInputCommandInteraction,
	EmbedBuilder,
	type SlashCommandBuilder,
	userMention,
} from "discord.js";

const getMessage = (percent: number) => {
	if (percent === 100) return "Perfect match!";
	if (percent >= 80) return "A great pair.";
	if (percent >= 60) return "There is real potential.";
	if (percent >= 40) return "It could work with some effort.";
	if (percent >= 20) return "Not very likely.";
	return "Not a match.";
};

export const addSubcommand = (data: SlashCommandBuilder) => {
	data.addSubcommand((cmd) =>
		cmd
			.setName("ship")
			.setDescription("Check the compatibility of two users.")
			.addUserOption((option) =>
				option
					.setName("user1")
					.setDescription("The first user")
					.setRequired(true),
			)
			.addUserOption((option) =>
				option
					.setName("user2")
					.setDescription("The second user. Defaults to you.")
					.setRequired(false),
			),
	);
};

export const execute = async (interaction: ChatInputCommandInteraction) => {
	const first = interaction.options.getUser("user1", true);
	const second = interaction.options.getUser("user2", false) ?? interaction.user;

	// Same result for both orders. Same pair always gives the same percent.
	const percent =
		first.id === second.id
			? 100
			: Number((BigInt(first.id) + BigInt(second.id)) % 101n);

	const filled = Math.round(percent / 10);
	const bar = `${"█".repeat(filled)}${"░".repeat(10 - filled)}`;

	const embed = new EmbedBuilder()
		.setTitle("💞 Compatibility")
		.setDescription(
			[
				`${userMention(first.id)} + ${userMention(second.id)}`,
				"",
				`**${percent}%** \`${bar}\``,
				"",
				getMessage(percent),
			].join("\n"),
		)
		.setColor("#ff69b4");

	return await interaction.reply({ embeds: [embed] });
};
