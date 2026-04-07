import * as React from "bloatless-react";

import ChatMessageViewModel from "../../ViewModel/Chat/chatMessageViewModel";
import { translations } from "../translations";
import { MessageReactionButtonRow } from "../Components/messageReactionButtonRow";

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
                        <div class="tile">
                            <span class="icon">account_circle</span>
                            <div>
                                <span>
                                    {translations.chatPage.message.sentBy}
                                </span>
                                <b class="break-word">
                                    {chatMessageViewModel.sender}
                                </b>
                            </div>
                        </div>

                        <div class="tile">
                            <span class="icon">schedule</span>
                            <div>
                                <span>
                                    {translations.chatPage.message.timeSent}
                                </span>
                                <b class="break-word">
                                    {chatMessageViewModel.dateSent}
                                </b>
                            </div>
                        </div>

                        <div class="tile">
                            <span class="icon">forum</span>
                            <div>
                                <span>
                                    {translations.chatPage.message.channel}
                                </span>
                                <b class="break-word">
                                    {chatMessageViewModel.channel}
                                </b>
                            </div>
                        </div>

                        <div class="tile">
                            <span class="icon">description</span>
                            <div>
                                <span>
                                    {
                                        translations.chatPage.message
                                            .messageContent
                                    }
                                </span>
                                <b
                                    class="break-word"
                                    subscribe:innerText={
                                        chatMessageViewModel.body
                                    }
                                ></b>
                            </div>
                        </div>
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
