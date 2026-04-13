// this file is responsible for all settings.

import StorageModel, { StorageModelSubPaths, filePaths } from "./storageModel";

export default class SettingsModel {
    readonly storageModel: StorageModel;

    // data
    username: string;
    firstDayOfWeek: string;
    language: string;
    theme: string;

    // storage
    private storeSetting(
        pathName: keyof typeof filePaths.settingsModel,
        value: string,
    ): void {
        const path = StorageModel.getPath(
            StorageModelSubPaths.SettingsModel,
            filePaths.settingsModel[pathName],
        );
        this.storageModel.write(path, value);
    }

    setName = (newValue: string): void => {
        this.username = newValue;
        this.storeSetting("username", newValue);
    }

    setFirstDayOfWeek = (newValue: string): void => {
        this.firstDayOfWeek = newValue;
        this.storeSetting("firstDayOfWeek", newValue);
    }

    setLanguage = (newValue: string): void => {
        this.language = newValue;
        this.storeSetting("language", newValue);
    }

    setTheme = (newValue: string): void => {
        this.theme = newValue;
        this.storeSetting("theme", newValue);
    }

    // load
    private readSetting = (
        pathName: keyof typeof filePaths.settingsModel,
    ): string => {
        const path = StorageModel.getPath(
            StorageModelSubPaths.SettingsModel,
            filePaths.settingsModel[pathName],
        );
        return this.storageModel.read(path);
    }

    loadUsername = (): void => {
        const content = this.readSetting("username");
        this.username = content ?? "";
    }

    loadFirstDayofWeek = (): void => {
        const content = this.readSetting("firstDayOfWeek");
        this.firstDayOfWeek = content ?? "0";
    }

    loadLanguage = (): void => {
        const content = this.readSetting("language");
        this.language = content ?? SettingsModel.getSystemLanguage();
    }

    loadTheme = (): void => {
        const content = this.readSetting("theme");
        this.theme = content ?? ThemeSettings.System;
    }

    // init
    constructor(storageModel: StorageModel) {
        this.storageModel = storageModel;

        this.loadUsername();
        this.loadFirstDayofWeek();
        this.loadLanguage();
        this.loadTheme();
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

export enum Languages {
    English = "en",
    German = "de",
    Spanish = "es",
}

export enum ThemeSettings {
    Dark = "dark",
    Light = "light",
    System = "system",
}
