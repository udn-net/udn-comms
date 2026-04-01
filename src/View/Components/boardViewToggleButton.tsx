import * as React from "bloatless-react";

import BoardViewModel, {
    BoardPageType,
} from "../../ViewModel/Pages/boardViewModel";

import { RibbonButton } from "./ribbonButton";

export function BoardViewToggleButton(
    label: string,
    icon: string,
    page: BoardPageType,
    boardViewModel: BoardViewModel,
) {
    function select() {
        boardViewModel.selectedPage.value = page;
    }

    const isSelected = React.createProxyState(
        [boardViewModel.selectedPage],
        () => boardViewModel.selectedPage.value == page,
    );

    return RibbonButton(label, icon, isSelected, select);
}
