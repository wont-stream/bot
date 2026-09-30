import { Glob } from "bun";

async function makeWaveform(path: string): Promise<string> {
	const proc = Bun.spawn(
		["ffmpeg", "-i", path, "-f", "s16le", "-ac", "1", "-ar", "8000", "pipe:1"],
		{
			stdout: "pipe",
			stderr: "ignore",
		},
	);

	const pcm = Buffer.from(await new Response(proc.stdout).arrayBuffer());
	await proc.exited;

	const samples = new Int16Array(
		pcm.buffer,
		pcm.byteOffset,
		Math.floor(pcm.byteLength / 2),
	);

	const bucketSize = Math.max(1, Math.floor(samples.length / 256));
	const waveform = new Uint8Array(256);

	for (let i = 0; i < 256; i++) {
		const start = i * bucketSize;
		const end = Math.min(start + bucketSize, samples.length);

		let peak = 0;

		for (let j = start; j < end; j++) {
			//@ts-expect-error pls
			peak = Math.max(peak, Math.abs(samples[j]));
		}

		// Int16 -> Discord's 0-255 amplitude range
		waveform[i] = Math.min(255, Math.round((peak / 32768) * 255));
	}

	return Buffer.from(waveform).toString("base64");
}

const glob = new Glob("**/*.opus");

const waveforms: Record<string, string> = {};

for await (const file of glob.scan({ cwd: "./audio" })) {
	waveforms[file.replace(".opus", "")] = await makeWaveform(`./audio/${file}`);
}

await Bun.write("./db/waveforms.json", JSON.stringify(waveforms, null, 2));
