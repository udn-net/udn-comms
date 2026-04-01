import * as React from "bloatless-react";

import { FileBrowser } from "../Components/fileBrowser";
import StorageViewModel from "../../ViewModel/Global/storageViewModel";
import { translations } from "../translations";

export function StorageModal(storageViewModel: StorageViewModel) {
    return (
        <div class="modal" toggle:open={storageViewModel.isShowingStorageModal}>
            <div style="max-width: 64rem">
                <main class="padding-0">{FileBrowser(storageViewModel)}</main>
                <button on:click={storageViewModel.hideStorageModal}>
                    {translations.general.closeButton}
                    <span class="icon">close</span>
                </button>
            </div>
        </div>
    );
}
