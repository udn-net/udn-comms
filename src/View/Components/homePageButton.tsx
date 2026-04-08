import * as React from "bloatless-react";

export function HomePageButton(action: () => void, label: string) {
    return (
        <button class="tile flex-no" on:click={action}>
            <span class="icon">sync_alt</span>
            <div>
                <span>{label}</span>
            </div>
        </button>
    );
}
