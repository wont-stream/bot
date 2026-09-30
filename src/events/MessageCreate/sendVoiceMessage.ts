import { Events, type MessageReplyOptions } from "discord.js";
import { getAudio } from "../../util/getAudio";

const pbhqtriggers = [
	"pink blush",
	"music",
	"outfit",
	"purse",
	"heels",
	"ratatatata",
	"puna",
	"nanana",
	"shalaka",
	"dahda",
	"dada",
];

const pblqtriggers = ["shein"];

const rlrsk8hqtriggers = ["rollerskate", "roller skate", "car"];

const rlrsk8lqtriggers = ["vroom", "goodwill"];

export const execute = async (client: CommandClient) => {
	client.on(Events.MessageCreate, async (message) => {
		if (
			pbhqtriggers.some((trigger) =>
				message.content.toLowerCase().includes(trigger),
			)
		) {
			return await message.reply(
				(await getAudio("pbhq")) as MessageReplyOptions,
			);
		}

		if (
			pblqtriggers.some((trigger) =>
				message.content.toLowerCase().includes(trigger),
			)
		) {
			return await message.reply(
				(await getAudio("pblq")) as MessageReplyOptions,
			);
		}

		if (
			rlrsk8hqtriggers.some((trigger) =>
				message.content.toLowerCase().includes(trigger),
			)
		) {
			return await message.reply(
				(await getAudio("rlrsk8hq")) as MessageReplyOptions,
			);
		}

		if (
			rlrsk8lqtriggers.some((trigger) =>
				message.content.toLowerCase().includes(trigger),
			)
		) {
			return await message.reply(
				(await getAudio("rlrsk8lq")) as MessageReplyOptions,
			);
		}
	});
};
