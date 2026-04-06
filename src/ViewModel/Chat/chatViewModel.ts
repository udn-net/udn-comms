import * as React from "bloatless-react";

import CalendarPageViewModel, {
    CALENDAR_EVENT_BOARD_ID,
} from "../Pages/calendarPageViewModel";
import ChatModel, {
    ChatMessage,
    ChatMessageReaction,
} from "../../Model/Chat/chatModel";
import StorageModel, {
    StorageModelSubPath,
    filePaths,
} from "../../Model/Global/storageModel";

import ChatListViewModel from "./chatListViewModel";
import { Color } from "../../colors";
import CoreViewModel from "../Global/coreViewModel";
import { Entry } from "../../View/Components/option";
import MessagePageViewModel from "../Pages/messagePageViewModel";
import SettingsPageViewModel from "../Pages/settingsPageViewModel";
import SettingsViewModel from "../Global/settingsViewModel";
import TaskPageViewModel from "../Pages/taskPageViewModel";
import { translations } from "../../View/translations";
import ConnectionViewModel from "../Global/connectionViewModel";
import NotificationViewModel from "../Global/notificationViewModel";

export default class ChatViewModel {
    chatModel: ChatModel;
    storageModel: StorageModel;
    settingsViewModel: SettingsViewModel;
    notificationViewModel: NotificationViewModel;
    connectionViewModel: ConnectionViewModel;
    chatListViewModel: ChatListViewModel;

    calendarViewModel: CalendarPageViewModel;
    taskPageViewModel: TaskPageViewModel;
    messagePageViewModel: MessagePageViewModel;
    settingsPageViewModel: SettingsPageViewModel;

    // state
    displayedColor: React.State<Color> = new React.State<any>(Color.Standard);
    selectedPage: React.State<ChatPageType> = new React.State<any>(
        ChatPageType.Messages,
    );

    index: React.State<number> = new React.State(0);
    hasUnreadMessages: React.State<boolean> = new React.State(false);

    taskBoardSuggestions: React.MapState<Entry> = new React.MapState();

    // view
    open = (): void => {
        this.chatListViewModel.openChat(this);
    };

    close = (): void => {
        this.chatListViewModel.closeChat();
    };

    closeSubPages = (): void => {};

    setColor = (color: Color): void => {
        this.setDisplayedColor(color);
        this.chatModel.setColor(color);
    };

    setDisplayedColor = (color: Color): void => {
        this.displayedColor.value = color;
    };

    resetColor = (): void => {
        this.displayedColor.value = this.settingsPageViewModel.color.value;
    };

    updateIndex = (): void => {
        const index: number =
            this.chatListViewModel.chatIndexManager.getIndex(this);
        this.index.value = index;
    };

    // load
    loadPageSelection = (): void => {
        const path: string[] = StorageModel.getPath(
            StorageModelSubPath.Chat,
            filePaths.chat.lastUsedPage(this.chatModel.id),
        );
        const lastUsedPage: string | null = this.storageModel.read(path);
        if (lastUsedPage != null) {
            this.selectedPage.value = lastUsedPage as any;
        }

        this.selectedPage.subscribeSilent((newPage) => {
            this.storageModel.write(path, newPage);
            this.resetColor();
        });
    };

    loadInfo = (): void => {
        this.updateReadStatus();
        this.taskBoardSuggestions.set(CALENDAR_EVENT_BOARD_ID, [
            CALENDAR_EVENT_BOARD_ID,
            translations.chatPage.calendar.eventsBoard,
        ]);
    };

    updateReadStatus = (): void => {
        if (
            this.chatListViewModel.selectedChat.value == this &&
            this.selectedPage.value == ChatPageType.Messages
        ) {
            this.chatModel.setReadStatus(false);
        }
        this.hasUnreadMessages.value = this.chatModel.info.hasUnreadMessages;
    };

    setReadStatus = (hasUnreadMessages: boolean): void => {
        this.chatModel.setReadStatus(hasUnreadMessages);
        this.hasUnreadMessages.value = hasUnreadMessages;
    };

    subscribeReadStatus = (): void => {
        React.createProxyState(
            [this.selectedPage, this.chatListViewModel.selectedChat],
            () => {
                if (this.chatListViewModel.selectedChat.value != this) return;
                if (this.selectedPage.value != ChatPageType.Messages) return;
                this.setReadStatus(false);
            },
        );
    };

    // init
    constructor(
        public coreViewModel: CoreViewModel,
        storageModel: StorageModel,
        chatModel: ChatModel,
        settingsViewModel: SettingsViewModel,
        notificationViewModel: NotificationViewModel,
        connectionViewModel: ConnectionViewModel,
        chatListViewModel: ChatListViewModel,
    ) {
        // models
        this.storageModel = storageModel;
        this.chatModel = chatModel;
        this.settingsViewModel = settingsViewModel;
        this.connectionViewModel = connectionViewModel;
        this.notificationViewModel = notificationViewModel;
        this.chatListViewModel = chatListViewModel;

        // page viewModels
        this.calendarViewModel = new CalendarPageViewModel(
            coreViewModel,
            this,
            this.storageModel,
            this.chatModel.fileModel.boardsAndTasksModel.calendarModel,
            this.chatModel.fileModel.boardsAndTasksModel,
        );
        this.taskPageViewModel = new TaskPageViewModel(
            this.coreViewModel,
            this,
            this.storageModel,
            this.chatModel.fileModel.boardsAndTasksModel,
        );
        this.messagePageViewModel = new MessagePageViewModel(
            this.coreViewModel,
            this,
        );
        this.settingsPageViewModel = new SettingsPageViewModel(
            this.coreViewModel,
            this,
        );

        // handlers
        chatModel.chatMessageHandlerManager.addHandler(
            (chatMessage: ChatMessage) => {
                this.messagePageViewModel.showChatMessage(chatMessage);
                this.updateReadStatus();

                this.notificationViewModel.showNotification(chatMessage);
            },
        );
        chatModel.reactionHandlerManager.addHandler(
            (reaction: ChatMessageReaction) => {
                this.messagePageViewModel.showReaction(reaction);
            },
        );

        // load
        this.loadPageSelection();
        this.resetColor();
        this.loadInfo();
        this.subscribeReadStatus();
    }
}

// types
export enum ChatPageType {
    Settings = "settings",
    Messages = "messages",
    Tasks = "tasks",
    Calendar = "calendar",
}
