import * as React from "bloatless-react";

import ChatViewModel from "../Chat/chatViewModel";
import { Colors } from "../../colors";
import CoreViewModel from "../Global/coreViewModel";

export default class SettingsPageViewModel {
    // state
    primaryChannel: React.State<string> = new React.State("");
    primaryChannelInput: React.State<string> = new React.State("");

    secondaryChannels: React.ListState<string> = new React.ListState();
    newSecondaryChannelInput: React.State<string> = new React.State("");

    encryptionKeyInput: React.State<string> = new React.State("");
    shouldShowEncryptionKey: React.State<boolean> = new React.State(false);
    encryptionKeyInputType: React.State<"text" | "password"> =
        React.createProxyState([this.shouldShowEncryptionKey], () =>
            this.shouldShowEncryptionKey.value == true ? "text" : "password",
        );

    color: React.State<Colors> = new React.State<any>(Colors.Standard);

    // guards
    cannotSetPrimaryChannel: React.State<boolean> = React.createProxyState(
        [this.primaryChannel, this.primaryChannelInput],
        () =>
            this.primaryChannelInput.value == "" ||
            this.primaryChannelInput.value == this.primaryChannel.value,
    );
    cannotAddSecondaryChannel: React.State<boolean> = React.createProxyState(
        [this.newSecondaryChannelInput],
        () => this.newSecondaryChannelInput.value == "",
    );
    cannotSetEncryptionKey: React.State<boolean>;

    // methods
    setPrimaryChannel = (): void => {
        this.chatViewModel.chatModel.setPrimaryChannel(
            this.primaryChannelInput.value,
        );
        this.primaryChannel.value =
            this.chatViewModel.chatModel.info.primaryChannel;

        this.chatViewModel.chatListViewModel.updateIndices();
    };

    addSecondaryChannel = (): void => {
        this.secondaryChannels.add(this.newSecondaryChannelInput.value);
        this.newSecondaryChannelInput.value = "";
        this.storeSecondaryChannels();
        this.loadSecondaryChannels();
    };

    removeSecondaryChannel = (secondaryChannel: string): void => {
        this.secondaryChannels.remove(secondaryChannel);
        this.storeSecondaryChannels();
    };

    storeSecondaryChannels = (): void => {
        this.chatViewModel.chatModel.setSecondaryChannels([
            ...this.secondaryChannels.value.values(),
        ]);
    };

    setEncryptionKey = (): void => {
        this.chatViewModel.chatModel.setEncryptionKey(
            this.encryptionKeyInput.value,
        );

        // disable button
        this.encryptionKeyInput.callSubscriptions();
    };

    applyColor = (newColor: Colors): void => {
        this.chatViewModel.setColor(newColor);
    };

    remove = (): void => {
        this.chatViewModel.close();
        this.chatViewModel.chatModel.delete();
        this.chatViewModel.chatListViewModel.untrackChat(this.chatViewModel);
    };

    // load
    loadListRelevantData = (): void => {
        this.primaryChannel.value =
            this.chatViewModel.chatModel.info.primaryChannel;

        this.color.value = this.chatViewModel.chatModel.color;
    };

    loadData = (): void => {
        this.primaryChannelInput.value =
            this.chatViewModel.chatModel.info.primaryChannel;

        this.loadSecondaryChannels();

        this.encryptionKeyInput.value =
            this.chatViewModel.chatModel.info.encryptionKey;
    };

    loadSecondaryChannels = (): void => {
        this.secondaryChannels.clear();
        for (const secondaryChannel of this.chatViewModel.chatModel
            .secondaryChannels) {
            this.secondaryChannels.add(secondaryChannel);
        }
    };

    // init
    constructor(
        public coreViewModel: CoreViewModel,
        public chatViewModel: ChatViewModel,
    ) {
        this.loadListRelevantData();

        this.cannotSetEncryptionKey = React.createProxyState(
            [this.encryptionKeyInput],
            () =>
                this.encryptionKeyInput.value ==
                this.chatViewModel.chatModel.info.encryptionKey,
        );

        this.color.subscribe((newColor) => {
            this.applyColor(newColor);
        });
    }
}
