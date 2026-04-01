import * as React from "bloatless-react";

import { translations } from "../translations";

export function DangerousActionButton(
    label: string,
    icon: string,
    action: () => void,
) {
    const isActionRequested = new React.State(false);
    const cannotConfirm = React.createProxyState(
        [isActionRequested],
        () => isActionRequested.value == false,
    );

    function requestAction() {
        isActionRequested.value = true;
    }
    function abort() {
        isActionRequested.value = false;
    }

    return (
        <div class="flex-row">
            <button class="flex" on:click={abort} toggle:hidden={cannotConfirm}>
                {translations.general.abortButton}
                <span class="icon">undo</span>
            </button>
            <button
                class="danger flex"
                on:click={requestAction}
                toggle:hidden={isActionRequested}
            >
                {label}
                <span class="icon">{icon}</span>
            </button>
            <button
                class="danger flex"
                on:click={action}
                toggle:hidden={cannotConfirm}
            >
                {translations.general.confirmButton}
                <span class="icon">warning</span>
            </button>
        </div>
    );
}
