import * as React from "bloatless-react";

import StorageModel, {
    PATH_COMPONENT_SEPARATOR,
} from "../../Model/Global/storageModel";

import CoreViewModel from "./coreViewModel";

export default class StorageViewModel {
    // state
    isShowingStorageModal: React.State<boolean> = new React.State(false);
    selectedPath: React.State<string> = new React.State(
        PATH_COMPONENT_SEPARATOR,
    );
    didMakeChanges: React.State<boolean> = new React.State(false);

    selectedFileName: React.State<string>;
    selectedFileContent: React.State<string>;

    lastDeletedItemPath: React.State<string> = new React.State("");

    // methods
    getSelectedItemContent = (): string => {
        const path = StorageModel.stringToPathComponents(
            this.selectedPath.value,
        );
        const content = this.coreViewModel.storageModel.read(path);
        return (
            (content ?? this.coreViewModel.translations.storage.notAFile) ||
            this.coreViewModel.translations.storage.contentEmpty
        );
    };

    deleteSelectedItem = (): void => {
        const path = StorageModel.stringToPathComponents(
            this.selectedPath.value,
        );
        this.lastDeletedItemPath.value = this.selectedPath.value;

        this.coreViewModel.storageModel.removeRecursively(path);
        this.didMakeChanges.value = true;
    };

    removeJunk = (): void => {
        this.coreViewModel.storageModel.removeJunk();
        this.selectedPath.value = PATH_COMPONENT_SEPARATOR;
    };

    // view
    showStorageModal = (): void => {
        this.isShowingStorageModal.value = true;
    };

    hideStorageModal = (): void => {
        if (this.didMakeChanges.value == true) {
            window.location.reload();
            return;
        }
        this.isShowingStorageModal.value = false;
    };

    // init
    constructor(public coreViewModel: CoreViewModel) {
        this.selectedFileName = React.createProxyState(
            [this.selectedPath],
            () => StorageModel.getFileNameFromString(this.selectedPath.value),
        );
        this.selectedFileContent = React.createProxyState(
            [this.selectedPath],
            () => this.getSelectedItemContent(),
        );
    }
}
