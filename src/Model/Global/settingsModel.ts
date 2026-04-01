// this file is responsible for all settings.

import StorageModel, { StorageModelSubPath, filePaths } from "./storageModel";

export default class SettingsModel {
    storageModel: StorageModel;

    // data
    username: string;
    firstDayOfWeek: string;

    // storage
    setName(newValue: string): void {
        this.username = newValue;
        const path = StorageModel.getPath(
            StorageModelSubPath.SettingsModel,
            filePaths.settingsModel.username,
        );
        this.storageModel.write(path, newValue);
    }

    setFirstDayOfWeek(newValue: string): void {
        this.firstDayOfWeek = newValue;
        const path = StorageModel.getPath(
            StorageModelSubPath.SettingsModel,
            filePaths.settingsModel.firstDayOfWeek,
        );
        this.storageModel.write(path, newValue);
    }

    // load
    loadUsernam(): void {
        const path = StorageModel.getPath(
            StorageModelSubPath.SettingsModel,
            filePaths.settingsModel.username,
        );
        const content = this.storageModel.read(path);
        this.username = content ?? "";
    }

    loadFirstDayofWeek(): void {
        const path = StorageModel.getPath(
            StorageModelSubPath.SettingsModel,
            filePaths.settingsModel.firstDayOfWeek,
        );
        const content = this.storageModel.read(path);
        this.firstDayOfWeek = content ?? "0";
    }

    // init
    constructor(storageModel: StorageModel) {
        this.storageModel = storageModel;

        this.loadUsernam();
        this.loadFirstDayofWeek();
    }
}
