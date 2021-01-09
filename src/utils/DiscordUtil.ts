import {Guild, GuildMember} from "discord.js";

class DiscordUtil {
	static async getGuildMember(value: string, guild: Guild): Promise<GuildMember | undefined> {
		if (value === "") return;

		// UserID
		if ((/^[0-9]+$/g).test(value)) {
			try {
				return await guild.members.fetch(value);
			} catch (error) {
				return undefined;
			}
		}

		// Username + discriminator
		if ((/^.*#[0-9]{4}$/g).test(value)) {
			const [username, discriminator] = value.split("#");
			const memberList = await guild.members.fetch({query: username});

			return memberList?.find(memberObject => memberObject.user.discriminator === discriminator);
		}

		// Username without discriminator
		const guildMember = await guild.members.fetch({query: value});

		return guildMember.first();
	}
}

export default DiscordUtil;