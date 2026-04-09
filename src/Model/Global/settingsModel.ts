// this file is responsible for all settings.

import { Languages } from "../../View/translations";
import StorageModel, { StorageModelSubPaths, filePaths } from "./storageModel";

export default class SettingsModel {
    storageModel: StorageModel;

    // data
    username: string;
    firstDayOfWeek: string;
    language: string;

    // storage
    setName(newValue: string): void {
        this.username = newValue;
        const path = StorageModel.getPath(
            StorageModelSubPaths.SettingsModel,
            filePaths.settingsModel.username,
        );
        this.storageModel.write(path, newValue);
    }

    setFirstDayOfWeek(newValue: string): void {
        this.firstDayOfWeek = newValue;
        const path = StorageModel.getPath(
            StorageModelSubPaths.SettingsModel,
            filePaths.settingsModel.firstDayOfWeek,
        );
        this.storageModel.write(path, newValue);
    }

    setLanguage(newValue: string): void {
        this.language = newValue;
        const path = StorageModel.getPath(
            StorageModelSubPaths.SettingsModel,
            filePaths.settingsModel.language,
        );
        this.storageModel.write(path, newValue);
    }

    // load
    loadUsername(): void {
        const path = StorageModel.getPath(
            StorageModelSubPaths.SettingsModel,
            filePaths.settingsModel.username,
        );
        const content = this.storageModel.read(path);
        this.username = content ?? "";
    }

    loadFirstDayofWeek(): void {
        const path = StorageModel.getPath(
            StorageModelSubPaths.SettingsModel,
            filePaths.settingsModel.firstDayOfWeek,
        );
        const content = this.storageModel.read(path);
        this.firstDayOfWeek = content ?? "0";
    }

    loadLanguage(): void {
        const path = StorageModel.getPath(
            StorageModelSubPaths.SettingsModel,
            filePaths.settingsModel.language,
        );
        const content = this.storageModel.read(path);
        this.language = content ?? SettingsModel.getSystemLanguage();
    }

    // init
    constructor(storageModel: StorageModel) {
        this.storageModel = storageModel;

        this.loadUsername();
        this.loadFirstDayofWeek();
        this.loadLanguage();
    }

    static getSystemLanguage(): Languages {
        switch (navigator.language.substring(0, 2)) {
            case "de":
                return Languages.German;
            case "es":
                return Languages.Spanish;
            default:
                return Languages.English;
        }
    }
}
