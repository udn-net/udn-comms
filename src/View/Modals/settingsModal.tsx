import * as React from "bloatless-react";

import { FileBrowser } from "../Components/fileBrowser";
import StorageViewModel from "../../ViewModel/Global/storageViewModel";
import { translations } from "../translations";
import SettingsViewModel from "../../ViewModel/Global/settingsViewModel";

export function SettingsModal(settingsViewModel: SettingsViewModel) {
    return (
        <div class="modal" toggle:open={settingsViewModel.isShowingSettingsModal}>
            <div style="max-width: 64rem">
                <main class="padding-0"></main>
                <button on:click={settingsViewModel.hideSettingsModal}>
                    {translations.general.closeButton}
                    <span class="icon">close</span>
                </button>
            </div>
        </div>
    );
}
