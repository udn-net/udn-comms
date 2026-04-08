import "./splitModal.css";

import * as React from "bloatless-react";

export function SplitModal(
    leftView: React.State<Element>,
    rightView: React.State<Element>,
    scrollButtonLabel: React.State<string>,
    extendedStyle: boolean = false,
    navigationState?: React.State<any>,
) {
    const view = (
        <div class="split-modal" toggle:extended={extendedStyle}>
            <div>
                <div class="scroll-area" children:set={leftView}></div>
                <div class="detail-button-wrapper" toggle:hidden={navigationState != undefined}>
                    <button class="ghost" on:click={scrollToDetails}>
                        <span
                            class="ellipsis"
                            subscribe:innerText={scrollButtonLabel}
                        ></span>
                        <span class="icon">arrow_forward</span>
                    </button>
                </div>
            </div>
            <div class="scroll-area" children:set={rightView}></div>
        </div>
    );

    function scrollToDetails() {
        view.scrollLeft = view.scrollWidth;
    }

    navigationState?.subscribe(scrollToDetails);

    return view;
}
