import * as React from "bloatless-react";

import ChatMessageViewModel from "../../ViewModel/Chat/chatMessageViewModel";
import CoreViewModel from "../../ViewModel/Global/coreViewModel";
import { ViewController } from "../viewController";

export function InlineReply (
    chatMessageViewModel: ChatMessageViewModel,
) {
    const reply = chatMessageViewModel.inlineReply;
    if (reply == undefined) return <div></div>

    const scroll = () => {
        ViewController.scrollToView(reply.chatMessage.id);
    }

    return (
        <div class="inline-reply" on:click={scroll}>
            <span>{reply.sender}</span>
            <b class="ellipsis" subscribe:innerText={reply.body}></b>
        </div>
    );
}
