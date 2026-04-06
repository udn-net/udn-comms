// this file is responsible for managing files within chats.

import { DATA_VERSION, ValidObject } from "../Utility/typeSafety";
import StorageModel, {
    StorageModelSubPath,
    filePaths,
} from "../Global/storageModel";
import {
    StringEntryObject,
    createTimestamp,
    parseValidObject,
    stringify,
} from "../Utility/utility";

import BoardsAndTasksModel from "./boardsAndTasksModel";
import ChatModel from "../Chat/chatModel";
import SettingsModel from "../Global/settingsModel";
import { v4 } from "uuid";

export default class FileModel {
    storageModel: StorageModel;
    settingsModel: SettingsModel;

    chatModel: ChatModel;
    boardsAndTasksModel: BoardsAndTasksModel;

    // paths
    getBasePath = (): string[] => {
        return StorageModel.getPath(
            StorageModelSubPath.Chat,
            filePaths.chat.files(this.chatModel.id),
        );
    };

    getFileContainerPath = (): string[] => {
        return [...this.getBasePath(), FileModelSubPath.Data];
    };

    getModelContainerPath = (modelName: FileModelSubPath): string[] => {
        return [...this.getBasePath(), FileModelSubPath.Model, modelName];
    };

    getFilePath = (fileId: string): string[] => {
        return [...this.getFileContainerPath(), fileId];
    };

    getFileContentPath = (fileId: string, fileContentId: string): string[] => {
        const filePath: string[] = this.getFilePath(fileId);
        return [...filePath, fileContentId];
    };

    // handlers
    handleStringifiedFileContent = (stringifiedFileContent: string): void => {
        const fileContent: FileContent<string> | null = parseValidObject(
            stringifiedFileContent,
            FileContentReference,
        );
        if (fileContent == null) return;

        this.handleFileContent(fileContent);
    };

    handleFileContent = (fileContent: FileContent<string>): void => {
        const didStore: boolean = this.storeFileContent(fileContent);
        if (didStore == false) return;

        this.boardsAndTasksModel.handleFileContent(fileContent);
        this.chatModel.handleReaction(fileContent);
    };

    // methods
    addFileContentAndSend = (fileContent: FileContent<string>): void => {
        this.handleFileContent(fileContent);
        this.chatModel.sendMessage("", fileContent);
    };

    // storage
    storeFileContent = (fileContent: FileContent<string>): boolean => {
        const fileContentPath: string[] = this.getFileContentPath(
            fileContent.fileId,
            fileContent.fileContentId,
        );

        // check if fileContent already exists
        const existingFileContent: string | null =
            this.storageModel.read(fileContentPath);
        if (existingFileContent != null) return false;

        const stringifiedContent: string = stringify(fileContent);
        this.storageModel.write(fileContentPath, stringifiedContent);
        return true;
    };

    listFileIds = (): string[] => {
        return this.storageModel.list(this.getBasePath());
    };

    listFileContentIds = (fileId: string): string[] => {
        const filePath: string[] = this.getFilePath(fileId);
        return this.storageModel.list(filePath);
    };

    selectLatestFileContentId = (
        fileContentIds: string[],
    ): string | undefined => {
        return fileContentIds[fileContentIds.length - 1];
    };

    getFileContent = <T extends FileContent<string>>(
        fileId: string,
        fileContentName: string,
        reference: T,
    ): T | null => {
        const filePath: string[] = this.getFileContentPath(
            fileId,
            fileContentName,
        );
        const fileContentOrNull: T | null = this.storageModel.readStringifiable(
            filePath,
            reference,
        );
        return fileContentOrNull;
    };

    getLatestFileContent = <T extends FileContent<string>>(
        fileId: string,
        reference: T,
    ): T | null => {
        const fileContentsIds: string[] = this.listFileContentIds(fileId);
        const latestFileContentId: string | undefined =
            this.selectLatestFileContentId(fileContentsIds);
        if (latestFileContentId == undefined) return null;

        const fileContent: T | null = this.getFileContent(
            fileId,
            latestFileContentId,
            reference,
        );
        return fileContent;
    };

    // init
    constructor(
        storageModel: StorageModel,
        settingsModel: SettingsModel,
        chatModel: ChatModel,
    ) {
        this.chatModel = chatModel;
        this.settingsModel = settingsModel;
        this.storageModel = storageModel;

        this.boardsAndTasksModel = new BoardsAndTasksModel(
            this.storageModel,
            this.settingsModel,
            chatModel,
            this,
        );
    }

    // utility
    static generateFileContentId = (creationDate: string): string => {
        return creationDate + v4();
    };

    static createFileContent = <T extends string>(
        fileId: string,
        type: T,
    ): FileContent<T> => {
        const creationDate: string = createTimestamp();
        const fileContentId: string =
            FileModel.generateFileContentId(creationDate);

        return {
            dataVersion: DATA_VERSION,

            fileId,
            fileContentId,
            creationDate,
            type,
        };
    };
}

// paths
export enum FileModelSubPath {
    Data = "data",
    Model = "model",
    ModelView = "view",
    ModelTask = "tasks",
    ModelCalendar = "calendar",
}

// types
export interface FileContent<T extends string>
    extends ValidObject, StringEntryObject {
    fileId: string;
    fileContentId: string;
    creationDate: string;

    type: T;
}

// references
export const FileContentReference: FileContent<string> = {
    dataVersion: DATA_VERSION,

    fileId: "",
    fileContentId: "",
    creationDate: "",

    type: "",
};
