import * as React from "bloatless-react";

import CoreViewModel from "./coreViewModel";
import SettingsModel from "../../Model/Global/settingsModel";
import { Languages } from "../../View/translations";

export default class SettingsViewModel {
    // state
    username: React.State<string> = new React.State("");
    usernameInput: React.State<string> = new React.State("");
    isShowingSettingsModal: React.State<boolean> = new React.State(false);
    selectedModalPage: React.State<SettingsModalPages> = new React.State(
        SettingsModalPages.Appearance,
    );

    firstDayOfWeek: React.State<string> = new React.State("0");
    language: React.State<Languages> = new React.State(Languages.English);

    // guards
    cannotSetName: React.State<boolean> = React.createProxyState(
        [this.usernameInput],
        () =>
            this.usernameInput.value == "" ||
            this.usernameInput.value ==
                this.coreViewModel.settingsModel.username,
    );

    // methods
    setName = (): void => {
        this.coreViewModel.settingsModel.setName(this.usernameInput.value);
        this.username.value = this.coreViewModel.settingsModel.username;
        this.usernameInput.callSubscriptions();
    };

    setFirstDayofWeek = (): void => {
        this.coreViewModel.settingsModel.setFirstDayOfWeek(
            this.firstDayOfWeek.value,
        );
    };

    showSettingsModal = (): void => {
        this.isShowingSettingsModal.value = true;
    };

    hideSettingsModal = (): void => {
        this.isShowingSettingsModal.value = false;
    };

    showModalPage = (page: SettingsModalPages): void => {
        this.selectedModalPage.value = page;
    };

    // init
    constructor(public coreViewModel: CoreViewModel) {
        this.username.value = coreViewModel.settingsModel.username;
        this.usernameInput.value = coreViewModel.settingsModel.username;
        this.firstDayOfWeek.value = coreViewModel.settingsModel.firstDayOfWeek;

        // subscriptions
        this.firstDayOfWeek.subscribe(this.setFirstDayofWeek);
    }
}

export enum SettingsModalPages {
    Appearance,
    Regional,
    Info,
}
