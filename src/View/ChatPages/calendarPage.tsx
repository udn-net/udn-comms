import "./calendarPage.css";

import * as React from "bloatless-react";

import CalendarModel from "../../Model/Files/calendarModel";
import CalendarPageViewModel from "../../ViewModel/Pages/calendarPageViewModel";
import { MonthGrid } from "../Components/monthGrid";
import { TaskSettingsModal } from "../Modals/taskSettingsModal";
import { TaskViewModelToEntry } from "../Components/taskEntry";
import { translations } from "../translations";
import { setFocusWithDelay } from "../utility";

export function CalendarPage(calendarPageViewModel: CalendarPageViewModel) {
    calendarPageViewModel.loadData();

    const mainContent = React.createProxyState(
        [calendarPageViewModel.monthGrid],
        () => {
            const monthGrid = calendarPageViewModel.monthGrid.value;

            if (monthGrid == undefined) {
                return <div></div>;
            } else {
                function drop(date: string) {
                    calendarPageViewModel.handleDrop(
                        monthGrid!.year.toString(),
                        monthGrid!.month.toString(),
                        date,
                    );
                }

                return MonthGrid(
                    monthGrid,
                    calendarPageViewModel.selectedDate,
                    drop,
                );
            }
        },
    );

    const sidePaneContentWrapper = React.createProxyState(
        [
            calendarPageViewModel.selectedYear,
            calendarPageViewModel.selectedMonth,
            calendarPageViewModel.selectedDate,
        ],
        () => {
            const listState = calendarPageViewModel.getEventsForDate();

            if (listState == undefined) {
                return <div></div>;
            } else {
                const sidePaneContent = React.createProxyState(
                    [listState],
                    () => {
                        if (listState.value.size == 0) {
                            return (
                                <div class="width-100 height-100 flex-column justify-center align-center">
                                    <span class="secondary slide-up">
                                        {
                                            translations.chatPage.calendar
                                                .noEvents
                                        }
                                    </span>
                                </div>
                            );
                        } else {
                            return (
                                <div
                                    class="flex-column gap slide-up padding-bottom"
                                    children:append={[
                                        listState,
                                        TaskViewModelToEntry,
                                    ]}
                                ></div>
                            );
                        }
                    },
                );

                return (
                    <div
                        class="width-100 height-100"
                        children:set={sidePaneContent}
                    ></div>
                );
            }
        },
    );

    const taskSettingsModal = React.createProxyState(
        [calendarPageViewModel.selectedTaskViewModel],
        () => {
            if (
                calendarPageViewModel.selectedTaskViewModel.value == undefined
            ) {
                return <div></div>;
            } else {
                setFocusWithDelay();

                return TaskSettingsModal(
                    calendarPageViewModel.selectedTaskViewModel.value,
                );
            }
        },
    );

    return (
        <div id="calendar-page">
            <div class="pane-wrapper grid-pane-wrapper">
                <div class="pane">
                    <div class="toolbar">
                        <span>
                            <button
                                class="ghost"
                                aria-label={
                                    translations.chatPage.calendar
                                        .todayButtonAudioLabel
                                }
                                on:click={calendarPageViewModel.showToday}
                            >
                                <span class="icon">today</span>
                            </button>
                        </span>
                        <span>
                            <button
                                class="ghost"
                                aria-label={
                                    translations.chatPage.calendar
                                        .previousMonthButtonAudioLabel
                                }
                                on:click={
                                    calendarPageViewModel.showPreviousMonth
                                }
                            >
                                <span class="icon">arrow_back</span>
                            </button>
                            <span class="input-wrapper">
                                <input
                                    class="year-input"
                                    type="number"
                                    aria-label={
                                        translations.chatPage.calendar
                                            .yearInputAudioLabel
                                    }
                                    placeholder={
                                        translations.chatPage.calendar
                                            .yearInputPlaceholder
                                    }
                                    bind:value={
                                        calendarPageViewModel.selectedYear
                                    }
                                ></input>
                                <input
                                    class="month-input"
                                    type="number"
                                    aria-label={
                                        translations.chatPage.calendar
                                            .monthInputAudioLabel
                                    }
                                    placeholder={
                                        translations.chatPage.calendar
                                            .monthInputPlaceholder
                                    }
                                    bind:value={
                                        calendarPageViewModel.selectedMonth
                                    }
                                ></input>
                            </span>
                            <button
                                class="ghost"
                                aria-label={
                                    translations.chatPage.calendar
                                        .nextMonthButtonAudioLabel
                                }
                                on:click={calendarPageViewModel.showNextMonth}
                            >
                                <span class="icon">arrow_forward</span>
                            </button>
                        </span>
                        <span>
                            <button
                                class="ghost"
                                aria-label={
                                    translations.chatPage.task
                                        .createTaskButtonAudioLabel
                                }
                                on:click={calendarPageViewModel.createEvent}
                            >
                                <span class="icon">add</span>
                            </button>
                        </span>
                    </div>
                    <div
                        class="content padding-0"
                        children:set={mainContent}
                    ></div>
                </div>
            </div>
            <div
                class="pane-wrapper side background"
                set:color={calendarPageViewModel.chatViewModel.displayedColor}
            >
                <div class="pane">
                    <div
                        class="content"
                        children:set={sidePaneContentWrapper}
                    ></div>
                </div>
            </div>

            <div children:set={taskSettingsModal}></div>
        </div>
    );
}
