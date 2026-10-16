import type { ClientUser } from "discord.js";

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

function avatarUrl(user: ClientUser): string {
	if (user.avatar) {
		const ext = user.avatar.startsWith("a_") ? "gif" : "png";
		return `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.${ext}?size=256`;
	}
	const index = Number((BigInt(user.id) >> 22n) % 6n);
	return `https://cdn.discordapp.com/embed/avatars/${index}.png`;
}

function _setStatus(state: "online" | "offline") {
	const el = $("status");
	el.dataset.state = state;
	el.textContent = state === "online" ? "Online" : "Offline";
}

function renderDetails(user: ClientUser, stats: BotStats) {
	const rows: [string, string][] = [
		["Uptime", `${stats.uptime}%`],
		["ID", user.id],
		["Username", user.username],
	];
	if (user.createdTimestamp) {
		rows.push([
			"Created",
			new Date(user.createdTimestamp).toLocaleDateString(),
		]);
	}
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
	const items: [string, number][] = [
		["Servers", stats.guilds],
		["Users", stats.users],
		["Commands", stats.subcommands],
	];
	$("stats").replaceChildren(
		...items.map(([label, value]) => {
			const box = document.createElement("div");
			const num = document.createElement("b");
			const text = document.createElement("span");
			box.className = "stat";
			num.textContent = value.toLocaleString();
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
	const user = await api<ClientUser>("/api/user");
	const stats = await api<BotStats>("/api/stats");

	const name = user.globalName ?? user.username;
	document.title = name;
	$("name").textContent = name;
	const img = $<HTMLImageElement>("avatar");
	img.src = avatarUrl(user);
	img.alt = `${name} avatar`;
	renderDetails(user, stats);
	renderStats(stats);
}

init();
