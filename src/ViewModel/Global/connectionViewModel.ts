import * as React from "bloatless-react";

import ConnectionModel from "../../Model/Global/connectionModel";
import CoreViewModel from "./coreViewModel";

export default class ConnectionViewModel {
    connectionModel: ConnectionModel;

    // state
    serverAddressInput: React.State<string> = new React.State("");
    isConnected: React.State<boolean> = new React.State(false);

    isShowingConnectionModal: React.State<boolean> = new React.State(false);

    previousAddresses: React.ListState<string> = new React.ListState();

    // guards
    cannotConnect: React.State<boolean> = React.createProxyState(
        [this.serverAddressInput, this.isConnected],
        () =>
            (this.isConnected.value == true &&
                this.serverAddressInput.value ==
                    this.connectionModel.address) ||
            this.serverAddressInput.value == "",
    );
    cannotDisonnect: React.State<boolean> = React.createProxyState(
        [this.isConnected],
        () => this.isConnected.value == false,
    );
    hasNoPreviousConnections: React.State<boolean> = React.createProxyState(
        [this.previousAddresses],
        () => this.previousAddresses.value.size == 0,
    );

    // handlers
    connectionChangeHandler = (): void => {
        this.isConnected.value = this.connectionModel.isConnected;

        if (this.connectionModel.isConnected == false) return;
        if (this.connectionModel.address == undefined) return;

        this.serverAddressInput.value = this.connectionModel.address;

        if (!this.previousAddresses.value.has(this.connectionModel.address)) {
            this.previousAddresses.add(this.connectionModel.address);
        }
    };

    // methods
    connect = (): void => {
        this.connectToAddress(this.serverAddressInput.value);
    };

    connectToAddress = (address: string): void => {
        this.connectionModel.connect(address);
    };

    disconnect = (): void => {
        this.connectionModel.disconnect();
    };

    removePreviousAddress = (address: string): void => {
        this.connectionModel.removeAddress(address);
        this.updatePreviousAddresses();
    };

    // view
    showConnectionModal = (): void => {
        this.isShowingConnectionModal.value = true;
    };

    hideConnectionModal = (): void => {
        this.isShowingConnectionModal.value = false;
    };

    updatePreviousAddresses = (): void => {
        this.previousAddresses.clear();
        this.previousAddresses.add(...this.connectionModel.addresses);
    };

    // init
    constructor(
        public coreViewModel: CoreViewModel,
        connectionModel: ConnectionModel,
    ) {
        this.connectionModel = connectionModel;
        this.updatePreviousAddresses();

        connectionModel.connectionChangeHandlerManager.addHandler(
            this.connectionChangeHandler,
        );
    }
}
