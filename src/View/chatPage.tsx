import "./homePage.css";

import * as React from "bloatless-react";

import ChatViewModel, { ChatPageType } from "../ViewModel/Chat/chatViewModel";

import { CalendarPage } from "./ChatPages/calendarPage";
import { ChatViewToggleButton } from "./Components/chatViewToggleButton";
import { MessagePage } from "./ChatPages/messagePage";
import { SettingsPage } from "./ChatPages/settingsPage";
import { TaskPage } from "./ChatPages/taskPage";
import { translations } from "./translations";

export function ChatPage(chatViewModel: ChatViewModel) {
    const mainContent = React.createProxyState(
        [chatViewModel.selectedPage],
        () => {
            chatViewModel.closeSubPages();

            switch (chatViewModel.selectedPage.value) {
                case ChatPageType.Settings: {
                    return SettingsPage(chatViewModel.settingsPageViewModel);
                }
                case ChatPageType.Tasks: {
                    return TaskPage(chatViewModel.taskPageViewModel);
                }
                case ChatPageType.Calendar: {
                    return CalendarPage(chatViewModel.calendarViewModel);
                }
                default: {
                    return MessagePage(chatViewModel.messagePageViewModel);
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
                <span>
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
                        aria-label={translations.chatPage.closeChatAudioLabe}
                        on:click={chatViewModel.close}
                    >
                        <span class="icon">close</span>
                    </button>
                    <button
                        class="danger"
                        aria-label={translations.general.restoreConnection}
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
                            translations.chatPage.pages.calendar,
                            "calendar_month",
                            ChatPageType.Calendar,
                            chatViewModel,
                        )}
                        {ChatViewToggleButton(
                            translations.chatPage.pages.tasks,
                            "task_alt",
                            ChatPageType.Tasks,
                            chatViewModel,
                        )}
                        {ChatViewToggleButton(
                            translations.chatPage.pages.messages,
                            "forum",
                            ChatPageType.Messages,
                            chatViewModel,
                        )}
                        {ChatViewToggleButton(
                            translations.chatPage.pages.settings,
                            "settings",
                            ChatPageType.Settings,
                            chatViewModel,
                        )}
                    </span>
                </div>
                <div id="main" children:set={mainContent}></div>
            </div>
        </article>
    );
}
