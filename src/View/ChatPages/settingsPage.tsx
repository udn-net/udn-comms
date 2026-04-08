import * as React from "bloatless-react";

import { Colors } from "../../colors";
import { ColorPicker } from "../Components/colorPicker";
import { DangerousActionButton } from "../Components/dangerousActionButton";
import { DeletableListItem } from "../Components/deletableListItem";
import SettingsPageViewModel from "../../ViewModel/Pages/settingsPageViewModel";
import { translations } from "../translations";

export function SettingsPage(settingsPageViewModel: SettingsPageViewModel) {
    settingsPageViewModel.loadData();

    const secondaryChannelConverter: React.StateItemConverter<string> = (
        secondaryChannel: string,
    ) => {
        return DeletableListItem(secondaryChannel, <span></span>, () => {
            settingsPageViewModel.removeSecondaryChannel(secondaryChannel);
        });
    };

    return (
        <div id="settings-page">
            <div class="pane-wrapper">
                <div class="pane">
                    <div class="toolbar">
                        <span class="title">
                            {translations.chatPage.settings.settingsHeadline}
                        </span>
                    </div>
                    <div class="content">
                        <label class="tile flex-no">
                            <span class="icon">forum</span>
                            <div>
                                <span>
                                    {
                                        translations.chatPage.settings
                                            .primaryChannelLabel
                                    }
                                </span>
                                <input
                                    bind:value={
                                        settingsPageViewModel.primaryChannelInput
                                    }
                                    on:enter={
                                        settingsPageViewModel.setPrimaryChannel
                                    }
                                ></input>
                            </div>
                        </label>
                        <div class="flex-row justify-end width-input">
                            <button
                                class="width-50"
                                aria-label={
                                    translations.chatPage.settings
                                        .setPrimaryChannelButtonAudioLabel
                                }
                                on:click={
                                    settingsPageViewModel.setPrimaryChannel
                                }
                                toggle:disabled={
                                    settingsPageViewModel.cannotSetPrimaryChannel
                                }
                            >
                                {translations.general.setButton}
                                <span class="icon">check</span>
                            </button>
                        </div>

                        <hr></hr>

                        <div class="flex-row width-input margin-bottom">
                            <input
                                aria-label={
                                    translations.chatPage.settings
                                        .newSecondaryChannelAudioLabel
                                }
                                placeholder={
                                    translations.chatPage.settings
                                        .newSecondaryChannelPlaceholder
                                }
                                bind:value={
                                    settingsPageViewModel.newSecondaryChannelInput
                                }
                                on:enter={
                                    settingsPageViewModel.addSecondaryChannel
                                }
                            ></input>
                            <button
                                class="primary"
                                aria-label={
                                    translations.chatPage.settings
                                        .addSecondaryChannelButtonAudioLabel
                                }
                                on:click={
                                    settingsPageViewModel.addSecondaryChannel
                                }
                                toggle:disabled={
                                    settingsPageViewModel.cannotAddSecondaryChannel
                                }
                            >
                                <span class="icon">add</span>
                            </button>
                        </div>

                        <div
                            class="flex-column gap width-input"
                            children:append={[
                                settingsPageViewModel.secondaryChannels,
                                secondaryChannelConverter,
                            ]}
                        ></div>

                        <hr></hr>

                        <label class="tile flex-no">
                            <span class="icon">key</span>
                            <div>
                                <span>
                                    {
                                        translations.chatPage.settings
                                            .encryptionKeyLabel
                                    }
                                </span>
                                <input
                                    bind:value={
                                        settingsPageViewModel.encryptionKeyInput
                                    }
                                    on:enter={
                                        settingsPageViewModel.setEncryptionKey
                                    }
                                    set:type={
                                        settingsPageViewModel.encryptionKeyInputType
                                    }
                                ></input>
                            </div>
                        </label>
                        <div class="flex-row justify-end width-input">
                            <button
                                class="width-50"
                                aria-label={
                                    translations.chatPage.settings
                                        .setEncryptionKeyButtonAudioLabel
                                }
                                on:click={
                                    settingsPageViewModel.setEncryptionKey
                                }
                                toggle:disabled={
                                    settingsPageViewModel.cannotSetEncryptionKey
                                }
                            >
                                {translations.general.setButton}
                                <span class="icon">check</span>
                            </button>
                        </div>

                        <label class="inline">
                            <input
                                type="checkbox"
                                bind:checked={
                                    settingsPageViewModel.shouldShowEncryptionKey
                                }
                            ></input>
                            {translations.chatPage.settings.showEncryptionKey}
                        </label>

                        <hr></hr>

                        {ColorPicker(settingsPageViewModel.color)}

                        <hr></hr>

                        <div class="width-input">
                            {DangerousActionButton(
                                translations.chatPage.settings.deleteChatButton,
                                "chat_error",
                                settingsPageViewModel.remove,
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
