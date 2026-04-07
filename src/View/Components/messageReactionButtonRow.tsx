import * as React from "bloatless-react";
import { ReactionSymbols } from "../../Model/Chat/chatModel";
import ChatMessageViewModel from "../../ViewModel/Chat/chatMessageViewModel";
import { translations } from "../translations";
import { MessageReactionButton } from "./messageReactionButton";

export function MessageReactionButtonRow(
    chatMessageViewModel: ChatMessageViewModel,
) {
    return (
        <div class="grid gap width-100 message-reaction-row">
            {MessageReactionButton(
                chatMessageViewModel,
                ReactionSymbols.ThumbsUp,
            )}
            {MessageReactionButton(
                chatMessageViewModel,
                ReactionSymbols.Check,
            )}
            {MessageReactionButton(
                chatMessageViewModel,
                ReactionSymbols.Attention,
            )}
            {MessageReactionButton(
                chatMessageViewModel,
                ReactionSymbols.DoubleAttention,
            )}
            {MessageReactionButton(
                chatMessageViewModel,
                ReactionSymbols.Question,
            )}
        </div>
    );
}
