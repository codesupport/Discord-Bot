import { GuildMember, Message, MessageEmbed } from "discord.js";
import DiscordUtils from "../utils/DiscordUtils";
import Command from "../abstracts/Command";
import DateUtils from "../utils/DateUtils";
import { EMBED_COLOURS } from "../config.json";

class InspectCommand extends Command {
	constructor() {
		super(
			"inspect",
			"Show information about a given user"
		);
	}

	async run(message: Message, args: string[]) {
		const userObj = args.length > 0
			? await DiscordUtils.getGuildMember(args[0], message.guild!)
			: message.member!;

		const embed = userObj === undefined
			? this.buildNoMatchEmbed()
			: this.buildInspectEmbed(userObj!);

		await message.channel.send({embed});
	}

	private buildNoMatchEmbed(): MessageEmbed {
		const embed = new MessageEmbed();

		embed.setTitle("Error");
		embed.setDescription("No match found.");
		embed.addField("Correct Usage", "?inspect [username|userID]");
		embed.setColor(EMBED_COLOURS.ERROR);

		return embed;
	}

	private buildInspectEmbed(memberObj: GuildMember): MessageEmbed {
		const embed = new MessageEmbed();

		embed.setTitle(`Inspecting ${memberObj?.user.tag}`);
		embed.setColor(memberObj?.displayColor || EMBED_COLOURS.DEFAULT);
		embed.setThumbnail(memberObj?.user.displayAvatarURL());
		embed.addField("User ID", memberObj?.user.id);
		embed.addField("Username", memberObj?.user.tag);

		if (memberObj?.nickname !== null) embed.addField("Nickname", memberObj?.nickname);

		if (memberObj?.joinedAt !== null) embed.addField("Joined At", DateUtils.formatAsText(memberObj?.joinedAt!));

		if (memberObj?.roles.cache.size > 1) {
			embed.addField("Roles", `${memberObj.roles.cache.filter(role => role.id !== memberObj?.guild!.id).map(role => ` ${role.toString()}`)}`);
		} else {
			embed.addField("Roles", "No roles");
		}

		return embed;
	}
}

export default InspectCommand;
