import { AttachmentBuilder, MessageFlags } from "discord.js";
import waveforms from "../../../db/waveforms.json";

export const Versions = Object.keys(waveforms);

export const getAudio = async (version: string) => {
	const stream = Bun.file(`./audio/${version}.opus`);
	const waveform = waveforms[version as "pblq"];

	const audio = new AttachmentBuilder(Buffer.from(await stream.arrayBuffer()), {
		name: "voice-message.opus",
		duration: 0,
		waveform,
	});

	return {
		files: [audio],
		flags: MessageFlags.IsVoiceMessage,
	};
};
