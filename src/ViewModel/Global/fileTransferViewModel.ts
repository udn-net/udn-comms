import * as React from "bloatless-react";

import FileTransferModel, {
    TransferData,
} from "../../Model/Global/fileTransferModel";
import StorageModel, {
    StorageModelSubPaths,
    filePaths,
} from "../../Model/Global/storageModel";

import ChatListModel from "../../Model/Chat/chatListModel";
import ChatModel from "../../Model/Chat/chatModel";
import { translations } from "../../View/translations";

export default class FileTransferViewModel {
    fileTransferModel: FileTransferModel;
    chatListModel: ChatListModel;

    // state
    presentedModal: React.State<FileTransferModals | undefined> =
        new React.State<any>(undefined);

    generalFileOptions: React.ListState<FileTransferOption> =
        new React.ListState();
    chatFileOptions: React.ListState<FileTransferOption> =
        new React.ListState();
    selectedPaths: React.ListState<string[]> = new React.ListState();

    transferChannel: React.State<string> = new React.State("");
    transferKey: React.State<string> = new React.State("");

    receivingTransferChannel: React.State<string> = new React.State("");
    receivingTransferKey: React.State<string> = new React.State("");

    filePathsSent: React.ListState<string> = new React.ListState();
    filesSentCount: React.State<number> = React.createProxyState(
        [this.filePathsSent],
        () => this.filePathsSent.value.size,
    );
    filesSentText: React.State<string> = React.createProxyState(
        [this.filesSentCount],
        () =>
            translations.dataTransferModal.filesSentCount(
                this.filesSentCount.value,
            ),
    );

    filePathsReceived: React.ListState<string> = new React.ListState();
    filesReceivedCount: React.State<number> = React.createProxyState(
        [this.filePathsReceived],
        () => this.filePathsReceived.value.size,
    );
    filesReceivedText: React.State<string> = React.createProxyState(
        [this.filesReceivedCount],
        () =>
            translations.dataTransferModal.filesReceivedCount(
                this.filesReceivedCount.value,
            ),
    );

    // guards
    hasNoPathsSelected: React.State<boolean> = React.createProxyState(
        [this.selectedPaths],
        () => this.selectedPaths.value.size == 0,
    );
    didNotFinishSending: React.State<boolean> = new React.State(true);
    cannotPrepareToReceive: React.State<boolean> = React.createProxyState(
        [this.receivingTransferChannel, this.receivingTransferKey],
        () =>
            this.receivingTransferChannel.value == "" ||
            this.receivingTransferKey.value == "",
    );

    // handlers
    handleReceivedFile = (path: string): void => {
        this.filePathsReceived.add(path);
    };

    // methods
    getOptions = (): void => {
        this.generalFileOptions.clear();
        this.chatFileOptions.clear();
        this.selectedPaths.clear();

        this.generalFileOptions.add(
            {
                label: translations.dataTransferModal.connectionData,
                path: StorageModel.getPath(
                    StorageModelSubPaths.ConnectionModel,
                    filePaths.connectionModel.previousAddresses,
                ),
            },
            {
                label: translations.dataTransferModal.settingsData,
                path: StorageModel.getPath(
                    StorageModelSubPaths.SettingsModel,
                    [],
                ),
            },
        );

        const chatModels: Set<ChatModel> = this.chatListModel.chatModels;
        for (const chatModel of chatModels) {
            this.chatFileOptions.add({
                label: chatModel.info.primaryChannel,
                path: chatModel.getBasePath(),
            });
        }
    };

    getTransferData = (): void => {
        const transferData: TransferData =
            this.fileTransferModel.generateTransferData();
        this.transferChannel.value = transferData.channel;
        this.transferKey.value = transferData.key;
    };

    // view
    showDirectionSelectionModal = (): void => {
        this.presentedModal.value = FileTransferModals.DirectionSelection;
        this.getOptions();
    };

    showFileSelectionModal = (): void => {
        this.presentedModal.value = FileTransferModals.FileSelection;
    };

    showTransferDataModal = (): void => {
        this.presentedModal.value = FileTransferModals.TransferDataDisplay;
        this.getTransferData();
        this.fileTransferModel.prepareToSend();
    };

    initiateTransfer = (): void => {
        this.presentedModal.value = FileTransferModals.TransferDisplay;
        this.didNotFinishSending.value = true;
        this.filePathsSent.clear();

        this.fileTransferModel.sendFiles(
            this.selectedPaths.value.values(),
            (path: string) => {
                console.log(path);
                this.filePathsSent.add(path);
            },
        );

        this.didNotFinishSending.value = false;
    };

    showTransferDataInputModal = (): void => {
        this.presentedModal.value = FileTransferModals.TransferDataInput;
    };

    prepareReceivingData = (): void => {
        this.presentedModal.value = FileTransferModals.ReceptionDisplay;
        this.filePathsReceived.clear();

        const transferData: TransferData = {
            channel: this.receivingTransferChannel.value,
            key: this.receivingTransferKey.value,
        };
        this.fileTransferModel.prepareToReceive(transferData);
    };

    hideModal = (): void => {
        this.presentedModal.value = undefined;
    };

    // init
    constructor(
        fileTransferModel: FileTransferModel,
        chatListModel: ChatListModel,
    ) {
        this.fileTransferModel = fileTransferModel;
        this.chatListModel = chatListModel;

        this.fileTransferModel.fileHandlerManager.addHandler(
            this.handleReceivedFile,
        );

        this.fileTransferModel.readyToSendHandlerManager.addHandler(() =>
            this.initiateTransfer(),
        );
    }
}

export interface FileTransferOption {
    label: string;
    path: string[];
}

export enum FileTransferModals {
    DirectionSelection,

    // sending
    FileSelection,
    TransferDataDisplay,
    TransferDisplay,

    // receiving
    TransferDataInput,
    ReceptionDisplay,
}
