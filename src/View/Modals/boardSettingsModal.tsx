import * as React from "bloatless-react";

import BoardViewModel from "../../ViewModel/Pages/boardViewModel";
import { ColorPicker } from "../Components/colorPicker";
import { DangerousActionButton } from "../Components/dangerousActionButton";
import { translations } from "../translations";

export function BoardSettingsModal(boardViewModel: BoardViewModel) {
    return (
        <div
            class="modal"
            toggle:open={boardViewModel.isPresentingSettingsModal}
        >
            <div>
                <main>
                    <h2>{translations.chatPage.task.boardSettingsHeadline}</h2>

                    <label class="tile flex-no">
                        <span class="icon">label</span>
                        <div>
                            <span>
                                {translations.chatPage.task.boardNameInputLabel}
                            </span>
                            <input
                                on:enter={boardViewModel.saveSettings}
                                bind:value={boardViewModel.name}
                            ></input>
                        </div>
                    </label>

                    <hr></hr>

                    {ColorPicker(boardViewModel.color)}

                    <hr></hr>

                    <div class="width-input">
                        {DangerousActionButton(
                            translations.chatPage.task.deleteBoardButton,
                            "delete_forever",
                            boardViewModel.deleteBoard,
                        )}
                    </div>
                </main>
                <button on:click={boardViewModel.hideSettings}>
                    {translations.general.closeButton}
                    <span class="icon">close</span>
                </button>
            </div>
        </div>
    );
}
