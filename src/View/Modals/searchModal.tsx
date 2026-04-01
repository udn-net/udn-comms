import * as React from "bloatless-react";

import SearchViewModel from "../../ViewModel/Utility/searchViewModel";
import { StringToOption } from "../Components/option";
import { translations } from "../translations";
import { v4 } from "uuid";

export function SearchModal<T>(
    searchViewModel: SearchViewModel<T>,
    headline: string,
    converter: React.StateItemConverter<T>,
    isOpen: React.State<boolean>,
) {
    function close() {
        isOpen.value = false;
    }

    const suggestionId = v4();

    return (
        <div class="modal" toggle:open={isOpen}>
            <div style="max-width: 64rem">
                <main>
                    <h2>{headline}</h2>
                    <div class="flex-row width-input">
                        <input
                            placeholder={translations.general.searchLabel}
                            bind:value={searchViewModel.searchInput}
                            on:enter={searchViewModel.applySearch}
                            list={suggestionId}
                        ></input>
                        <datalist
                            hidden
                            id={suggestionId}
                            children:append={[
                                searchViewModel.suggestions,
                                StringToOption,
                            ]}
                        ></datalist>
                        <button
                            class="primary"
                            aria-label={
                                translations.general.searchButtonAudioLabel
                            }
                            on:click={searchViewModel.applySearch}
                            toggle:disabled={searchViewModel.cannotApplySearch}
                        >
                            <span class="icon">search</span>
                        </button>
                    </div>

                    <hr></hr>

                    <div
                        class="grid gap"
                        style="grid-template-columns: repeat(auto-fit, minmax(12rem, 1fr))"
                        children:append={[
                            searchViewModel.matchingObjects,
                            converter,
                        ]}
                    ></div>
                </main>
                <button on:click={close}>
                    {translations.general.closeButton}
                    <span class="icon">close</span>
                </button>
            </div>
        </div>
    );
}
