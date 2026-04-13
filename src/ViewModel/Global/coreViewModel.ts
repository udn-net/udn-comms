import * as React from "bloatless-react";
import SettingsModel from "../../Model/Global/settingsModel";
import { allTranslations, Translations } from "../../View/translations";
import StorageModel from "../../Model/Global/storageModel";
import ConnectionModel from "../../Model/Global/connectionModel";
import ChatListModel from "../../Model/Chat/chatListModel";
import FileTransferModel from "../../Model/Global/fileTransferModel";
import { v4 } from "uuid";

export default class CoreViewModel {
    readonly BUILD = "Build 26.04.13.A";

    translations: Translations;

    // CONTEXT
    private contextStack = new Map<string, Context>();
    get contexts(): Context[] {
        return [...this.contextStack.values()];
    }
    get context(): Context | undefined {
        return this.contexts.pop();
    }
    logContexts = (): void => {
        console.log(
            "context",
            this.contexts.map(
                (x) => x.contextDebugDescription + "-" + x.contextId,
            ),
        );
    };
    set context(context: Context) {
        if (this.contextStack.has(context.contextId)) return;
        this.contextStack.set(context.contextId, context);
        this.logContexts();
    }
    closeContext = (contextId: string): void => {
        if (!this.contexts.map(context=>context.contextId).includes(contextId)) return;
        while (this.contexts.length > 0) {
            const currentContext = this.context;
            this.contextStack.delete(currentContext.contextId);
            if (currentContext.contextId == contextId) break;
        }
        this.logContexts();
    };

    handleKeyDown = (e: KeyboardEvent): void => {
        if (!CoreViewModel.checkIsKeystroke(e)) return;
        const contexts = this.contexts;
        while (contexts.length > 0) {
            const currentContext = contexts.pop();
            if (!currentContext) contexts;
            const isHandled: boolean = currentContext.handleKeystroke(e);
            if (isHandled == true) break;
        }
    };

    // DRAG & DROP
    draggedObject: React.State<any> = new React.State<any>(undefined);

    // SUGGESTIONS
    // boards & tasks
    boardFilterStringSuggestions: React.ListState<string> =
        new React.ListState();

    taskCategorySuggestions: React.ListState<string> = new React.ListState();
    taskStatusSuggestions: React.ListState<string> = new React.ListState();

    // init
    constructor(
        public storageModel: StorageModel,
        public settingsModel: SettingsModel,
        public connectionModel: ConnectionModel,
        public chatListModel: ChatListModel,
        public fileTransferModel: FileTransferModel,
    ) {
        this.translations =
            allTranslations[settingsModel.language] || allTranslations.en;

        document.body.addEventListener("keydown", this.handleKeyDown);
    }

    // util
    static checkIsKeystroke(e: KeyboardEvent): boolean {
        return (e.metaKey || e.altKey) && e.ctrlKey;
    }
}

export class Context {
    contextId = v4();
    contextDebugDescription: string;
    keystrokes = new Map<string, () => void>();

    handleKeystroke = (e: KeyboardEvent): boolean => {
        const fn = this.keystrokes.get(e.key.toLowerCase());
        if (!fn) return false;
        e.preventDefault();
        fn();
        return true;
    };

    close: () => void;

    registerKeyStroke = (key: string, fn: () => void): void => {
        this.keystrokes.set(key, fn);
    };
}

export class ContextHost<T> extends Context {
    coreViewModel: CoreViewModel;
    contexts = new Map<T, Context>();
    currentContext = new React.State<Context | undefined>(undefined);

    get isOpen(): boolean {
        return false;
    }
    get contextSelection(): T | undefined {
        return undefined;
    }

    registerContext = (key: T, context: Context): void => {
        this.contexts.set(key, context);
    };

    closeContext = (): void => {
        if (this.currentContext.value) {
            this.coreViewModel.closeContext(this.currentContext.value.contextId);
        }
        this.currentContext.value = undefined;
    };

    updateContexts = (): void => {
        if (this.isOpen == false) return;

        const selectedContext = this.contexts.get(this.contextSelection);
        if (!selectedContext) return;
        if (selectedContext != this.currentContext.value) {
            this.closeContext();
        };

        this.coreViewModel.logContexts();

        this.coreViewModel.context = selectedContext;
        this.currentContext.value = selectedContext;
    };
}
