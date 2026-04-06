import * as React from "bloatless-react";

import FileTransferViewModel, {
    FileTransferModal,
    FileTransferOption,
} from "../../ViewModel/Global/fileTransferViewModel";

import ConnectionViewModel from "../../ViewModel/Global/connectionViewModel";
import StorageModel from "../../Model/Global/storageModel";
import { StringToTextSpan } from "../Components/textSpan";
import { reload } from "../utility";
import { translations } from "../translations";

export function DataTransferModalWrapper(
    connectionViewModel: ConnectionViewModel,
    fileTransferViewModel: FileTransferViewModel,
) {
    return (
        <div>
            {DirectionSelectionModal(
                connectionViewModel,
                fileTransferViewModel,
            )}
            {FileSelectionModal(fileTransferViewModel)}
            {TransferDataDisplayModal(fileTransferViewModel)}
            {TransferDisplayModal(fileTransferViewModel)}
            {TransferDataInputModal(fileTransferViewModel)}
            {DataReceptionModal(fileTransferViewModel)}
        </div>
    );
}

function DirectionSelectionModal(
    connectionViewModel: ConnectionViewModel,
    fileTransferViewModel: FileTransferViewModel,
) {
    const isPresented = React.createProxyState(
        [fileTransferViewModel.presentedModal],
        () =>
            fileTransferViewModel.presentedModal.value ==
            FileTransferModal.DirectionSelection,
    );

    const isDisconnected = React.createProxyState(
        [connectionViewModel.isConnected],
        () => connectionViewModel.isConnected.value == false,
    );

    return (
        <div class="modal" toggle:open={isPresented}>
            <div>
                <main>
                    <h2>
                        {translations.dataTransferModal.transferDataHeadline}
                    </h2>

                    <p
                        class="error"
                        toggle:hidden={connectionViewModel.isConnected}
                    >
                        {translations.dataTransferModal.notConnectedError}
                    </p>

                    <div
                        class="flex-column gap content-margin-bottom"
                        toggle:hidden={isDisconnected}
                    >
                        <button
                            class="tile"
                            on:click={
                                fileTransferViewModel.showFileSelectionModal
                            }
                        >
                            <span class="icon">upload</span>
                            <div>
                                <b>
                                    {
                                        translations.dataTransferModal
                                            .fromThisDeviceButton
                                    }
                                </b>
                            </div>
                            <span class="icon">arrow_forward</span>
                        </button>
                        <button
                            class="tile"
                            on:click={
                                fileTransferViewModel.showTransferDataInputModal
                            }
                        >
                            <span class="icon">download</span>
                            <div>
                                <b>
                                    {
                                        translations.dataTransferModal
                                            .toThisDeviceButton
                                    }
                                </b>
                            </div>
                            <span class="icon">arrow_forward</span>
                        </button>
                    </div>
                </main>
                <button on:click={fileTransferViewModel.hideModal}>
                    {translations.general.closeButton}
                    <span class="icon">close</span>
                </button>
            </div>
        </div>
    );
}

function FileSelectionModal(fileTransferViewModel: FileTransferViewModel) {
    // option
    const OptionConverter: React.StateItemConverter<FileTransferOption> = (
        fileOption: FileTransferOption,
    ) => {
        return OptionEntry(fileOption, fileTransferViewModel);
    };

    function OptionEntry(
        fileOption: FileTransferOption,
        fileTransferViewModel: FileTransferViewModel,
    ) {
        const isSelected = new React.State(false);
        if (fileTransferViewModel.selectedPaths.value.has(fileOption.path)) {
            isSelected.value = true;
        }
        isSelected.subscribeSilent((isSelected) => {
            if (isSelected == true) {
                fileTransferViewModel.selectedPaths.add(fileOption.path);
            } else {
                fileTransferViewModel.selectedPaths.remove(fileOption.path);
            }
        });
        function toggle() {
            isSelected.value = !isSelected.value;
        }

        return (
            <button class="tile" toggle:selected={isSelected} on:click={toggle}>
                <div>
                    <b class="ellipsis">{fileOption.label}</b>
                    <span class="secondary ellipsis">
                        {StorageModel.pathComponentsToString(
                            ...fileOption.path,
                        )}
                    </span>
                </div>
            </button>
        );
    }

    // state
    const isPresented = React.createProxyState(
        [fileTransferViewModel.presentedModal],
        () =>
            fileTransferViewModel.presentedModal.value ==
            FileTransferModal.FileSelection,
    );

    return (
        <div class="modal" toggle:open={isPresented}>
            <div>
                <main>
                    <h2>
                        {translations.dataTransferModal.transferDataHeadline}
                    </h2>
                    <span class="secondary">
                        {translations.dataTransferModal.selectionDescription}
                    </span>

                    <hr></hr>

                    <h3>{translations.dataTransferModal.generalHeadline}</h3>
                    <div
                        class="flex-column gap content-margin-bottom"
                        children:append={[
                            fileTransferViewModel.generalFileOptions,
                            OptionConverter,
                        ]}
                    ></div>

                    <h3>{translations.dataTransferModal.chatsHeadline}</h3>
                    <div
                        class="flex-column gap"
                        children:append={[
                            fileTransferViewModel.chatFileOptions,
                            OptionConverter,
                        ]}
                    ></div>
                </main>
                <div class="flex-row width-100">
                    <button
                        class="flex"
                        on:click={
                            fileTransferViewModel.showDirectionSelectionModal
                        }
                    >
                        {translations.general.backButton}
                    </button>
                    <button
                        class="primary flex"
                        on:click={fileTransferViewModel.showTransferDataModal}
                        toggle:disabled={
                            fileTransferViewModel.hasNoPathsSelected
                        }
                    >
                        {translations.general.continueButton}
                        <span class="icon">arrow_forward</span>
                    </button>
                </div>
            </div>
        </div>
    );
}

function TransferDataDisplayModal(
    fileTransferViewModel: FileTransferViewModel,
) {
    const isPresented = React.createProxyState(
        [fileTransferViewModel.presentedModal],
        () =>
            fileTransferViewModel.presentedModal.value ==
            FileTransferModal.TransferDataDisplay,
    );

    return (
        <div class="modal" toggle:open={isPresented}>
            <div>
                <main>
                    <h2>
                        {translations.dataTransferModal.transferDataHeadline}
                    </h2>

                    <span class="secondary">
                        {translations.dataTransferModal.dataEntryDescription}
                    </span>

                    <hr></hr>

                    <div class="flex-column gap content-margin-bottom">
                        <div class="tile">
                            <span class="icon">forum</span>
                            <div>
                                <span class="secondary">
                                    {
                                        translations.dataTransferModal
                                            .transferChannelHeadline
                                    }
                                </span>
                                <b
                                    subscribe:innerText={
                                        fileTransferViewModel.transferChannel
                                    }
                                ></b>
                            </div>
                        </div>
                        <div class="tile">
                            <span class="icon">key</span>
                            <div>
                                <span class="secondary">
                                    {
                                        translations.dataTransferModal
                                            .transferKeyHeadline
                                    }
                                </span>
                                <b
                                    subscribe:innerText={
                                        fileTransferViewModel.transferKey
                                    }
                                ></b>
                            </div>
                        </div>
                    </div>
                </main>
                <div class="flex-row width-100">
                    <button
                        class="flex"
                        on:click={fileTransferViewModel.showFileSelectionModal}
                    >
                        {translations.general.backButton}
                    </button>
                    <button disabled class="flex">
                        {translations.general.waitingLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}

function TransferDisplayModal(fileTransferViewModel: FileTransferViewModel) {
    const isPresented = React.createProxyState(
        [fileTransferViewModel.presentedModal],
        () =>
            fileTransferViewModel.presentedModal.value ==
            FileTransferModal.TransferDisplay,
    );

    return (
        <div class="modal" toggle:open={isPresented}>
            <div>
                <main>
                    <h2>
                        {translations.dataTransferModal.transferDataHeadline}
                    </h2>

                    <p
                        class="secondary"
                        subscribe:innerText={
                            fileTransferViewModel.filesSentText
                        }
                    ></p>

                    <p
                        class="secondary"
                        toggle:hidden={
                            fileTransferViewModel.didNotFinishSending
                        }
                    >
                        {translations.dataTransferModal.allFilesSent}
                    </p>

                    <hr></hr>

                    <div
                        class="tile flex-column align-start"
                        children:append={[
                            fileTransferViewModel.filePathsSent,
                            StringToTextSpan,
                        ]}
                    ></div>
                </main>
                <div class="flex-row width-100">
                    <button
                        class="flex"
                        on:click={fileTransferViewModel.initiateTransfer}
                    >
                        {translations.dataTransferModal.sendAgainButton}
                        <span class="icon">restart_alt</span>
                    </button>
                    <button
                        class="flex"
                        on:click={fileTransferViewModel.hideModal}
                        toggle:disabled={
                            fileTransferViewModel.didNotFinishSending
                        }
                    >
                        {translations.general.closeButton}
                        <span class="icon">close</span>
                    </button>
                </div>
            </div>
        </div>
    );
}

function TransferDataInputModal(fileTransferViewModel: FileTransferViewModel) {
    const isPresented = React.createProxyState(
        [fileTransferViewModel.presentedModal],
        () =>
            fileTransferViewModel.presentedModal.value ==
            FileTransferModal.TransferDataInput,
    );

    return (
        <div class="modal" toggle:open={isPresented}>
            <div>
                <main>
                    <h2>
                        {translations.dataTransferModal.transferDataHeadline}
                    </h2>

                    <span class="secondary">
                        {
                            translations.dataTransferModal
                                .dataEntryInputDescription
                        }
                    </span>

                    <hr></hr>

                    <div class="flex-column gap content-margin-bottom">
                        <label class="tile">
                            <span class="icon">forum</span>
                            <div>
                                <span class="secondary">
                                    {
                                        translations.dataTransferModal
                                            .transferChannelHeadline
                                    }
                                </span>
                                <input
                                    bind:value={
                                        fileTransferViewModel.receivingTransferChannel
                                    }
                                ></input>
                            </div>
                        </label>
                        <label class="tile">
                            <span class="icon">key</span>
                            <div>
                                <span class="secondary">
                                    {
                                        translations.dataTransferModal
                                            .transferKeyHeadline
                                    }
                                </span>
                                <input
                                    bind:value={
                                        fileTransferViewModel.receivingTransferKey
                                    }
                                ></input>
                            </div>
                        </label>
                    </div>
                </main>
                <div class="flex-row width-100">
                    <button
                        class="flex"
                        on:click={
                            fileTransferViewModel.showDirectionSelectionModal
                        }
                    >
                        {translations.general.backButton}
                    </button>
                    <button
                        class="primary flex"
                        on:click={fileTransferViewModel.prepareReceivingData}
                        toggle:disabled={
                            fileTransferViewModel.cannotPrepareToReceive
                        }
                    >
                        {translations.general.continueButton}
                        <span class="icon">arrow_forward</span>
                    </button>
                </div>
            </div>
        </div>
    );
}

function DataReceptionModal(fileTransferViewModel: FileTransferViewModel) {
    const isPresented = React.createProxyState(
        [fileTransferViewModel.presentedModal],
        () =>
            fileTransferViewModel.presentedModal.value ==
            FileTransferModal.ReceptionDisplay,
    );

    return (
        <div class="modal" toggle:open={isPresented}>
            <div>
                <main>
                    <h2>
                        {translations.dataTransferModal.transferDataHeadline}
                    </h2>

                    <p
                        class="secondary"
                        subscribe:innerText={
                            fileTransferViewModel.filesReceivedText
                        }
                    ></p>

                    <hr></hr>

                    <div
                        class="tile flex-column align-start"
                        children:append={[
                            fileTransferViewModel.filePathsReceived,
                            StringToTextSpan,
                        ]}
                    ></div>
                </main>
                <button on:click={reload}>
                    {translations.general.reloadAppButton}
                    <span class="icon">refresh</span>
                </button>
            </div>
        </div>
    );
}
