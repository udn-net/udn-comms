import * as React from "bloatless-react";

import BoardViewModel, {
    BoardPageType,
} from "../../ViewModel/Pages/boardViewModel";

export function RibbonButton(
    label: string,
    icon: string,
    isSelected: React.State<boolean>,
    select: () => void,
) {
    return (
        <button
            class="ribbon-button"
            aria-label={label}
            toggle:selected={isSelected}
            on:click={select}
        >
            <span class="icon">{icon}</span>
        </button>
    );
}
