import * as React from "bloatless-react";

import {
    ChatMessage,
    ChatMessageReaction,
    ChatMessageReactionReference,
    ChatMessageStatus,
    ReactionSymbols,
} from "../../Model/Chat/chatModel";

import CoreViewModel from "../Global/coreViewModel";
import MessagePageViewModel from "../Pages/messagePageViewModel";

export default class ChatMessageViewModel {
    messagePageViewModel: MessagePageViewModel;

    // data
    chatMessage: ChatMessage;
    channel: string;
    sender: string;
    dateSent: string;
    body: React.State<string> = new React.State("");
    status: React.State<ChatMessageStatus | any> = new React.State<any>(
        undefined,
    );
    sentByUser: boolean;

    reactionsThumbsUp = new React.MapState<ChatMessageReaction>();
    reactionsCheck = new React.MapState<ChatMessageReaction>();
    reactionsAttention = new React.MapState<ChatMessageReaction>();
    reactionsDoubleAttention = new React.MapState<ChatMessageReaction>();
    reactionsQuestion = new React.MapState<ChatMessageReaction>();

    reactionsThumbsUpCount = React.createProxyState(
        [this.reactionsThumbsUp],
        () => this.reactionsThumbsUp.value.size,
    );
    reactionsCheckCount = React.createProxyState(
        [this.reactionsCheck],
        () => this.reactionsCheck.value.size,
    );
    reactionsAttentionCount = React.createProxyState(
        [this.reactionsAttention],
        () => this.reactionsAttention.value.size,
    );
    reactionsDoubleAttentionCount = React.createProxyState(
        [this.reactionsDoubleAttention],
        () => this.reactionsDoubleAttention.value.size,
    );
    reactionsQuestionCount = React.createProxyState(
        [this.reactionsQuestion],
        () => this.reactionsQuestion.value.size,
    );

    // state
    isPresentingInfoModal: React.State<boolean> = new React.State(false);

    // methods
    copyMessage = (): void => {
        navigator.clipboard.writeText(this.body.value);
    };
    resendMessage = (): void => {
        this.messagePageViewModel.sendMessageFromBody(this.body.value);
    };
    decryptMessage = (): void => {
        this.messagePageViewModel.decryptMessage(this);
    };

    // view
    showInfoModal = (): void => {
        this.isPresentingInfoModal.value = true;
    };

    hideInfoModal = (): void => {
        this.isPresentingInfoModal.value = false;
    };

    // reactions
    addReaction = (reaction: ChatMessageReaction): void => {
        switch (reaction.content) {
            case ReactionSymbols.ThumbsUp:
                return this.reactionsThumbsUp.set(reaction.sender, reaction);
            case ReactionSymbols.Check:
                return this.reactionsCheck.set(reaction.sender, reaction);
            case ReactionSymbols.Attention:
                return this.reactionsAttention.set(reaction.sender, reaction);
            case ReactionSymbols.DoubleAttention:
                return this.reactionsDoubleAttention.set(
                    reaction.sender,
                    reaction,
                );
            case ReactionSymbols.Question:
                return this.reactionsQuestion.set(reaction.sender, reaction);
        }
    };

    sendReaction = (content: ReactionSymbols): void => {
        this.messagePageViewModel.sendReaction(this.chatMessage.id, content);
    };

    // load
    loadData = (): void => {
        this.channel = this.chatMessage.channel;
        this.sender = this.chatMessage.sender;
        this.dateSent = new Date(this.chatMessage.dateSent).toLocaleString();
        this.body.value = this.chatMessage.body;
        this.status.value = this.chatMessage.status;
    };

    // init
    constructor(
        public coreViewModel: CoreViewModel,
        messagePageViewModel: MessagePageViewModel,
        chatMessage: ChatMessage,
        sentByUser: boolean,
    ) {
        this.messagePageViewModel = messagePageViewModel;

        this.chatMessage = chatMessage;
        this.sentByUser = sentByUser;
        this.loadData();
    }
}
