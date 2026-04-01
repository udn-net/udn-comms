// this file is responsible for managing chats.

import { DATA_VERSION, ValidObject } from "../Utility/typeSafety";
import FileModel, { FileContent } from "../Files/fileModel";
import {
    HandlerManager,
    createTimestamp,
    localeCompare,
    parseValidObject,
    stringify,
} from "../Utility/utility";
import StorageModel, {
    StorageModelSubPath,
    filePaths,
} from "../Global/storageModel";
import { decryptString, encryptString } from "../Utility/crypto";

import ChatListModel from "./chatListModel";
import { Color } from "../../colors";
import ConnectionModel from "../Global/connectionModel";
import SettingsModel from "../Global/settingsModel";
import { v4 } from "uuid";

export default class ChatModel {
    connectionModel: ConnectionModel;
    storageModel: StorageModel;
    settingsModel: SettingsModel;
    chatListModel: ChatListModel;

    fileModel: FileModel;

    // data
    id: string;
    info: ChatInfo;
    color: Color;

    chatMessageHandlerManager: HandlerManager<ChatMessage> =
        new HandlerManager();

    get secondaryChannels(): string[] {
        return this.info.secondaryChannels.sort(localeCompare);
    }

    // paths
    getBasePath = (): string[] => {
        return StorageModel.getPath(
            StorageModelSubPath.Chat,
            filePaths.chat.chatBase(this.id),
        );
    };

    getInfoPath = (): string[] => {
        return StorageModel.getPath(
            StorageModelSubPath.Chat,
            filePaths.chat.info(this.id),
        );
    };

    getColorPath = (): string[] => {
        return StorageModel.getPath(
            StorageModelSubPath.Chat,
            filePaths.chat.color(this.id),
        );
    };

    getMessageDirPath = (): string[] => {
        return StorageModel.getPath(
            StorageModelSubPath.Chat,
            filePaths.chat.messages(this.id),
        );
    };

    getMessagePath = (id: string): string[] => {
        return [...this.getMessageDirPath(), id];
    };

    // handlers
    handleMessage = (body: string): void => {
        const chatMessage: ChatMessage | null = parseValidObject(
            body,
            ChatMessageReference,
        );
        if (chatMessage == null) return;

        chatMessage.status = ChatMessageStatus.Received;
        this.addMessage(chatMessage);

        this.setReadStatus(true);
    };

    handleMessageSent = (chatMessage: ChatMessage): void => {
        chatMessage.status = ChatMessageStatus.Sent;
        this.addMessage(chatMessage);
    };

    // settings
    setPrimaryChannel = (primaryChannel: string): void => {
        this.info.primaryChannel = primaryChannel;
        this.storeInfo();
        this.subscribe();
    };

    setSecondaryChannels = (secondaryChannels: string[]): void => {
        this.info.secondaryChannels = secondaryChannels;
        this.storeInfo();
    };

    setEncryptionKey = (key: string): void => {
        this.info.encryptionKey = key;
        this.storeInfo();
    };

    setColor = (color: Color): void => {
        this.color = color;
        this.storeColor();
    };

    // messaging
    addMessage = async (chatMessage: ChatMessage): Promise<void> => {
        await this.decryptMessage(chatMessage);

        // message
        if (chatMessage.body != "") {
            const messagePath: string[] = this.getMessagePath(chatMessage.id);
            this.storageModel.writeStringifiable(messagePath, chatMessage);
            this.chatMessageHandlerManager.trigger(chatMessage);
        }

        // file
        this.fileModel.handleStringifiedFileContent(
            chatMessage.stringifiedFile,
        );
    };

    sendMessage = async (
        body: string,
        fileContent?: FileContent<string>,
    ): Promise<boolean> => {
        const senderName = this.settingsModel.username;
        if (senderName == "") return false;

        const allChannels = [this.info.primaryChannel];
        for (const secondaryChannel of this.info.secondaryChannels) {
            allChannels.push(secondaryChannel);
        }

        const combinedChannel: string = allChannels.join("/");

        const chatMessage: ChatMessage = await ChatModel.createChatMessage(
            combinedChannel,
            senderName,
            this.info.encryptionKey,
            body,
            fileContent,
        );

        this.addMessage(chatMessage);
        this.connectionModel.sendMessageOrStore(chatMessage);
        return true;
    };

    decryptMessage = async (chatMessage: ChatMessage): Promise<void> => {
        const decryptedBody: string = await decryptString(
            chatMessage.body,
            this.info.encryptionKey,
        );
        const decryptedFile: string = await decryptString(
            chatMessage.stringifiedFile ?? "",
            this.info.encryptionKey,
        );
        chatMessage.body = decryptedBody;
        chatMessage.stringifiedFile = decryptedFile;
    };

    subscribe = (): void => {
        this.connectionModel.addChannel(this.info.primaryChannel);
    };

    setReadStatus = (hasUnreadMessages: boolean): void => {
        this.info.hasUnreadMessages = hasUnreadMessages;
        this.storeInfo();
    };

    // storage
    storeInfo = (): void => {
        this.storageModel.writeStringifiable(this.getInfoPath(), this.info);
    };

    storeColor = (): void => {
        this.storageModel.write(this.getColorPath(), this.color);
    };

    delete = () => {
        // untrack
        this.chatListModel.untrackChat(this);

        // delete
        const dirPath: string[] = this.getBasePath();
        this.storageModel.removeRecursively(dirPath);
    };

    // load
    loadInfo = (): void => {
        const info: ChatInfo | null = this.storageModel.readStringifiable(
            this.getInfoPath(),
            ChatInfoReference,
        );
        if (info != null) {
            this.info = info;
        } else {
            this.info = ChatModel.generateChatInfo("0");
        }
    };

    loadColor = (): void => {
        const path: string[] = this.getColorPath();
        const color: string | null = this.storageModel.read(path);
        if (!color) {
            this.color = Color.Standard;
        } else {
            this.color = color as any;
        }
    };

    get messages(): ChatMessage[] {
        const messageIds: string[] = this.storageModel.list(
            this.getMessageDirPath(),
        );
        if (!Array.isArray(messageIds)) return [];

        const chatMessages: ChatMessage[] = [];
        for (const messageId of messageIds) {
            const messagePath: string[] = this.getMessagePath(messageId);
            const chatMessage: ChatMessage | any =
                this.storageModel.readStringifiable(
                    messagePath,
                    ChatMessageReference,
                );
            chatMessages.push(chatMessage);
        }

        const sorted = chatMessages.sort((a, b) =>
            a.dateSent.localeCompare(b.dateSent),
        );
        return sorted;
    }

    // init
    constructor(
        storageModel: StorageModel,
        connectionModel: ConnectionModel,
        settingsModel: SettingsModel,
        chatListModel: ChatListModel,
        chatId: string,
    ) {
        this.id = chatId;
        this.connectionModel = connectionModel;
        this.settingsModel = settingsModel;
        this.storageModel = storageModel;
        this.chatListModel = chatListModel;

        this.loadInfo();
        this.loadColor();
        this.subscribe();

        this.fileModel = new FileModel(
            this.storageModel,
            this.settingsModel,
            this,
        );
    }

    // utility
    static splitChannel(channelString: string): string[] {
        return channelString.split("/");
    }

    static generateChatInfo = (primaryChannel: string): ChatInfo => {
        return {
            dataVersion: DATA_VERSION,

            primaryChannel,
            secondaryChannels: [],
            encryptionKey: "",
            hasUnreadMessages: false,
        };
    };

    static createChatMessage = async (
        channel: string,
        sender: string,
        encryptionKey: string,
        body: string,
        fileContent?: FileContent<string>,
    ): Promise<ChatMessage> => {
        const chatMessage: ChatMessage = {
            dataVersion: DATA_VERSION,

            id: v4(),

            channel,
            sender,
            body,
            dateSent: createTimestamp(),

            status: ChatMessageStatus.Outbox,
            stringifiedFile: "",
        };
        if (fileContent != undefined) {
            const stringifiedFile = stringify(fileContent);
            chatMessage.stringifiedFile = stringifiedFile;
        }

        if (encryptionKey != "") {
            chatMessage.body = await encryptString(
                chatMessage.body,
                encryptionKey,
            );
            chatMessage.stringifiedFile = await encryptString(
                chatMessage.stringifiedFile,
                encryptionKey,
            );
        }

        return chatMessage;
    };
}

// types
export interface ChatInfo extends ValidObject {
    primaryChannel: string;
    secondaryChannels: string[];
    encryptionKey: string;

    hasUnreadMessages: boolean;
}

export enum ChatMessageStatus {
    Outbox = "outbox",
    Sent = "sent",
    Received = "received",
    Other = "other",
}

export interface ChatMessage extends ValidObject {
    id: string;

    channel: string;
    sender: string;
    body: string;
    dateSent: string;

    status: ChatMessageStatus;

    stringifiedFile: string;
}

// references
export const ChatInfoReference: ChatInfo = {
    dataVersion: DATA_VERSION,

    primaryChannel: "",
    secondaryChannels: [""],
    encryptionKey: "",

    hasUnreadMessages: true,
};

export const ChatMessageReference: ChatMessage = {
    dataVersion: DATA_VERSION,

    id: "",

    channel: "",
    sender: "",
    body: "",
    dateSent: "",

    status: "" as ChatMessageStatus,

    stringifiedFile: "",
};
