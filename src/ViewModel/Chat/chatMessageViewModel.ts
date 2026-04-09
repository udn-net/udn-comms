import * as React from "bloatless-react";

import {
    ChatMessage,
    ChatMessageReaction,
    ChatMessageReactionReference,
    ChatMessageStatuses,
    ReactionSymbols,
} from "../../Model/Chat/chatModel";

import CoreViewModel from "../Global/coreViewModel";
import MessagePageViewModel from "../Pages/messagePageViewModel";

export default class ChatMessageViewModel {
    // data
    chatMessage: ChatMessage;
    channel: string;
    sender: string;
    dateSent: string;
    body: React.State<string> = new React.State("");
    status: React.State<ChatMessageStatuses | any> = new React.State<any>(
        undefined,
    );
    sentByUser: boolean;

    reactionsThumbsUp = new React.MapState<ChatMessageReaction>();
    reactionsCheck = new React.MapState<ChatMessageReaction>();
    reactionsStop = new React.MapState<ChatMessageReaction>();
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
    reactionsStopCount = React.createProxyState(
        [this.reactionsStop],
        () => this.reactionsStop.value.size,
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
    handleReaction = (reaction: ChatMessageReaction): void => {
        function setReaction(mapState: React.MapState<any>) {
            if (reaction.isDeleting) {
                mapState.remove(reaction.sender);
            } else {
                mapState.set(reaction.sender, reaction);
            }
        }

        switch (reaction.content) {
            case ReactionSymbols.ThumbsUp:
                return setReaction(this.reactionsThumbsUp);
            case ReactionSymbols.Check:
                return setReaction(this.reactionsCheck);
            case ReactionSymbols.Stop:
                return setReaction(this.reactionsStop);
            case ReactionSymbols.Attention:
                return setReaction(this.reactionsAttention);
            case ReactionSymbols.DoubleAttention:
                return setReaction(this.reactionsDoubleAttention);
            case ReactionSymbols.Question:
                return setReaction(this.reactionsQuestion);
        }
    };

    sendReaction = (content: ReactionSymbols, isDeleting: boolean): void => {
        this.messagePageViewModel.sendReaction(
            this.chatMessage.id,
            content,
            isDeleting,
        );
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
        public messagePageViewModel: MessagePageViewModel,
        chatMessage: ChatMessage,
        sentByUser: boolean,
    ) {
        this.chatMessage = chatMessage;
        this.sentByUser = sentByUser;
        this.loadData();
    }
}
