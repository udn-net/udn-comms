import "./messagePage.css";

import * as React from "bloatless-react";

import { ChatMessageViewModelToView } from "../Components/chatMessage";
import MessagePageViewModel from "../../ViewModel/Pages/messagePageViewModel";
import { translations } from "../translations";

export function MessagePage(messagePageViewModel: MessagePageViewModel) {
    messagePageViewModel.loadData();

    const messageContainer = (
        <div
            id="message-container"
            children:append={[
                messagePageViewModel.chatMessageViewModels,
                ChatMessageViewModelToView,
            ]}
        ></div>
    );

    function scrollDown() {
        messageContainer.scrollTop = messageContainer.scrollHeight;
    }
    function scrollDownIfApplicable() {
        const scrollFromBottom =
            messageContainer.scrollHeight -
            (messageContainer.scrollTop + messageContainer.offsetHeight);
        if (scrollFromBottom > 400) return;

        scrollDown();
    }
    messagePageViewModel.chatMessageViewModels.subscribeSilent(
        scrollDownIfApplicable,
    );
    setTimeout(() => scrollDown(), 100);

    return (
        <div id="message-page">
            <div class="pane-wrapper">
                <div class="pane">
                    <div class="toolbar">
                        <span class="title">
                            {translations.chatPage.message.messagesHeadline}
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
                                            translations.chatPage.message
                                                .composerInputPlaceholder
                                        }
                                    ></input>
                                    <button
                                        class="primary"
                                        aria-label={
                                            translations.chatPage.message
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
        </div>
    );
}
