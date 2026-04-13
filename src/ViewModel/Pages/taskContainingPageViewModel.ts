import * as React from "bloatless-react";

import BoardsAndTasksModel, {
    TaskFileContent,
} from "../../Model/Files/boardsAndTasksModel";

import ChatViewModel from "../Chat/chatViewModel";
import CoreViewModel, { Context } from "../Global/coreViewModel";
import { IndexManager } from "../../Model/Utility/utility";
import TaskViewModel from "./taskViewModel";

export default class TaskContainingPageViewModel extends Context {
    // state
    readonly taskIndexManager = new IndexManager<TaskViewModel>(
        (taskViewModel: TaskViewModel) => taskViewModel.sortingString,
    );

    selectedTaskViewModel: React.State<TaskViewModel | undefined> =
        new React.State<any>(undefined);

    taskViewModels: React.MapState<TaskViewModel> = new React.MapState();

    // methods
    createTaskFromBoardId = (boardId: string): void => {
        const taskFileContent: TaskFileContent =
            this.boardsAndTasksModel.createTask(boardId);
        const taskViewModel: TaskViewModel = new TaskViewModel(
            this.coreViewModel,
            this.chatViewModel,
            this.boardsAndTasksModel,
            this,
            taskFileContent,
        );
        taskViewModel.open();
        this.updateTaskIndices();
    };

    // view
    showTask = (taskFileContent: TaskFileContent): void => {};
    removeTaskFromView = (taskFileContent: TaskFileContent): void => {};

    selectTask = (selectedTask: TaskViewModel): void => {
        this.selectedTaskViewModel.value = selectedTask;
    };

    closeTask = () => {
        this.selectedTaskViewModel.value = undefined;
    };

    updateTaskIndices = (): void => {
        this.taskIndexManager.update([...this.taskViewModels.value.values()]);
        for (const taskViewModel of this.taskViewModels.value.values()) {
            taskViewModel.updateIndex();
        }
    };

    // init
    constructor(
        public readonly coreViewModel: CoreViewModel,
        public readonly chatViewModel: ChatViewModel,
        public readonly boardsAndTasksModel: BoardsAndTasksModel,
    ) {
        super();
    }
}
