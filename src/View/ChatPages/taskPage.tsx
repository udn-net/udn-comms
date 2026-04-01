import "./taskPage.css";

import * as React from "bloatless-react";

import { BoardPage } from "./boardPage";
import { BoardViewModelToEntry } from "../Components/boardEntry";
import TaskPageViewModel from "../../ViewModel/Pages/taskPageViewModel";
import { translations } from "../translations";

export function TaskPage(taskPageViewModel: TaskPageViewModel) {
    taskPageViewModel.loadData();

    const isShowingBoard = React.createProxyState(
        [taskPageViewModel.selectedBoardId],
        () => taskPageViewModel.selectedBoardId.value != undefined,
    );

    const paneContent = React.createProxyState(
        [taskPageViewModel.selectedBoardId],
        () => {
            const selectedBoardId = taskPageViewModel.selectedBoardId.value;
            if (selectedBoardId == undefined) {
                return (
                    <div class="pane align-center justify-center">
                        <span class="secondary">
                            {translations.chatPage.task.noBoardSelected}
                        </span>
                    </div>
                );
            }
            const selectedBoard =
                taskPageViewModel.boardViewModels.value.get(selectedBoardId);
            if (selectedBoard == undefined) {
                return (
                    <div class="pane align-center justify-center">
                        <span class="secondary">
                            {translations.chatPage.task.boardNotFound}
                        </span>
                    </div>
                );
            }

            return BoardPage(selectedBoard);
        },
    );

    return (
        <div
            id="task-page"
            toggle:isshowingboard={isShowingBoard}
            set:showingboardlist={taskPageViewModel.isShowingBoadList}
        >
            <div
                id="board-list"
                class="pane-wrapper side background"
                set:color={taskPageViewModel.chatViewModel.displayedColor}
            >
                <div class="pane">
                    <div class="toolbar">
                        <div class="flex-row width-input">
                            <input
                                class="no-outline"
                                bind:value={taskPageViewModel.newBoardNameInput}
                                on:enter={taskPageViewModel.createBoard}
                                placeholder={
                                    translations.chatPage.task
                                        .newBoardNamePlaceholder
                                }
                            ></input>
                            <button
                                class="primary"
                                aria-label={
                                    translations.chatPage.task
                                        .createBoardButtonAudioLabel
                                }
                                on:click={taskPageViewModel.createBoard}
                                toggle:disabled={
                                    taskPageViewModel.cannotCreateBoard
                                }
                            >
                                <span class="icon">add</span>
                            </button>
                        </div>
                    </div>
                    <div class="content">
                        <div
                            class="grid gap"
                            style="grid-template-columns: repeat(auto-fill, minmax(12rem, 1fr))"
                            children:append={[
                                taskPageViewModel.boardViewModels,
                                BoardViewModelToEntry,
                            ]}
                        ></div>
                    </div>
                </div>
            </div>
            <div
                id="board-content"
                class="pane-wrapper"
                children:set={paneContent}
            ></div>
        </div>
    );
}
