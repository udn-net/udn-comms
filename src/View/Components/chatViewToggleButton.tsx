import * as React from "bloatless-react";

import ChatViewModel, {
    ChatPageType,
} from "../../ViewModel/Chat/chatViewModel";

import { RibbonButton } from "./ribbonButton";

export function ChatViewToggleButton(
    label: string,
    icon: string,
    page: ChatPageType,
    chatViewModel: ChatViewModel,
) {
    function select() {
        chatViewModel.selectedPage.value = page;
    }

    const isSelected = React.createProxyState(
        [chatViewModel.selectedPage],
        () => chatViewModel.selectedPage.value == page,
    );

    return RibbonButton(label, icon, isSelected, select);
}
