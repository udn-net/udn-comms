import * as React from "bloatless-react";
import {
    ChatMessageReaction,
    ReactionSymbols,
} from "../../Model/Chat/chatModel";
import ChatMessageViewModel from "../../ViewModel/Chat/chatMessageViewModel";
import { translations } from "../translations";

export function MessageReactionButton(
    chatMessageViewModel: ChatMessageViewModel,
    content: ReactionSymbols,
) {
    let audioLabel: string;
    let count: React.State<number>;
    let reactionState: React.MapState<ChatMessageReaction>;
    let isActive = new React.State(false);
    let isZero = new React.State(true);

    function sendReaction() {
        chatMessageViewModel.sendReaction(content, isActive.value);
    }

    function getUsername(): string {
        return chatMessageViewModel.messagePageViewModel.chatViewModel
            .settingsViewModel.username.value;
    }

    function checkIsHighlighted(): boolean {
        return reactionState.value.has(getUsername());
    }

    switch (content) {
        case ReactionSymbols.ThumbsUp: {
            audioLabel = translations.chatPage.message.thumbsUpReaction;
            count = chatMessageViewModel.reactionsThumbsUpCount;
            reactionState = chatMessageViewModel.reactionsThumbsUp;
            break;
        }
        case ReactionSymbols.Check: {
            audioLabel = translations.chatPage.message.checkReaction;
            count = chatMessageViewModel.reactionsCheckCount;
            reactionState = chatMessageViewModel.reactionsCheck;
            break;
        }
        case ReactionSymbols.Stop: {
            audioLabel = translations.chatPage.message.stopReaction;
            count = chatMessageViewModel.reactionsStopCount;
            reactionState = chatMessageViewModel.reactionsStop;
            break;
        }
        case ReactionSymbols.Attention: {
            audioLabel = translations.chatPage.message.attentionReaction;
            count = chatMessageViewModel.reactionsAttentionCount;
            reactionState = chatMessageViewModel.reactionsAttention;
            break;
        }
        case ReactionSymbols.DoubleAttention: {
            audioLabel = translations.chatPage.message.doubleAttentionReaction;
            count = chatMessageViewModel.reactionsDoubleAttentionCount;
            reactionState = chatMessageViewModel.reactionsDoubleAttention;
            break;
        }
        case ReactionSymbols.Question: {
            audioLabel = translations.chatPage.message.questionReaction;
            count = chatMessageViewModel.reactionsQuestionCount;
            reactionState = chatMessageViewModel.reactionsQuestion;
            break;
        }
    }

    reactionState.subscribe(() => {
        isActive.value = checkIsHighlighted();
        isZero.value = reactionState.value.size == 0;
    });

    return (
        <button
            class="flex"
            on:click={sendReaction}
            aria-label={audioLabel}
            toggle:selected={isActive}
            toggle:zero={isZero}
        >
            {content}
            <span subscribe:innerText={count}></span>
        </button>
    );
}
