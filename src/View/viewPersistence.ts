import * as React from "bloatless-react";

class PageTracker {
    pages: React.State<HTMLElement | undefined> | undefined;
}

class PageTrackerMap {
    trackers = new Map<string, PageTracker>();

    private register = (key: string): PageTracker => {
        if (this.trackers.has(key)) {
            return this.trackers.get(key);
        };
        const tracker = new PageTracker();
        this.trackers.set(key, tracker);
        return tracker
    }

    setPages = (key: string, pages: () => React.State<HTMLElement>): React.State<HTMLElement | undefined> | undefined => {
        const tracker: PageTracker = this.register(key);

        if (tracker.pages != undefined) {
            return tracker.pages;
        } else {
            tracker.pages = pages();
            return tracker.pages;
        }
    }
}

export class ViewPersistence {
    static readonly chatPages = new PageTracker();
    static readonly taskPages = new PageTrackerMap();
    static readonly boardPages = new PageTrackerMap();
}