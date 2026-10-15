export const getTimezoneTimestamps = (timeZone: string) => {
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

	const current = new Intl.DateTimeFormat("en-US", {
		timeZone,
		hour: "numeric",
		minute: "2-digit",
		timeZoneName: "short",
	}).format(now);

	return {
		midnight: `<t:${Math.floor(midnight / 1000)}:t>`,
		current,
	};
};
