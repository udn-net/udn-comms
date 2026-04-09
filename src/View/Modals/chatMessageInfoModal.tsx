import * as React from "bloatless-react";

import ChatMessageViewModel from "../../ViewModel/Chat/chatMessageViewModel";
import { translations } from "../translations";
import { MessageReactionButtonRow } from "../Components/messageReactionButtonRow";
import { InfoTile } from "../Components/infoTile";

export function ChatMessageInfoModal(
    chatMessageViewModel: ChatMessageViewModel,
) {
    return (
        <div
            class="modal"
            toggle:open={chatMessageViewModel.isPresentingInfoModal}
        >
            <div>
                <main>
                    <h2>{translations.chatPage.message.messageInfoHeadline}</h2>

                    <div class="flex-column gap">
                        {InfoTile("account_circle", translations.chatPage.message.sentBy, chatMessageViewModel.sender)}
                        {InfoTile("schedule", translations.chatPage.message.timeSent, chatMessageViewModel.dateSent)}
                        {InfoTile("forum", translations.chatPage.message.channel, chatMessageViewModel.channel)}
                        {InfoTile("description", translations.chatPage.message.messageContent, chatMessageViewModel.body)}
                    </div>

                    <hr></hr>

                    <div class="flex-column gap">
                        <button on:click={chatMessageViewModel.copyMessage}>
                            {translations.chatPage.message.copyMessageButton}
                            <span class="icon">content_copy</span>
                        </button>
                        <button on:click={chatMessageViewModel.resendMessage}>
                            {translations.chatPage.message.resendMessageButton}
                            <span class="icon">redo</span>
                        </button>
                        <button on:click={chatMessageViewModel.decryptMessage}>
                            {translations.chatPage.message.decryptMessageButton}
                            <span class="icon">key</span>
                        </button>
                    </div>

                    <hr></hr>

                    {MessageReactionButtonRow(chatMessageViewModel)}
                </main>
                <button on:click={chatMessageViewModel.hideInfoModal}>
                    {translations.general.closeButton}
                    <span class="icon">close</span>
                </button>
            </div>
        </div>
    );
}
