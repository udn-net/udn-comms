import * as React from "bloatless-react";

import ChatMessageViewModel from "../../ViewModel/Chat/chatMessageViewModel";
import { MessageReactionButtonRow } from "../Components/messageReactionButtonRow";
import { InfoTile } from "../Components/infoTile";
import CoreViewModel from "../../ViewModel/Global/coreViewModel";

export function ChatMessageInfoModal(
    coreViewModel: CoreViewModel,
    chatMessageViewModel: ChatMessageViewModel,
) {
    return (
        <div
            class="modal"
            toggle:open={chatMessageViewModel.isPresentingInfoModal}
        >
            <div>
                <main>
                    <h2>
                        {
                            coreViewModel.translations.chatPage.message
                                .messageInfoHeadline
                        }
                    </h2>

                    <div class="flex-column gap">
                        {InfoTile(
                            "account_circle",
                            coreViewModel.translations.chatPage.message.sentBy,
                            chatMessageViewModel.sender,
                        )}
                        {InfoTile(
                            "schedule",
                            coreViewModel.translations.chatPage.message
                                .timeSent,
                            chatMessageViewModel.dateSent,
                        )}
                        {InfoTile(
                            "forum",
                            coreViewModel.translations.chatPage.message.channel,
                            chatMessageViewModel.channel,
                        )}
                        {InfoTile(
                            "description",
                            coreViewModel.translations.chatPage.message
                                .messageContent,
                            chatMessageViewModel.body,
                        )}
                    </div>

                    <hr></hr>

                    <div class="flex-column gap">
                        <button on:click={chatMessageViewModel.copyMessage}>
                            {
                                coreViewModel.translations.chatPage.message
                                    .copyMessageButton
                            }
                            <span class="icon">content_copy</span>
                        </button>
                        <button on:click={chatMessageViewModel.resendMessage}>
                            {
                                coreViewModel.translations.chatPage.message
                                    .resendMessageButton
                            }
                            <span class="icon">redo</span>
                        </button>
                        <button on:click={chatMessageViewModel.decryptMessage}>
                            {
                                coreViewModel.translations.chatPage.message
                                    .decryptMessageButton
                            }
                            <span class="icon">key</span>
                        </button>
                    </div>

                    <hr></hr>

                    {MessageReactionButtonRow(
                        coreViewModel,
                        chatMessageViewModel,
                    )}
                </main>
                <button on:click={chatMessageViewModel.hideInfoModal}>
                    {coreViewModel.translations.general.closeButton}
                    <span class="icon">close</span>
                </button>
            </div>
        </div>
    );
}
