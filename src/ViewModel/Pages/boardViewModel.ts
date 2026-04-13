import * as React from "bloatless-react";

import BoardsAndTasksModel, {
    BoardInfoFileContent,
    TaskFileContent,
} from "../../Model/Files/boardsAndTasksModel";

import ChatViewModel, { ChatPageTypes } from "../Chat/chatViewModel";
import { Colors } from "../../colors";
import CoreViewModel from "../Global/coreViewModel";
import SearchViewModel from "../Utility/searchViewModel";
import StorageModel from "../../Model/Global/storageModel";
import TaskContainingPageViewModel from "./taskContainingPageViewModel";
import TaskPageViewModel from "./taskPageViewModel";
import TaskViewModel from "./taskViewModel";
import { CommonKeys } from "../../View/keystrokes";

export default class BoardViewModel extends TaskContainingPageViewModel {
    contextDebugDescription = "board";

    // state
    name: React.State<string> = new React.State("");
    color: React.State<Colors> = new React.State<any>(Colors.Standard);

    index: React.State<number> = new React.State(0);

    selectedPage: React.State<BoardPageTypes> = new React.State<any>(
        BoardPageTypes.List,
    );

    isSelected: React.State<boolean>;
    isPresentingSettingsModal: React.State<boolean> = new React.State(false);
    isPresentingFilterModal: React.State<boolean> = new React.State(false);

    searchViewModel: SearchViewModel<TaskViewModel>;
    filteredTaskViewModels: React.ListState<TaskViewModel> =
        new React.ListState();
    isFilterActive: React.State<boolean>;

    // paths
    getBasePath = (): string[] => {
        return [
            ...this.taskPageViewModel.getBoardViewPath(this.boardInfo.fileId),
        ];
    };

    getLastUsedBoardPath = (): string[] => {
        return [...this.getBasePath(), BoardViewModelSubPaths.LastUsedView];
    };

    getPreviousSearchesPath = (): string[] => {
        return [...this.getBasePath(), BoardViewModelSubPaths.PreviousSearches];
    };

    getLastSearchPath = (): string[] => {
        return [...this.getBasePath(), BoardViewModelSubPaths.LastSearch];
    };

    // settings
    saveSettings = (): void => {
        const newBoardInfoFileContent: BoardInfoFileContent =
            BoardsAndTasksModel.createBoardInfoFileContent(
                this.boardInfo.fileId,
                this.name.value,
                this.color.value,
            );
        this.taskPageViewModel.updateBoard(newBoardInfoFileContent);

        this.taskPageViewModel.selectBoard(this);
    };

    applyColor = (): void => {
        this.taskPageViewModel.chatViewModel.setDisplayedColor(
            this.color.value,
        );
    };

    deleteBoard = (): void => {
        this.taskPageViewModel.deleteBoard(this.boardInfo);
        this.chatViewModel.taskBoardSuggestions.remove(this.boardInfo.fileId);
        this.close();
    };

    // methods
    createTask = (): void => {
        this.createTaskFromBoardId(this.boardInfo.fileId);
    };

    handleDropWithinBoard = (category?: string, status?: string): void => {
        const draggedObject: any = this.coreViewModel.draggedObject.value;
        if (draggedObject instanceof TaskViewModel == false) return;
        draggedObject.setCategoryAndStatus(category, status);
    };

    handleDropBetweenBoards = (): void => {
        const draggedObject: any = this.coreViewModel.draggedObject.value;
        if (draggedObject instanceof TaskViewModel == false) return;
        draggedObject.setBoardId(this.boardInfo.fileId);
    };

    // storage
    storeLastUsedView = (): void => {
        const path: string[] = this.getLastUsedBoardPath();
        const lastUsedView: string = this.selectedPage.value;
        this.coreViewModel.storageModel.write(path, lastUsedView);
    };

    restoreLastUsedView = (): void => {
        const path: string[] = this.getLastUsedBoardPath();
        const lastUsedView: string | null =
            this.coreViewModel.storageModel.read(path);
        if (lastUsedView == null) return;

        this.selectedPage.value = lastUsedView as BoardPageTypes;
    };

    handleNewSearch = (searchTerm: string): void => {
        const suggestionPath: string[] = [
            ...this.getPreviousSearchesPath(),
            searchTerm,
        ];
        this.coreViewModel.storageModel.write(suggestionPath, "");
        if (
            !this.coreViewModel.boardFilterStringSuggestions.value.has(
                searchTerm,
            )
        ) {
            this.coreViewModel.boardFilterStringSuggestions.add(searchTerm);
        }

        const lastSearchPath: string[] = this.getLastSearchPath();
        this.coreViewModel.storageModel.write(lastSearchPath, searchTerm);
    };

    // view
    showTask = (taskFileContent: TaskFileContent): void => {
        if (taskFileContent.boardId != this.boardInfo.fileId) {
            // remove task that was moved to different board
            this.boardsAndTasksModel.deleteTaskReference(
                this.boardInfo.fileId,
                taskFileContent.fileId,
            );
            this.removeTaskFromView(taskFileContent);
            return;
        }

        const taskViewModel: TaskViewModel = new TaskViewModel(
            this.coreViewModel,
            this.chatViewModel,
            this.boardsAndTasksModel,
            this,
            taskFileContent,
        );
        this.taskViewModels.set(taskFileContent.fileId, taskViewModel);
    };

    removeTaskFromView = (taskFileContent: TaskFileContent): void => {
        this.taskViewModels.remove(taskFileContent.fileId);
        this.updateIndex();
    };

    select = (): void => {
        this.taskPageViewModel.selectBoard(this);
    };

    close = (): void => {
        this.taskPageViewModel.closeBoard();
        this.taskViewModels.clear();
    };

    showSettings = (): void => {
        this.isPresentingSettingsModal.value = true;
    };

    hideSettings = (): void => {
        this.saveSettings();
        this.isPresentingSettingsModal.value = false;
    };

    showFilterModal = (): void => {
        this.isPresentingFilterModal.value = true;
    };

    hideFilterModal = (): void => {
        this.isPresentingFilterModal.value = false;
    };

    resetFilter = (): void => {
        this.searchViewModel.search("");
    };

    updateIndex = (): void => {
        const index: number =
            this.taskPageViewModel.boardIndexManager.getIndex(this);
        this.index.value = index;
    };

    // load
    loadListRelevantData = (): void => {
        this.name.value = this.boardInfo.name;
        this.color.value = this.boardInfo.color;
    };

    loadTasks = (): void => {
        const taskIds: string[] = this.boardsAndTasksModel.listTaskIds(
            this.boardInfo.fileId,
        );
        for (const taskId of taskIds) {
            if (this.taskViewModels.value.has(taskId)) return;

            const taskFileContent: TaskFileContent | null =
                this.boardsAndTasksModel.getLatestTaskFileContent(taskId);
            if (taskFileContent == null) continue;

            const taskViewModel: TaskViewModel = new TaskViewModel(
                this.coreViewModel,
                this.chatViewModel,
                this.boardsAndTasksModel,
                this,
                taskFileContent,
            );
            this.taskViewModels.set(taskFileContent.fileId, taskViewModel);
        }

        this.updateTaskIndices();
    };

    loadSearchSuggestions = (): void => {
        const dirPath: string[] = this.getPreviousSearchesPath();
        const searches: string[] =
            this.coreViewModel.storageModel.list(dirPath);
        this.coreViewModel.boardFilterStringSuggestions.add(...searches);
    };

    restoreSearch = (): void => {
        const lastSearchPath: string[] = this.getLastSearchPath();
        const lastSearch: string | null =
            this.coreViewModel.storageModel.read(lastSearchPath);
        if (lastSearch != null) {
            this.searchViewModel.search(lastSearch);
        }
    };

    loadData = (): void => {
        this.restoreLastUsedView();
        this.loadTasks();
        this.loadSearchSuggestions();
    };

    // init
    constructor(
        public readonly coreViewModel: CoreViewModel,
        public readonly chatViewModel: ChatViewModel,
        public readonly boardsAndTasksModel: BoardsAndTasksModel,
        public readonly taskPageViewModel: TaskPageViewModel,
        public readonly boardInfo: BoardInfoFileContent,
    ) {
        super(coreViewModel, chatViewModel, boardsAndTasksModel);

        // load
        this.loadListRelevantData();

        // subscriptions
        this.isSelected = React.createProxyState(
            [this.taskPageViewModel.selectedBoardId],
            () =>
                this.taskPageViewModel.selectedBoardId.value ==
                this.boardInfo.fileId,
        );

        this.color.subscribe(() => {
            if (this.isSelected.value == false) return;
            if (this.chatViewModel.selectedPage.value != ChatPageTypes.Tasks)
                return;
            this.applyColor();
        });

        this.selectedPage.subscribeSilent(() => {
            this.storeLastUsedView();
        });

        // handlers
        boardsAndTasksModel.taskHandlerManager.addHandler(
            (taskFileContent: TaskFileContent) => {
                if (taskFileContent.boardId != this.boardInfo.fileId) return;
                this.showTask(taskFileContent);
                this.updateTaskIndices();
            },
        );

        // search
        this.searchViewModel = new SearchViewModel(
            this.taskViewModels,
            this.filteredTaskViewModels,
            TaskViewModel.getStringsForFilter,
            this.coreViewModel.boardFilterStringSuggestions,
        );
        this.searchViewModel.appliedQuery.subscribeSilent((newQuery) => {
            this.handleNewSearch(newQuery);
        });
        this.restoreSearch();

        this.isFilterActive = React.createProxyState(
            [this.searchViewModel.appliedQuery],
            () => this.searchViewModel.appliedQuery.value != "",
        );

        // keystrokes
        this.registerKeyStroke(CommonKeys.Filter, this.showFilterModal);
        this.registerKeyStroke(CommonKeys.Reset, this.resetFilter);
        this.registerKeyStroke(CommonKeys.CloseOrCancel, this.hideFilterModal);
        this.registerKeyStroke(CommonKeys.Settings, this.showSettings);
        this.registerKeyStroke(CommonKeys.Apply, this.hideSettings);
        this.registerKeyStroke(CommonKeys.Create, this.createTask);

        this.taskPageViewModel.registerContext(this.boardInfo.fileId, this);
    }
}

export enum BoardViewModelSubPaths {
    LastUsedView = "last-used-view",
    PreviousSearches = "previous-searches",
    LastSearch = "last-search",
}

// types
export enum BoardPageTypes {
    List = "list",
    Kanban = "kanban",
    StatusGrid = "status-grid",
}
