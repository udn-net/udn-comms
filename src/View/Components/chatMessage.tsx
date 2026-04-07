import * as React from "bloatless-react";

import { ChatMessageInfoModal } from "../Modals/chatMessageInfoModal";
import { ChatMessageStatus } from "../../Model/Chat/chatModel";
import ChatMessageViewModel from "../../ViewModel/Chat/chatMessageViewModel";
import { translations } from "../translations";
import { MessageReactionButtonRow } from "./messageReactionButtonRow";

export function ChatMessage(chatMessageViewModel: ChatMessageViewModel) {
    const statusIcon = React.createProxyState(
        [chatMessageViewModel.status],
        () => {
            switch (chatMessageViewModel.status.value) {
                case ChatMessageStatus.Outbox:
                    return "hourglass_top";
                case ChatMessageStatus.Sent:
                    return "check";
                case ChatMessageStatus.Received:
                    return "done_all";
                default:
                    return "warning";
            }
        },
    );

    return (
        <div
            class="message-bubble"
            toggle:sentbyuser={chatMessageViewModel.sentByUser}
        >
            <div class="main tile">
                <div class="text-container">
                    <span class="sender-name ellipsis">
                        {chatMessageViewModel.sender}
                    </span>
                    <span
                        class="body"
                        subscribe:innerText={chatMessageViewModel.body}
                    ></span>
                    <span class="timestamp ellipsis">
                        <span
                            class="icon"
                            subscribe:innerText={statusIcon}
                        ></span>
                        {chatMessageViewModel.dateSent}
                    </span>
                </div>

                <div class="button-container">
                    <button
                        on:click={chatMessageViewModel.showInfoModal}
                        aria-label={
                            translations.chatPage.message
                                .showMessageInfoButtonAudioLabel
                        }
                    >
                        <span class="icon">info</span>
                    </button>
                </div>

            </div>
            {MessageReactionButtonRow(chatMessageViewModel)}
            {ChatMessageInfoModal(chatMessageViewModel)}
        </div>
    );
}

export const ChatMessageViewModelToView: React.StateItemConverter<
    ChatMessageViewModel
> = (chatMessageViewModel: ChatMessageViewModel) => {
    return ChatMessage(chatMessageViewModel);
};
