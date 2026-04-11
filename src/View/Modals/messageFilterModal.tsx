import * as React from "bloatless-react";

import SearchViewModel from "../../ViewModel/Utility/searchViewModel";
import { StringToOption } from "../Components/option";
import { v4 } from "uuid";
import CoreViewModel from "../../ViewModel/Global/coreViewModel";
import MessagePageViewModel from "../../ViewModel/Pages/messagePageViewModel";

export function MessageFilterModal<T>(
    coreViewModel: CoreViewModel,
    messagePageViewModel: MessagePageViewModel,
    converter: React.StateItemConverter<T>,
) {
    return (
        <div class="modal" toggle:open={messagePageViewModel.isFilterModalOpen}>
            <div>
                <main>
                    <h2>{coreViewModel.translations.chatPage.message.messageFilterHeadline}</h2>
                    <div class="flex-row width-input">
                        <input
                            placeholder={
                                coreViewModel.translations.general.searchLabel
                            }
                            bind:value={messagePageViewModel.searchViewModel.searchInput}
                            on:enter={messagePageViewModel.searchViewModel.applySearch}
                        ></input>
                        <button
                            class="primary"
                            aria-label={
                                coreViewModel.translations.general
                                    .searchButtonAudioLabel
                            }
                            on:click={messagePageViewModel.searchViewModel.applySearch}
                            toggle:disabled={messagePageViewModel.searchViewModel.cannotApplySearch}
                        >
                            <span class="icon">search</span>
                        </button>
                    </div>

                    <hr></hr>
                </main>
                <button on:click={messagePageViewModel.closeFilterModal}>
                    {coreViewModel.translations.general.closeButton}
                    <span class="icon">close</span>
                </button>
            </div>
        </div>
    );
}
