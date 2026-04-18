// cleanup: Phase A

import { Message } from "udn-frontend";
import StorageModel from "./storageModel";
import ConnectionModel from "./connectionModel";
import {
    HandlerManager,
    generateRandomToken,
    parse,
    stringify,
} from "../Utility/utility";
import { checkMatchesObjectStructure } from "../Utility/typeSafety";
import { decryptString, encryptString } from "../Utility/crypto";

export default class FileTransferModel {
    readonly storageModel: StorageModel;
    readonly connectionModel: ConnectionModel;

    static READY_MESSAGE = "ready";

    // data
    transferData: TransferData | undefined;
    direction: TransferDirections = TransferDirections.Send;

    // handler managers
    readonly fileHandlerManager = new HandlerManager<string>();
    readonly readyToSendHandlerManager = new HandlerManager<boolean>();

    // general
    readonly generateTransferData = (): TransferData => {
        const transferData: TransferData = {
            channel: generateRandomToken(4),
            key: generateRandomToken(6),
        };
        this.transferData = transferData;
        return transferData;
    };

    readonly prepareToSend = (): void => {
        this.direction = TransferDirections.Send;
        this.connectionModel.addChannel(this.transferData.channel);
    };

    readonly prepareToReceive = (transferData: TransferData): void => {
        this.direction = TransferDirections.Receive;

        this.connectionModel.addChannel(transferData.channel);
        this.transferData = transferData;
        this.connectionModel.sendPlainMessage(
            transferData.channel,
            FileTransferModel.READY_MESSAGE,
        );
    };

    // handlers
    readonly handleMessage = (data: Message): void => {
        if (this.transferData == undefined) return;
        if (data.messageChannel != this.transferData.channel) return;
        if (
            data.messageBody == FileTransferModel.READY_MESSAGE &&
            this.direction == TransferDirections.Send
        ) {
            this.readyToSendHandlerManager.trigger(true);
        }

        if (this.transferData == undefined) return;
        if (data.messageBody == undefined) return;

        this.handleFile(data.messageBody);
    };

    readonly handleFile = async (encryptedFileData: string): Promise<void> => {
        if (this.transferData == undefined) return;

        const decrypted: string = await decryptString(
            encryptedFileData,
            this.transferData.key,
        );

        const parsed: any = parse(decrypted);
        const isFileData: boolean = checkMatchesObjectStructure(
            parsed,
            FileDataReference,
        );
        if (isFileData == false) return;

        const fileData: FileData = parsed;
        this.storageModel.write(fileData.path, fileData.body);

        const pathString: string = StorageModel.pathComponentsToString(
            ...fileData.path,
        );
        this.fileHandlerManager.trigger(pathString);
    };

    // sending
    readonly sendFiles = (
        directoryPaths: IteratorObject<string[]>,
        callback: (path: string) => void,
    ): void => {
        for (const directoryPath of directoryPaths) {
            this.storageModel.recurse(directoryPath, (filePath: string[]) => {
                this.sendFile(filePath);
                const pathString: string = StorageModel.pathComponentsToString(
                    ...filePath,
                );
                callback(pathString);
            });
        }
    };

    readonly sendFile = async (filePath: string[]): Promise<void> => {
        if (this.transferData == undefined) return;
        const fileContent: string | null = this.storageModel.read(filePath);
        if (fileContent == null) return;

        const fileData: FileData = {
            path: filePath,
            body: fileContent,
        };
        const stringifiedFileData: string = stringify(fileData);
        const encryptedFileData: string = await encryptString(
            stringifiedFileData,
            this.transferData.key,
        );
        this.connectionModel.sendPlainMessage(
            this.transferData.channel,
            encryptedFileData,
        );
    };

    // init
    constructor(storageModel: StorageModel, connectionModel: ConnectionModel) {
        this.storageModel = storageModel;
        this.connectionModel = connectionModel;

        this.connectionModel.messageHandlerManager.setHandler(
            "file-transfer",
            this.handleMessage,
        );
    }
}

export interface TransferData {
    readonly channel: string;
    readonly key: string;
}

export interface FileData {
    path: string[];
    body: string;
}

export const FileDataReference: FileData = {
    path: [""],
    body: "",
};

export enum TransferDirections {
    Send,
    Receive,
}
