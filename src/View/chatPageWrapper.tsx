import "./chatPage.css";

import * as React from "bloatless-react";

import ChatListViewModel from "../ViewModel/Chat/chatListViewModel";
import { ChatPage } from "./chatPage";
import CoreViewModel from "../ViewModel/Global/coreViewModel";

export function ChatPageWrapper(
    coreViewModel: CoreViewModel,
    chatListViewModel: ChatListViewModel,
) {
    const chatPageContent = React.createProxyState(
        [chatListViewModel.selectedChat],
        () => {
            if (chatListViewModel.selectedChat.value == undefined) {
                return <div></div>;
            } else {
                return ChatPage(
                    coreViewModel,
                    chatListViewModel.selectedChat.value,
                );
            }
        },
    );

    return <div id="chat-page-wrapper" children:set={chatPageContent}></div>;
}
