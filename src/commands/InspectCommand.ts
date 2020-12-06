import {Message, MessageEmbed} from "discord.js";
import Command from "../abstracts/Command";
import DateUtils from "../utils/DateUtils";
import {EMBED_COLOURS} from "../config.json";

class InspectCommand extends Command {
	constructor() {
		super(
			"inspect",
			"Show information about a given user"
		);
	}

	async run(message: Message, args: string[]) {
		const embed = new MessageEmbed();

		try {
			let userObj;
			let userList;

			if (args.length > 0) {
				if ((/^\d+$/g).test(args[0])) {
					userObj = await message.guild?.members?.fetch(args[0]);
				} else {
					if (!(/^.*#[0-9]{4}$/).test(args[0])) throw "";

					const userData = args[0].split("#");

					const username = userData[0];
					const discriminator = userData[1];

					userList = await message.guild?.members?.fetch({query: username, limit: 1000});

					if (userList === undefined) return;

					if (userList?.size > 1) {
						userObj = await userList?.find(memberObject => memberObject.user.discriminator === discriminator);
					} else if (userList.size === 1) {
						userObj = userList?.first();
					}
				}
			} else {
				if (message.member === null) return;
				userObj = message.member;
			}

			if (userObj !== undefined) {
				if (message.guild === undefined) return;
				if (userObj?.joinedAt === null) return;

				embed.setTitle(`Inspecting ${userObj?.user.tag}`);
				embed.setThumbnail(userObj?.user.displayAvatarURL());
				embed.addField("User ID", userObj?.user.id);
				embed.addField("Username", userObj?.user.tag);
				embed.addField("Joined At", DateUtils.formatAsText(userObj?.joinedAt));
				if (userObj?.nickname !== null) embed.addField("Nickname", userObj?.nickname);
				embed.addField("Roles", `${userObj.roles.cache.filter(role => role.id !== message?.guild!.id).map(role => ` ${role.toString()}`)}`);
				embed.setColor(EMBED_COLOURS.SUCCESS);
			} else {
				embed.setTitle("Error");
				embed.setDescription("No user was found with this username/userID.");
				embed.setColor(EMBED_COLOURS.ERROR);
			}
		} catch (error) {
			embed.setTitle("Error");
			embed.setDescription("Incorrect usage of command");
			embed.addField("Correct Usage", "?inspect [username + discriminator / userID]");
			embed.setColor(EMBED_COLOURS.ERROR);
		}

		await message.channel.send({embed});
	}
}

export default InspectCommand;