import "./splitModal.css";

import * as React from "bloatless-react";

export function SplitModal(
    leftView: React.State<Element>,
    rightView: React.State<Element>,
    extendedStyle: boolean = false,
    navigationState?: React.State<any>,
) {
    const view = (
        <div class="split-modal" toggle:extended={extendedStyle} toggle:primitive={navigationState == undefined}>
            <div>
                <div class="scroll-area" children:set={leftView}></div>
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
