import * as React from "bloatless-react";

import ChatListModel from "../../Model/Chat/chatListModel";
import ChatModel from "../../Model/Chat/chatModel";
import ChatViewModel from "./chatViewModel";
import CoreViewModel from "../Global/coreViewModel";
import { IndexManager } from "../../Model/Utility/utility";
import SettingsViewModel from "../Global/settingsViewModel";
import StorageModel from "../../Model/Global/storageModel";
import ConnectionViewModel from "../Global/connectionViewModel";
import NotificationViewModel from "../Global/notificationViewModel";

export default class ChatListViewModel {
    notificationViewModel: NotificationViewModel;

    // data
    chatIndexManager = new IndexManager<ChatViewModel>(
        (chatViewModel: ChatViewModel) =>
            chatViewModel.settingsPageViewModel.primaryChannel.value,
    );

    // state
    newChatPrimaryChannel: React.State<string> = new React.State("");
    chatViewModels: React.ListState<ChatViewModel> = new React.ListState();

    selectedChat: React.State<ChatViewModel | undefined> = new React.State<any>(
        undefined,
    );

    // guards
    cannotCreateChat = React.createProxyState(
        [this.newChatPrimaryChannel],
        () => this.newChatPrimaryChannel.value == "",
    );

    // methods
    createChat = (): void => {
        const chatModel: ChatModel =
            this.coreViewModel.chatListModel.createChat(
                this.newChatPrimaryChannel.value,
            );
        this.newChatPrimaryChannel.value = "";

        const chatViewModel: ChatViewModel =
            this.createChatViewModel(chatModel);
        this.trackChat(chatViewModel);
        this.updateIndices();
    };

    trackChat = (chatViewModel: ChatViewModel): void => {
        this.chatViewModels.add(chatViewModel);
    };

    untrackChat = (chatViewModel: ChatViewModel): void => {
        this.coreViewModel.chatListModel.untrackChat(chatViewModel.chatModel);
        this.chatViewModels.remove(chatViewModel);
    };

    createChatViewModel = (chatModel: ChatModel): ChatViewModel => {
        return new ChatViewModel(
            this.coreViewModel,
            chatModel,
            this.settingsViewModel,
            this.notificationViewModel,
            this.connectionViewModel,
            this,
        );
    };

    updateIndices = (): void => {
        this.chatIndexManager.update([...this.chatViewModels.value.values()]);
        for (const chatViewModel of this.chatViewModels.value) {
            chatViewModel.updateIndex();
        }
    };

    // view
    openChat = (chatViewModel: ChatViewModel): void => {
        this.selectedChat.value = chatViewModel;
        this.notificationViewModel.skipLoop();
    };

    closeChat = (): void => {
        this.selectedChat.value = undefined;
    };

    // load
    loadChats = (): void => {
        this.chatViewModels.clear();
        for (const chatModel of this.coreViewModel.chatListModel.chatModels.values()) {
            const chatViewModel = this.createChatViewModel(chatModel);
            this.trackChat(chatViewModel);
        }
        this.updateIndices();
    };

    // init
    constructor(
        public coreViewModel: CoreViewModel,
        public settingsViewModel: SettingsViewModel,
        public connectionViewModel: ConnectionViewModel,
    ) {
        this.notificationViewModel = new NotificationViewModel(this);

        this.loadChats();
    }
}
