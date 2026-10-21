import { EmbedBuilder } from "discord.js";

export const fetchJson = async <T>(
	url: string,
	timeoutMs = 5000,
): Promise<T | null> => {
	try {
		const response = await fetch(url, {
			signal: AbortSignal.timeout(timeoutMs),
		});
		if (!response.ok) return null;
 
		return (await response.json()) as T;
	} catch {
		return null;
	}
};

export const isHttpsUrl = (value: unknown): value is string => {
	if (typeof value !== "string") return false;
 
	try {
		return new URL(value).protocol === "https:";
	} catch {
		return false;
	}
};
 
export const apiUnavailable = new EmbedBuilder()
	.setDescription("-# This service is unavailable. Try again later.")
	.setColor("#800000");
 