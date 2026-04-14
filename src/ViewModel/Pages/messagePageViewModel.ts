import * as React from "bloatless-react";

import {
    ChatMessage,
    ChatMessageReaction,
    ReactionSymbols,
} from "../../Model/Chat/chatModel";
import ChatMessageViewModel from "../Chat/chatMessageViewModel";
import ChatViewModel, { ChatPageTypes } from "../Chat/chatViewModel";
import CoreViewModel, { Context } from "../Global/coreViewModel";
import SearchViewModel from "../Utility/searchViewModel";
import { v4 } from "uuid";
import { CommonKeys } from "../../View/keystrokes";

export default class MessagePageViewModel extends Context {
    // state
    chatMessageViewModels: React.MapState<ChatMessageViewModel> =
        new React.MapState();
    filteredMessageViewModels: React.ListState<ChatMessageViewModel> =
        new React.ListState();
    searchViewModel: SearchViewModel<ChatMessageViewModel>;
    isFilterModalOpen = new React.State<boolean>(false);
    reactionFilter = new React.State<ReactionSymbols | undefined>(undefined);
    isFilterActive: React.State<boolean>;

    replyingMessageId = new React.State<string|undefined>(undefined)
    composingMessage = new React.State<string>("");

    // guards
    cannotSendMessage: React.State<boolean>;

    // methods
    sendMessage = (): void => {
        if (this.cannotSendMessage.value == true) return;

        this.sendMessageFromBody(this.composingMessage.value);
        this.composingMessage.value = "";
    };

    sendMessageFromBody = (body: string): void => {
        this.chatViewModel.chatModel.sendMessage(body, this.replyingMessageId.value);
        this.replyingMessageId.value = undefined;
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

    showFilterModal = (): void => {
        this.isFilterModalOpen.value = true;
    };

    hideFilterModal = (): void => {
        this.isFilterModalOpen.value = false;
    };

    revokeReactionFilter = (): void => {
        this.reactionFilter.value = undefined;
    };

    setReactionFilter = (content: ReactionSymbols): void => {
        this.reactionFilter.value = content;
    };

    resetFilter = (): void => {
        this.revokeReactionFilter();
        this.searchViewModel.search("");
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
        public readonly coreViewModel: CoreViewModel,
        public readonly chatViewModel: ChatViewModel,
    ) {
        super("message-page");

        // states
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

        this.isFilterActive = React.createProxyState(
            [this.searchViewModel.appliedQuery, this.reactionFilter],
            () =>
                this.searchViewModel.appliedQuery.value != "" ||
                this.reactionFilter.value != undefined,
        );

        // keystrokes
        this.registerKeyStroke(CommonKeys.Filter, this.showFilterModal);
        this.registerKeyStroke(CommonKeys.CloseOrCancel, this.hideFilterModal);
        this.registerKeyStroke(CommonKeys.Reset, this.resetFilter);

        this.chatViewModel.registerContext(ChatPageTypes.Messages, this);
    }
}
