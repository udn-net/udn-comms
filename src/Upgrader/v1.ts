// this file is responsible for migrating data from v1 to v2.

import {
    BoardInfoFileContent,
    TaskFileContent,
} from "../Model/Files/boardsAndTasksModel";
import ChatModel, {
    ChatMessage,
    ChatMessageStatus,
} from "../Model/Chat/chatModel";
import {
    getLocalStorageItemAndClear,
    parseArray,
    parseOrFallback,
} from "../Model/Utility/utility";

import ChatListModel from "../Model/Chat/chatListModel";
import ConnectionModel from "../Model/Global/connectionModel";
import FileModel from "../Model/Files/fileModel";
import SettingsModel from "../Model/Global/settingsModel";
import { checkMatchesObjectStructure } from "../Model/Utility/typeSafety";
import { translations } from "../View/translations";
import { v4 } from "uuid";

export default class v1Upgrader {
    // general
    migrateSettings = (): void => {
        const name: string | null = getLocalStorageItemAndClear("sender-name");
        if (name != null) {
            const parsedName: string = parseOrFallback(name);
            this.settingsModel.setName(parsedName);
        }

        const firstDayOfWeek: string | null =
            getLocalStorageItemAndClear("first-day-of-week");
        if (firstDayOfWeek != null) {
            const parsedFirstDayOfWeek: string =
                parseOrFallback(firstDayOfWeek);
            this.settingsModel.setFirstDayOfWeek(parsedFirstDayOfWeek);
        }
    };

    migrateConnections = (): void => {
        const previousAddressString: string | null =
            getLocalStorageItemAndClear("previous-addresses");
        if (previousAddressString == null) return;

        const previousAddresses: any[] = parseArray(previousAddressString);
        for (const address of previousAddresses) {
            if (typeof address != "string") continue;
            this.connectionModel.storeAddress(address);
        }
    };

    // chats
    migrateChats = (): void => {
        const chatIdString: string | null =
            getLocalStorageItemAndClear("chat-ids");
        if (chatIdString == null) return;

        const chatIds: any[] = parseArray(chatIdString);
        for (const chatId of chatIds) {
            if (typeof chatId != "string") continue;
            this.migrateChatById(chatId);
        }
    };

    migrateChatById = (id: string): void => {
        // get primary channel
        const primaryChannel: string | null = getLocalStorageItemAndClear(
            storageKeys.primaryChannel(id),
        );
        if (primaryChannel == null) return;
        const parsedPriamryChannel: string = parseOrFallback(primaryChannel);

        // create chat
        const chatModel: ChatModel =
            this.chatListModel.createChat(parsedPriamryChannel);

        // secondary channels
        const secondaryChannelString: string | null =
            getLocalStorageItemAndClear(storageKeys.secondaryChannels(id));
        if (secondaryChannelString != null) {
            const potentialSecondaryChannels: any[] = parseArray(
                secondaryChannelString,
            );

            const confirmedSecondaryChannels: string[] = [];
            for (const secondaryChannel of potentialSecondaryChannels) {
                if (typeof secondaryChannel != "string") continue;
                confirmedSecondaryChannels.push(secondaryChannel);
            }

            chatModel.setSecondaryChannels(confirmedSecondaryChannels);
        }

        // encryption key
        const encryptionKey: string | null = getLocalStorageItemAndClear(
            storageKeys.encyptionKey(id),
        );
        if (encryptionKey != null) {
            const parsedEncryptionKey: string = parseOrFallback(encryptionKey);
            chatModel.setEncryptionKey(parsedEncryptionKey);
        }

        // messages
        const messagesString: string =
            getLocalStorageItemAndClear(storageKeys.messages(id)) ?? "";
        const messageOutboxString: string =
            getLocalStorageItemAndClear(storageKeys.outbox(id)) ?? "";
        const potentialMessages: any[] = parseArray(messagesString);
        const potentialMessagesInOutbox: any[] =
            parseArray(messageOutboxString);

        const addMessages = (
            potentialMessages: any[],
            status: ChatMessageStatus,
        ) => {
            for (const potentialMessage of potentialMessages) {
                const isV1ChatMessage: boolean = checkMatchesObjectStructure(
                    potentialMessage,
                    V1ChatMessageReference,
                );
                if (isV1ChatMessage == false) continue;
                const v1ChatMessage: typeof V1ChatMessageReference =
                    potentialMessage;

                const convertedChatMessage: ChatMessage = {
                    dataVersion: "v2",

                    id: v4(),

                    channel: v1ChatMessage.channel,
                    sender: v1ChatMessage.sender,
                    body: v1ChatMessage.body,
                    dateSent: v1ChatMessage.isoDate,

                    status,
                    stringifiedFile: "",
                };
                chatModel.addMessage(convertedChatMessage);
                if (status == ChatMessageStatus.Outbox) {
                    this.connectionModel.sendMessageOrStore(
                        convertedChatMessage,
                    );
                }
            }
        };

        addMessages(potentialMessages, ChatMessageStatus.Received);
        addMessages(potentialMessagesInOutbox, ChatMessageStatus.Outbox);

        // objects
        const objectsString: string =
            getLocalStorageItemAndClear(storageKeys.objects(id)) ?? "";
        const objectOutboxString: string =
            getLocalStorageItemAndClear(storageKeys.itemOutbox(id)) ?? "";
        const potentialObjects: any[] = parseArray(objectsString);
        const potentialObjectsInOutbox: any[] = parseArray(objectOutboxString);

        const addObjects = (potentialObjects: any[]): void => {
            const board: BoardInfoFileContent =
                chatModel.fileModel.boardsAndTasksModel.createBoard(
                    translations.updater.migrated,
                );
            chatModel.fileModel.boardsAndTasksModel.updateBoard(board);

            for (const potentialObjectEntry of potentialObjects) {
                const potentialObject = potentialObjectEntry[1];
                const isV1MessageObject: boolean =
                    checkIsV1MessageObject(potentialObject);
                if (isV1MessageObject == false) continue;

                const objectId: string = potentialObject.id;
                const objectName: string = potentialObject.title;

                const contentVersions: any[] = Object.values(
                    potentialObject.contentVersions,
                );
                for (const potentialVersion of contentVersions) {
                    const isV1MessageObjectContent: boolean =
                        checkIsV1MessageObjectContent(potentialVersion);
                    if (isV1MessageObjectContent == false) continue;

                    const convertedTaskFileContent: TaskFileContent = {
                        dataVersion: "v2",

                        fileId: objectId,
                        fileContentId: FileModel.generateFileContentId(
                            potentialVersion.isoDateVersionCreated,
                        ),
                        creationDate: potentialVersion.isoDateVersionCreated,
                        type: "task",

                        name: objectName ?? "",
                        boardId: board.fileId ?? "",

                        description: potentialVersion.noteContent ?? "",

                        category: potentialVersion.categoryName ?? "",
                        status: potentialVersion.status ?? "",
                        priority: potentialVersion.priority ?? "",

                        date: potentialVersion.date ?? "",
                        time: potentialVersion.time ?? "",
                    };
                    console.log(convertedTaskFileContent);
                    chatModel.fileModel.handleFileContent(
                        convertedTaskFileContent,
                    );
                }
            }
        };

        addObjects([...potentialObjects, ...potentialObjectsInOutbox]);
    };

    // init
    constructor(
        public settingsModel: SettingsModel,
        public connectionModel: ConnectionModel,
        public chatListModel: ChatListModel,
    ) {
        this.migrateSettings();
        this.migrateConnections();
        this.migrateChats();
    }
}

const storageKeys = {
    viewType(id: string): string {
        return id + "view-type";
    },

    hasUnread(id: string): string {
        return id + "has-unread-messages";
    },

    primaryChannel(id: string): string {
        return id + "primary-channel";
    },

    secondaryChannels(id: string): string {
        return id + "secondary-channels";
    },

    encyptionKey(id: string): string {
        return id + "encryption-key";
    },

    messages(id: string): string {
        return id + "messages";
    },

    objects(id: string): string {
        return id + "items";
    },

    outbox(id: string): string {
        return id + "outbox";
    },

    itemOutbox(id: string): string {
        return id + "item-outbox";
    },

    composingMessage(id: string): string {
        return id + "composing-message";
    },
};

const V1ChatMessageReference = {
    channel: "",
    sender: "",
    body: "",
    isoDate: "",
};

function checkIsV1MessageObject(object: any): boolean {
    if (object.id == undefined) return false;
    if (object.title == undefined) return false;
    if (object.contentVersions == undefined) return false;

    return true;
}

function checkIsV1MessageObjectContent(object: any): boolean {
    if (object.id == undefined) return false;
    if (object.isoDateVersionCreated == undefined) return false;

    return true;
}
