import "./chatPage.css";

import * as React from "bloatless-react";

import ChatListViewModel from "../ViewModel/Chat/chatListViewModel";
import { ChatPage } from "./chatPage";

export function ChatPageWrapper(chatListViewModel: ChatListViewModel) {
    const chatPageContent = React.createProxyState(
        [chatListViewModel.selectedChat],
        () => {
            if (chatListViewModel.selectedChat.value == undefined) {
                return <div></div>;
            } else {
                return ChatPage(chatListViewModel.selectedChat.value);
            }
        },
    );

    return <div id="chat-page-wrapper" children:set={chatPageContent}></div>;
}
