import * as React from "bloatless-react";

import { PATH_COMPONENT_SEPARATOR } from "../../Model/Global/storageModel";
import StorageViewModel from "../../ViewModel/Global/storageViewModel";
import { translations } from "../translations";

import { SplitModal } from "../Components/splitModal";
import { DangerousActionButton } from "../Components/dangerousActionButton";
import { DirectoryItemList } from "../Components/directoryItemList";

export function StorageModal(storageViewModel: StorageViewModel) {
    const detailView = React.createProxyState(
        [storageViewModel.selectedPath],
        () => {
            if (storageViewModel.selectedPath.value == PATH_COMPONENT_SEPARATOR)
                return (
                    <div>
                        <span class="secondary">
                            {translations.storage.noItemSelected}
                        </span>

                        <hr></hr>

                        {DangerousActionButton(
                            translations.storage.removeJunkButton,
                            "delete_forever",
                            storageViewModel.removeJunk,
                        )}
                    </div>
                );

            return (
                <div class="flex-column gap">
                    <div class="tile flex-no">
                        <div>
                            <b>{translations.storage.path}</b>
                            <span
                                class="break-all"
                                subscribe:innerText={
                                    storageViewModel.selectedPath
                                }
                            ></span>
                        </div>
                    </div>
                    <div class="tile flex-no">
                        <div>
                            <b>{translations.storage.content}</b>
                            <code
                                subscribe:innerText={
                                    storageViewModel.selectedFileContent
                                }
                            ></code>
                        </div>
                    </div>

                    {DangerousActionButton(
                        translations.storage.deleteItem,
                        "delete_forever",
                        storageViewModel.deleteSelectedItem,
                    )}
                </div>
            );
        },
    );
    return (
        <div class="modal" toggle:open={storageViewModel.isShowingStorageModal}>
            <div style="max-width: 64rem">
                <main class="padding-0">
                    {SplitModal(
                        new React.State(DirectoryItemList(storageViewModel)),
                        detailView,
                        storageViewModel.selectedFileName,
                    )}
                </main>
                <button on:click={storageViewModel.hideStorageModal}>
                    {translations.general.closeButton}
                    <span class="icon">close</span>
                </button>
            </div>
        </div>
    );
}
