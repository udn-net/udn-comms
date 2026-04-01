import { checkIsValidObject, checkMatchesObjectStructure } from "./typeSafety";

export interface Stringifiable {
    toString(): string;
}

// crypto
export function generateRandomToken(length: number): string {
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    const string = array.join("");
    return string.substring(0, length);
}

// date
export function createTimestamp(): string {
    return new Date().toISOString();
}

// filters etc
export type StringEntryObject = { [key: string]: Stringifiable | undefined };

export function filterObjectsByStringEntries<T>(
    reference: StringEntryObject,
    converter: (object: T) => StringEntryObject,
    objects: T[],
): Set<T> {
    const matches: Set<T> = new Set();

    object_loop: for (const object of objects) {
        const doesMatch: boolean = checkDoesObjectMatchReference(
            reference,
            converter(object),
        );
        if (doesMatch) matches.add(object);
    }

    return matches;
}

export function checkDoesObjectMatchReference(
    reference: StringEntryObject,
    stringEntryObject: StringEntryObject,
    explicitEmptyValue: boolean = false,
): boolean {
    reference_entry_loop: for (const referenceEntry of Object.entries(
        reference,
    )) {
        const [referenceKey, referenceValue] = referenceEntry;
        const stringEntryObjectValue: Stringifiable | undefined =
            stringEntryObject[referenceKey];

        if (referenceValue == undefined) return false;

        if (referenceValue[0] == "-") {
            const strippedReferenceValue: string = referenceValue
                .toString()
                .substring(1);
            // property may not exist
            if (
                strippedReferenceValue == "" &&
                stringEntryObjectValue != undefined &&
                stringEntryObjectValue != ""
            ) {
                return false;
            }

            // property may not match
            if (stringEntryObjectValue == strippedReferenceValue) {
                return false;
            }
        } else {
            if (explicitEmptyValue == false) {
                // property must exist but be anything
                if (
                    referenceValue == "" &&
                    (stringEntryObjectValue == undefined ||
                        stringEntryObjectValue == "")
                ) {
                    return false;
                } else if (referenceValue == "") {
                    continue reference_entry_loop;
                }
            }

            // property must match
            if (stringEntryObjectValue != referenceValue) {
                return false;
            }
        }
    }
    return true;
}

export function collectObjectValuesForKey<T>(
    key: string,
    converter: (object: T) => StringEntryObject,
    objects: T[],
): string[] {
    const values: Set<string> = new Set();

    for (const object of objects) {
        const stringEntryObject: StringEntryObject = converter(object);
        const stringEntryObjectValue: Stringifiable | undefined =
            stringEntryObject[key];
        if (stringEntryObjectValue == undefined) continue;

        values.add(stringEntryObjectValue.toString());
    }

    return [...values.values()];
}

export function filterObjectsByWords<T>(
    query: string,
    getStringsOfObject: (object: T) => string[],
    objects: T[],
): Set<T> {
    const matches: Set<T> = new Set();

    object_loop: for (const object of objects) {
        const doesMatch: boolean = checkDoesObjectMatchSearch(
            query,
            getStringsOfObject,
            object,
        );
        if (doesMatch) matches.add(object);
    }

    return matches;
}

export function checkDoesObjectMatchSearch<T>(
    query: string,
    getStringsOfObject: (object: T) => string[],
    object: T,
): boolean {
    if (query == "") return true;

    const stringsInObject: string[] = getStringsOfObject(object);
    const wordsInObject: string[] = [];
    for (const string of stringsInObject) {
        const lowercaseWordsInString = string
            .toString()
            .toLowerCase()
            .split(" ")
            .filter((word) => word != "");
        wordsInObject.push(...lowercaseWordsInString);
    }

    const lowercaseWordsInQuery = query
        .toLowerCase()
        .split(" ")
        .filter((word) => word != "");
    for (const queryWord of lowercaseWordsInQuery) {
        if (queryWord[0] == "-") {
            // exclusion
            const wordContent = queryWord.substring(1);
            if (wordsInObject.includes(wordContent)) {
                return false;
            }
        } else {
            if (wordsInObject.includes(queryWord) == false) {
                return false;
            }
        }
    }

    return true;
}

// handlers
export type Handler<T> = (item: T) => void;

export class HandlerManager<T> {
    handlers: Set<Handler<T>> = new Set();

    // manage
    addHandler = (handler: Handler<T>): void => {
        this.handlers.add(handler);
    };

    deleteHandler = (handler: Handler<T>): void => {
        this.handlers.delete(handler);
    };

    // trigger
    trigger = (item: T): void => {
        for (const handler of this.handlers) {
            handler(item);
        }
    };
}

// sorting
export class IndexManager<T> {
    private itemToString: (item: T) => string;

    sortedStrings: string[] = [];

    // methods
    update = (items: T[]): void => {
        this.sortedStrings = [];

        let strings: string[] = [];
        for (const item of items) {
            const string: string = this.itemToString(item);
            strings.push(string);
        }

        this.sortedStrings = strings.sort(localeCompare);
    };

    getIndex = (item: T): number => {
        const string: string = this.itemToString(item);
        const index: number = this.sortedStrings.indexOf(string);
        return index;
    };

    // init
    constructor(itemToString: (item: T) => string) {
        this.itemToString = itemToString;
    }
}

// storage
export function getLocalStorageItemAndClear(key: string): string | null {
    const value: string | null = localStorage.getItem(key);
    localStorage.removeItem(key);
    if (value != null) localStorage.setItem(`_${key}`, value);
    return value;
}

// string & parsing
export function stringify(data: any): string {
    return JSON.stringify(data, null, 4);
}

export function padZero(string: string | undefined, length: number): string {
    return (string ?? "").padStart(length, "0");
}

export function parse(string: string): any {
    try {
        return JSON.parse(string);
    } catch {
        return {};
    }
}

export function parseValidObject<T>(string: string, reference: T): T | null {
    const parsed: any = parse(string);
    if (checkIsValidObject(parsed) == false) return null;

    const doesMatchReference: boolean = checkMatchesObjectStructure(
        parsed,
        reference,
    );
    if (doesMatchReference == false) return null;

    return parsed;
}

export function parseOrFallback(inputString: string): any {
    try {
        return JSON.parse(inputString);
    } catch {
        return inputString;
    }
}

export function parseArray(inputString: string): any[] {
    const parsed: any = parseOrFallback(inputString);
    if (Array.isArray(parsed) == false) return [];
    return parsed;
}

// sort
export function localeCompare(a: string, b: string): number {
    return a.localeCompare(b);
}
