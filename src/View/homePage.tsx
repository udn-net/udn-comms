import "./homePage.css";

import * as React from "bloatless-react";

import { Option, StringToOption } from "./Components/option";

import ChatListViewModel from "../ViewModel/Chat/chatListViewModel";
import { ChatViewModelToChatEntry } from "./Components/chatEntry";
import ConnectionViewModel from "../ViewModel/Global/connectionViewModel";
import FileTransferViewModel from "../ViewModel/Global/fileTransferViewModel";
import SettingsViewModel from "../ViewModel/Global/settingsViewModel";
import StorageViewModel from "../ViewModel/Global/storageViewModel";
import { translations } from "./translations";
import CoreViewModel from "../ViewModel/Global/coreViewModel";
import { HomePageButton } from "./Components/homePageButton";

export function HomePage(
    coreVieWModel: CoreViewModel,
    storageViewModel: StorageViewModel,
    settingsViewModel: SettingsViewModel,
    connectionViewModel: ConnectionViewModel,
    fileTransferViewModel: FileTransferViewModel,
    chatListViewModel: ChatListViewModel,
) {
    // sections
    const overviewSection = (
        <div id="overview-section">
            <h2>{translations.homePage.overviewHeadline}</h2>

            <label class="tile flex-no">
                <span class="icon">cell_tower</span>
                <div>
                    <span>{translations.homePage.serverAddress}</span>
                    <input
                        list="previous-connection-list"
                        placeholder={
                            translations.homePage.serverAddressPlaceholder
                        }
                        bind:value={connectionViewModel.serverAddressInput}
                        on:enter={connectionViewModel.connect}
                    ></input>
                    <datalist
                        hidden
                        id="previous-connection-list"
                        children:append={[
                            connectionViewModel.previousAddresses,
                            StringToOption,
                        ]}
                    ></datalist>
                </div>
            </label>

            <div class="flex-row">
                <button
                    class="danger flex justify-center"
                    aria-label={translations.homePage.disconnectAudioLabel}
                    on:click={connectionViewModel.disconnect}
                    toggle:disabled={connectionViewModel.cannotDisonnect}
                >
                    <span class="icon">link_off</span>
                </button>
                <button
                    class="flex justify-center"
                    aria-label={
                        translations.homePage.manageConnectionsAudioLabel
                    }
                    on:click={connectionViewModel.showConnectionModal}
                    toggle:disabled={
                        connectionViewModel.hasNoPreviousConnections
                    }
                >
                    <span class="icon">history</span>
                </button>
                <button
                    class="primary flex justify-center"
                    aria-label={translations.homePage.connectAudioLabel}
                    on:click={connectionViewModel.connect}
                    toggle:disabled={connectionViewModel.cannotConnect}
                >
                    <span class="icon">link</span>
                </button>
            </div>

            <hr></hr>

            <label class="tile flex-no">
                <span class="icon">account_circle</span>
                <div>
                    <span>{translations.homePage.yourNameLabel}</span>
                    <input
                        placeholder={translations.homePage.yourNamePlaceholder}
                        bind:value={settingsViewModel.usernameInput}
                        on:enter={settingsViewModel.setName}
                    ></input>
                </div>
            </label>
            <div class="flex-row justify-end">
                <button
                    class="width-50"
                    on:click={settingsViewModel.setName}
                    toggle:disabled={settingsViewModel.cannotSetName}
                    aria-label={translations.homePage.setNameButtonAudioLabel}
                >
                    {translations.general.setButton}
                    <span class="icon">check</span>
                </button>
            </div>

            <hr></hr>

            {HomePageButton(
                settingsViewModel.showSettingsModal,
                translations.homePage.settingsButton,
                "settings",
            )}
            {HomePageButton(
                fileTransferViewModel.showDirectionSelectionModal,
                translations.homePage.transferDataButton,
                "sync_alt",
            )}
            {HomePageButton(
                storageViewModel.showStorageModal,
                translations.homePage.manageStorageButton,
                "hard_drive",
            )}

            <div class="mobile-only">
                <hr></hr>

                <div class="flex-row justify-end">
                    <button class="ghost width-50" on:click={scrollToChat}>
                        {translations.homePage.scrollToChatButton}
                        <span class="icon">arrow_forward</span>
                    </button>
                </div>
            </div>
        </div>
    );

    const chatSection = (
        <div id="chat-section">
            <h2>{translations.homePage.chatsHeadline}</h2>

            <div class="flex-row width-input">
                <input
                    placeholder={translations.homePage.addChatPlaceholder}
                    aria-label={translations.homePage.addChatAudioLabel}
                    bind:value={chatListViewModel.newChatPrimaryChannel}
                    on:enter={chatListViewModel.createChat}
                ></input>
                <button
                    class="primary"
                    aria-label={translations.homePage.addChatButton}
                    on:click={chatListViewModel.createChat}
                    toggle:disabled={chatListViewModel.cannotCreateChat}
                >
                    <span class="icon">add</span>
                </button>
            </div>

            <div
                id="chat-grid"
                children:append={[
                    chatListViewModel.chatViewModels,
                    ChatViewModelToChatEntry,
                ]}
            ></div>
        </div>
    );

    // methods
    function scrollToChat() {
        chatSection.scrollIntoView();
    }

    // final
    return (
        <article id="home-page">
            <div>
                {overviewSection}
                {chatSection}
            </div>
        </article>
    );
}
