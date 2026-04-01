import * as React from "bloatless-react";

import BoardsAndTasksModel, {
    TaskFileContent,
} from "../../Model/Files/boardsAndTasksModel";
import CalendarModel, { MonthGrid } from "../../Model/Files/calendarModel";

import ChatViewModel from "../Chat/chatViewModel";
import CoreViewModel from "../Global/coreViewModel";
import StorageModel from "../../Model/Global/storageModel";
import TaskContainingPageViewModel from "./taskContainingPageViewModel";
import TaskViewModel from "./taskViewModel";

export const CALENDAR_EVENT_BOARD_ID = "events";

export default class CalendarPageViewModel extends TaskContainingPageViewModel {
    storageModel: StorageModel;
    calendarModel: CalendarModel;
    boardsAndTasksModel: BoardsAndTasksModel;

    // data
    get monthString(): string {
        return CalendarModel.getMonthString(
            this.selectedYear.value.toString(),
            this.selectedMonth.value.toString(),
        );
    }

    // paths
    getBasePath = (): string[] => {
        return [...this.calendarModel.getViewPath()];
    };

    // state
    selectedYear: React.State<number> = new React.State(0);
    selectedMonth: React.State<number> = new React.State(0);
    selectedDate: React.State<number> = new React.State(0);

    monthGrid: React.State<
        MonthGrid<React.MapState<TaskViewModel>> | undefined
    > = new React.State<any>(undefined);

    // methods
    createEvent = (): void => {
        const taskFileContent: TaskFileContent =
            this.boardsAndTasksModel.createTask(CALENDAR_EVENT_BOARD_ID);
        taskFileContent.date = CalendarModel.getISODateString(
            this.selectedYear.value.toString(),
            this.selectedMonth.value.toString(),
            this.selectedDate.value.toString(),
        );

        const taskViewModel: TaskViewModel = new TaskViewModel(
            this.coreViewModel,
            this.chatViewModel,
            this.boardsAndTasksModel,
            this,
            taskFileContent,
        );

        this.selectTask(taskViewModel);
        this.updateTaskIndices();
    };

    getEventsForDate = (): React.MapState<TaskViewModel> | undefined => {
        const paddedDate: string = CalendarModel.padDateOrMonth(
            this.selectedDate.toString(),
        );

        if (this.monthGrid.value == undefined) {
            return undefined;
        }

        return this.monthGrid.value.days[paddedDate];
    };

    // view
    getTaskMapState = (
        taskFileContent: TaskFileContent,
    ): React.MapState<TaskViewModel> | null => {
        if (this.monthGrid.value == null) return null;

        const date: string = CalendarModel.isoToDateString(
            taskFileContent.date ?? "",
        );
        return this.monthGrid.value.days[date];
    };

    showTask = (taskFileContent: TaskFileContent): void => {
        const monthString: string | undefined = CalendarModel.isoToMonthString(
            taskFileContent.date ?? "",
        );
        if (monthString == undefined || monthString != this.monthString) {
            this.removeTaskFromView(taskFileContent);
            this.calendarModel.deleteTaskReference(
                this.monthString,
                taskFileContent.fileId,
            );
            return;
        }

        const taskViewModel: TaskViewModel = new TaskViewModel(
            this.coreViewModel,
            this.chatViewModel,
            this.boardsAndTasksModel,
            this,
            taskFileContent,
        );
        const mapState: React.MapState<TaskViewModel> | null =
            this.getTaskMapState(taskFileContent);

        this.taskViewModels.handleRemoval(taskViewModel, () => {
            mapState?.remove(taskFileContent.fileId);
        });

        this.taskViewModels.remove(taskFileContent.fileId);
        this.taskViewModels.set(taskFileContent.fileId, taskViewModel);

        mapState?.set(taskFileContent.fileId, taskViewModel);
    };

    removeTaskFromView = (taskFileContent: TaskFileContent): void => {
        this.taskViewModels.remove(taskFileContent.fileId);
    };

    showToday = (): void => {
        const today: Date = new Date();
        this.selectedYear.value = today.getFullYear();
        this.selectedMonth.value = today.getMonth() + 1;
        this.selectedDate.value = today.getDate();
    };

    showPreviousMonth = (): void => {
        this.selectedMonth.value -= 1;

        if (this.selectedMonth.value <= 0) {
            this.selectedYear.value -= 1;
            this.selectedMonth.value = 12;
        }
    };

    showNextMonth = (): void => {
        this.selectedMonth.value += 1;

        if (this.selectedMonth.value >= 13) {
            this.selectedYear.value += 1;
            this.selectedMonth.value = 1;
        }
    };

    handleDrop = (year: string, month: string, date: string): void => {
        const ISOString: string = CalendarModel.getISODateString(
            year,
            month,
            date,
        );

        const draggedObject: any = this.coreViewModel.draggedObject.value;
        if (draggedObject instanceof TaskViewModel == false) return;

        draggedObject.setDate(ISOString);
    };

    // load
    loadMonthTasks = (): void => {
        this.monthGrid.value = this.calendarModel.generateMonthGrid(
            this.selectedYear.value,
            this.selectedMonth.value,
            () => new React.MapState(),
        );
        const taskIds: string[] = this.calendarModel.listTaskIds(
            this.monthString,
        );

        for (const taskId of taskIds) {
            const taskFileContent: TaskFileContent | null =
                this.boardsAndTasksModel.getLatestTaskFileContent(taskId);
            if (taskFileContent == null) continue;
            this.showTask(taskFileContent);
        }

        this.updateTaskIndices();
    };

    loadData = (): void => {
        this.loadMonthTasks();
    };

    // init
    constructor(
        public coreViewModel: CoreViewModel,
        public chatViewModel: ChatViewModel,
        storageModel: StorageModel,
        calendarModel: CalendarModel,
        boardsAndTasksModel: BoardsAndTasksModel,
    ) {
        super(coreViewModel, chatViewModel, boardsAndTasksModel);

        this.storageModel = storageModel;
        this.calendarModel = calendarModel;
        this.boardsAndTasksModel = boardsAndTasksModel;

        this.chatViewModel = chatViewModel;

        React.bulkSubscribe([this.selectedYear, this.selectedMonth], () => {
            this.loadMonthTasks();
        });

        // handlers
        boardsAndTasksModel.taskHandlerManager.addHandler(
            (taskFileContent: TaskFileContent) => {
                this.showTask(taskFileContent);
            },
        );

        // initiate
        this.showToday();
    }
}

export enum TaskPageViewModelSubPath {
    LastUsedBoard = "last-used-board",
}
