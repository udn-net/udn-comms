import * as React from "bloatless-react";

export default class CoreViewModel {
    readonly BUILD = "Build 26.04.08.B"

    // DRAG & DROP
    draggedObject: React.State<any> = new React.State<any>(undefined);

    // SUGGESTIONS
    // boards & tasks
    boardFilterStringSuggestions: React.ListState<string> =
        new React.ListState();

    taskCategorySuggestions: React.ListState<string> = new React.ListState();
    taskStatusSuggestions: React.ListState<string> = new React.ListState();
}
