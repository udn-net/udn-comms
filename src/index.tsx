import "./base.css";
import "./colors.css";
import "./coloredTile.css";

import * as React from "bloatless-react";

import ChatListModel from "./Model/Chat/chatListModel";
import ChatListViewModel from "./ViewModel/Chat/chatListViewModel";
import { ChatPageWrapper } from "./View/chatPageWrapper";
import { ConnectionModal } from "./View/Modals/connectionModal";
import ConnectionModel from "./Model/Global/connectionModel";
import ConnectionViewModel from "./ViewModel/Global/connectionViewModel";
import CoreViewModel from "./ViewModel/Global/coreViewModel";
import { DataTransferModalWrapper } from "./View/Modals/dataTransferModal";
import FileTransferModel from "./Model/Global/fileTransferModel";
import FileTransferViewModel from "./ViewModel/Global/fileTransferViewModel";
import { HomePage } from "./View/homePage";
import SettingsModel from "./Model/Global/settingsModel";
import SettingsViewModel from "./ViewModel/Global/settingsViewModel";
import { StorageModal } from "./View/Modals/storageModal";
import StorageModel from "./Model/Global/storageModel";
import StorageViewModel from "./ViewModel/Global/storageViewModel";
import v1Upgrader from "./Upgrader/v1";
import { SettingsModal } from "./View/Modals/settingsModal";

// models
const storageModel = new StorageModel();
const settingsModel = new SettingsModel(storageModel);
const connectionModel = new ConnectionModel(storageModel);
const chatListModel = new ChatListModel(
    storageModel,
    settingsModel,
    connectionModel,
);
const fileTransferModel = new FileTransferModel(storageModel, connectionModel);

// viewModels
const coreViewModel = new CoreViewModel(
    storageModel,
    settingsModel,
    connectionModel,
    chatListModel,
    fileTransferModel,
);

// upgrade
new v1Upgrader(coreViewModel);

const storageViewModel = new StorageViewModel(coreViewModel);
const settingsViewModel = new SettingsViewModel(coreViewModel);
const connectionViewModel = new ConnectionViewModel(coreViewModel);
const chatListViewModel = new ChatListViewModel(
    coreViewModel,
    settingsViewModel,
    connectionViewModel,
);
const fileTransferViewModel = new FileTransferViewModel(coreViewModel);

// view
chatListViewModel.selectedChat.subscribe(() => {
    document.body.toggleAttribute(
        "showing-chat",
        chatListViewModel.selectedChat.value != undefined,
    );
});

document.body.append(
    <div id="background-wrapper">
        <div id="sky"></div>
        <div id="grass-1"></div>
        <div id="grass-2"></div>
    </div>,
);
document
    .querySelector("main")!
    .append(
        HomePage(
            coreViewModel,
            storageViewModel,
            settingsViewModel,
            connectionViewModel,
            fileTransferViewModel,
            chatListViewModel,
        ),
        ChatPageWrapper(coreViewModel, chatListViewModel),
        ConnectionModal(coreViewModel, connectionViewModel),
        DataTransferModalWrapper(
            coreViewModel,
            connectionViewModel,
            fileTransferViewModel,
        ),
        StorageModal(coreViewModel, storageViewModel),
        SettingsModal(coreViewModel, settingsViewModel),
    );
