import * as React from "bloatless-react";

import ConnectionViewModel from "../../ViewModel/Global/connectionViewModel";
import { DeletableListItem } from "../Components/deletableListItem";
import { translations } from "../translations";

export function ConnectionModal(connectionViewModel: ConnectionViewModel) {
    const previousAddressConverter: React.StateItemConverter<string> = (
        address: string,
    ) => {
        function connnect() {
            connectionViewModel.connectToAddress(address);
        }

        const cannotConnect = React.createProxyState(
            [connectionViewModel.isConnected],
            () =>
                connectionViewModel.isConnected.value == true &&
                connectionViewModel.connectionModel.address == address,
        );

        return DeletableListItem(
            address,
            <button
                class="primary"
                on:click={connnect}
                toggle:disabled={cannotConnect}
                aria-label={
                    translations.connectionModal.connectButtonAudioLabel
                }
            >
                <span class="icon">link</span>
            </button>,
            () => {
                connectionViewModel.removePreviousAddress(address);
            },
        );
    };

    return (
        <div
            class="modal"
            toggle:open={connectionViewModel.isShowingConnectionModal}
        >
            <div>
                <main>
                    <h2>
                        {translations.connectionModal.connectionModalHeadline}
                    </h2>

                    <div
                        class="flex-column gap"
                        children:append={[
                            connectionViewModel.previousAddresses,
                            previousAddressConverter,
                        ]}
                    ></div>
                </main>
                <button on:click={connectionViewModel.hideConnectionModal}>
                    {translations.general.closeButton}
                    <span class="icon">close</span>
                </button>
            </div>
        </div>
    );
}
