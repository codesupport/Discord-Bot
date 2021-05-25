import { Constants, Message } from "discord.js";
import EventHandler from "../../abstracts/EventHandler";
import CommandFactory from "../../factories/CommandFactory";
import getConfigValue from "../../utils/getConfigValue";
import { COMMAND_PREFIX } from "../../config.json";
import GenericObject from "../../interfaces/GenericObject";

class CommandParserHandler extends EventHandler {
	private readonly commandFactory: CommandFactory;

	constructor() {
		super(Constants.Events.MESSAGE_CREATE);

		this.commandFactory = new CommandFactory();
		this.commandFactory.loadCommands();
	}

	handle = async (message: Message): Promise<void> => {
		if (message.content.startsWith(COMMAND_PREFIX)) {
			const BOTLESS_CHANNELS = getConfigValue<GenericObject<string>>("BOTLESS_CHANNELS");

			if (Object.values(BOTLESS_CHANNELS).includes(message.channel.id)) {
				return;
			}

			const args = message.content.replace("?", "").split(" ");
			const trigger = args.shift() || args[0];

			if (!trigger) return;

			/* eslint-disable */
			if (this.commandFactory.commandExists(trigger)) {
				const command = this.commandFactory.getCommand(trigger);
				const whitelist = command.getWhitelistedChannels();

				if (whitelist.length >= 1 && !whitelist.includes(message.channel.id)) {
					return;
				}

				await command.run(message, args);

				if (command.isSelfDestructing()) {
					await message.delete();
				}
			}
			/* eslint-enable */
		}
	}
}

export default CommandParserHandler;