import * as React from "bloatless-react";
import CoreViewModel from "../../ViewModel/Global/coreViewModel";
import ChatMessageViewModel from "../../ViewModel/Chat/chatMessageViewModel";
import { ChatMessageReaction } from "../../Model/Chat/chatModel";

export function MessageReactionEntry(reaction: ChatMessageReaction) {
    return (
        <div class="tile flex-row">
            <span class="flex width-100">{reaction.sender}</span>
            <span>{reaction.content}</span>
        </div>
    );
}
