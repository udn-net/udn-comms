import * as React from "bloatless-react";

import { ChatMessageInfoModal } from "../Modals/chatMessageInfoModal";
import { ChatMessageStatuses } from "../../Model/Chat/chatModel";
import ChatMessageViewModel from "../../ViewModel/Chat/chatMessageViewModel";
import { MessageReactionButtonRow } from "./messageReactionButtonRow";
import CoreViewModel from "../../ViewModel/Global/coreViewModel";

export function ChatMessage(
    coreViewModel: CoreViewModel,
    chatMessageViewModel: ChatMessageViewModel,
) {
    const statusIcon = React.createProxyState(
        [chatMessageViewModel.status],
        () => {
            switch (chatMessageViewModel.status.value) {
                case ChatMessageStatuses.Outbox:
                    return "hourglass_top";
                case ChatMessageStatuses.Sent:
                    return "check";
                case ChatMessageStatuses.Received:
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
            toggle:hidden={chatMessageViewModel.isHidden}
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
                            coreViewModel.translations.chatPage.message
                                .showMessageInfoButtonAudioLabel
                        }
                    >
                        <span class="icon">info</span>
                    </button>
                </div>
            </div>
            {MessageReactionButtonRow(coreViewModel, chatMessageViewModel)}
            {ChatMessageInfoModal(coreViewModel, chatMessageViewModel)}
        </div>
    );
}
