import { BunCache } from "bun-cache";
import {
	type ChatInputCommandInteraction,
	EmbedBuilder,
	MessageFlags,
	type SlashCommandBuilder,
} from "discord.js";
import { guildOnly } from "../../util/errors/guildOnly";
import {
	getAuth,
	getToken,
	getUsername,
	verifyNonce,
} from "../../util/riotSignOn";

const nonces = new BunCache();

export const addSubcommand = (data: SlashCommandBuilder) => {
	data.addSubcommand((cmd) =>
		cmd
			.setName("riot-nickname")
			.setDescription("Set your nickname to your riot #")
			.addStringOption((option) =>
				option
					.setName("copied-link")
					.setDescription("Paste the link you copied after logging in here.")
					.setRequired(false),
			),
	);
};

export const execute = async (interaction: ChatInputCommandInteraction) => {
	const guildCommand = guildOnly(interaction);
	if (guildCommand)
		return await interaction.reply({
			embeds: [guildCommand],
			flags: MessageFlags.Ephemeral,
		});

	const embed = new EmbedBuilder();

	const link = interaction.options.getString("copied-link", false);
	if (!link) {
		const auth = getAuth();
		nonces.put(interaction.user.id, auth.nonce, 125_000); // grace period for latency or anything else
		embed.setDescription(
			[
				`This expires <t:${Math.floor(Date.now() / 1000) + 120}:R>`,
				"You will have to retry if you can't complete it in time.",
				"",
				"",
				`1. Open the [login page](${auth.url}).`,
				"2. Login to your Riot Account.",
				"3. Copy the link you were sent to. **It will look like an error page but that is ok!**",
				"4. Rerun this command, and set the copied-link option to the link you copied.",
				"5. Done!",
				"",
				"",
				"-# We do ***NOT*** store any data.",
				"-# You will need to redo this if you change your Riot username or tag.",
			].join("\n"),
		);
		return await interaction.reply({
			embeds: [embed],
			flags: MessageFlags.Ephemeral,
		});
	}

	let code: string | null = null;

	try {
		code = new URL(link).searchParams.get("code");
	} catch (_e) {
		embed
			.setDescription("Something went wrong, did you paste the right link?")
			.setColor("#800000");
		return await interaction.reply({
			embeds: [embed],
			flags: MessageFlags.Ephemeral,
		});
	}

	if (!code) {
		embed
			.setDescription("Something went wrong, did you paste the right link?")
			.setColor("#800000");
		return await interaction.reply({
			embeds: [embed],
			flags: MessageFlags.Ephemeral,
		});
	}

	const expectedNonce = nonces.get(interaction.user.id);
	if (!expectedNonce) {
		embed
			.setDescription(
				["No pending login found.","Run this command again without the link option first."].join("\n")
			)
			.setColor("#800000");
		return await interaction.reply({
			embeds: [embed],
			flags: MessageFlags.Ephemeral,
		});
	}

	await interaction.deferReply({ flags: MessageFlags.Ephemeral });

	try {
		const { id_token } = await getToken(code);
		verifyNonce(id_token, expectedNonce as string);

		const riotTag = getUsername(id_token);

		const member = interaction.guild?.members.cache.get(interaction.user.id);
		if (!member) {
			embed
				.setDescription("Couldn't find you in this server to rename.")
				.setColor("#800000");
			return await interaction.editReply({
				embeds: [embed],
			});
		}

		if (!member.manageable) {
			embed
				.setDescription(
					"I can't change your nickname!\n Check my role position or permissions, or you may be the server owner.",
				)
				.setColor("#800000");
			return await interaction.editReply({
				embeds: [embed],
			});
		}

		await member.setNickname(riotTag, "Linked to Riot Account");
		embed.setDescription(`Nickname set to \`${riotTag}\`.`);
		await interaction.editReply({ embeds: [embed] });
	} catch (err) {
		embed
			.setDescription(`Failed to link account: ${(err as Error).message}`)
			.setColor("#800000");
		await interaction.editReply({
			embeds: [embed],
		});
	} finally {
		nonces.delete(interaction.user.id);
	}
};
