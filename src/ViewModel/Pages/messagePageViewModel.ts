import * as React from "bloatless-react";

import {
    ChatMessage,
    ChatMessageReaction,
    ReactionSymbols,
} from "../../Model/Chat/chatModel";
import ChatMessageViewModel from "../Chat/chatMessageViewModel";
import ChatViewModel from "../Chat/chatViewModel";
import CoreViewModel from "../Global/coreViewModel";

export default class MessagePageViewModel {
    chatViewModel: ChatViewModel;

    // state
    chatMessageViewModels: React.MapState<ChatMessageViewModel> =
        new React.MapState();
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
        chatViewModel: ChatViewModel,
    ) {
        this.chatViewModel = chatViewModel;

        this.cannotSendMessage = React.createProxyState(
            [
                this.chatViewModel.settingsViewModel.username,
                this.composingMessage,
            ],
            () =>
                this.chatViewModel.settingsViewModel.username.value == "" ||
                this.composingMessage.value == "",
        );
    }
}
