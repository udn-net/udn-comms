import * as React from "bloatless-react";

import { translations } from "../translations";
import SettingsViewModel, {
    SettingsModalPages,
} from "../../ViewModel/Global/settingsViewModel";
import { SplitModal } from "../Components/splitModal";

export function SettingsModal(settingsViewModel: SettingsViewModel) {
    return (
        <div
            class="modal"
            toggle:open={settingsViewModel.isShowingSettingsModal}
        >
            <div style="max-width: 64rem">
                <main class="padding-0">
                    {SplitModal(
                        new React.State(SettingsLeftPane(settingsViewModel)),
                        new React.State(<span>settings</span>),
                        new React.State(""),
                    )}
                </main>
                <button on:click={settingsViewModel.hideSettingsModal}>
                    {translations.general.closeButton}
                    <span class="icon">close</span>
                </button>
            </div>
        </div>
    );
}

function SettingsLeftPane(settingsViewModel: SettingsViewModel) {
    return (
        <div class="flex-column">
            {SettingsPaneButton(
                settingsViewModel,
                SettingsModalPages.Appearance,
                translations.settings.pages.appearance,
            )}
            {SettingsPaneButton(
                settingsViewModel,
                SettingsModalPages.Regional,
                translations.settings.pages.regional,
            )}
        </div>
    );
}

function SettingsPaneButton(
    settingsViewModel: SettingsViewModel,
    page: SettingsModalPages,
    label: string,
) {
    const isSelected = React.createProxyState(
        [settingsViewModel.selectedModalPage],
        () => settingsViewModel.selectedModalPage.value == page,
    );

    return (
        <button
            toggle:selected={isSelected}
            on:click={() => settingsViewModel.showModalPage(page)}
        >
            {label}
        </button>
    );
}
