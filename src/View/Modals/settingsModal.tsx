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
                        new React.State(""),
                        false,
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
            <label class="tile flex-no">
                <span class="icon">calendar_month</span>
                <div>
                    <span>
                        {
                            coreViewModel.translations.settings
                                .firstDayOfWeekLabel
                        }
                    </span>
                    <select bind:value={settingsViewModel.firstDayOfWeek}>
                        {...coreViewModel.translations.regional.weekdays.full.map(
                            (weekdayName, i) =>
                                Option(
                                    weekdayName,
                                    i.toString(),
                                    i.toString() ==
                                        settingsViewModel.firstDayOfWeek.value,
                                ),
                        )}
                    </select>
                    <span class="icon">arrow_drop_down</span>
                </div>
            </label>
            <label class="tile flex-no">
                <span class="icon">language</span>
                <div>
                    <span>{coreViewModel.translations.settings.language}</span>
                    <select bind:value={settingsViewModel.language}>
                        {...[...Object.values(Languages)].map((language, i) =>
                            Option(
                                languageNames[language],
                                language,
                                language == settingsViewModel.language.value,
                            ),
                        )}
                    </select>
                    <span class="icon">arrow_drop_down</span>
                </div>
            </label>
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
