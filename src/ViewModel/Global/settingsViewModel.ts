import * as React from "bloatless-react";

import CoreViewModel from "./coreViewModel";
import SettingsModel from "../../Model/Global/settingsModel";

export default class SettingsViewModel {
    settingsModel: SettingsModel;

    // state
    username: React.State<string> = new React.State("");
    usernameInput: React.State<string> = new React.State("");
    firstDayOfWeekInput: React.State<string> = new React.State("0");
    isShowingSettingsModal: React.State<boolean> = new React.State(false);

    // guards
    cannotSetName: React.State<boolean> = React.createProxyState(
        [this.usernameInput],
        () =>
            this.usernameInput.value == "" ||
            this.usernameInput.value == this.settingsModel.username,
    );

    // methods
    setName = (): void => {
        this.settingsModel.setName(this.usernameInput.value);
        this.username.value = this.settingsModel.username;
        this.usernameInput.callSubscriptions();
    };

    setFirstDayofWeek = (): void => {
        this.settingsModel.setFirstDayOfWeek(this.firstDayOfWeekInput.value);
    };

    showSettingsModal = (): void => {
        this.isShowingSettingsModal.value = true;
    }

    hideSettingsModal = (): void => {
        this.isShowingSettingsModal.value = false;
    }

    // init
    constructor(
        public coreViewModel: CoreViewModel,
        settingsModel: SettingsModel,
    ) {
        this.settingsModel = settingsModel;

        this.username.value = settingsModel.username;
        this.usernameInput.value = settingsModel.username;
        this.firstDayOfWeekInput.value = settingsModel.firstDayOfWeek;

        // subscriptions
        this.firstDayOfWeekInput.subscribe(this.setFirstDayofWeek);
    }
}
