import * as React from "bloatless-react";

import FileTransferModel, {
    TransferData,
} from "../../Model/Global/fileTransferModel";
import StorageModel, {
    StorageModelSubPaths,
    filePaths,
} from "../../Model/Global/storageModel";

import ChatModel from "../../Model/Chat/chatModel";
import CoreViewModel, { Context } from "./coreViewModel";
import { CommonKeys } from "../../View/keystrokes";

export default class FileTransferViewModel extends Context {
    contextDebugDescription = "transfer";

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
            this.coreViewModel.translations.dataTransferModal.filesSentCount(
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
            this.coreViewModel.translations.dataTransferModal.filesReceivedCount(
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
                label: this.coreViewModel.translations.dataTransferModal
                    .connectionData,
                path: StorageModel.getPath(
                    StorageModelSubPaths.ConnectionModel,
                    filePaths.connectionModel.previousAddresses,
                ),
            },
            {
                label: this.coreViewModel.translations.dataTransferModal
                    .settingsData,
                path: StorageModel.getPath(
                    StorageModelSubPaths.SettingsModel,
                    [],
                ),
            },
        );

        const chatModels: Set<ChatModel> =
            this.coreViewModel.chatListModel.chatModels;
        for (const chatModel of chatModels) {
            this.chatFileOptions.add({
                label: chatModel.info.primaryChannel,
                path: chatModel.getBasePath(),
            });
        }
    };

    getTransferData = (): void => {
        const transferData: TransferData =
            this.coreViewModel.fileTransferModel.generateTransferData();
        this.transferChannel.value = transferData.channel;
        this.transferKey.value = transferData.key;
    };

    // view
    showDirectionSelectionModal = (): void => {
        this.coreViewModel.context = this;
        this.presentedModal.value = FileTransferModals.DirectionSelection;
        this.getOptions();
    };

    showFileSelectionModal = (): void => {
        this.presentedModal.value = FileTransferModals.FileSelection;
    };

    showTransferDataModal = (): void => {
        this.presentedModal.value = FileTransferModals.TransferDataDisplay;
        this.getTransferData();
        this.coreViewModel.fileTransferModel.prepareToSend();
    };

    initiateTransfer = (): void => {
        this.presentedModal.value = FileTransferModals.TransferDisplay;
        this.didNotFinishSending.value = true;
        this.filePathsSent.clear();

        this.coreViewModel.fileTransferModel.sendFiles(
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
        if (this.cannotPrepareToReceive.value == true) return;
        this.presentedModal.value = FileTransferModals.ReceptionDisplay;
        this.filePathsReceived.clear();

        const transferData: TransferData = {
            channel: this.receivingTransferChannel.value,
            key: this.receivingTransferKey.value,
        };
        this.coreViewModel.fileTransferModel.prepareToReceive(transferData);
    };

    hideModal = (): void => {
        this.coreViewModel.closeContext(this.contextId);
        this.presentedModal.value = undefined;
    };

    // init
    constructor(public readonly coreViewModel: CoreViewModel) {
        super();

        this.coreViewModel.fileTransferModel.fileHandlerManager.addHandler(
            this.handleReceivedFile,
        );

        this.coreViewModel.fileTransferModel.readyToSendHandlerManager.addHandler(
            () => this.initiateTransfer(),
        );

        // keystrokes
        this.registerKeyStroke(CommonKeys.CloseOrCancel, this.hideModal);
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
