import { expect } from "chai";
import { Constants, Channel, Message, MessageMentions, Collection, User } from "discord.js";
import { SinonSandbox, createSandbox } from "sinon";
import EventHandler from "../../../src/abstracts/EventHandler";
import MockDiscord from "../../MockDiscord";
import GhostPingHandler from "../../../src/event/handlers/GhostPingHandler";

describe("GhostPingHandler", () => {
	describe("constructor()", () => {
		it("creates a handler for MESSAGE_DELETE", () => {
			const handler = new GhostPingHandler();

			expect(handler.getEvent()).to.equal(Constants.Events.MESSAGE_DELETE);
		});
	});

	describe("handle()", () => {
		let sandbox: SinonSandbox;
		let handler: EventHandler;
		let discordMock: MockDiscord;

		beforeEach(() => {
			sandbox = createSandbox();
			handler = new GhostPingHandler();
			discordMock = new MockDiscord();
		});

		it("sends a message when a message is deleted that pinged a user", async () => {
			const message = discordMock.getMessage();
			const messageMock = sandbox.stub(message.channel, "send");

			const mockUser = new User(discordMock.getClient(), {
				id: "328194044587147278",
				username: "user username",
				discriminator: "user#0000",
				avatar: "user avatar url",
				bot: false
			});

			message.mentions = new MessageMentions(message, [mockUser], [], false);

			message.content = "Hey <@328194044587147278>!";

			await handler.handle(message);

			expect(messageMock.calledOnce).to.be.true;
		});

		it("does not send a message when a message is deleted that didn't ping a user", async () => {
			const message = discordMock.getMessage();
			const messageMock = sandbox.stub(message.channel, "send");

			message.mentions = new MessageMentions(message, [], [], false);

			message.content = "Hey everybody!";

			await handler.handle(message);

			expect(messageMock.calledOnce).to.be.false;
		});

		it("does not send a message when it's author is a bot", async () => {
			const message = discordMock.getMessage();
			const messageMock = sandbox.stub(message.channel, "send");

			const author = discordMock.getUser();
			author.bot = true;

			message.author = author;
			message.mentions = new MessageMentions(message, [discordMock.getUser()], [], false);
			message.content = "Hey <@328194044587147278>, stop spamming or we'll arrest you!";

			await handler.handle(message);

			expect(messageMock.called).to.be.false;
		});

		it("does not send a message when author only mentions himself", async () => {
			const message = discordMock.getMessage();
			const messageMock = sandbox.stub(message.channel, "send");

			const author = discordMock.getUser();

			message.author = author;
			message.mentions = new MessageMentions(message, [discordMock.getUser()], [], false);
			message.content = `<@${message.author.id}>`;
			message.mentions.users.size === 1;
			message.mentions.users.first()?.id !== message.author.id;

			await handler.handle(message);

			expect(messageMock.called).to.be.false;
		});

		it("sends a message when message author and someone else is being mentioned", async () => {
			const message = discordMock.getMessage();
			const messageMock = sandbox.stub(message.channel, "send");

			const author = discordMock.getUser();
			const mockUser = new User(discordMock.getClient(), {
				id: "328194044587147278",
				username: "user username",
				discriminator: "user#0000",
				avatar: "user avatar url",
				bot: false
			});

			message.author = author;
			message.mentions = new MessageMentions(message, [discordMock.getUser(), mockUser], [], false);
			message.content = `<@${message.author.id}> <@328194044587147278>`;

			await handler.handle(message);

			expect(messageMock.called).to.be.true;
		});

		afterEach(() => {
			sandbox.restore();
		});
	});
});

