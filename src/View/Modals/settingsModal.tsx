import * as React from "bloatless-react";

import { languageNames } from "../translations";
import SettingsViewModel, {
    SettingsModalPages,
} from "../../ViewModel/Global/settingsViewModel";
import { SplitModal } from "../Components/splitModal";
import { InfoTile } from "../Components/infoTile";
import { Option } from "../Components/option";
import CoreViewModel from "../../ViewModel/Global/coreViewModel";
import { Languages, ThemeSettings } from "../../Model/Global/settingsModel";
import { OptionButtonList } from "../Components/optionButtonList";
import { stringify } from "../../Model/Utility/utility";

export function SettingsModal(
    coreViewModel: CoreViewModel,
    settingsViewModel: SettingsViewModel,
) {
    const detailView = React.createProxyState(
        [settingsViewModel.selectedModalPage],
        () => {
            switch (settingsViewModel.selectedModalPage.value) {
                case SettingsModalPages.Appearance:
                    return SettingsAppearancePane(
                        coreViewModel,
                        settingsViewModel,
                    );
                case SettingsModalPages.Regional:
                    return SettingsRegionalPane(
                        coreViewModel,
                        settingsViewModel,
                    );
                case SettingsModalPages.Info:
                    return SettingsInfoPane(coreViewModel, settingsViewModel);
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
                        new React.State(
                            SettingsLeftPane(coreViewModel, settingsViewModel),
                        ),
                        detailView,
                        true,
                        settingsViewModel.selectedModalPage,
                    )}
                </main>
                <button on:click={settingsViewModel.hideSettingsModal}>
                    {coreViewModel.translations.general.closeButton}
                    <span class="icon">close</span>
                </button>
            </div>
        </div>
    );
}

function SettingsLeftPane(
    coreViewModel: CoreViewModel,
    settingsViewModel: SettingsViewModel,
) {
    return (
        <div class="flex-column gap">
            {SettingsPaneButton(
                settingsViewModel,
                SettingsModalPages.Appearance,
                coreViewModel.translations.settings.pages.appearance,
            )}
            {SettingsPaneButton(
                settingsViewModel,
                SettingsModalPages.Regional,
                coreViewModel.translations.settings.pages.regional,
            )}
            {SettingsPaneButton(
                settingsViewModel,
                SettingsModalPages.Info,
                coreViewModel.translations.settings.pages.info,
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

function SettingsInfoPane(
    coreViewModel: CoreViewModel,
    settingsViewModel: SettingsViewModel,
) {
    return (
        <div class="slide-up">
            <h2>{coreViewModel.translations.homePage.appName}</h2>
            <hr></hr>
            <div class="flex-column gap">
                {InfoTile(
                    "build",
                    coreViewModel.translations.settings.version,
                    settingsViewModel.coreViewModel.BUILD,
                )}
            </div>
        </div>
    );
}

function SettingsRegionalPane(
    coreViewModel: CoreViewModel,
    settingsViewModel: SettingsViewModel,
) {
    return (
        <div class="slide-up">
            <h2>{coreViewModel.translations.settings.pages.regional}</h2>

            <hr></hr>
            <h3>{coreViewModel.translations.settings.language}</h3>
            {OptionButtonList(
                new React.ListState<[string, string]>(
                    Object.values(Languages).map(
                        (x) => [languageNames[x], x],
                    ),
                ),
                settingsViewModel.language,
            )}

            <hr></hr>
            <h3>{coreViewModel.translations.settings.firstDayOfWeekLabel}</h3>
            {OptionButtonList(
                new React.ListState<[string, string]>(
                    coreViewModel.translations.regional.weekdays.full.map(
                        (x, i) => [x, i.toString()],
                    ),
                ),
                settingsViewModel.firstDayOfWeek,
            )}
        </div>
    );
}

function SettingsAppearancePane(
    coreViewModel: CoreViewModel,
    settingsViewModel: SettingsViewModel,
) {
    return (
        <div class="slide-up">
            <h2>{coreViewModel.translations.settings.pages.appearance}</h2>
            <hr></hr>
            {OptionButtonList(
                new React.ListState<[string, ThemeSettings]>([
                    [
                        coreViewModel.translations.settings.themes.dark,
                        ThemeSettings.Dark,
                    ],
                    [
                        coreViewModel.translations.settings.themes.light,
                        ThemeSettings.Light,
                    ],
                    [
                        coreViewModel.translations.settings.themes.system,
                        ThemeSettings.System,
                    ],
                ]),
                settingsViewModel.theme,
            )}
        </div>
    );
}
