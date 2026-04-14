import * as React from "bloatless-react";

class ItemTracker<T> {
    items: React.State<T | undefined> | undefined;
}

class ViewTrackerMap<T> {
    trackers = new Map<string, ItemTracker<T>>();

    private register = (key: string): ItemTracker<T> => {
        if (this.trackers.has(key)) {
            return this.trackers.get(key);
        }
        const tracker = new ItemTracker<T>();
        this.trackers.set(key, tracker);
        return tracker;
    };

    setItems = (
        key: string,
        views: () => React.State<T>,
    ): React.State<T | undefined> | undefined => {
        const tracker: ItemTracker<T> = this.register(key);

        if (tracker.items != undefined) {
            return tracker.items;
        } else {
            tracker.items = views();
            return tracker.items;
        }
    };
}

export class ViewController {
    static readonly chatPages = new ItemTracker<HTMLElement>();
    static readonly taskPages = new ViewTrackerMap<HTMLElement>();
    static readonly boardPages = new ViewTrackerMap<HTMLElement>();
    static readonly inlineReplies = new ViewTrackerMap<HTMLElement>();
    static readonly messageIcons = new ViewTrackerMap<string>();

    static scrollToView(id: string) {
        const element = document.getElementById(id);
        if (!element) return
        element.scrollIntoView();
        element.setAttribute("scrolled", "");
        setTimeout(()=>element.removeAttribute("scrolled"), 1000);
    }
}
