import * as React from "bloatless-react";
import { ReactionSymbols } from "../../Model/Chat/chatModel";
import ChatMessageViewModel from "../../ViewModel/Chat/chatMessageViewModel";
import { translations } from "../translations";

export function MessageReactionButton(
    chatMessageViewModel: ChatMessageViewModel,
    content: ReactionSymbols,
) {
    function sendReaction() {
        chatMessageViewModel.sendReaction(content, isActive.value);
    }

    function getUsername(): string {
        return chatMessageViewModel.messagePageViewModel.chatViewModel
            .settingsViewModel.username.value;
    }

    function checkIsHighlighted(mapState: React.MapState<any>): boolean {
        return mapState.value.has(getUsername());
    }

    let audioLabel: string;
    let count: React.State<number>;
    let isActive: React.State<boolean>;

    switch (content) {
        case ReactionSymbols.ThumbsUp: {
            audioLabel = translations.chatPage.message.thumbsUpReaction;
            count = chatMessageViewModel.reactionsThumbsUpCount;
            isActive = React.createProxyState(
                [chatMessageViewModel.reactionsThumbsUp],
                () =>
                    checkIsHighlighted(chatMessageViewModel.reactionsThumbsUp),
            );
            break;
        }
        case ReactionSymbols.Check: {
            audioLabel = translations.chatPage.message.checkReaction;
            count = chatMessageViewModel.reactionsCheckCount;
            isActive = React.createProxyState(
                [chatMessageViewModel.reactionsCheck],
                () => checkIsHighlighted(chatMessageViewModel.reactionsCheck),
            );
            break;
        }
        case ReactionSymbols.Attention: {
            audioLabel = translations.chatPage.message.attentionReaction;
            count = chatMessageViewModel.reactionsAttentionCount;
            isActive = React.createProxyState(
                [chatMessageViewModel.reactionsAttention],
                () =>
                    checkIsHighlighted(chatMessageViewModel.reactionsAttention),
            );
            break;
        }
        case ReactionSymbols.DoubleAttention: {
            audioLabel = translations.chatPage.message.doubleAttentionReaction;
            count = chatMessageViewModel.reactionsDoubleAttentionCount;
            isActive = React.createProxyState(
                [chatMessageViewModel.reactionsDoubleAttention],
                () =>
                    checkIsHighlighted(
                        chatMessageViewModel.reactionsDoubleAttention,
                    ),
            );
            break;
        }
        case ReactionSymbols.Question: {
            audioLabel = translations.chatPage.message.questionReaction;
            count = chatMessageViewModel.reactionsQuestionCount;
            isActive = React.createProxyState(
                [chatMessageViewModel.reactionsQuestion],
                () =>
                    checkIsHighlighted(chatMessageViewModel.reactionsQuestion),
            );
            break;
        }
    }

    return (
        <button
            class="flex"
            on:click={sendReaction}
            aria-label={audioLabel}
            toggle:selected={isActive}
        >
            {content}
            <span subscribe:innerText={count}></span>
        </button>
    );
}
