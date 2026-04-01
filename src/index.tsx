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

// upgrade
new v1Upgrader(settingsModel, connectionModel, chatListModel);

// viewModels
const coreVieWModel = new CoreViewModel();

const storageViewModel = new StorageViewModel(coreVieWModel, storageModel);
const settingsViewModel = new SettingsViewModel(coreVieWModel, settingsModel);
const connectionViewModel = new ConnectionViewModel(
    coreVieWModel,
    connectionModel,
);
const chatListViewModel = new ChatListViewModel(
    coreVieWModel,
    storageModel,
    chatListModel,
    settingsViewModel,
);
const fileTransferViewModel = new FileTransferViewModel(
    fileTransferModel,
    chatListModel,
);

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
            storageViewModel,
            settingsViewModel,
            connectionViewModel,
            fileTransferViewModel,
            chatListViewModel,
        ),
        ChatPageWrapper(chatListViewModel),
        ConnectionModal(connectionViewModel),
        DataTransferModalWrapper(connectionViewModel, fileTransferViewModel),
        StorageModal(storageViewModel),
    );
