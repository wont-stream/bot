import {
    type ChatInputCommandInteraction,
    MessageFlags,
    type SlashCommandBuilder,
} from "discord.js";
import { getAuth, getToken, getUsername, verifyNonce } from "../../util/riotSignOn";
import { BunCache } from "bun-cache";

const nonces = new BunCache()

export const addSubcommand = (data: SlashCommandBuilder) => {
    data.addSubcommand((cmd) =>
        cmd.setName("riot-nickname").setDescription("Set your nickname to your riot #").addStringOption((option) =>
            option
                .setName("copied-link")
                .setDescription("Paste the link you copied after logging in here.")
                .setRequired(false),
        ),
    );
};

export const execute = async (interaction: ChatInputCommandInteraction) => {
    const link = interaction.options.getString("copied-link", false);
    if (!link) {
        const auth = getAuth()
        nonces.put(interaction.user.id, auth.nonce, 125_000) // grace period for latency or anything else
        return await interaction.reply({ content: `This expires <t:${Math.floor(Date.now() / 1000) + 120}:R>. You will have to retry if you can't complete it in time.\n\n1. Open the [login page](${auth.url}).\n2. Login to your Riot Account.\n3. Copy the link you were sent to. **It will look like an error page but that is ok!**\n4. Rerun this command, and set the copied-link option to the link you copied.\n5. Done!\n\nWe do ***NOT*** store any data. You will need to rerun this if you change your Riot username or tag.`, flags: MessageFlags.Ephemeral })
    }

    let code: string | null = null;

    try {
        code = new URL(link).searchParams.get("code")
    } catch (_e) {
        return await interaction.reply({ content: "Something went wrong, did you paste the right link?", flags: MessageFlags.Ephemeral })
    }

    if (!code) return await interaction.reply({ content: "Something went wrong, did you paste the right link?", flags: MessageFlags.Ephemeral })

    const expectedNonce = nonces.get(interaction.user.id);
    if (!expectedNonce) {
        return await interaction.reply({ content: "No pending login found. Run this command again without the link option first.", flags: MessageFlags.Ephemeral })
    }

    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        try {
        const { access_token, id_token } = await getToken(code);
        verifyNonce(id_token, expectedNonce as string);

        const riotTag = await getUsername(access_token);

        const member = interaction.guild?.members.cache.get(interaction.user.id);
        if (!member) {
            return await interaction.editReply({ content: "Couldn't find you in this server to rename." });
        }

        await member.setNickname(riotTag, "Linked to Riot Account");
        await interaction.editReply({ content: `Nickname set to \`${riotTag}\`.` });
    } catch (err) {
        await interaction.editReply({ content: `Failed to link account: ${(err as Error).message}` });
    } finally {
        nonces.delete(interaction.user.id);
    }
};
