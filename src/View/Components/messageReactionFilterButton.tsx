import * as React from "bloatless-react";
import {
    ChatMessageReaction,
    ReactionSymbols,
} from "../../Model/Chat/chatModel";
import ChatMessageViewModel from "../../ViewModel/Chat/chatMessageViewModel";
import CoreViewModel from "../../ViewModel/Global/coreViewModel";
import MessagePageViewModel from "../../ViewModel/Pages/messagePageViewModel";

export function MessageReactionFilterButton(
    messagePageViewModel: MessagePageViewModel,
    content: ReactionSymbols,
) {
    const select = () => {
        messagePageViewModel.setReactionFilter(content);
    };

    const isSelected = React.createProxyState(
        [messagePageViewModel.reactionFilter],
        () => messagePageViewModel.reactionFilter.value == content,
    );

    return (
        <button
            class="flex justify-center"
            on:click={select}
            toggle:selected={isSelected}
        >
            {content}
        </button>
    );
}
