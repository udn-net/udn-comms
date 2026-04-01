import * as React from "bloatless-react";

import BoardViewModel, {
    BoardPageType,
} from "../../ViewModel/Pages/boardViewModel";

import { BoardKanbanPage } from "./boardKanbanPage";
import { BoardSettingsModal } from "../Modals/boardSettingsModal";
import { BoardStatusGridPage } from "./boardStatusGridPage";
import { BoardViewToggleButton } from "../Components/boardViewToggleButton";
import { SearchModal } from "../Modals/searchModal";
import { TaskSettingsModal } from "../Modals/taskSettingsModal";
import { TaskViewModelToEntry } from "../Components/taskEntry";
import { translations } from "../translations";
import { setFocusWithDelay } from "../utility";

export function BoardPage(boardViewModel: BoardViewModel) {
    boardViewModel.loadData();

    // main content
    const mainContent = React.createProxyState(
        [boardViewModel.selectedPage],
        () => {
            switch (boardViewModel.selectedPage.value) {
                case BoardPageType.Kanban: {
                    return BoardKanbanPage(boardViewModel);
                }
                case BoardPageType.StatusGrid: {
                    return BoardStatusGridPage(boardViewModel);
                }
                default: {
                    return (
                        <div
                            class="task-grid"
                            children:append={[
                                boardViewModel.filteredTaskViewModels,
                                TaskViewModelToEntry,
                            ]}
                        ></div>
                    );
                }
            }
        },
    );

    // task modal
    const taskSettingsModal = React.createProxyState(
        [boardViewModel.selectedTaskViewModel],
        () => {
            if (boardViewModel.selectedTaskViewModel.value == undefined) {
                return <div></div>;
            } else {
                setFocusWithDelay();

                return TaskSettingsModal(
                    boardViewModel.selectedTaskViewModel.value,
                );
            }
        },
    );

    return (
        <div class="pane">
            <div class="toolbar">
                <span>
                    <button
                        class="ghost board-close-button"
                        aria-label={
                            translations.chatPage.task
                                .closeBoardButtonAudioLabel
                        }
                        on:click={boardViewModel.close}
                    >
                        <span class="icon">arrow_back</span>
                    </button>
                    <button
                        class="ghost board-toggle-button inset-outline"
                        aria-label={
                            translations.chatPage.task
                                .toggleBoardButtonAudioLabel
                        }
                        on:click={
                            boardViewModel.taskPageViewModel.toggleBoardList
                        }
                        toggle:selected={
                            boardViewModel.taskPageViewModel.isShowingBoadList
                        }
                    >
                        <span class="icon">dock_to_right</span>
                    </button>
                    <button
                        class="ghost"
                        aria-label={
                            translations.chatPage.task.boardSettingsHeadline
                        }
                        on:click={boardViewModel.showSettings}
                    >
                        <span class="icon">settings</span>
                    </button>
                </span>
                <span class="scroll-h ribbon">
                    {BoardViewToggleButton(
                        translations.chatPage.task.listViewButtonAudioLabel,
                        "view_list",
                        BoardPageType.List,
                        boardViewModel,
                    )}
                    {BoardViewToggleButton(
                        translations.chatPage.task.kanbanViewButtonAudioLabel,
                        "view_kanban",
                        BoardPageType.Kanban,
                        boardViewModel,
                    )}
                    {BoardViewToggleButton(
                        translations.chatPage.task.statusViewButtonAudioLabel,
                        "grid_view",
                        BoardPageType.StatusGrid,
                        boardViewModel,
                    )}
                </span>
                <span>
                    <button
                        class="ghost"
                        aria-label={
                            translations.chatPage.task
                                .filterTasksButtonAudioLabel
                        }
                        on:click={boardViewModel.showFilterModal}
                    >
                        <span class="icon">filter_alt</span>
                    </button>
                    <button
                        class="ghost"
                        aria-label={
                            translations.chatPage.task
                                .createTaskButtonAudioLabel
                        }
                        on:click={boardViewModel.createTask}
                    >
                        <span class="icon">add</span>
                    </button>
                </span>
            </div>
            <div class="content main-content" children:set={mainContent}></div>

            {BoardSettingsModal(boardViewModel)}
            {SearchModal(
                boardViewModel.searchViewModel,
                translations.chatPage.task.filterTasksHeadline,
                TaskViewModelToEntry,
                boardViewModel.isPresentingFilterModal,
            )}
            <div children:set={taskSettingsModal}></div>
        </div>
    );
}
