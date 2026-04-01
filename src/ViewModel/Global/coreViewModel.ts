import * as React from "bloatless-react";

export default class CoreViewModel {
    // DRAG & DROP
    draggedObject: React.State<any> = new React.State<any>(undefined);

    // SUGGESTIONS
    // boards & tasks
    boardSearchSuggestions: React.ListState<string> = new React.ListState();

    taskCategorySuggestions: React.ListState<string> = new React.ListState();
    taskStatusSuggestions: React.ListState<string> = new React.ListState();
}
