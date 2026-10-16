import { echo } from "@atums/echo";
import { ShardingManager } from "discord.js";
import { setManager } from "./web";

const manager = new ShardingManager("./src/bot.ts", {
	totalShards: "auto",
	token: process.env.DISCORD_TOKEN,
});

manager.on("shardCreate", (shard) => {
	echo.custom("SHARDS", "Created", shard.id);
});

await manager.spawn();

setManager(manager);
