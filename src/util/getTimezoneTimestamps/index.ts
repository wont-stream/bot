export const getTimezoneTimestamps = (timeZone: string) => {
	const now = new Date();

	const parts = Object.fromEntries(
		new Intl.DateTimeFormat("en-US", {
			timeZone,
			hour: "numeric",
			minute: "numeric",
			second: "numeric",
			hourCycle: "h23",
		})
			.formatToParts(now)
			.map(({ type, value }) => [type, Number(value)]),
	);

	const secondsSinceMidnight =
		(parts.hour ?? 0) * 3600 + (parts.minute ?? 0) * 60 + (parts.second ?? 0);

	const midnightUnix = Math.floor(now.getTime() / 1000) - secondsSinceMidnight;

	const current = new Intl.DateTimeFormat("en-US", {
		timeZone,
		weekday: "short",
		hour: "numeric",
		minute: "2-digit",
	}).format(now);

	return {
		midnight: `<t:${midnightUnix}:t>`,
		current,
	};
};
