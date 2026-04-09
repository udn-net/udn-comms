import * as React from "bloatless-react";

import { translations } from "../translations";
import SettingsViewModel, {
    SettingsModalPages,
} from "../../ViewModel/Global/settingsViewModel";
import { SplitModal } from "../Components/splitModal";

export function SettingsModal(settingsViewModel: SettingsViewModel) {
    const detailView = React.createProxyState([settingsViewModel.selectedModalPage], () => {
        switch (settingsViewModel.selectedModalPage.value) {
            case SettingsModalPages.Appearance: 
                return <div>Appearance</div>
            case SettingsModalPages.Regional: 
                return <div>Regional</div>
            case SettingsModalPages.Info: 
                return <div>Info</div>
        }
    })

    return (
        <div
            class="modal"
            toggle:open={settingsViewModel.isShowingSettingsModal}
        >
            <div>
                <main class="padding-0">
                    {SplitModal(
                        new React.State(SettingsLeftPane(settingsViewModel)),
                        detailView,
                        new React.State(""),
                        false,
                        settingsViewModel.selectedModalPage,
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
        <div class="flex-column gap">
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
            {SettingsPaneButton(
                settingsViewModel,
                SettingsModalPages.Info,
                translations.settings.pages.info,
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
