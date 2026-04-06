// this file is responsible for managing UDN connections.

import { ChatMessage, ChatMessageReference } from "../Chat/chatModel";
import { HandlerManager, stringify } from "../Utility/utility";
import StorageModel, { StorageModelSubPath, filePaths } from "./storageModel";
import UDNFrontend, { Message } from "udn-frontend";

export default class ConnectionModel {
    udn: UDNFrontend;
    storageModel: StorageModel;
    reconnectInterval: number | undefined = undefined;
    shouldAttemptReconnect: boolean = false;

    // data
    get isConnected(): boolean {
        return this.udn.ws != undefined && this.udn.ws.readyState == 1;
    }

    get address(): string | undefined {
        return this.udn.ws?.url;
    }

    connectionChangeHandlerManager: HandlerManager<void> = new HandlerManager();
    messageHandlerManager: HandlerManager<Message> = new HandlerManager();
    messageSentHandlerManager: HandlerManager<ChatMessage> =
        new HandlerManager();

    channelsToSubscribe: Set<string> = new Set();

    // handlers
    handleMessage = (data: Message): void => {
        this.messageHandlerManager.trigger(data);
    };

    handleConnectionChange = (): void => {
        console.log("connection status:", this.isConnected, this.address);
        this.connectionChangeHandlerManager.trigger();
        if (this.address == undefined) return;

        this.storeAddress(this.address);
        this.sendSubscriptionRequest();
        this.sendMessagesInOutbox();
        this.shouldAttemptReconnect = true;
    };

    // connection
    connect = (address: string): void => {
        console.log("connecting...", address);
        this.udn.connect(address);
    };

    disconnect = (): void => {
        this.udn.disconnect();

        // do not reconnect
        const reconnectAddressPath: string[] = StorageModel.getPath(
            StorageModelSubPath.ConnectionModel,
            filePaths.connectionModel.reconnectAddress,
        );
        this.storageModel.remove(reconnectAddressPath);
        this.shouldAttemptReconnect = false;
    };

    reconnect = (): void => {
        const reconnectAddressPath: string[] = this.getReconnectAddressPath();
        const reconnectAddress: string | null =
            this.storageModel.read(reconnectAddressPath);
        if (reconnectAddress == null) return;

        console.log("reconnecting...");
        this.connect(reconnectAddress);
    };

    // mailbox
    getMailboxPath = (address: string): string[] => {
        const mailboxDirPath = StorageModel.getPath(
            StorageModelSubPath.ConnectionModel,
            filePaths.connectionModel.mailboxes,
        );
        const mailboxFilePath = [...mailboxDirPath, address];
        return mailboxFilePath;
    };

    requestNewMailbox = (): void => {
        console.log("requesting new mailbox");
        this.udn.requestMailbox();
    };

    connectMailbox = (): void => {
        if (this.address == undefined) return;

        const mailboxId = this.storageModel.read(
            this.getMailboxPath(this.address),
        );
        console.log("connecting mailbox", mailboxId);
        if (mailboxId == null) return this.requestNewMailbox();

        this.udn.connectMailbox(mailboxId);
    };

    storeMailbox = (mailboxId: string): void => {
        if (this.address == undefined) return;
        this.storageModel.write(this.getMailboxPath(this.address), mailboxId);
    };

    // subscription
    addChannel = (channel: string): void => {
        this.channelsToSubscribe.add(channel);
        this.sendSubscriptionRequest();
    };

    sendSubscriptionRequest = (): void => {
        if (this.isConnected == false) return;

        for (const channel of this.channelsToSubscribe) {
            this.udn.subscribe(channel);
        }
        // update mailbox
        this.connectMailbox();
    };

    // outbox
    getOutboxPath = (): string[] => {
        return StorageModel.getPath(
            StorageModelSubPath.ConnectionModel,
            filePaths.connectionModel.outbox,
        );
    };

    getOutboxMessags = (): ChatMessage[] => {
        const outboxPath: string[] = this.getOutboxPath();
        const messageIds: string[] = this.storageModel.list(outboxPath);

        let chatMessages: ChatMessage[] = [];
        for (const messageId of messageIds) {
            const chatMessage: ChatMessage | null =
                this.storageModel.readStringifiable(
                    [...outboxPath, messageId],
                    ChatMessageReference,
                );

            if (chatMessage == null) continue;
            chatMessages.push(chatMessage);
        }

        return chatMessages;
    };

    addToOutbox = (chatMessage: ChatMessage): void => {
        const messagePath: string[] = [...this.getOutboxPath(), chatMessage.id];
        this.storageModel.writeStringifiable(messagePath, chatMessage);
    };

    removeFromOutbox = (chatMessage: ChatMessage): void => {
        const messagePath: string[] = [...this.getOutboxPath(), chatMessage.id];
        this.storageModel.remove(messagePath);
    };

    sendMessagesInOutbox = (): void => {
        const messages: ChatMessage[] = this.getOutboxMessags();

        for (const message of messages) {
            const isSent: boolean = this.tryToSendMessage(message);
            if (isSent == false) return;

            this.removeFromOutbox(message);
        }
    };

    // messaging
    sendMessageOrStore = (chatMessage: ChatMessage): void => {
        const isSent = this.tryToSendMessage(chatMessage);
        if (isSent == true) return;

        this.addToOutbox(chatMessage);
    };

    tryToSendMessage = (chatMessage: ChatMessage): boolean => {
        const stringifiedBody: string = stringify(chatMessage);
        const isSent: boolean = this.sendPlainMessage(
            chatMessage.channel,
            stringifiedBody,
        );
        if (isSent) this.messageSentHandlerManager.trigger(chatMessage);
        return isSent;
    };

    sendPlainMessage = (channel: string, body: string): boolean => {
        return this.udn.sendMessage(channel, body);
    };

    // storage
    getPreviousAddressPath = (): string[] => {
        return StorageModel.getPath(
            StorageModelSubPath.ConnectionModel,
            filePaths.connectionModel.previousAddresses,
        );
    };

    getAddressPath = (address: string): string[] => {
        const dirPath = this.getPreviousAddressPath();
        return [...dirPath, address];
    };

    getReconnectAddressPath = (): string[] => {
        return StorageModel.getPath(
            StorageModelSubPath.ConnectionModel,
            filePaths.connectionModel.reconnectAddress,
        );
    };

    storeAddress = (address: string): void => {
        // history
        const addressPath = this.getAddressPath(address);
        this.storageModel.write(addressPath, "");

        // reconnect
        const reconnectAddressPath: string[] = this.getReconnectAddressPath();
        this.storageModel.write(reconnectAddressPath, address);
    };

    removeAddress = (address: string): void => {
        const addressPath = this.getAddressPath(address);
        this.storageModel.remove(addressPath);
    };

    get addresses(): string[] {
        const dirPath = this.getPreviousAddressPath();
        return this.storageModel.list(dirPath);
    }

    // init
    constructor(storageModel: StorageModel) {
        // create frontend
        this.udn = new UDNFrontend();
        this.storageModel = storageModel;

        // setup handlers
        this.udn.onmessage = (data: Message) => {
            this.handleMessage(data);
        };
        this.udn.onconnect = () => {
            this.handleConnectionChange();
        };
        this.udn.ondisconnect = () => {
            this.handleConnectionChange();
        };

        this.udn.onmailboxcreate = (mailboxId: string) => {
            console.log("created mailbox", mailboxId);
            this.storeMailbox(mailboxId);
            this.connectMailbox();
        };
        this.udn.onmailboxdelete = (mailboxId: string) => {
            console.log(`mailbox ${mailboxId} deleted`);
            this.requestNewMailbox();
        };
        this.udn.onmailboxconnect = (mailboxId: string) => {
            console.log(`using mailbox ${mailboxId}`);
        };

        setInterval(() => {
            if (this.isConnected == true) return;
            if (this.shouldAttemptReconnect == false) return;
            this.reconnect();
        }, 5000)
        this.reconnect();
    }
}

// paths
export enum settingsModelStorageFiles {
    username = "user-name",
    firstDayOfWeek = "first-day-of-week",
}
