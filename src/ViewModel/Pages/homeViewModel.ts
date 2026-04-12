import { CommonKeys } from "../../View/keystrokes";
import ConnectionViewModel from "../Global/connectionViewModel";
import CoreViewModel, { Context } from "../Global/coreViewModel";
import FileTransferViewModel from "../Global/fileTransferViewModel";
import SettingsViewModel from "../Global/settingsViewModel";
import StorageViewModel from "../Global/storageViewModel";

export default class HomeViewModel extends Context {
    contextDebugDescription = "home";

    constructor(
        public coreViewModel: CoreViewModel,
        public settingsViewModel: SettingsViewModel,
        public fileTransferViewModel: FileTransferViewModel,
        public storageViewModel: StorageViewModel,
        public connectionViewModel: ConnectionViewModel,
    ) {
        super();

        this.coreViewModel.context = this;

        this.registerKeyStroke(
            CommonKeys.Settings,
            this.settingsViewModel.showSettingsModal,
        );
        this.registerKeyStroke(
            "d",
            this.fileTransferViewModel.showDirectionSelectionModal,
        );
        this.registerKeyStroke("e", this.storageViewModel.showStorageModal);
        this.registerKeyStroke("x", this.connectionViewModel.disconnect);
        this.registerKeyStroke("c", this.connectionViewModel.connect);
    }
}
