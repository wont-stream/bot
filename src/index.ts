import { echo } from "@atums/echo";
import { ShardingManager } from "discord.js";
import AutoPoster from "topgg-autoposter";
import { setManager } from "./web";

const manager = new ShardingManager("./src/bot.ts", {
	totalShards: "auto",
	token: process.env.DISCORD_TOKEN,
});

if (process.env.TOPGG_TOKEN) {
	const poster = AutoPoster(process.env.TOPGG_TOKEN, manager);

	poster.on("posted", (stats) => {
		echo.custom(
			"TOPGG",
			"Posted",
			`Server count: ${stats.serverCount}, Shard count: ${stats.shardCount}`,
		);
	});

	poster.on("error", (error) => {
		echo.error(error);
	});
}

manager.on("shardCreate", (shard) => {
	echo.custom("SHARDS", "Created", shard.id);
});

await manager.spawn();

setManager(manager);
