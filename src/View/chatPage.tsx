import "./homePage.css";

import * as React from "bloatless-react";

import ChatViewModel, { ChatPageTypes } from "../ViewModel/Chat/chatViewModel";

import { CalendarPage } from "./ChatPages/calendarPage";
import { ChatViewToggleButton } from "./Components/chatViewToggleButton";
import { MessagePage } from "./ChatPages/messagePage";
import { SettingsPage } from "./ChatPages/settingsPage";
import { TaskPage } from "./ChatPages/taskPage";
import CoreViewModel from "../ViewModel/Global/coreViewModel";
import { ViewController } from "./viewController";

export function ChatPage(
    coreViewModel: CoreViewModel,
    chatViewModel: ChatViewModel,
) {
    ViewController.chatPages.items = React.createProxyState(
        [chatViewModel.selectedPage],
        () => {
            switch (chatViewModel.selectedPage.value) {
                case ChatPageTypes.Settings: {
                    return SettingsPage(
                        coreViewModel,
                        chatViewModel.settingsPageViewModel,
                    );
                }
                case ChatPageTypes.Tasks: {
                    return TaskPage(
                        coreViewModel,
                        chatViewModel.taskPageViewModel,
                    );
                }
                case ChatPageTypes.Calendar: {
                    return CalendarPage(
                        coreViewModel,
                        chatViewModel.calendarViewModel,
                    );
                }
                default: {
                    return MessagePage(
                        coreViewModel,
                        chatViewModel.messagePageViewModel,
                    );
                }
            }
        },
    );

    const marqueeContent = React.createProxyState(
        [chatViewModel.notificationViewModel.marquee],
        () => {
            const value = chatViewModel.notificationViewModel.marquee.value;
            if (value == undefined) return <span></span>;
            return (
                <span
                    on:click={
                        chatViewModel.notificationViewModel.openNotification
                    }
                >
                    <b>{value.sender}</b>
                    <span class="secondary">{value.chat}: </span>
                    <span>{value.body}</span>
                </span>
            );
        },
    );

    return (
        <article
            id="chat-page"
            set:color={chatViewModel.displayedColor}
            class="subtle-background"
        >
            <div>
                <div id="ribbon">
                    <button
                        class="ghost"
                        aria-label={
                            coreViewModel.translations.chatPage
                                .closeChatAudioLabe
                        }
                        on:click={chatViewModel.close}
                    >
                        <span class="icon">close</span>
                    </button>
                    <button
                        class="danger"
                        aria-label={
                            coreViewModel.translations.general.restoreConnection
                        }
                        on:click={
                            chatViewModel.connectionViewModel
                                .showConnectionModal
                        }
                        toggle:hidden={
                            chatViewModel.connectionViewModel.isConnected
                        }
                    >
                        <span class="icon">signal_disconnected</span>
                    </button>

                    <span class="marquee" children:set={marqueeContent}></span>

                    <span class="navigation-buttons">
                        {ChatViewToggleButton(
                            coreViewModel.translations.chatPage.pages.calendar,
                            "calendar_month",
                            ChatPageTypes.Calendar,
                            chatViewModel,
                        )}
                        {ChatViewToggleButton(
                            coreViewModel.translations.chatPage.pages.tasks,
                            "task_alt",
                            ChatPageTypes.Tasks,
                            chatViewModel,
                        )}
                        {ChatViewToggleButton(
                            coreViewModel.translations.chatPage.pages.messages,
                            "forum",
                            ChatPageTypes.Messages,
                            chatViewModel,
                        )}
                        {ChatViewToggleButton(
                            coreViewModel.translations.chatPage.pages.settings,
                            "settings",
                            ChatPageTypes.Settings,
                            chatViewModel,
                        )}
                    </span>
                </div>
                <div
                    id="main"
                    children:set={ViewController.chatPages.items}
                ></div>
            </div>
        </article>
    );
}
