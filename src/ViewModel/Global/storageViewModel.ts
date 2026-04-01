import * as React from "bloatless-react";

import StorageModel, {
    PATH_COMPONENT_SEPARATOR,
} from "../../Model/Global/storageModel";

import CoreViewModel from "./coreViewModel";
import { translations } from "../../View/translations";

export default class StorageViewModel {
    storageModel: StorageModel;

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
        const content = this.storageModel.read(path);
        return (
            (content ?? translations.storage.notAFile) ||
            translations.storage.contentEmpty
        );
    };

    deleteSelectedItem = (): void => {
        const path = StorageModel.stringToPathComponents(
            this.selectedPath.value,
        );
        this.lastDeletedItemPath.value = this.selectedPath.value;

        this.storageModel.removeRecursively(path);
        this.didMakeChanges.value = true;
    };

    removeJunk = (): void => {
        this.storageModel.removeJunk();
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
    constructor(
        public coreViewModel: CoreViewModel,
        storageModel: StorageModel,
    ) {
        this.storageModel = storageModel;

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
