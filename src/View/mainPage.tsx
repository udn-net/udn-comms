import * as React from "bloatless-react";

import { translations } from "./translations";

export function MainPage() {
    return (
        <article id="home-page">
            <header>
                <span>{translations.homePage.appName}</span>
            </header>
            <div></div>
        </article>
    );
}
