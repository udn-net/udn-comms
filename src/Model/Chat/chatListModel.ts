import ChatModel, { ChatMessage } from "./chatModel";
import StorageModel, {
    StorageModelSubPaths,
    filePaths,
} from "../Global/storageModel";

import ConnectionModel from "../Global/connectionModel";
import { Message } from "udn-frontend";
import SettingsModel from "../Global/settingsModel";
import { v4 } from "uuid";

export default class ChatListModel {
    storageModel: StorageModel;
    settingsModel: SettingsModel;
    connectionModel: ConnectionModel;

    // data
    chatModels: Set<ChatModel> = new Set<ChatModel>();

    // handlers
    messageHandler = (data: Message): void => {
        const channel: string | undefined = data.messageChannel;
        const body: string | undefined = data.messageBody;
        if (channel == undefined) return;
        if (body == undefined) return;

        this.routeMessageToCorrectChatModel(channel, (chatModel: ChatModel) =>
            chatModel.handleMessage(body),
        );
    };

    messageSentHandler = (chatMessage: ChatMessage): void => {
        const channel: string = chatMessage.channel;

        this.routeMessageToCorrectChatModel(channel, (chatModel: ChatModel) =>
            chatModel.handleMessageSent(chatMessage),
        );
    };

    // methods
    routeMessageToCorrectChatModel = (
        channel: string,
        fn: (chatModel: ChatModel) => void,
    ): void => {
        const allChannels = channel.split("/");

        for (const chatModel of this.chatModels) {
            for (const channel of allChannels) {
                if (channel != chatModel.info.primaryChannel) continue;
                fn(chatModel);
                break;
            }
        }
    };

    // storage
    addChatModel = (chatModel: ChatModel) => {
        this.chatModels.add(chatModel);
    };

    createChat = (primaryChannel: string): ChatModel => {
        const id: string = v4();

        const chatModel = new ChatModel(
            this.storageModel,
            this.connectionModel,
            this.settingsModel,
            this,
            id,
        );
        chatModel.setPrimaryChannel(primaryChannel);

        this.addChatModel(chatModel);
        return chatModel;
    };

    untrackChat = (chat: ChatModel): void => {
        this.chatModels.delete(chat);
    };

    // load
    loadChats = (): void => {
        const chatDir = StorageModel.getPath(
            StorageModelSubPaths.Chat,
            filePaths.chat.base,
        );
        const chatIds = this.storageModel.list(chatDir);
        for (const chatId of chatIds) {
            const chatModel = new ChatModel(
                this.storageModel,
                this.connectionModel,
                this.settingsModel,
                this,
                chatId,
            );
            this.addChatModel(chatModel);
        }
    };

    // init
    constructor(
        storageModel: StorageModel,
        settingsModel: SettingsModel,
        connectionModel: ConnectionModel,
    ) {
        this.storageModel = storageModel;
        this.settingsModel = settingsModel;
        this.connectionModel = connectionModel;
        this.loadChats();

        connectionModel.messageHandlerManager.addHandler(this.messageHandler);
        connectionModel.messageSentHandlerManager.addHandler(
            this.messageSentHandler,
        );
    }
}
