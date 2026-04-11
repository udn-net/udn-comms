import "./messagePage.css";

import * as React from "bloatless-react";

import MessagePageViewModel from "../../ViewModel/Pages/messagePageViewModel";
import CoreViewModel from "../../ViewModel/Global/coreViewModel";
import ChatMessageViewModel from "../../ViewModel/Chat/chatMessageViewModel";
import { ChatMessage } from "../Components/chatMessage";
import { SearchModal } from "../Modals/searchModal";

export function MessagePage(
    coreViewModel: CoreViewModel,
    messagePageViewModel: MessagePageViewModel,
) {
    messagePageViewModel.loadData();
    const ChatMessageViewModelToView: React.StateItemConverter<
        ChatMessageViewModel
    > = (chatMessageViewModel: ChatMessageViewModel) => {
        return ChatMessage(coreViewModel, chatMessageViewModel);
    };

    const messageContainer = (
        <div
            id="message-container"
            children:append={[
                messagePageViewModel.filteredMessageViewModels,
                ChatMessageViewModelToView,
            ]}
        ></div>
    );

    function scrollDown(hard: boolean = false) {
        if (hard) {
            messageContainer.setAttribute("scroll-hard", "");
        }
        messageContainer.scrollTop = messageContainer.scrollHeight;
        messageContainer.removeAttribute("scroll-hard");
    }
    function scrollDownIfApplicable() {
        const scrollFromBottom =
            messageContainer.scrollHeight -
            (messageContainer.scrollTop + messageContainer.offsetHeight);
        if (scrollFromBottom > 400) return;

        scrollDown();
    }
    messagePageViewModel.filteredMessageViewModels.subscribeSilent(
        scrollDownIfApplicable,
    );
    setTimeout(() => scrollDown(true), 100);

    return (
        <div id="message-page">
            <div class="pane-wrapper">
                <div class="pane">
                    <div class="toolbar">
                        <span class="title">
                            {
                                coreViewModel.translations.chatPage.message
                                    .messagesHeadline
                            }
                        </span>
                        <span>
                            <button
                                class="ghost"
                                on:click={messagePageViewModel.openFilterModal}
                                aria-label={
                                    coreViewModel.translations.chatPage.message
                                        .filterMessagesButtonAudioLabel
                                }
                            >
                                <span class="icon">filter_alt</span>
                            </button>
                        </span>
                    </div>
                    <div class="content">
                        {messageContainer}
                        <div id="composer">
                            <div class="content-width-constraint">
                                <div class="input-width-constraint">
                                    <input
                                        bind:value={
                                            messagePageViewModel.composingMessage
                                        }
                                        on:enter={
                                            messagePageViewModel.sendMessage
                                        }
                                        placeholder={
                                            coreViewModel.translations.chatPage
                                                .message
                                                .composerInputPlaceholder
                                        }
                                    ></input>
                                    <button
                                        class="primary"
                                        aria-label={
                                            coreViewModel.translations.chatPage
                                                .message
                                                .sendMessageButtonAudioLabel
                                        }
                                        on:click={
                                            messagePageViewModel.sendMessage
                                        }
                                        toggle:disabled={
                                            messagePageViewModel.cannotSendMessage
                                        }
                                    >
                                        <span class="icon">send</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {SearchModal(
                coreViewModel,
                messagePageViewModel.searchViewModel,
                coreViewModel.translations.chatPage.message
                    .messageFilterHeadline,
                ChatMessageViewModelToView,
                messagePageViewModel.isFilterModalOpen,
            )}
        </div>
    );
}
