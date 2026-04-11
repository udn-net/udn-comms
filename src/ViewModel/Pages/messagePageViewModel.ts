import * as React from "bloatless-react";

import {
    ChatMessage,
    ChatMessageReaction,
    ReactionSymbols,
} from "../../Model/Chat/chatModel";
import ChatMessageViewModel from "../Chat/chatMessageViewModel";
import ChatViewModel from "../Chat/chatViewModel";
import CoreViewModel from "../Global/coreViewModel";
import SearchViewModel from "../Utility/searchViewModel";

export default class MessagePageViewModel {
    // state
    chatMessageViewModels: React.MapState<ChatMessageViewModel> =
        new React.MapState();
    filteredMessageViewModels: React.ListState<ChatMessageViewModel> =
        new React.ListState();
    searchViewModel: SearchViewModel<ChatMessageViewModel>;
    isFilterModalOpen = new React.State<boolean>(false);
    reactionFilter = new React.State<ReactionSymbols | undefined>(undefined);

    composingMessage: React.State<string> = new React.State("");

    // guards
    cannotSendMessage: React.State<boolean>;

    // methods
    sendMessage = (): void => {
        if (this.cannotSendMessage.value == true) return;

        this.sendMessageFromBody(this.composingMessage.value);
        this.composingMessage.value = "";
    };

    sendMessageFromBody = (body: string): void => {
        this.chatViewModel.chatModel.sendMessage(body);
    };

    decryptMessage = async (
        messageViewModel: ChatMessageViewModel,
    ): Promise<void> => {
        const chatMessage: ChatMessage = messageViewModel.chatMessage;
        await this.chatViewModel.chatModel.decryptMessage(chatMessage);
        this.chatViewModel.chatModel.addMessage(chatMessage);
        messageViewModel.loadData();
    };

    sendReaction = (
        messageId: string,
        content: ReactionSymbols,
        isDeleting: boolean,
    ): void => {
        this.chatViewModel.chatModel.sendReaction(
            messageId,
            content,
            isDeleting,
        );
    };

    // view
    showChatMessage = (chatMessage: ChatMessage): void => {
        const chatMessageViewModel = new ChatMessageViewModel(
            this.coreViewModel,
            this,
            chatMessage,
            chatMessage.sender ==
                this.chatViewModel.settingsViewModel.username.value,
        );

        const existingChatMessageViewModel: ChatMessageViewModel | undefined =
            this.chatMessageViewModels.value.get(chatMessage.id);
        if (existingChatMessageViewModel != undefined) {
            existingChatMessageViewModel.body.value = chatMessage.body;
            existingChatMessageViewModel.status.value = chatMessage.status;
        } else {
            this.chatMessageViewModels.set(
                chatMessage.id,
                chatMessageViewModel,
            );
        }
    };

    handleReaction = (reaction: ChatMessageReaction): void => {
        const messageViewModel: ChatMessageViewModel | undefined =
            this.chatMessageViewModels.value.get(reaction.messageId);
        if (messageViewModel == undefined) return;
        messageViewModel.handleReaction(reaction);
    };

    openFilterModal = (): void => {
        this.isFilterModalOpen.value = true;
    };

    closeFilterModal = (): void => {
        this.isFilterModalOpen.value = false;
    };

    revokeReactionFilter = (): void => {
        this.reactionFilter.value = undefined;
    }

    setReactionFilter = (content: ReactionSymbols): void => {
        this.reactionFilter.value = content;
    };

    // load
    loadData = (): void => {
        this.chatMessageViewModels.clear();
        for (const chatMessage of this.chatViewModel.chatModel.messages) {
            this.showChatMessage(chatMessage);
        }
        for (const reaction of this.chatViewModel.chatModel.reactions) {
            this.handleReaction(reaction);
        }
    };

    // init
    constructor(
        public coreViewModel: CoreViewModel,
        public chatViewModel: ChatViewModel,
    ) {
        this.cannotSendMessage = React.createProxyState(
            [
                this.chatViewModel.settingsViewModel.username,
                this.composingMessage,
            ],
            () =>
                this.chatViewModel.settingsViewModel.username.value == "" ||
                this.composingMessage.value == "",
        );

        this.searchViewModel = new SearchViewModel(
            this.chatMessageViewModels,
            this.filteredMessageViewModels,
            (chatMessageViewModel) => [chatMessageViewModel.body.value],
            new React.ListState(),
        );
    }
}
