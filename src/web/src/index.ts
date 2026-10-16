/** Fetch JSON from the bot API. Add new endpoints by calling api<T>("/api/...") . */
async function api<T>(path: string): Promise<T> {
	const res = await fetch(`${path}?t=${Date.now()}`);
	if (!res.ok) throw new Error(`${path} returned ${res.status}`);
	return res.json() as Promise<T>;
}

/** Response of /api/stats. */
interface BotStats {
	guilds: number;
	users: number;
	commands: number;
	subcommands: number;
	inviteUrl: string;
	uptime: string;
}

const $ = <T extends HTMLElement>(id: string) =>
	document.getElementById(id) as T;

function renderDetails(stats: BotStats) {
	const rows: [string, string][] = [["Uptime", `${stats.uptime}%`]];

	const dl = $("details");
	dl.replaceChildren(
		...rows.flatMap(([label, value]) => {
			const dt = document.createElement("dt");
			const dd = document.createElement("dd");
			dt.textContent = label;
			dd.textContent = value;
			return [dt, dd];
		}),
	);
}

function renderStats(stats: BotStats) {
	const items: [string, string][] = [
		["Servers", stats.guilds.toLocaleString()],
		["Users", stats.users.toLocaleString()],
		["Commands", stats.subcommands.toLocaleString()],
	];
	$("stats").replaceChildren(
		...items.map(([label, value]) => {
			const box = document.createElement("div");
			const num = document.createElement("b");
			const text = document.createElement("span");
			box.className = "stat";
			num.textContent = value;
			text.textContent = label;
			box.append(num, text);
			return box;
		}),
	);
	const invite = $<HTMLAnchorElement>("invite");
	invite.href = stats.inviteUrl;
	invite.hidden = false;
}

async function init() {
	const stats = await api<BotStats>("/api/stats");

	renderDetails(stats);
	renderStats(stats);
}

init();
