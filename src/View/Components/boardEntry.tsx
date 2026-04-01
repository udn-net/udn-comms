import * as React from "bloatless-react";

import BoardViewModel from "../../ViewModel/Pages/boardViewModel";
import { allowDrop } from "../utility";

export function BoardEntry(boardViewModel: BoardViewModel) {
    const view = (
        <button
            set:color={boardViewModel.color}
            class="tile colored-tile"
            toggle:selected={boardViewModel.isSelected}
            on:click={boardViewModel.select}
            on:dragover={allowDrop}
            on:drop={boardViewModel.handleDropBetweenBoards}
        >
            <span
                class="shadow"
                subscribe:innerText={boardViewModel.name}
            ></span>
            <b subscribe:innerText={boardViewModel.name}></b>
        </button>
    );

    boardViewModel.index.subscribe((newIndex) => {
        view.style.order = newIndex;
    });

    return view;
}

export const BoardViewModelToEntry: React.StateItemConverter<BoardViewModel> = (
    boardViewModel: BoardViewModel,
) => {
    return BoardEntry(boardViewModel);
};
