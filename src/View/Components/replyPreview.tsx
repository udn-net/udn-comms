import * as React from "bloatless-react";

import ChatMessageViewModel from "../../ViewModel/Chat/chatMessageViewModel";
import CoreViewModel from "../../ViewModel/Global/coreViewModel";

export function ReplyPreview(
    coreViewModel: CoreViewModel,
    chatMessageViewModel: ChatMessageViewModel,
) {
    return (
        <div class="reply-preview">
            <div class="surface">
                <span class="secondary">{chatMessageViewModel.sender}</span>
                <b class="ellipsis" subscribe:innerText={chatMessageViewModel.body}></b>
            </div>
            <button
                class="standard square"
                on:click={chatMessageViewModel.cancelReply}
                aria-label={coreViewModel.translations.chatPage.message.cancelReplyAudioLabel}
            >
                <span class="icon">close</span>
            </button>
        </div>
    );
}
