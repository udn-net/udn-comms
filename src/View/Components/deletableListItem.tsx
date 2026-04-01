import * as React from "bloatless-react";

import { translations } from "../translations";

export function DeletableListItem(
    text: string,
    primaryButton: HTMLElement,
    ondelete: () => void,
) {
    return (
        <div class="tile flex-row justify-apart align-center padding-0">
            <span class="padding-h ellipsis">{text}</span>

            <div class="flex-row justify-end">
                {primaryButton}

                <button
                    class="danger"
                    aria-label={translations.general.deleteItemButtonAudioLabel}
                    on:click={ondelete}
                >
                    <span class="icon">delete</span>
                </button>
            </div>
        </div>
    );
}
