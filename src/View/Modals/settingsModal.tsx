import * as React from "bloatless-react";

import { translations } from "../translations";
import SettingsViewModel, {
    SettingsModalPages,
} from "../../ViewModel/Global/settingsViewModel";
import { SplitModal } from "../Components/splitModal";
import { InfoTile } from "../Components/infoTile";
import { Option } from "../Components/option";

export function SettingsModal(settingsViewModel: SettingsViewModel) {
    const detailView = React.createProxyState(
        [settingsViewModel.selectedModalPage],
        () => {
            switch (settingsViewModel.selectedModalPage.value) {
                case SettingsModalPages.Appearance:
                    return <div>Appearance</div>;
                case SettingsModalPages.Regional:
                    return SettingsRegionalPane(settingsViewModel);
                case SettingsModalPages.Info:
                    return SettingsInfoPane(settingsViewModel);
            }
        },
    );

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

function SettingsInfoPane(settingsViewModel: SettingsViewModel) {
    return (
        <div class="slide-up">
            <h2>{translations.homePage.appName}</h2>
            <hr></hr>
            <div class="flex-column gap">
                {InfoTile(
                    "build",
                    translations.settings.version,
                    settingsViewModel.coreViewModel.BUILD,
                )}
            </div>
        </div>
    );
}

function SettingsRegionalPane(settingsViewModel: SettingsViewModel) {
    return (
        <div class="slide-up">
            <h2>{translations.settings.pages.regional}</h2>
            <hr></hr>
            <label class="tile flex-no">
                <span class="icon">calendar_month</span>
                <div>
                    <span>{translations.homePage.firstDayOfWeekLabel}</span>
                    <select bind:value={settingsViewModel.firstDayOfWeekInput}>
                        {...translations.regional.weekdays.full.map(
                            (weekdayName, i) =>
                                Option(
                                    weekdayName,
                                    i.toString(),
                                    i.toString() ==
                                        settingsViewModel.firstDayOfWeekInput
                                            .value,
                                ),
                        )}
                    </select>
                    <span class="icon">arrow_drop_down</span>
                </div>
            </label>
        </div>
    );
}
