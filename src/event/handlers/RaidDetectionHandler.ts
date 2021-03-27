import { Constants, GuildMember, TextChannel } from "discord.js";
import EventHandler from "../../abstracts/EventHandler";
import { RAID_SETTINGS, LOG_CHANNEL_ID, GENERAL_CHANNEL_ID, MOD_ROLE } from "../../config.json";
import getConfigValue from "../../utils/getConfigValue";

class RaidDetectionHandler extends EventHandler {
	private joinQueue: GuildMember[] = [];

	constructor() {
		super(Constants.Events.GUILD_MEMBER_ADD);
	}

	handle = async (member: GuildMember): Promise<void> => {
		const timeToWait = 1000 * getConfigValue<number>("RAID_SETTINGS.TIME_TILL_REMOVAL");
		const modChannel = member.guild?.channels.cache.find(channel => channel.id === LOG_CHANNEL_ID) as TextChannel;
		const generalChannel = member.guild?.channels.cache.find(channel => channel.id === GENERAL_CHANNEL_ID) as TextChannel;

		this.joinQueue.push(member);

		if (this.joinQueue.length >= RAID_SETTINGS.MAX_QUEUE_SIZE) {
			try {
				await Promise.all(this.joinQueue.map(async member => {
					await member.kick("Detected as part of a raid.");
					await modChannel.send(`@<${MOD_ROLE}> **RAID DETECTION** Kicked user ${member.displayName} (${member.id}).`);
				}));

				this.joinQueue = [];

				await generalChannel.send(`
					**:warning: We have detected a raid is currently going on and are solving the issue.**
					Please refrain from notifying the moderators or spamming this channel.
					Thank you for your cooperation and we apologise for any inconvenience.
				`);
			} catch (error) {
				console.error(error);

				await modChannel.send(`Failed to kick users or empty queue: \n\`${error.message}\``);
			}
		}

		setTimeout(() => {
			if (this.joinQueue.includes(member)) {
				this.joinQueue.splice(this.joinQueue.indexOf(member), 1);
			}
		}, timeToWait);
	}
}

export default RaidDetectionHandler;
