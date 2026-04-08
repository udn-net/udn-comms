import * as React from "bloatless-react";

import ChatViewModel, {
    ChatPageTypes,
} from "../../ViewModel/Chat/chatViewModel";

import { RibbonButton } from "./ribbonButton";

export function ChatViewToggleButton(
    label: string,
    icon: string,
    page: ChatPageTypes,
    chatViewModel: ChatViewModel,
) {
    function select() {
        chatViewModel.selectedPage.value = page;
    }

    const isSelected = React.createProxyState(
        [chatViewModel.selectedPage],
        () => chatViewModel.selectedPage.value == page,
    );

    const isHighlighted = new React.State(false);
    if (page == ChatPageTypes.Messages) {
        chatViewModel.hasUnreadMessages.subscribe(
            (hasUnreadMessages) => (isHighlighted.value = hasUnreadMessages),
        );
    }

    return RibbonButton(label, icon, isSelected, select, isHighlighted);
}
