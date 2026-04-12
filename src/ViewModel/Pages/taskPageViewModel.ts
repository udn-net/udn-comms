import * as React from "bloatless-react";

import BoardsAndTasksModel, {
    BoardInfoFileContent,
} from "../../Model/Files/boardsAndTasksModel";

import BoardViewModel, { BoardPageTypes } from "./boardViewModel";
import ChatViewModel, { ChatPageTypes } from "../Chat/chatViewModel";
import CoreViewModel, { Context, ContextHost } from "../Global/coreViewModel";
import { IndexManager } from "../../Model/Utility/utility";

export default class TaskPageViewModel extends ContextHost<string> {
    contextDebugDescription = "task-page";

    // data
    boardIndexManager: IndexManager<BoardViewModel> = new IndexManager(
        (boardViewModel: BoardViewModel) => boardViewModel.name.value,
    );

    // paths
    getBasePath = (): string[] => {
        return [...this.boardsAndTasksModel.getViewPath()];
    };
    getBoardViewPath = (boardId): string[] => {
        return [...this.getBasePath(), boardId];
    };
    getLastUsedBoardPath = (): string[] => {
        return [...this.getBasePath(), TaskPageViewModelSubPaths.LastUsedBoard];
    };

    // state
    newBoardNameInput: React.State<string> = new React.State("");
    boardViewModels: React.MapState<BoardViewModel> = new React.MapState();
    isShowingBoadList: React.State<boolean> = new React.State(true);
    selectedBoardId: React.State<string | undefined> = new React.State<any>(
        undefined,
    );

    // context
    get isOpen(): boolean {
        return (
            this.chatViewModel.isOpen &&
            this.chatViewModel.selectedPage.value == ChatPageTypes.Tasks
        );
    }

    get contextSelection(): string {
        return this.selectedBoardId.value;
    }

    // guards
    cannotCreateBoard: React.State<boolean> = React.createProxyState(
        [this.newBoardNameInput],
        () => this.newBoardNameInput.value == "",
    );

    // methods
    createBoard = (): void => {
        if (this.cannotCreateBoard.value == true) return;

        const boardInfoFileContent: BoardInfoFileContent =
            this.boardsAndTasksModel.createBoard(this.newBoardNameInput.value);
        this.newBoardNameInput.value = "";

        this.showBoardInList(boardInfoFileContent);
        this.boardsAndTasksModel.updateBoardAndSend(boardInfoFileContent);
        this.updateBoardIndices();
    };

    updateBoard = (boardInfoFileContent: BoardInfoFileContent): void => {
        this.boardsAndTasksModel.updateBoardAndSend(boardInfoFileContent);
        this.updateBoardIndices();
    };

    deleteBoard = (boardInfoFileContent: BoardInfoFileContent): void => {
        this.boardsAndTasksModel.deleteBoard(boardInfoFileContent.fileId);
        this.boardViewModels.remove(boardInfoFileContent.fileId);
        this.updateBoardIndices();
    };

    // view
    toggleBoardList = (): void => {
        this.isShowingBoadList.value = !this.isShowingBoadList.value;
    };

    showBoardInList = (boardInfo: BoardInfoFileContent): void => {
        const boardViewModel: BoardViewModel = new BoardViewModel(
            this.coreViewModel,
            this.chatViewModel,
            this.boardsAndTasksModel,
            this,
            boardInfo,
        );
        this.boardViewModels.set(boardInfo.fileId, boardViewModel);

        this.chatViewModel.taskBoardSuggestions.set(boardInfo.fileId, [
            boardInfo.fileId,
            this.boardsAndTasksModel.getBoardName(boardInfo.fileId),
        ]);
    };

    selectBoard = (boardViewModel: BoardViewModel): void => {
        this.selectedBoardId.value = boardViewModel.boardInfo.fileId;
        this.chatViewModel.displayedColor.value = boardViewModel.color.value;

        this.storeLastUsedBoard();
    };

    closeBoard = (): void => {
        this.closeContext();

        this.selectedBoardId.value = undefined;
        this.chatViewModel.resetColor();

        this.storeLastUsedBoard();
    };

    updateBoardIndices = (): void => {
        this.boardIndexManager.update([...this.boardViewModels.value.values()]);
        for (const boardViewModel of this.boardViewModels.value.values()) {
            boardViewModel.updateIndex();
        }
    };

    // storage
    storeLastUsedBoard = (): void => {
        const path: string[] = this.getLastUsedBoardPath();
        const lastUsedBoardId: string = this.selectedBoardId.value ?? "";
        this.coreViewModel.storageModel.write(path, lastUsedBoardId);
    };

    openLastUsedBoard = (): void => {
        const path: string[] = this.getLastUsedBoardPath();
        const lastUsedBoardId: string | null =
            this.coreViewModel.storageModel.read(path);
        if (lastUsedBoardId == null) return;

        const boardViewModel: BoardViewModel | undefined =
            this.boardViewModels.value.get(lastUsedBoardId);
        if (boardViewModel == undefined) return;

        this.selectBoard(boardViewModel);
    };

    // load
    loadData = (): void => {
        this.boardViewModels.clear();

        const boardIds: string[] = this.boardsAndTasksModel.listBoardIds();
        for (const boardId of boardIds) {
            const boardInfo: BoardInfoFileContent | null =
                this.boardsAndTasksModel.getBoardInfo(boardId);
            if (boardInfo == null) continue;

            this.showBoardInList(boardInfo);
        }

        this.updateBoardIndices();
        this.openLastUsedBoard();
    };

    // init
    constructor(
        public coreViewModel: CoreViewModel,
        public chatViewModel: ChatViewModel,
        public boardsAndTasksModel: BoardsAndTasksModel,
    ) {
        super();

        this.chatViewModel = chatViewModel;

        this.loadData();

        // handlers
        boardsAndTasksModel.boardHandlerManager.addHandler(
            (boardInfoFileContent: BoardInfoFileContent) => {
                this.showBoardInList(boardInfoFileContent);
                this.updateBoardIndices();
            },
        );

        // context
        this.chatViewModel.registerContext(ChatPageTypes.Tasks, this);

        this.selectedBoardId.subscribeSilent(this.updateContexts);
    }
}

export enum TaskPageViewModelSubPaths {
    LastUsedBoard = "last-used-board",
}
