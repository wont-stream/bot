import { setClient } from "../../web";

export const execute = async (client: CommandClient) => {
	setClient(client);
};
