// it is responsible for managing calendar-realted reference files for tasks.

import FileModel, { FileModelSubPath } from "./fileModel";

import SettingsModel from "../Global/settingsModel";
import StorageModel from "../Global/storageModel";
import { TaskFileContent } from "./boardsAndTasksModel";
import CoreViewModel from "../../ViewModel/Global/coreViewModel";

export default class CalendarModel {
    readonly storageModel: StorageModel;
    readonly fileModel: FileModel;
    readonly settingsModel: SettingsModel;

    // paths
    getBasePath = (): string[] => {
        return this.fileModel.getModelContainerPath(
            FileModelSubPath.ModelCalendar,
        );
    };

    getViewPath = (): string[] => {
        return [...this.getBasePath(), FileModelSubPath.ModelView];
    };

    getMonthContainerPath = (): string[] => {
        return [...this.getBasePath(), CalendarModelSubPaths.Months];
    };

    getMonthPath = (monthString: string): string[] => {
        return [...this.getMonthContainerPath(), monthString];
    };

    // main
    storeTaskReference = (taskFileContent: TaskFileContent): void => {
        if (taskFileContent.date == undefined) return;

        const monthString: string = CalendarModel.isoToMonthString(
            taskFileContent.date,
        );

        const monthPath: string[] = this.getMonthPath(monthString);
        const referencePath: string[] = [...monthPath, taskFileContent.fileId];

        this.storageModel.write(referencePath, "");
    };

    deleteTaskReference = (monthString: string, taskId: string): void => {
        const monthPath: string[] = this.getMonthPath(monthString);
        const referencePath: string[] = [...monthPath, taskId];

        this.storageModel.write(referencePath, "");
    };

    listTaskIds = (monthString: string): string[] => {
        const monthPath: string[] = this.getMonthPath(monthString);
        return this.storageModel.list(monthPath);
    };

    generateMonthGrid = <T>(
        coreViewModel: CoreViewModel,
        year: number,
        month: number,
        defaultValueCreator: () => T,
    ): MonthGrid<T> => {
        // get today
        const date = coreViewModel.unwrappedTodayDate;
        const isCurrentMonth: boolean =
            year == date.getFullYear() && month == date.getMonth() + 1;

        // get data for offset
        date.setDate(1);
        date.setMonth(month - 1);
        date.setFullYear(year);

        const firstWeekdayOfMonth: number = date.getDay();
        const firstDayOfWeekSetting: number = parseInt(
            this.settingsModel.firstDayOfWeek,
        );

        const offset: number =
            firstWeekdayOfMonth < firstDayOfWeekSetting
                ? 7 - firstDayOfWeekSetting
                : firstWeekdayOfMonth - firstDayOfWeekSetting;

        // get total day count
        date.setMonth(month);
        date.setDate(-1);
        const daysInMonth: number = date.getDate() + 1;

        const grid: MonthGrid<T> = {
            offset,
            firstDayOfWeek: parseInt(this.settingsModel.firstDayOfWeek),
            isCurrentMonth,
            year,
            month,
            days: {},
        };

        for (let i = 0; i < daysInMonth; i++) {
            const paddedDate: string = CalendarModel.padDateOrMonth(
                (i + 1).toString(),
            );
            grid.days[paddedDate] = defaultValueCreator();
        }

        return grid;
    };

    // init
    constructor(
        storageModel: StorageModel,
        settingsModel: SettingsModel,
        fileModel: FileModel,
    ) {
        this.storageModel = storageModel;
        this.settingsModel = settingsModel;
        this.fileModel = fileModel;
    }

    // utility
    static isoToMonthString = (dateISOString: string): string => {
        const [year, month, _] = dateISOString.split("-");
        return CalendarModel.getMonthString(year, month);
    };

    static isoToDateString = (dateISOString: string): string => {
        const [year, month, date, _] = dateISOString.split("-");
        const paddedDate = CalendarModel.padDateOrMonth(date ?? "");
        return paddedDate;
    };

    static getMonthString = (year: string = "", month: string = ""): string => {
        const paddedYear: string = year.padStart(4, "0");
        const paddedMonth: string = CalendarModel.padDateOrMonth(month);
        return `${paddedYear}-${paddedMonth}`;
    };

    static getISODateString = (
        year: string,
        month: string,
        date: string,
    ): string => {
        const monthString: string = CalendarModel.getMonthString(year, month);
        const paddedDate: string = CalendarModel.padDateOrMonth(date);
        return `${monthString}-${paddedDate}`;
    };

    static padDateOrMonth = (input: string): string => {
        return input.padStart(2, "0");
    };
}

export enum CalendarModelSubPaths {
    Months = "months",
}

// types
export interface MonthGrid<T> {
    readonly offset: number;
    readonly firstDayOfWeek: number;
    readonly isCurrentMonth: boolean;

    readonly year: number;
    readonly month: number;

    readonly days: { [date: string]: T };
}
