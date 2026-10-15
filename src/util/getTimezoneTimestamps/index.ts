export const getTimezoneTimestamps = (timeZone: string) => {
	const now = new Date();

	const current = new Intl.DateTimeFormat("en-US", {
		timeZone,
		weekday: "short",
		hour: "numeric",
		minute: "2-digit",
		timeZoneName: "short",
	}).format(now);

	const midnight = `${new Intl.DateTimeFormat("en-US", {
		timeZone,
		weekday: "short",
		month: "short",
		day: "numeric",
	}).format(now)}, 12:00 AM`;

	return { midnight, current };
};