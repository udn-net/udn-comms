import * as React from "bloatless-react";
import SettingsModel from "../../Model/Global/settingsModel";
import { allTranslations, Translations } from "../../View/translations";
import StorageModel from "../../Model/Global/storageModel";
import ConnectionModel from "../../Model/Global/connectionModel";
import ChatListModel from "../../Model/Chat/chatListModel";
import FileTransferModel from "../../Model/Global/fileTransferModel";

export default class CoreViewModel {
    readonly BUILD = "Build 26.04.09.E";

    translations: Translations;

    // DRAG & DROP
    draggedObject: React.State<any> = new React.State<any>(undefined);

    // SUGGESTIONS
    // boards & tasks
    boardFilterStringSuggestions: React.ListState<string> =
        new React.ListState();

    taskCategorySuggestions: React.ListState<string> = new React.ListState();
    taskStatusSuggestions: React.ListState<string> = new React.ListState();

    // init
    constructor(
        public storageModel: StorageModel,
        public settingsModel: SettingsModel,
        public connectionModel: ConnectionModel,
        public chatListModel: ChatListModel,
        public fileTransferModel: FileTransferModel,
    ) {
        this.translations =
            allTranslations[settingsModel.language] || allTranslations.en;
    }
}
