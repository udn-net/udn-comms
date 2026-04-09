(() => {
  // node_modules/bloatless-react/index.ts
  var State = class {
    _value;
    _bindings = /* @__PURE__ */ new Set();
    // init
    constructor(initialValue) {
      this._value = initialValue;
    }
    // value
    get value() {
      return this._value;
    }
    set value(newValue) {
      if (this._value == newValue) return;
      this._value = newValue;
      this.callSubscriptions();
    }
    // subscriptions
    callSubscriptions() {
      this._bindings.forEach((fn) => fn(this._value));
    }
    subscribe(fn) {
      this._bindings.add(fn);
      fn(this._value);
    }
    subscribeSilent(fn) {
      this._bindings.add(fn);
    }
    // stringify
    toString() {
      return JSON.stringify(this._value);
    }
  };
  var ListState = class extends State {
    additionHandlers = /* @__PURE__ */ new Set();
    removalHandlers = /* @__PURE__ */ new Map();
    // init
    constructor(initialItems) {
      super(new Set(initialItems));
    }
    // list
    add(...items) {
      items.forEach((item) => {
        this.value.add(item);
        this.additionHandlers.forEach((handler) => handler(item));
      });
      this.callSubscriptions();
    }
    remove(...items) {
      items.forEach((item) => {
        this.value.delete(item);
        if (!this.removalHandlers.has(item)) return;
        this.removalHandlers.get(item).forEach((handler) => handler(item));
        this.removalHandlers.delete(item);
      });
      this.callSubscriptions();
    }
    clear() {
      this.remove(...this.value.values());
    }
    // handlers
    handleAddition(handler) {
      this.additionHandlers.add(handler);
      [...this.value.values()].forEach(handler);
    }
    handleRemoval(item, handler) {
      if (!this.removalHandlers.has(item))
        this.removalHandlers.set(item, /* @__PURE__ */ new Set());
      this.removalHandlers.get(item).add(handler);
    }
    // stringification
    toString() {
      const array = [...this.value.values()];
      const json = JSON.stringify(array);
      return json;
    }
  };
  var MapState = class extends State {
    additionHandlers = /* @__PURE__ */ new Set();
    removalHandlers = /* @__PURE__ */ new Map();
    // init
    constructor(initialItems) {
      super(new Map(initialItems));
    }
    // list
    set(key, item) {
      this.remove(key);
      this.value.set(key, item);
      this.additionHandlers.forEach((handler) => handler(item));
      this.callSubscriptions();
    }
    remove(key) {
      const item = this.value.get(key);
      if (!item) return;
      this.value.delete(key);
      this.callSubscriptions();
      if (!this.removalHandlers.has(item)) return;
      this.removalHandlers.get(item).forEach((handler) => handler(item));
      this.removalHandlers.delete(item);
    }
    clear() {
      [...this.value.keys()].forEach((key) => this.remove(key));
    }
    // handlers
    handleAddition(handler) {
      this.additionHandlers.add(handler);
      [...this.value.values()].forEach(handler);
    }
    handleRemoval(item, handler) {
      if (!this.removalHandlers.has(item))
        this.removalHandlers.set(item, /* @__PURE__ */ new Set());
      this.removalHandlers.get(item).add(handler);
    }
    // stringification
    toString() {
      const array = [...this.value.entries()];
      const json = JSON.stringify(array);
      return json;
    }
  };
  function createProxyState(statesToSubscibe, fn) {
    const proxyState = new State(fn());
    statesToSubscibe.forEach(
      (state) => state.subscribe(() => proxyState.value = fn())
    );
    return proxyState;
  }
  function bulkSubscribe(statesToSubscibe, fn) {
    statesToSubscibe.forEach((state) => state.subscribeSilent(fn));
  }
  function createElement(tagName, attributes = {}, ...children) {
    const element = document.createElement(tagName);
    if (attributes != null)
      Object.entries(attributes).forEach((entry) => {
        const [attributename, value] = entry;
        const [directiveKey, directiveValue] = attributename.split(":");
        switch (directiveKey) {
          case "on": {
            switch (directiveValue) {
              case "enter": {
                element.addEventListener("keydown", (e) => {
                  if (e.key != "Enter") return;
                  value(e);
                });
                break;
              }
              default: {
                element.addEventListener(directiveValue, value);
              }
            }
            break;
          }
          case "keystroke": {
            element.addEventListener("keydown", (e) => {
              if (e.metaKey == false && e.ctrlKey == false) return;
              if (e.key != directiveValue) return;
              value(e);
            });
            break;
          }
          case "subscribe": {
            const state = value;
            state.subscribe(
              (newValue) => element[directiveValue] = newValue
            );
            break;
          }
          case "bind": {
            const state = value;
            state.subscribe(
              (newValue) => element[directiveValue] = newValue
            );
            element.addEventListener(
              "input",
              () => state.value = element[directiveValue]
            );
            break;
          }
          case "toggle": {
            if (value.subscribe) {
              const state = value;
              state.subscribe(
                (newValue) => element.toggleAttribute(directiveValue, newValue)
              );
            } else {
              element.toggleAttribute(directiveValue, value);
            }
            break;
          }
          case "set": {
            const state = value;
            state.subscribe(
              (newValue) => element.setAttribute(directiveValue, newValue)
            );
            break;
          }
          case "children": {
            switch (directiveValue) {
              case "set": {
                const state = value;
                state.subscribe((newValue) => {
                  element.innerHTML = "";
                  element.append(...[newValue].flat());
                });
                break;
              }
              case "append":
              case "prepend": {
                try {
                  const [listState, toElement] = value;
                  listState.handleAddition((newItem) => {
                    const child = toElement(newItem);
                    listState.handleRemoval(
                      newItem,
                      () => child.remove()
                    );
                    if (directiveValue == "append") {
                      element.append(child);
                    } else if (directiveValue == "prepend") {
                      element.prepend(child);
                    }
                  });
                } catch (error) {
                  console.error(error);
                  throw `error: cannot process subscribe:children directive. 
 Usage: "children:append={[list, converter]}"; you can find a more detailed example in the documentation.`;
                }
              }
            }
            break;
          }
          default:
            element.setAttribute(attributename, value);
        }
      });
    children.filter((x) => x).forEach((child) => element.append(child));
    return element;
  }

  // src/Model/Utility/typeSafety.ts
  var DATA_VERSION = "v2";
  function checkIsValidObject(object) {
    return object.dataVersion == DATA_VERSION;
  }
  function checkMatchesObjectStructure(objectToCheck, reference) {
    if (typeof reference != "object") {
      return typeof objectToCheck == typeof reference;
    }
    for (const key of Object.keys(reference)) {
      const requiredType = typeof reference[key];
      const actualType = typeof objectToCheck[key];
      if (requiredType != actualType) return false;
      if (Array.isArray(reference[key]) || reference[key] instanceof Set) {
        if (objectToCheck[key].length == 0) continue;
        if (objectToCheck[key].size == 0) continue;
        const [firstOfObjectToCheck] = objectToCheck[key];
        const [fisrtOfReference] = reference[key];
        const doesFirstItemMatch = checkMatchesObjectStructure(
          firstOfObjectToCheck,
          fisrtOfReference
        );
        if (doesFirstItemMatch == false) return false;
      } else if (requiredType == "object") {
        const doesNestedObjectMatch = checkMatchesObjectStructure(
          objectToCheck[key],
          reference[key]
        );
        if (doesNestedObjectMatch == false) return false;
      }
    }
    return true;
  }

  // src/Model/Utility/utility.ts
  function generateRandomToken(length) {
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    const string = array.join("");
    return string.substring(0, length);
  }
  function createTimestamp() {
    return (/* @__PURE__ */ new Date()).toISOString();
  }
  function checkDoesObjectMatchReference(reference, stringEntryObject, explicitEmptyValue = false) {
    reference_entry_loop: for (const referenceEntry of Object.entries(
      reference
    )) {
      const [referenceKey, referenceValue] = referenceEntry;
      const stringEntryObjectValue = stringEntryObject[referenceKey];
      if (referenceValue == void 0) return false;
      if (referenceValue[0] == "-") {
        const strippedReferenceValue = referenceValue.toString().substring(1);
        if (strippedReferenceValue == "" && stringEntryObjectValue != void 0 && stringEntryObjectValue != "") {
          return false;
        }
        if (stringEntryObjectValue == strippedReferenceValue) {
          return false;
        }
      } else {
        if (explicitEmptyValue == false) {
          if (referenceValue == "" && (stringEntryObjectValue == void 0 || stringEntryObjectValue == "")) {
            return false;
          } else if (referenceValue == "") {
            continue reference_entry_loop;
          }
        }
        if (stringEntryObjectValue != referenceValue) {
          return false;
        }
      }
    }
    return true;
  }
  function collectObjectValuesForKey(key, converter, objects) {
    const values = /* @__PURE__ */ new Set();
    for (const object of objects) {
      const stringEntryObject = converter(object);
      const stringEntryObjectValue = stringEntryObject[key];
      if (stringEntryObjectValue == void 0) continue;
      values.add(stringEntryObjectValue.toString());
    }
    return [...values.values()];
  }
  function checkDoesObjectMatchSearch(query, getStringsOfObject, object) {
    if (query == "") return true;
    const stringsInObject = getStringsOfObject(object);
    const wordsInObject = [];
    for (const string of stringsInObject) {
      const lowercaseWordsInString = string.toString().toLowerCase().split(" ").filter((word) => word != "");
      wordsInObject.push(...lowercaseWordsInString);
    }
    const lowercaseWordsInQuery = query.toLowerCase().split(" ").filter((word) => word != "");
    for (const queryWord of lowercaseWordsInQuery) {
      if (queryWord[0] == "-") {
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
  var HandlerManager = class {
    constructor() {
      this.handlers = /* @__PURE__ */ new Set();
      // manage
      this.addHandler = (handler) => {
        this.handlers.add(handler);
      };
      this.deleteHandler = (handler) => {
        this.handlers.delete(handler);
      };
      // trigger
      this.trigger = (item) => {
        for (const handler of this.handlers) {
          handler(item);
        }
      };
    }
  };
  var IndexManager = class {
    // init
    constructor(itemToString) {
      this.sortedStrings = [];
      // methods
      this.update = (items) => {
        this.sortedStrings = [];
        let strings = [];
        for (const item of items) {
          const string = this.itemToString(item);
          strings.push(string);
        }
        this.sortedStrings = strings.sort(localeCompare);
      };
      this.getIndex = (item) => {
        const string = this.itemToString(item);
        const index = this.sortedStrings.indexOf(string);
        return index;
      };
      this.itemToString = itemToString;
    }
  };
  function getLocalStorageItemAndClear(key) {
    const value = localStorage.getItem(key);
    localStorage.removeItem(key);
    if (value != null) localStorage.setItem(`_${key}`, value);
    return value;
  }
  function stringify(data) {
    return JSON.stringify(data, null, 4);
  }
  function padZero(string, length) {
    return (string ?? "").padStart(length, "0");
  }
  function parse(string) {
    try {
      return JSON.parse(string);
    } catch {
      return {};
    }
  }
  function parseValidObject(string, reference) {
    const parsed = parse(string);
    if (checkIsValidObject(parsed) == false) return null;
    const doesMatchReference = checkMatchesObjectStructure(
      parsed,
      reference
    );
    if (doesMatchReference == false) return null;
    return parsed;
  }
  function parseOrFallback(inputString) {
    try {
      return JSON.parse(inputString);
    } catch {
      return inputString;
    }
  }
  function parseArray(inputString) {
    const parsed = parseOrFallback(inputString);
    if (Array.isArray(parsed) == false) return [];
    return parsed;
  }
  function localeCompare(a, b) {
    return a.localeCompare(b);
  }

  // src/Model/Global/storageModel.ts
  var PATH_COMPONENT_SEPARATOR = "\\";
  var StorageModel = class _StorageModel {
    // init
    constructor() {
      this.storageEntryTree = {};
      // read
      this.read = (pathComponents) => {
        const pathString = _StorageModel.pathComponentsToString(
          ...pathComponents
        );
        return localStorage.getItem(pathString);
      };
      this.list = (pathComponents) => {
        let currentParent = this.storageEntryTree;
        for (const component of pathComponents) {
          const nextParent = currentParent[component];
          if (nextParent == void 0) return [];
          currentParent = nextParent;
        }
        return [...Object.keys(currentParent).sort(localeCompare)];
      };
      // write
      this.write = (pathComponents, value) => {
        const pathString = _StorageModel.pathComponentsToString(
          ...pathComponents
        );
        localStorage.setItem(pathString, value);
        this.updateTree(...pathComponents);
      };
      this.remove = (pathComponents, shouldInitialize = true) => {
        const pathString = _StorageModel.pathComponentsToString(
          ...pathComponents
        );
        localStorage.removeItem(pathString);
        if (shouldInitialize == true) {
          this.initializeTree();
        }
      };
      this.rename = (sourcePathComponents, destinationPathComponents, shouldInitialize = true) => {
        const content = this.read(sourcePathComponents);
        if (content == null) return false;
        this.write(destinationPathComponents, content);
        this.remove(sourcePathComponents);
        if (shouldInitialize == true) {
          this.initializeTree();
        }
        return true;
      };
      // recursion
      this.recurse = (rootDirectory, fn) => {
        loop_over_files: for (const key of Object.keys(localStorage)) {
          const pathComponentsOfCurrentEntity = _StorageModel.stringToPathComponents(key);
          loop_over_path_components: for (let i = 0; i < rootDirectory.length; i++) {
            if (!pathComponentsOfCurrentEntity[i]) continue loop_over_files;
            if (pathComponentsOfCurrentEntity[i] != rootDirectory[i])
              continue loop_over_files;
          }
          fn(pathComponentsOfCurrentEntity);
        }
        this.initializeTree();
      };
      this.removeRecursively = (pathComponents) => {
        this.recurse(
          pathComponents,
          (path) => this.remove(path, false)
        );
        this.initializeTree();
      };
      this.renameRecursively = (sourcePathComponents, destinationPathComponents) => {
        this.recurse(sourcePathComponents, (path) => {
          const relativePathOfCurrentEntity = path.slice(
            sourcePathComponents.length
          );
          const destinationPathComponentsOfCurrentEntity = [
            ...destinationPathComponents,
            ...relativePathOfCurrentEntity
          ];
          this.rename(path, destinationPathComponentsOfCurrentEntity, false);
        });
        this.initializeTree();
      };
      // stringifiable
      this.writeStringifiable = (pathComponents, value) => {
        const valueString = stringify(value);
        this.write(pathComponents, valueString);
      };
      this.readStringifiable = (pathComponents, reference) => {
        const valueString = this.read(pathComponents);
        if (!valueString) return null;
        const object = parseValidObject(valueString, reference);
        if (object == null) return null;
        return object;
      };
      // cleaning
      this.removeJunk = () => {
        this.recurse([], (path) => {
          if (path[0] == DATA_VERSION) return;
          this.remove(path);
        });
      };
      // tree
      this.initializeTree = () => {
        console.log("initializing tree");
        this.storageEntryTree = {};
        for (const key of Object.keys(localStorage)) {
          const components = _StorageModel.stringToPathComponents(key);
          this.updateTree(...components);
        }
      };
      this.updateTree = (...pathComponents) => {
        let currentParent = this.storageEntryTree;
        for (const pathPart of pathComponents) {
          if (!currentParent[pathPart]) {
            currentParent[pathPart] = {};
          }
          currentParent = currentParent[pathPart];
        }
      };
      this.printTree = () => {
        return stringify(this.storageEntryTree);
      };
      this.initializeTree();
    }
    static {
      // utility
      this.getFileName = (pathComponents) => {
        return pathComponents[pathComponents.length - 1] || "\\";
      };
    }
    static {
      this.getFileNameFromString = (pathString) => {
        const pathComponents = this.stringToPathComponents(pathString);
        return pathComponents[pathComponents.length - 1] || "\\";
      };
    }
    static {
      this.pathComponentsToString = (...pathComponents) => {
        return pathComponents.filter((x) => x != "").join(PATH_COMPONENT_SEPARATOR);
      };
    }
    static {
      this.stringToPathComponents = (string) => {
        return string.split(PATH_COMPONENT_SEPARATOR).filter((x) => x != "");
      };
    }
    static {
      this.join = (...items) => {
        let allComponents = [];
        for (const item of items) {
          const parts = this.stringToPathComponents(item);
          allComponents.push(...parts);
        }
        return _StorageModel.pathComponentsToString(...allComponents);
      };
    }
    static getPath(locationName, filePath) {
      return [DATA_VERSION, locationName, ...filePath];
    }
  };
  var filePaths = {
    connectionModel: {
      socketAddress: ["socket-address"],
      reconnectAddress: ["reconnect-address"],
      outbox: ["outbox"],
      mailboxes: ["mailboxes"],
      previousAddresses: ["previous-addresses"]
    },
    chat: {
      base: [],
      chatBase: (id) => [id],
      info: (id) => [...filePaths.chat.chatBase(id), "info"],
      color: (id) => [...filePaths.chat.chatBase(id), "color"],
      messages: (id) => [...filePaths.chat.chatBase(id), "messages"],
      reactions: (id) => [
        ...filePaths.chat.chatBase(id),
        "reactions"
      ],
      lastUsedPage: (id) => [
        ...filePaths.chat.chatBase(id),
        "last-used-page"
      ],
      files: (id) => [...filePaths.chat.chatBase(id), "files"]
    },
    notificationModel: {
      base: []
    },
    settingsModel: {
      username: ["user-name"],
      firstDayOfWeek: ["first-day-of-week"],
      language: ["language"],
      theme: ["theme"]
    }
  };

  // src/Model/Files/calendarModel.ts
  var CalendarModel = class _CalendarModel {
    // init
    constructor(storageModel2, settingsModel2, fileModel) {
      // paths
      this.getBasePath = () => {
        return this.fileModel.getModelContainerPath(
          "calendar" /* ModelCalendar */
        );
      };
      this.getViewPath = () => {
        return [...this.getBasePath(), "view" /* ModelView */];
      };
      this.getMonthContainerPath = () => {
        return [...this.getBasePath(), "months" /* Months */];
      };
      this.getMonthPath = (monthString) => {
        return [...this.getMonthContainerPath(), monthString];
      };
      // main
      this.storeTaskReference = (taskFileContent) => {
        if (taskFileContent.date == void 0) return;
        const monthString = _CalendarModel.isoToMonthString(
          taskFileContent.date
        );
        const monthPath = this.getMonthPath(monthString);
        const referencePath = [...monthPath, taskFileContent.fileId];
        this.storageModel.write(referencePath, "");
      };
      this.deleteTaskReference = (monthString, taskId) => {
        const monthPath = this.getMonthPath(monthString);
        const referencePath = [...monthPath, taskId];
        this.storageModel.write(referencePath, "");
      };
      this.listTaskIds = (monthString) => {
        const monthPath = this.getMonthPath(monthString);
        return this.storageModel.list(monthPath);
      };
      this.generateMonthGrid = (year, month, defaultValueCreator) => {
        const date = /* @__PURE__ */ new Date();
        const isCurrentMonth = year == date.getFullYear() && month == date.getMonth() + 1;
        date.setDate(1);
        date.setMonth(month - 1);
        date.setFullYear(year);
        const firstWeekdayOfMonth = date.getDay();
        const firstDayOfWeekSetting = parseInt(
          this.settingsModel.firstDayOfWeek
        );
        const offset = firstWeekdayOfMonth < firstDayOfWeekSetting ? 7 - firstDayOfWeekSetting : firstWeekdayOfMonth - firstDayOfWeekSetting;
        date.setMonth(month);
        date.setDate(-1);
        const daysInMonth = date.getDate() + 1;
        const grid = {
          offset,
          firstDayOfWeek: parseInt(this.settingsModel.firstDayOfWeek),
          isCurrentMonth,
          year,
          month,
          days: {}
        };
        for (let i = 0; i < daysInMonth; i++) {
          const paddedDate = _CalendarModel.padDateOrMonth(
            (i + 1).toString()
          );
          grid.days[paddedDate] = defaultValueCreator();
        }
        return grid;
      };
      this.storageModel = storageModel2;
      this.settingsModel = settingsModel2;
      this.fileModel = fileModel;
    }
    static {
      // utility
      this.isoToMonthString = (dateISOString) => {
        const [year, month, _] = dateISOString.split("-");
        return _CalendarModel.getMonthString(year, month);
      };
    }
    static {
      this.isoToDateString = (dateISOString) => {
        const [year, month, date, _] = dateISOString.split("-");
        const paddedDate = _CalendarModel.padDateOrMonth(date ?? "");
        return paddedDate;
      };
    }
    static {
      this.getMonthString = (year = "", month = "") => {
        const paddedYear = year.padStart(4, "0");
        const paddedMonth = _CalendarModel.padDateOrMonth(month);
        return `${paddedYear}-${paddedMonth}`;
      };
    }
    static {
      this.getISODateString = (year, month, date) => {
        const monthString = _CalendarModel.getMonthString(year, month);
        const paddedDate = _CalendarModel.padDateOrMonth(date);
        return `${monthString}-${paddedDate}`;
      };
    }
    static {
      this.padDateOrMonth = (input) => {
        return input.padStart(2, "0");
      };
    }
  };

  // src/colors.ts
  var Colors = /* @__PURE__ */ ((Colors2) => {
    Colors2["Standard"] = "standard";
    Colors2["Coral"] = "coral";
    Colors2["Yellow"] = "yellow";
    Colors2["Green"] = "green";
    Colors2["LightBlue"] = "lightblue";
    Colors2["Blue"] = "blue";
    Colors2["purple"] = "purple";
    return Colors2;
  })(Colors || {});

  // node_modules/uuid/dist/esm-browser/stringify.js
  var byteToHex = [];
  for (i = 0; i < 256; ++i) {
    byteToHex.push((i + 256).toString(16).slice(1));
  }
  var i;
  function unsafeStringify(arr, offset = 0) {
    return (byteToHex[arr[offset + 0]] + byteToHex[arr[offset + 1]] + byteToHex[arr[offset + 2]] + byteToHex[arr[offset + 3]] + "-" + byteToHex[arr[offset + 4]] + byteToHex[arr[offset + 5]] + "-" + byteToHex[arr[offset + 6]] + byteToHex[arr[offset + 7]] + "-" + byteToHex[arr[offset + 8]] + byteToHex[arr[offset + 9]] + "-" + byteToHex[arr[offset + 10]] + byteToHex[arr[offset + 11]] + byteToHex[arr[offset + 12]] + byteToHex[arr[offset + 13]] + byteToHex[arr[offset + 14]] + byteToHex[arr[offset + 15]]).toLowerCase();
  }

  // node_modules/uuid/dist/esm-browser/rng.js
  var getRandomValues;
  var rnds8 = new Uint8Array(16);
  function rng() {
    if (!getRandomValues) {
      getRandomValues = typeof crypto !== "undefined" && crypto.getRandomValues && crypto.getRandomValues.bind(crypto);
      if (!getRandomValues) {
        throw new Error("crypto.getRandomValues() not supported. See https://github.com/uuidjs/uuid#getrandomvalues-not-supported");
      }
    }
    return getRandomValues(rnds8);
  }

  // node_modules/uuid/dist/esm-browser/native.js
  var randomUUID = typeof crypto !== "undefined" && crypto.randomUUID && crypto.randomUUID.bind(crypto);
  var native_default = {
    randomUUID
  };

  // node_modules/uuid/dist/esm-browser/v4.js
  function v4(options, buf, offset) {
    if (native_default.randomUUID && !buf && !options) {
      return native_default.randomUUID();
    }
    options = options || {};
    var rnds = options.random || (options.rng || rng)();
    rnds[6] = rnds[6] & 15 | 64;
    rnds[8] = rnds[8] & 63 | 128;
    if (buf) {
      offset = offset || 0;
      for (var i = 0; i < 16; ++i) {
        buf[offset + i] = rnds[i];
      }
      return buf;
    }
    return unsafeStringify(rnds);
  }
  var v4_default = v4;

  // src/Model/Files/boardsAndTasksModel.ts
  var BoardsAndTasksModel = class _BoardsAndTasksModel {
    // init
    constructor(storageModel2, settingsModel2, chatModel, fileModel) {
      // data
      this.boardHandlerManager = new HandlerManager();
      this.taskHandlerManager = new HandlerManager();
      // paths
      this.getBasePath = () => {
        return this.fileModel.getModelContainerPath("tasks" /* ModelTask */);
      };
      this.getViewPath = () => {
        return [...this.getBasePath(), "view" /* ModelView */];
      };
      this.getBoardFilePath = (boardId) => {
        return [...this.fileModel.getFilePath(boardId)];
      };
      this.getTaskFilePath = (taskId) => {
        return [...this.fileModel.getFilePath(taskId)];
      };
      this.getBoardContainerPath = () => {
        return [...this.getBasePath(), "boards" /* Boards */];
      };
      this.getBoardDirectoryPath = (boardId) => {
        return [...this.getBoardContainerPath(), boardId];
      };
      this.getTaskContainerPath = (boardId) => {
        return [
          ...this.getBoardDirectoryPath(boardId),
          "tasks" /* BoardTasks */
        ];
      };
      this.getTaskReferencePath = (boardId, fileId) => {
        return [...this.getTaskContainerPath(boardId), fileId];
      };
      // handlers
      this.handleFileContent = (fileContent) => {
        if (checkMatchesObjectStructure(
          fileContent,
          BoardInfoFileContentReference
        ) == true) {
          this.handleBoard(fileContent);
        } else if (checkMatchesObjectStructure(
          fileContent,
          TaskFileContentReference
        ) == true) {
          this.handleTask(fileContent);
        }
      };
      this.handleBoard = (boardInfoFileContent) => {
        this.updateBoard(boardInfoFileContent);
      };
      this.handleTask = (taskFileContent) => {
        this.updateTask(taskFileContent);
      };
      // boards
      this.createBoard = (name) => {
        const boardInfoFileContent = _BoardsAndTasksModel.createBoardInfoFileContent(
          v4_default(),
          name,
          "standard" /* Standard */
        );
        return boardInfoFileContent;
      };
      this.updateBoard = (boardInfoFileContent) => {
        this.storeBoard(boardInfoFileContent);
        this.boardHandlerManager.trigger(boardInfoFileContent);
      };
      this.updateBoardAndSend = (boardInfoFileContent) => {
        this.updateBoard(boardInfoFileContent);
        this.chatModel.sendMessage("", boardInfoFileContent);
      };
      this.storeBoard = (boardInfoFileContent) => {
        this.fileModel.storeFileContent(boardInfoFileContent);
        const boardDirectoryPath = this.getBoardDirectoryPath(
          boardInfoFileContent.fileId
        );
        this.storageModel.write(boardDirectoryPath, "");
      };
      this.deleteBoard = (boardId) => {
        const boardFilePath = this.getBoardFilePath(boardId);
        const boardDirectoryPath = this.getBoardDirectoryPath(boardId);
        this.storageModel.removeRecursively(boardFilePath);
        this.storageModel.removeRecursively(boardDirectoryPath);
      };
      this.listBoardIds = () => {
        const boardContainerPath = this.getBoardContainerPath();
        const boardIds = this.storageModel.list(boardContainerPath);
        return boardIds;
      };
      this.getBoardInfo = (fileId) => {
        const boardInfoFileContentOrNull = this.fileModel.getLatestFileContent(
          fileId,
          BoardInfoFileContentReference
        );
        return boardInfoFileContentOrNull;
      };
      this.getBoardName = (boardId) => {
        const boardInfo = this.getBoardInfo(boardId);
        if (boardInfo == null) return "";
        return boardInfo.name;
      };
      //tasks
      this.createTask = (boardId) => {
        const taskFileContent = _BoardsAndTasksModel.createTaskFileContent(v4_default(), "", boardId);
        return taskFileContent;
      };
      this.updateTask = (taskFileContent) => {
        this.storeTask(taskFileContent);
        this.taskHandlerManager.trigger(taskFileContent);
      };
      this.updateTaskAndSend = (taskFileContent) => {
        this.updateTask(taskFileContent);
        this.chatModel.sendMessage("", taskFileContent);
      };
      this.storeTask = (taskFileContent) => {
        this.fileModel.storeFileContent(taskFileContent);
        const taskReferencePath = this.getTaskReferencePath(
          taskFileContent.boardId,
          taskFileContent.fileId
        );
        this.storageModel.write(taskReferencePath, "");
        this.calendarModel.storeTaskReference(taskFileContent);
      };
      this.listTaskIds = (boardId) => {
        const taskContainerPath = this.getTaskContainerPath(boardId);
        const fileIds = this.storageModel.list(taskContainerPath);
        return fileIds;
      };
      this.listTaskVersionIds = (taskId) => {
        const versionIds = this.fileModel.listFileContentIds(taskId);
        return versionIds;
      };
      this.getLatestTaskFileContent = (taskId) => {
        const taskFileContentOrNull = this.fileModel.getLatestFileContent(
          taskId,
          TaskFileContentReference
        );
        return taskFileContentOrNull;
      };
      this.getSpecificTaskFileContent = (taskId, versionId) => {
        const taskFileContentOrNull = this.fileModel.getFileContent(
          taskId,
          versionId,
          TaskFileContentReference
        );
        return taskFileContentOrNull;
      };
      this.deleteTask = (boardId, taskId) => {
        const taskFilePath = this.getTaskFilePath(taskId);
        this.storageModel.removeRecursively(taskFilePath);
        this.deleteTaskReference(boardId, taskId);
      };
      this.deleteTaskReference = (boardId, taskId) => {
        const taskReferencePath = this.getTaskReferencePath(
          boardId,
          taskId
        );
        this.storageModel.removeRecursively(taskReferencePath);
      };
      this.storageModel = storageModel2;
      this.settingsModel = settingsModel2;
      this.chatModel = chatModel;
      this.fileModel = fileModel;
      this.calendarModel = new CalendarModel(
        this.storageModel,
        this.settingsModel,
        this.fileModel
      );
    }
    static {
      // utility
      this.createBoardInfoFileContent = (fileId, name, color) => {
        const fileContent = FileModel2.createFileContent(fileId, "board-info");
        return {
          ...fileContent,
          name,
          color
        };
      };
    }
    static {
      this.createTaskFileContent = (fileId, name, boardId) => {
        const fileContent = FileModel2.createFileContent(
          fileId,
          "task"
        );
        return {
          ...fileContent,
          name,
          boardId
        };
      };
    }
  };
  var BoardInfoFileContentReference = {
    dataVersion: DATA_VERSION,
    fileId: "string",
    fileContentId: "",
    creationDate: "",
    type: "board-info",
    name: "",
    color: ""
  };
  var TaskFileContentReference = {
    dataVersion: DATA_VERSION,
    fileId: "string",
    fileContentId: "",
    creationDate: "",
    type: "task",
    name: "",
    boardId: ""
  };

  // src/Model/Files/fileModel.ts
  var FileModel2 = class _FileModel {
    // init
    constructor(storageModel2, settingsModel2, chatModel) {
      // paths
      this.getBasePath = () => {
        return StorageModel.getPath(
          "chat" /* Chat */,
          filePaths.chat.files(this.chatModel.id)
        );
      };
      this.getFileContainerPath = () => {
        return [...this.getBasePath(), "data" /* Data */];
      };
      this.getModelContainerPath = (modelName) => {
        return [...this.getBasePath(), "model" /* Model */, modelName];
      };
      this.getFilePath = (fileId) => {
        return [...this.getFileContainerPath(), fileId];
      };
      this.getFileContentPath = (fileId, fileContentId) => {
        const filePath = this.getFilePath(fileId);
        return [...filePath, fileContentId];
      };
      // handlers
      this.handleStringifiedFileContent = (stringifiedFileContent) => {
        const fileContent = parseValidObject(
          stringifiedFileContent,
          FileContentReference
        );
        if (fileContent == null) return;
        this.handleFileContent(fileContent);
      };
      this.handleFileContent = (fileContent) => {
        const didStore = this.storeFileContent(fileContent);
        if (didStore == false) return;
        this.boardsAndTasksModel.handleFileContent(fileContent);
        this.chatModel.handleReaction(fileContent);
      };
      // methods
      this.addFileContentAndSend = (fileContent) => {
        this.handleFileContent(fileContent);
        this.chatModel.sendMessage("", fileContent);
      };
      // storage
      this.storeFileContent = (fileContent) => {
        const fileContentPath = this.getFileContentPath(
          fileContent.fileId,
          fileContent.fileContentId
        );
        const existingFileContent = this.storageModel.read(fileContentPath);
        if (existingFileContent != null) return false;
        const stringifiedContent = stringify(fileContent);
        this.storageModel.write(fileContentPath, stringifiedContent);
        return true;
      };
      this.listFileIds = () => {
        return this.storageModel.list(this.getBasePath());
      };
      this.listFileContentIds = (fileId) => {
        const filePath = this.getFilePath(fileId);
        return this.storageModel.list(filePath);
      };
      this.selectLatestFileContentId = (fileContentIds) => {
        return fileContentIds[fileContentIds.length - 1];
      };
      this.getFileContent = (fileId, fileContentName, reference) => {
        const filePath = this.getFileContentPath(
          fileId,
          fileContentName
        );
        const fileContentOrNull = this.storageModel.readStringifiable(
          filePath,
          reference
        );
        return fileContentOrNull;
      };
      this.getLatestFileContent = (fileId, reference) => {
        const fileContentsIds = this.listFileContentIds(fileId);
        const latestFileContentId = this.selectLatestFileContentId(fileContentsIds);
        if (latestFileContentId == void 0) return null;
        const fileContent = this.getFileContent(
          fileId,
          latestFileContentId,
          reference
        );
        return fileContent;
      };
      this.chatModel = chatModel;
      this.settingsModel = settingsModel2;
      this.storageModel = storageModel2;
      this.boardsAndTasksModel = new BoardsAndTasksModel(
        this.storageModel,
        this.settingsModel,
        chatModel,
        this
      );
    }
    static {
      // utility
      this.generateFileContentId = (creationDate) => {
        return creationDate + v4_default();
      };
    }
    static {
      this.createFileContent = (fileId, type) => {
        const creationDate = createTimestamp();
        const fileContentId = _FileModel.generateFileContentId(creationDate);
        return {
          dataVersion: DATA_VERSION,
          fileId,
          fileContentId,
          creationDate,
          type
        };
      };
    }
  };
  var FileContentReference = {
    dataVersion: DATA_VERSION,
    fileId: "",
    fileContentId: "",
    creationDate: "",
    type: ""
  };

  // src/Model/Utility/crypto.ts
  var IV_SIZE = 12;
  var ENCRYPTION_ALG = "AES-GCM";
  async function encryptString(plaintext, passphrase) {
    if (!window.crypto.subtle) return plaintext;
    const iv = generateIV();
    const key = await importKey(passphrase, "encrypt");
    const encryptedArray = await encrypt(iv, key, plaintext);
    const encryptionData = {
      iv: uInt8ToArray(iv),
      encryptedArray: uInt8ToArray(encryptedArray)
    };
    return btoa(JSON.stringify(encryptionData));
  }
  async function decryptString(cyphertext, passphrase) {
    try {
      const encrypionData = JSON.parse(atob(cyphertext));
      const iv = arrayToUint8(encrypionData.iv);
      const encryptedArray = arrayToUint8(encrypionData.encryptedArray);
      const key = await importKey(passphrase, "decrypt");
      return await decrypt(iv, key, encryptedArray);
    } catch {
      return cyphertext;
    }
  }
  function encode(string) {
    return new TextEncoder().encode(string);
  }
  function decode(array) {
    return new TextDecoder("utf-8").decode(array);
  }
  async function encrypt(iv, key, message) {
    const arrayBuffer = await window.crypto.subtle.encrypt(
      { name: ENCRYPTION_ALG, iv },
      key,
      encode(message)
    );
    return new Uint8Array(arrayBuffer);
  }
  async function decrypt(iv, key, cyphertext) {
    const arrayBuffer = await crypto.subtle.decrypt(
      { name: ENCRYPTION_ALG, iv },
      key,
      cyphertext
    );
    return arrayBufferToString(arrayBuffer);
  }
  async function hash(encoded) {
    return await crypto.subtle.digest("SHA-256", encoded);
  }
  function generateIV() {
    return crypto.getRandomValues(new Uint8Array(IV_SIZE));
  }
  async function importKey(passphrase, purpose) {
    return await crypto.subtle.importKey(
      "raw",
      await hash(encode(passphrase)),
      { name: ENCRYPTION_ALG },
      false,
      [purpose]
    );
  }
  function arrayBufferToString(arrayBuffer) {
    const uInt8Array = new Uint8Array(arrayBuffer);
    return decode(uInt8Array);
  }
  function uInt8ToArray(uInt8Array) {
    return Array.from(uInt8Array);
  }
  function arrayToUint8(array) {
    return new Uint8Array(array);
  }

  // src/Model/Chat/chatModel.ts
  var ChatModel = class _ChatModel {
    // init
    constructor(storageModel2, connectionModel2, settingsModel2, chatListModel2, chatId) {
      this.chatMessageHandlerManager = new HandlerManager();
      this.reactionHandlerManager = new HandlerManager();
      // paths
      this.getBasePath = () => {
        return StorageModel.getPath(
          "chat" /* Chat */,
          filePaths.chat.chatBase(this.id)
        );
      };
      this.getInfoPath = () => {
        return StorageModel.getPath(
          "chat" /* Chat */,
          filePaths.chat.info(this.id)
        );
      };
      this.getColorPath = () => {
        return StorageModel.getPath(
          "chat" /* Chat */,
          filePaths.chat.color(this.id)
        );
      };
      this.getMessageDirPath = () => {
        return StorageModel.getPath(
          "chat" /* Chat */,
          filePaths.chat.messages(this.id)
        );
      };
      this.getMessagePath = (id) => {
        return [...this.getMessageDirPath(), id];
      };
      this.getReactionDirPath = () => {
        return StorageModel.getPath(
          "chat" /* Chat */,
          filePaths.chat.reactions(this.id)
        );
      };
      this.getReactionPath = (id) => {
        return [...this.getReactionDirPath(), id];
      };
      // handlers
      this.handleMessage = (body) => {
        const chatMessage = parseValidObject(
          body,
          ChatMessageReference
        );
        if (chatMessage == null) return;
        chatMessage.status = "received" /* Received */;
        this.addMessage(chatMessage);
        this.setReadStatus(true);
      };
      this.handleReaction = (reaction) => {
        if (!checkMatchesObjectStructure(reaction, ChatMessageReactionReference))
          return;
        const reactionPath = this.getReactionPath(reaction.fileId);
        if (reaction.isDeleting == true) {
          this.storageModel.remove(reactionPath);
        } else {
          this.storageModel.writeStringifiable(reactionPath, reaction);
        }
        this.reactionHandlerManager.trigger(reaction);
      };
      this.handleMessageSent = (chatMessage) => {
        chatMessage.status = "sent" /* Sent */;
        this.addMessage(chatMessage);
      };
      // settings
      this.setPrimaryChannel = (primaryChannel) => {
        this.info.primaryChannel = primaryChannel;
        this.storeInfo();
        this.subscribe();
      };
      this.setSecondaryChannels = (secondaryChannels) => {
        this.info.secondaryChannels = secondaryChannels;
        this.storeInfo();
      };
      this.setEncryptionKey = (key) => {
        this.info.encryptionKey = key;
        this.storeInfo();
      };
      this.setColor = (color) => {
        this.color = color;
        this.storeColor();
      };
      // messaging
      this.addMessage = async (chatMessage) => {
        await this.decryptMessage(chatMessage);
        if (chatMessage.body != "") {
          const messagePath = this.getMessagePath(chatMessage.id);
          this.storageModel.writeStringifiable(messagePath, chatMessage);
          this.chatMessageHandlerManager.trigger(chatMessage);
        }
        this.fileModel.handleStringifiedFileContent(
          chatMessage.stringifiedFile
        );
      };
      this.getNameAndChannel = () => {
        const senderName = this.settingsModel.username;
        if (senderName == "") return false;
        const allChannels = [this.info.primaryChannel];
        for (const secondaryChannel of this.info.secondaryChannels) {
          allChannels.push(secondaryChannel);
        }
        const combinedChannel = allChannels.join("/");
        return [senderName, combinedChannel];
      };
      this.sendMessage = async (body, fileContent) => {
        const nameAndChannel = this.getNameAndChannel();
        if (nameAndChannel == false) return;
        const [senderName, combinedChannel] = nameAndChannel;
        const chatMessage = await _ChatModel.createChatMessage(
          combinedChannel,
          senderName,
          this.info.encryptionKey,
          body,
          fileContent
        );
        this.addMessage(chatMessage);
        this.connectionModel.sendMessageOrStore(chatMessage);
        return true;
      };
      this.decryptMessage = async (chatMessage) => {
        const decryptedBody = await decryptString(
          chatMessage.body,
          this.info.encryptionKey
        );
        const decryptedFile = await decryptString(
          chatMessage.stringifiedFile ?? "",
          this.info.encryptionKey
        );
        chatMessage.body = decryptedBody;
        chatMessage.stringifiedFile = decryptedFile;
      };
      this.sendReaction = async (messageId, content, isDeleting) => {
        const nameAndChannel = this.getNameAndChannel();
        if (nameAndChannel == false) return;
        const [senderName, combinedChannel] = nameAndChannel;
        const reaction = _ChatModel.createMessageReaction(
          messageId,
          senderName,
          content,
          isDeleting
        );
        this.sendMessage("", reaction);
        this.handleReaction(reaction);
      };
      this.subscribe = () => {
        this.connectionModel.addChannel(this.info.primaryChannel);
      };
      this.setReadStatus = (hasUnreadMessages) => {
        this.info.hasUnreadMessages = hasUnreadMessages;
        this.storeInfo();
      };
      // storage
      this.storeInfo = () => {
        this.storageModel.writeStringifiable(this.getInfoPath(), this.info);
      };
      this.storeColor = () => {
        this.storageModel.write(this.getColorPath(), this.color);
      };
      this.delete = () => {
        this.chatListModel.untrackChat(this);
        const dirPath = this.getBasePath();
        this.storageModel.removeRecursively(dirPath);
      };
      // load
      this.loadInfo = () => {
        const info = this.storageModel.readStringifiable(
          this.getInfoPath(),
          ChatInfoReference
        );
        if (info != null) {
          this.info = info;
        } else {
          this.info = _ChatModel.generateChatInfo("0");
        }
      };
      this.loadColor = () => {
        const path = this.getColorPath();
        const color = this.storageModel.read(path);
        if (!color) {
          this.color = "standard" /* Standard */;
        } else {
          this.color = color;
        }
      };
      this.id = chatId;
      this.connectionModel = connectionModel2;
      this.settingsModel = settingsModel2;
      this.storageModel = storageModel2;
      this.chatListModel = chatListModel2;
      this.loadInfo();
      this.loadColor();
      this.subscribe();
      this.fileModel = new FileModel2(
        this.storageModel,
        this.settingsModel,
        this
      );
    }
    get secondaryChannels() {
      return this.info.secondaryChannels.sort(localeCompare);
    }
    get messages() {
      const messageIds = this.storageModel.list(
        this.getMessageDirPath()
      );
      if (!Array.isArray(messageIds)) return [];
      const chatMessages = [];
      for (const messageId of messageIds) {
        const messagePath = this.getMessagePath(messageId);
        const chatMessage = this.storageModel.readStringifiable(
          messagePath,
          ChatMessageReference
        );
        if (chatMessage == null) continue;
        chatMessages.push(chatMessage);
      }
      const sorted = chatMessages.sort(
        (a, b) => a.dateSent.localeCompare(b.dateSent)
      );
      return sorted;
    }
    get reactions() {
      const reactionIds = this.storageModel.list(
        this.getReactionDirPath()
      );
      if (!Array.isArray(reactionIds)) return [];
      const reactions = [];
      for (const reactionId of reactionIds) {
        const reactionPath = this.getReactionPath(reactionId);
        const reaction = this.storageModel.readStringifiable(
          reactionPath,
          ChatMessageReactionReference
        );
        if (reaction == null) continue;
        reactions.push(reaction);
      }
      return reactions;
    }
    // utility
    static splitChannel(channelString) {
      return channelString.split("/");
    }
    static {
      this.generateChatInfo = (primaryChannel) => {
        return {
          dataVersion: DATA_VERSION,
          primaryChannel,
          secondaryChannels: [],
          encryptionKey: "",
          hasUnreadMessages: false
        };
      };
    }
    static {
      this.createChatMessage = async (channel, sender, encryptionKey, body, fileContent) => {
        const chatMessage = {
          dataVersion: DATA_VERSION,
          id: v4_default(),
          channel,
          sender,
          body,
          dateSent: createTimestamp(),
          status: "outbox" /* Outbox */,
          stringifiedFile: ""
        };
        if (fileContent != void 0) {
          const stringifiedFile = stringify(fileContent);
          chatMessage.stringifiedFile = stringifiedFile;
        }
        if (encryptionKey != "") {
          chatMessage.body = await encryptString(
            chatMessage.body,
            encryptionKey
          );
          chatMessage.stringifiedFile = await encryptString(
            chatMessage.stringifiedFile,
            encryptionKey
          );
        }
        return chatMessage;
      };
    }
    static {
      this.createMessageReaction = (messageId, sender, content, isDeleting) => {
        const fileContent = FileModel2.createFileContent(v4_default(), "reaction");
        const reaction = {
          ...fileContent,
          fileId: _ChatModel.createMessageReactionId(
            messageId,
            content,
            sender
          ),
          messageId,
          sender,
          content,
          isDeleting
        };
        return reaction;
      };
    }
    static {
      this.createMessageReactionId = (messageId, content, sender) => {
        return messageId + sender + reactionStringMap[content];
      };
    }
  };
  var ReactionSymbols = /* @__PURE__ */ ((ReactionSymbols2) => {
    ReactionSymbols2["ThumbsUp"] = "\u{1F44D}";
    ReactionSymbols2["Check"] = "\u2705";
    ReactionSymbols2["Stop"] = "\u{1F6D1}";
    ReactionSymbols2["Attention"] = "\u2757\uFE0F";
    ReactionSymbols2["DoubleAttention"] = "\u203C\uFE0F";
    ReactionSymbols2["Question"] = "\u2753";
    return ReactionSymbols2;
  })(ReactionSymbols || {});
  var reactionStringMap = {};
  Object.entries(ReactionSymbols).forEach((value) => {
    reactionStringMap[value[1]] = value[0];
  });
  var ChatInfoReference = {
    dataVersion: DATA_VERSION,
    primaryChannel: "",
    secondaryChannels: [""],
    encryptionKey: "",
    hasUnreadMessages: true
  };
  var ChatMessageReference = {
    dataVersion: DATA_VERSION,
    id: "",
    channel: "",
    sender: "",
    body: "",
    dateSent: "",
    status: "",
    stringifiedFile: ""
  };
  var ChatMessageReactionReference = {
    dataVersion: DATA_VERSION,
    fileId: "",
    fileContentId: "",
    creationDate: "",
    type: "reaction",
    messageId: "",
    sender: "",
    content: "",
    isDeleting: false
  };

  // src/Model/Chat/chatListModel.ts
  var ChatListModel = class {
    // init
    constructor(storageModel2, settingsModel2, connectionModel2) {
      // data
      this.chatModels = /* @__PURE__ */ new Set();
      // handlers
      this.messageHandler = (data) => {
        const channel = data.messageChannel;
        const body = data.messageBody;
        if (channel == void 0) return;
        if (body == void 0) return;
        this.routeMessageToCorrectChatModel(
          channel,
          (chatModel) => chatModel.handleMessage(body)
        );
      };
      this.messageSentHandler = (chatMessage) => {
        const channel = chatMessage.channel;
        this.routeMessageToCorrectChatModel(
          channel,
          (chatModel) => chatModel.handleMessageSent(chatMessage)
        );
      };
      // methods
      this.routeMessageToCorrectChatModel = (channel, fn) => {
        const allChannels = channel.split("/");
        for (const chatModel of this.chatModels) {
          for (const channel2 of allChannels) {
            if (channel2 != chatModel.info.primaryChannel) continue;
            fn(chatModel);
            break;
          }
        }
      };
      // storage
      this.addChatModel = (chatModel) => {
        this.chatModels.add(chatModel);
      };
      this.createChat = (primaryChannel) => {
        const id = v4_default();
        const chatModel = new ChatModel(
          this.storageModel,
          this.connectionModel,
          this.settingsModel,
          this,
          id
        );
        chatModel.setPrimaryChannel(primaryChannel);
        this.addChatModel(chatModel);
        return chatModel;
      };
      this.untrackChat = (chat) => {
        this.chatModels.delete(chat);
      };
      // load
      this.loadChats = () => {
        const chatDir = StorageModel.getPath(
          "chat" /* Chat */,
          filePaths.chat.base
        );
        const chatIds = this.storageModel.list(chatDir);
        for (const chatId of chatIds) {
          const chatModel = new ChatModel(
            this.storageModel,
            this.connectionModel,
            this.settingsModel,
            this,
            chatId
          );
          this.addChatModel(chatModel);
        }
      };
      this.storageModel = storageModel2;
      this.settingsModel = settingsModel2;
      this.connectionModel = connectionModel2;
      this.loadChats();
      connectionModel2.messageHandlerManager.addHandler(this.messageHandler);
      connectionModel2.messageSentHandlerManager.addHandler(
        this.messageSentHandler
      );
    }
  };

  // src/View/utility.ts
  function allowDrop(event) {
    event.preventDefault();
  }
  function allowDrag(event) {
    event.dataTransfer?.setData("text", "");
  }
  function reload() {
    window.location.reload();
  }
  function setFocus() {
    document.getElementById("focused")?.focus();
  }
  function setFocusWithDelay() {
    setTimeout(setFocus, 100);
  }

  // src/ViewModel/Pages/taskViewModel.ts
  var TaskViewModel = class {
    // init
    constructor(coreViewModel2, chatViewModel, boardsAndTasksModel, containingModel, task) {
      this.coreViewModel = coreViewModel2;
      this.chatViewModel = chatViewModel;
      this.boardsAndTasksModel = boardsAndTasksModel;
      this.containingModel = containingModel;
      this.task = task;
      // paths
      this.getFilePath = () => {
        return this.boardsAndTasksModel.getTaskFilePath(this.task.fileId);
      };
      // state
      this.index = new State(0);
      this.boardId = new State("");
      this.name = new State("");
      this.description = new State("");
      this.category = new State("");
      this.status = new State("");
      this.priority = new State("");
      this.date = new State("");
      this.time = new State("");
      this.selectedVersionId = new State("");
      this.versionIds = new ListState();
      // methods
      this.dragStart = (event) => {
        allowDrag(event);
        this.coreViewModel.draggedObject.value = this;
      };
      this.setCategoryAndStatus = (category, status) => {
        if (category != void 0) this.category.value = category;
        if (status != void 0) this.status.value = status;
        this.save();
      };
      this.setBoardId = (boardId) => {
        this.boardId.value = boardId;
        this.save();
      };
      this.setDate = (dateISOString) => {
        this.date.value = dateISOString;
        this.save();
      };
      // view
      this.open = () => {
        this.containingModel.selectTask(this);
      };
      this.close = () => {
        this.containingModel.closeTask();
      };
      this.closeAndDiscard = () => {
        this.close();
        this.loadTaskData();
      };
      this.closeAndSave = (e) => {
        e.preventDefault();
        this.close();
        this.save();
      };
      this.updateIndex = () => {
        const index = this.containingModel.taskIndexManager.getIndex(this);
        this.index.value = index;
      };
      this.updateSuggestions = () => {
        if (this.coreViewModel.taskCategorySuggestions.value.has(
          this.category.value
        ) == false) {
          this.coreViewModel.taskCategorySuggestions.add(this.category.value);
        }
        if (this.coreViewModel.taskStatusSuggestions.value.has(
          this.status.value
        ) == false) {
          this.coreViewModel.taskStatusSuggestions.add(this.status.value);
        }
      };
      // settings
      this.save = () => {
        const newTaskFileContent = BoardsAndTasksModel.createTaskFileContent(
          this.task.fileId,
          this.name.value,
          this.task.boardId
        );
        newTaskFileContent.boardId = this.boardId.value;
        newTaskFileContent.description = this.description.value;
        newTaskFileContent.status = this.status.value;
        newTaskFileContent.category = this.category.value;
        newTaskFileContent.priority = this.priority.value;
        newTaskFileContent.date = this.date.value;
        newTaskFileContent.time = this.time.value;
        this.boardsAndTasksModel.updateTaskAndSend(newTaskFileContent);
        this.containingModel.showTask(newTaskFileContent);
        this.containingModel.updateTaskIndices();
        this.updateSuggestions();
      };
      this.deleteTask = () => {
        this.close();
        this.boardsAndTasksModel.deleteTask(
          this.task.boardId,
          this.task.fileId
        );
        this.containingModel.removeTaskFromView(this.task);
      };
      // load
      this.loadVersionIds = () => {
        const versionIds = this.boardsAndTasksModel.listTaskVersionIds(this.task.fileId);
        const sortedVersionIds = versionIds.sort(localeCompare).reverse();
        this.versionIds.clear();
        this.versionIds.add(...sortedVersionIds);
      };
      this.switchVersion = (versionId) => {
        const taskFileContent = this.boardsAndTasksModel.getSpecificTaskFileContent(
          this.task.fileId,
          versionId
        );
        if (taskFileContent == null) return;
        this.task = taskFileContent;
        this.loadTaskData();
      };
      this.loadAllData = () => {
        this.loadTaskData();
        this.loadVersionIds();
      };
      this.loadTaskData = () => {
        this.boardId.value = this.task.boardId;
        this.name.value = this.task.name;
        this.description.value = this.task.description ?? "";
        this.category.value = this.task.category ?? "";
        this.status.value = this.task.status ?? "";
        this.priority.value = this.task.priority ?? "";
        this.date.value = this.task.date ?? "";
        this.time.value = this.task.time ?? "";
        this.selectedVersionId.value = this.task.fileContentId;
        this.updateSuggestions();
      };
      this.loadAllData();
      this.selectedVersionId.subscribeSilent((selectedVersionId) => {
        this.switchVersion(selectedVersionId);
      });
    }
    get sortingString() {
      const splitDate = this.date.value.split("-");
      const year = padZero(splitDate[0], 4);
      const month = padZero(splitDate[1], 2);
      const date = padZero(splitDate[2], 2);
      const splitTime = this.time.value.split(":");
      const hour = padZero(splitTime[0], 2);
      const minute = padZero(splitTime[1], 2);
      const priorityNumber = parseInt(this.priority.value);
      const invertedPriority = 100 - priorityNumber;
      return year + month + date + hour + minute + invertedPriority + this.name.value;
    }
    static {
      // utility
      this.getStringsForFilter = (taskViewModel) => {
        return [
          taskViewModel.task.name,
          taskViewModel.task.category ?? "",
          taskViewModel.task.status ?? "",
          taskViewModel.task.priority ?? "",
          taskViewModel.task.date ?? "",
          taskViewModel.task.time ?? ""
        ];
      };
    }
  };

  // src/ViewModel/Pages/taskContainingPageViewModel.ts
  var TaskContainingPageViewModel = class {
    // init
    constructor(coreViewModel2, chatViewModel, boardsAndTasksModel) {
      this.coreViewModel = coreViewModel2;
      this.chatViewModel = chatViewModel;
      this.boardsAndTasksModel = boardsAndTasksModel;
      // state
      this.taskIndexManager = new IndexManager(
        (taskViewModel) => taskViewModel.sortingString
      );
      this.selectedTaskViewModel = new State(void 0);
      this.taskViewModels = new MapState();
      // methods
      this.createTaskFromBoardId = (boardId) => {
        const taskFileContent = this.boardsAndTasksModel.createTask(boardId);
        const taskViewModel = new TaskViewModel(
          this.coreViewModel,
          this.chatViewModel,
          this.boardsAndTasksModel,
          this,
          taskFileContent
        );
        this.selectTask(taskViewModel);
        this.updateTaskIndices();
      };
      // view
      this.showTask = (taskFileContent) => {
      };
      this.removeTaskFromView = (taskFileContent) => {
      };
      this.selectTask = (selectedTask) => {
        this.selectedTaskViewModel.value = selectedTask;
      };
      this.closeTask = () => {
        this.selectedTaskViewModel.value = void 0;
      };
      this.updateTaskIndices = () => {
        this.taskIndexManager.update([...this.taskViewModels.value.values()]);
        for (const taskViewModel of this.taskViewModels.value.values()) {
          taskViewModel.updateIndex();
        }
      };
    }
  };

  // src/ViewModel/Pages/calendarPageViewModel.ts
  var CALENDAR_EVENT_BOARD_ID = "events";
  var CalendarPageViewModel = class extends TaskContainingPageViewModel {
    // init
    constructor(coreViewModel2, chatViewModel, calendarModel, boardsAndTasksModel) {
      super(coreViewModel2, chatViewModel, boardsAndTasksModel);
      this.coreViewModel = coreViewModel2;
      this.chatViewModel = chatViewModel;
      this.calendarModel = calendarModel;
      this.boardsAndTasksModel = boardsAndTasksModel;
      // paths
      this.getBasePath = () => {
        return [...this.calendarModel.getViewPath()];
      };
      // state
      this.selectedYear = new State(0);
      this.selectedMonth = new State(0);
      this.selectedDate = new State(0);
      this.monthGrid = new State(void 0);
      // methods
      this.createEvent = () => {
        const taskFileContent = this.boardsAndTasksModel.createTask(CALENDAR_EVENT_BOARD_ID);
        taskFileContent.date = CalendarModel.getISODateString(
          this.selectedYear.value.toString(),
          this.selectedMonth.value.toString(),
          this.selectedDate.value.toString()
        );
        const taskViewModel = new TaskViewModel(
          this.coreViewModel,
          this.chatViewModel,
          this.boardsAndTasksModel,
          this,
          taskFileContent
        );
        this.selectTask(taskViewModel);
        this.updateTaskIndices();
      };
      this.getEventsForDate = () => {
        const paddedDate = CalendarModel.padDateOrMonth(
          this.selectedDate.toString()
        );
        if (this.monthGrid.value == void 0) {
          return void 0;
        }
        return this.monthGrid.value.days[paddedDate];
      };
      // view
      this.getTaskMapState = (taskFileContent) => {
        if (this.monthGrid.value == null) return null;
        const date = CalendarModel.isoToDateString(
          taskFileContent.date ?? ""
        );
        return this.monthGrid.value.days[date];
      };
      this.showTask = (taskFileContent) => {
        const monthString = CalendarModel.isoToMonthString(
          taskFileContent.date ?? ""
        );
        if (monthString == void 0 || monthString != this.monthString) {
          this.removeTaskFromView(taskFileContent);
          this.calendarModel.deleteTaskReference(
            this.monthString,
            taskFileContent.fileId
          );
          return;
        }
        const taskViewModel = new TaskViewModel(
          this.coreViewModel,
          this.chatViewModel,
          this.boardsAndTasksModel,
          this,
          taskFileContent
        );
        const mapState = this.getTaskMapState(taskFileContent);
        this.taskViewModels.handleRemoval(taskViewModel, () => {
          mapState?.remove(taskFileContent.fileId);
        });
        this.taskViewModels.remove(taskFileContent.fileId);
        this.taskViewModels.set(taskFileContent.fileId, taskViewModel);
        mapState?.set(taskFileContent.fileId, taskViewModel);
        this.updateTaskIndices();
      };
      this.removeTaskFromView = (taskFileContent) => {
        this.taskViewModels.remove(taskFileContent.fileId);
      };
      this.showToday = () => {
        const today = /* @__PURE__ */ new Date();
        this.selectedYear.value = today.getFullYear();
        this.selectedMonth.value = today.getMonth() + 1;
        this.selectedDate.value = today.getDate();
      };
      this.showPreviousMonth = () => {
        this.selectedMonth.value -= 1;
        if (this.selectedMonth.value <= 0) {
          this.selectedYear.value -= 1;
          this.selectedMonth.value = 12;
        }
      };
      this.showNextMonth = () => {
        this.selectedMonth.value += 1;
        if (this.selectedMonth.value >= 13) {
          this.selectedYear.value += 1;
          this.selectedMonth.value = 1;
        }
      };
      this.handleDrop = (year, month, date) => {
        const ISOString = CalendarModel.getISODateString(
          year,
          month,
          date
        );
        const draggedObject = this.coreViewModel.draggedObject.value;
        if (draggedObject instanceof TaskViewModel == false) return;
        draggedObject.setDate(ISOString);
      };
      // load
      this.loadMonthTasks = () => {
        this.monthGrid.value = this.calendarModel.generateMonthGrid(
          this.selectedYear.value,
          this.selectedMonth.value,
          () => new MapState()
        );
        const taskIds = this.calendarModel.listTaskIds(
          this.monthString
        );
        for (const taskId of taskIds) {
          const taskFileContent = this.boardsAndTasksModel.getLatestTaskFileContent(taskId);
          if (taskFileContent == null) continue;
          this.showTask(taskFileContent);
        }
      };
      this.loadData = () => {
        this.loadMonthTasks();
      };
      this.calendarModel = calendarModel;
      this.boardsAndTasksModel = boardsAndTasksModel;
      this.chatViewModel = chatViewModel;
      bulkSubscribe([this.selectedYear, this.selectedMonth], () => {
        this.loadMonthTasks();
      });
      boardsAndTasksModel.taskHandlerManager.addHandler(
        (taskFileContent) => {
          this.showTask(taskFileContent);
        }
      );
      this.showToday();
    }
    // data
    get monthString() {
      return CalendarModel.getMonthString(
        this.selectedYear.value.toString(),
        this.selectedMonth.value.toString()
      );
    }
  };

  // src/ViewModel/Chat/chatMessageViewModel.ts
  var ChatMessageViewModel = class {
    // init
    constructor(coreViewModel2, messagePageViewModel, chatMessage, sentByUser) {
      this.coreViewModel = coreViewModel2;
      this.messagePageViewModel = messagePageViewModel;
      this.body = new State("");
      this.status = new State(
        void 0
      );
      this.reactionsThumbsUp = new MapState();
      this.reactionsCheck = new MapState();
      this.reactionsStop = new MapState();
      this.reactionsAttention = new MapState();
      this.reactionsDoubleAttention = new MapState();
      this.reactionsQuestion = new MapState();
      this.reactionsThumbsUpCount = createProxyState(
        [this.reactionsThumbsUp],
        () => this.reactionsThumbsUp.value.size
      );
      this.reactionsCheckCount = createProxyState(
        [this.reactionsCheck],
        () => this.reactionsCheck.value.size
      );
      this.reactionsStopCount = createProxyState(
        [this.reactionsStop],
        () => this.reactionsStop.value.size
      );
      this.reactionsAttentionCount = createProxyState(
        [this.reactionsAttention],
        () => this.reactionsAttention.value.size
      );
      this.reactionsDoubleAttentionCount = createProxyState(
        [this.reactionsDoubleAttention],
        () => this.reactionsDoubleAttention.value.size
      );
      this.reactionsQuestionCount = createProxyState(
        [this.reactionsQuestion],
        () => this.reactionsQuestion.value.size
      );
      // state
      this.isPresentingInfoModal = new State(false);
      // methods
      this.copyMessage = () => {
        navigator.clipboard.writeText(this.body.value);
      };
      this.resendMessage = () => {
        this.messagePageViewModel.sendMessageFromBody(this.body.value);
      };
      this.decryptMessage = () => {
        this.messagePageViewModel.decryptMessage(this);
      };
      // view
      this.showInfoModal = () => {
        this.isPresentingInfoModal.value = true;
      };
      this.hideInfoModal = () => {
        this.isPresentingInfoModal.value = false;
      };
      // reactions
      this.handleReaction = (reaction) => {
        function setReaction(mapState) {
          if (reaction.isDeleting) {
            mapState.remove(reaction.sender);
          } else {
            mapState.set(reaction.sender, reaction);
          }
        }
        switch (reaction.content) {
          case "\u{1F44D}" /* ThumbsUp */:
            return setReaction(this.reactionsThumbsUp);
          case "\u2705" /* Check */:
            return setReaction(this.reactionsCheck);
          case "\u{1F6D1}" /* Stop */:
            return setReaction(this.reactionsStop);
          case "\u2757\uFE0F" /* Attention */:
            return setReaction(this.reactionsAttention);
          case "\u203C\uFE0F" /* DoubleAttention */:
            return setReaction(this.reactionsDoubleAttention);
          case "\u2753" /* Question */:
            return setReaction(this.reactionsQuestion);
        }
      };
      this.sendReaction = (content, isDeleting) => {
        this.messagePageViewModel.sendReaction(
          this.chatMessage.id,
          content,
          isDeleting
        );
      };
      // load
      this.loadData = () => {
        this.channel = this.chatMessage.channel;
        this.sender = this.chatMessage.sender;
        this.dateSent = new Date(this.chatMessage.dateSent).toLocaleString();
        this.body.value = this.chatMessage.body;
        this.status.value = this.chatMessage.status;
      };
      this.chatMessage = chatMessage;
      this.sentByUser = sentByUser;
      this.loadData();
    }
  };

  // src/ViewModel/Pages/messagePageViewModel.ts
  var MessagePageViewModel = class {
    // init
    constructor(coreViewModel2, chatViewModel) {
      this.coreViewModel = coreViewModel2;
      this.chatViewModel = chatViewModel;
      // state
      this.chatMessageViewModels = new MapState();
      this.composingMessage = new State("");
      // methods
      this.sendMessage = () => {
        if (this.cannotSendMessage.value == true) return;
        this.sendMessageFromBody(this.composingMessage.value);
        this.composingMessage.value = "";
      };
      this.sendMessageFromBody = (body) => {
        this.chatViewModel.chatModel.sendMessage(body);
      };
      this.decryptMessage = async (messageViewModel) => {
        const chatMessage = messageViewModel.chatMessage;
        await this.chatViewModel.chatModel.decryptMessage(chatMessage);
        this.chatViewModel.chatModel.addMessage(chatMessage);
        messageViewModel.loadData();
      };
      this.sendReaction = (messageId, content, isDeleting) => {
        this.chatViewModel.chatModel.sendReaction(
          messageId,
          content,
          isDeleting
        );
      };
      // view
      this.showChatMessage = (chatMessage) => {
        const chatMessageViewModel = new ChatMessageViewModel(
          this.coreViewModel,
          this,
          chatMessage,
          chatMessage.sender == this.chatViewModel.settingsViewModel.username.value
        );
        const existingChatMessageViewModel = this.chatMessageViewModels.value.get(chatMessage.id);
        if (existingChatMessageViewModel != void 0) {
          existingChatMessageViewModel.body.value = chatMessage.body;
          existingChatMessageViewModel.status.value = chatMessage.status;
        } else {
          this.chatMessageViewModels.set(
            chatMessage.id,
            chatMessageViewModel
          );
        }
      };
      this.handleReaction = (reaction) => {
        const messageViewModel = this.chatMessageViewModels.value.get(reaction.messageId);
        if (messageViewModel == void 0) return;
        messageViewModel.handleReaction(reaction);
      };
      // load
      this.loadData = () => {
        this.chatMessageViewModels.clear();
        for (const chatMessage of this.chatViewModel.chatModel.messages) {
          this.showChatMessage(chatMessage);
        }
        for (const reaction of this.chatViewModel.chatModel.reactions) {
          this.handleReaction(reaction);
        }
      };
      this.cannotSendMessage = createProxyState(
        [
          this.chatViewModel.settingsViewModel.username,
          this.composingMessage
        ],
        () => this.chatViewModel.settingsViewModel.username.value == "" || this.composingMessage.value == ""
      );
    }
  };

  // src/ViewModel/Pages/settingsPageViewModel.ts
  var SettingsPageViewModel = class {
    // init
    constructor(coreViewModel2, chatViewModel) {
      this.coreViewModel = coreViewModel2;
      this.chatViewModel = chatViewModel;
      // state
      this.primaryChannel = new State("");
      this.primaryChannelInput = new State("");
      this.secondaryChannels = new ListState();
      this.newSecondaryChannelInput = new State("");
      this.encryptionKeyInput = new State("");
      this.shouldShowEncryptionKey = new State(false);
      this.encryptionKeyInputType = createProxyState(
        [this.shouldShowEncryptionKey],
        () => this.shouldShowEncryptionKey.value == true ? "text" : "password"
      );
      this.color = new State("standard" /* Standard */);
      // guards
      this.cannotSetPrimaryChannel = createProxyState(
        [this.primaryChannel, this.primaryChannelInput],
        () => this.primaryChannelInput.value == "" || this.primaryChannelInput.value == this.primaryChannel.value
      );
      this.cannotAddSecondaryChannel = createProxyState(
        [this.newSecondaryChannelInput],
        () => this.newSecondaryChannelInput.value == ""
      );
      // methods
      this.setPrimaryChannel = () => {
        this.chatViewModel.chatModel.setPrimaryChannel(
          this.primaryChannelInput.value
        );
        this.primaryChannel.value = this.chatViewModel.chatModel.info.primaryChannel;
        this.chatViewModel.chatListViewModel.updateIndices();
      };
      this.addSecondaryChannel = () => {
        this.secondaryChannels.add(this.newSecondaryChannelInput.value);
        this.newSecondaryChannelInput.value = "";
        this.storeSecondaryChannels();
        this.loadSecondaryChannels();
      };
      this.removeSecondaryChannel = (secondaryChannel) => {
        this.secondaryChannels.remove(secondaryChannel);
        this.storeSecondaryChannels();
      };
      this.storeSecondaryChannels = () => {
        this.chatViewModel.chatModel.setSecondaryChannels([
          ...this.secondaryChannels.value.values()
        ]);
      };
      this.setEncryptionKey = () => {
        this.chatViewModel.chatModel.setEncryptionKey(
          this.encryptionKeyInput.value
        );
        this.encryptionKeyInput.callSubscriptions();
      };
      this.applyColor = (newColor) => {
        this.chatViewModel.setColor(newColor);
      };
      this.remove = () => {
        this.chatViewModel.close();
        this.chatViewModel.chatModel.delete();
        this.chatViewModel.chatListViewModel.untrackChat(this.chatViewModel);
      };
      // load
      this.loadListRelevantData = () => {
        this.primaryChannel.value = this.chatViewModel.chatModel.info.primaryChannel;
        this.color.value = this.chatViewModel.chatModel.color;
      };
      this.loadData = () => {
        this.primaryChannelInput.value = this.chatViewModel.chatModel.info.primaryChannel;
        this.loadSecondaryChannels();
        this.encryptionKeyInput.value = this.chatViewModel.chatModel.info.encryptionKey;
      };
      this.loadSecondaryChannels = () => {
        this.secondaryChannels.clear();
        for (const secondaryChannel of this.chatViewModel.chatModel.secondaryChannels) {
          this.secondaryChannels.add(secondaryChannel);
        }
      };
      this.loadListRelevantData();
      this.cannotSetEncryptionKey = createProxyState(
        [this.encryptionKeyInput],
        () => this.encryptionKeyInput.value == this.chatViewModel.chatModel.info.encryptionKey
      );
      this.color.subscribe((newColor) => {
        this.applyColor(newColor);
      });
    }
  };

  // src/ViewModel/Utility/searchViewModel.ts
  var SearchViewModel = class {
    // init
    constructor(allObjects, matchingObjects, getStringsOfObject, suggestions) {
      // state
      this.appliedQuery = new State("");
      this.searchInput = new State("");
      // guards
      this.cannotApplySearch = createProxyState(
        [this.searchInput, this.appliedQuery],
        () => this.searchInput.value == this.appliedQuery.value
      );
      // methods
      this.search = (searchTerm) => {
        this.searchInput.value = searchTerm;
        this.applySearch();
      };
      this.applySearch = () => {
        this.appliedQuery.value = this.searchInput.value;
        this.matchingObjects.clear();
        for (const object of this.allObjects.value.values()) {
          const doesMatch = this.checkDoesMatchSearch(object);
          if (doesMatch == false) continue;
          this.matchingObjects.add(object);
        }
      };
      // utility
      this.checkDoesMatchSearch = (object) => {
        return checkDoesObjectMatchSearch(
          this.appliedQuery.value,
          this.getStringsOfObject,
          object
        );
      };
      this.allObjects = allObjects;
      this.matchingObjects = matchingObjects;
      this.getStringsOfObject = getStringsOfObject;
      this.suggestions = suggestions;
      this.allObjects.handleAddition((newObject) => {
        const doesMatch = this.checkDoesMatchSearch(newObject);
        if (doesMatch == false) {
          this.matchingObjects.remove(newObject);
        } else {
          if (this.matchingObjects.value.has(newObject)) return;
          this.matchingObjects.add(newObject);
          this.allObjects.handleRemoval(newObject, () => {
            this.matchingObjects.remove(newObject);
          });
        }
      });
    }
  };

  // src/ViewModel/Pages/boardViewModel.ts
  var BoardViewModel = class extends TaskContainingPageViewModel {
    // init
    constructor(coreViewModel2, chatViewModel, boardsAndTasksModel, taskPageViewModel, boardInfo) {
      super(coreViewModel2, chatViewModel, boardsAndTasksModel);
      this.coreViewModel = coreViewModel2;
      this.chatViewModel = chatViewModel;
      this.boardsAndTasksModel = boardsAndTasksModel;
      this.taskPageViewModel = taskPageViewModel;
      this.boardInfo = boardInfo;
      // state
      this.name = new State("");
      this.color = new State("standard" /* Standard */);
      this.index = new State(0);
      this.selectedPage = new State(
        "list" /* List */
      );
      this.isPresentingSettingsModal = new State(false);
      this.isPresentingFilterModal = new State(false);
      this.filteredTaskViewModels = new ListState();
      // paths
      this.getBasePath = () => {
        return [
          ...this.taskPageViewModel.getBoardViewPath(this.boardInfo.fileId)
        ];
      };
      this.getLastUsedBoardPath = () => {
        return [...this.getBasePath(), "last-used-view" /* LastUsedView */];
      };
      this.getPreviousSearchesPath = () => {
        return [...this.getBasePath(), "previous-searches" /* PreviousSearches */];
      };
      this.getLastSearchPath = () => {
        return [...this.getBasePath(), "last-search" /* LastSearch */];
      };
      // settings
      this.saveSettings = () => {
        const newBoardInfoFileContent = BoardsAndTasksModel.createBoardInfoFileContent(
          this.boardInfo.fileId,
          this.name.value,
          this.color.value
        );
        this.taskPageViewModel.updateBoard(newBoardInfoFileContent);
      };
      this.applyColor = () => {
        this.taskPageViewModel.chatViewModel.setDisplayedColor(
          this.color.value
        );
      };
      this.deleteBoard = () => {
        this.taskPageViewModel.deleteBoard(this.boardInfo);
        this.chatViewModel.taskBoardSuggestions.remove(this.boardInfo.fileId);
        this.close();
      };
      // methods
      this.createTask = () => {
        this.createTaskFromBoardId(this.boardInfo.fileId);
      };
      this.handleDropWithinBoard = (category, status) => {
        const draggedObject = this.coreViewModel.draggedObject.value;
        if (draggedObject instanceof TaskViewModel == false) return;
        draggedObject.setCategoryAndStatus(category, status);
      };
      this.handleDropBetweenBoards = () => {
        const draggedObject = this.coreViewModel.draggedObject.value;
        if (draggedObject instanceof TaskViewModel == false) return;
        draggedObject.setBoardId(this.boardInfo.fileId);
      };
      // storage
      this.storeLastUsedView = () => {
        const path = this.getLastUsedBoardPath();
        const lastUsedView = this.selectedPage.value;
        this.coreViewModel.storageModel.write(path, lastUsedView);
      };
      this.restoreLastUsedView = () => {
        const path = this.getLastUsedBoardPath();
        const lastUsedView = this.coreViewModel.storageModel.read(path);
        if (lastUsedView == null) return;
        this.selectedPage.value = lastUsedView;
      };
      this.handleNewSearch = (searchTerm) => {
        const suggestionPath = [
          ...this.getPreviousSearchesPath(),
          searchTerm
        ];
        this.coreViewModel.storageModel.write(suggestionPath, "");
        if (!this.coreViewModel.boardFilterStringSuggestions.value.has(
          searchTerm
        )) {
          this.coreViewModel.boardFilterStringSuggestions.add(searchTerm);
        }
        const lastSearchPath = this.getLastSearchPath();
        this.coreViewModel.storageModel.write(lastSearchPath, searchTerm);
      };
      // view
      this.showTask = (taskFileContent) => {
        if (taskFileContent.boardId != this.boardInfo.fileId) {
          this.boardsAndTasksModel.deleteTaskReference(
            this.boardInfo.fileId,
            taskFileContent.fileId
          );
          this.removeTaskFromView(taskFileContent);
          return;
        }
        const taskViewModel = new TaskViewModel(
          this.coreViewModel,
          this.chatViewModel,
          this.boardsAndTasksModel,
          this,
          taskFileContent
        );
        this.taskViewModels.set(taskFileContent.fileId, taskViewModel);
      };
      this.removeTaskFromView = (taskFileContent) => {
        this.taskViewModels.remove(taskFileContent.fileId);
        this.updateIndex();
      };
      this.select = () => {
        this.taskPageViewModel.selectBoard(this);
      };
      this.close = () => {
        this.taskPageViewModel.closeBoard();
        this.taskViewModels.clear();
      };
      this.showSettings = () => {
        this.isPresentingSettingsModal.value = true;
      };
      this.hideSettings = () => {
        this.saveSettings();
        this.isPresentingSettingsModal.value = false;
      };
      this.showFilterModal = () => {
        this.isPresentingFilterModal.value = true;
      };
      this.hideFilterModal = () => {
        this.isPresentingFilterModal.value = false;
      };
      this.updateIndex = () => {
        const index = this.taskPageViewModel.boardIndexManager.getIndex(this);
        this.index.value = index;
      };
      // load
      this.loadListRelevantData = () => {
        this.name.value = this.boardInfo.name;
        this.color.value = this.boardInfo.color;
      };
      this.loadTasks = () => {
        const taskIds = this.boardsAndTasksModel.listTaskIds(
          this.boardInfo.fileId
        );
        for (const taskId of taskIds) {
          if (this.taskViewModels.value.has(taskId)) return;
          const taskFileContent = this.boardsAndTasksModel.getLatestTaskFileContent(taskId);
          if (taskFileContent == null) continue;
          const taskViewModel = new TaskViewModel(
            this.coreViewModel,
            this.chatViewModel,
            this.boardsAndTasksModel,
            this,
            taskFileContent
          );
          this.taskViewModels.set(taskFileContent.fileId, taskViewModel);
        }
        this.updateTaskIndices();
      };
      this.loadSearchSuggestions = () => {
        const dirPath = this.getPreviousSearchesPath();
        const searches = this.coreViewModel.storageModel.list(dirPath);
        this.coreViewModel.boardFilterStringSuggestions.add(...searches);
      };
      this.restoreSearch = () => {
        const lastSearchPath = this.getLastSearchPath();
        const lastSearch = this.coreViewModel.storageModel.read(lastSearchPath);
        if (lastSearch != null) {
          this.searchViewModel.search(lastSearch);
        }
      };
      this.loadData = () => {
        this.restoreLastUsedView();
        this.loadTasks();
        this.loadSearchSuggestions();
      };
      this.loadListRelevantData();
      this.isSelected = createProxyState(
        [this.taskPageViewModel.selectedBoardId],
        () => this.taskPageViewModel.selectedBoardId.value == this.boardInfo.fileId
      );
      this.color.subscribe(() => {
        if (this.isSelected.value == false) return;
        if (this.chatViewModel.selectedPage.value != "tasks" /* Tasks */)
          return;
        this.applyColor();
      });
      this.selectedPage.subscribeSilent(() => {
        this.storeLastUsedView();
      });
      boardsAndTasksModel.taskHandlerManager.addHandler(
        (taskFileContent) => {
          if (taskFileContent.boardId != this.boardInfo.fileId) return;
          this.showTask(taskFileContent);
          this.updateTaskIndices();
        }
      );
      this.searchViewModel = new SearchViewModel(
        this.taskViewModels,
        this.filteredTaskViewModels,
        TaskViewModel.getStringsForFilter,
        this.coreViewModel.boardFilterStringSuggestions
      );
      this.searchViewModel.appliedQuery.subscribeSilent((newQuery) => {
        this.handleNewSearch(newQuery);
      });
      this.restoreSearch();
    }
  };

  // src/ViewModel/Pages/taskPageViewModel.ts
  var TaskPageViewModel = class {
    // init
    constructor(coreViewModel2, chatViewModel, boardsAndTasksModel) {
      this.coreViewModel = coreViewModel2;
      this.chatViewModel = chatViewModel;
      this.boardsAndTasksModel = boardsAndTasksModel;
      // data
      this.boardIndexManager = new IndexManager(
        (boardViewModel) => boardViewModel.name.value
      );
      // paths
      this.getBasePath = () => {
        return [...this.boardsAndTasksModel.getViewPath()];
      };
      this.getBoardViewPath = (boardId) => {
        return [...this.getBasePath(), boardId];
      };
      this.getLastUsedBoardPath = () => {
        return [...this.getBasePath(), "last-used-board" /* LastUsedBoard */];
      };
      // state
      this.newBoardNameInput = new State("");
      this.boardViewModels = new MapState();
      this.isShowingBoadList = new State(true);
      this.selectedBoardId = new State(
        void 0
      );
      // guards
      this.cannotCreateBoard = createProxyState(
        [this.newBoardNameInput],
        () => this.newBoardNameInput.value == ""
      );
      // methods
      this.createBoard = () => {
        if (this.cannotCreateBoard.value == true) return;
        const boardInfoFileContent = this.boardsAndTasksModel.createBoard(this.newBoardNameInput.value);
        this.newBoardNameInput.value = "";
        this.showBoardInList(boardInfoFileContent);
        this.boardsAndTasksModel.updateBoardAndSend(boardInfoFileContent);
        this.updateBoardIndices();
      };
      this.updateBoard = (boardInfoFileContent) => {
        this.boardsAndTasksModel.updateBoardAndSend(boardInfoFileContent);
        this.updateBoardIndices();
      };
      this.deleteBoard = (boardInfoFileContent) => {
        this.boardsAndTasksModel.deleteBoard(boardInfoFileContent.fileId);
        this.boardViewModels.remove(boardInfoFileContent.fileId);
        this.updateBoardIndices();
      };
      // view
      this.toggleBoardList = () => {
        this.isShowingBoadList.value = !this.isShowingBoadList.value;
      };
      this.showBoardInList = (boardInfo) => {
        const boardViewModel = new BoardViewModel(
          this.coreViewModel,
          this.chatViewModel,
          this.boardsAndTasksModel,
          this,
          boardInfo
        );
        this.boardViewModels.set(boardInfo.fileId, boardViewModel);
        this.chatViewModel.taskBoardSuggestions.set(boardInfo.fileId, [
          boardInfo.fileId,
          this.boardsAndTasksModel.getBoardName(boardInfo.fileId)
        ]);
      };
      this.selectBoard = (boardViewModel) => {
        this.selectedBoardId.value = boardViewModel.boardInfo.fileId;
        this.chatViewModel.displayedColor.value = boardViewModel.color.value;
        this.storeLastUsedBoard();
      };
      this.closeBoard = () => {
        this.selectedBoardId.value = void 0;
        this.chatViewModel.resetColor();
        this.storeLastUsedBoard();
      };
      this.updateBoardIndices = () => {
        this.boardIndexManager.update([...this.boardViewModels.value.values()]);
        for (const boardViewModel of this.boardViewModels.value.values()) {
          boardViewModel.updateIndex();
        }
      };
      // storage
      this.storeLastUsedBoard = () => {
        const path = this.getLastUsedBoardPath();
        const lastUsedBoardId = this.selectedBoardId.value ?? "";
        this.coreViewModel.storageModel.write(path, lastUsedBoardId);
      };
      this.openLastUsedBoard = () => {
        const path = this.getLastUsedBoardPath();
        const lastUsedBoardId = this.coreViewModel.storageModel.read(path);
        if (lastUsedBoardId == null) return;
        const boardViewModel = this.boardViewModels.value.get(lastUsedBoardId);
        if (boardViewModel == void 0) return;
        this.selectBoard(boardViewModel);
      };
      // load
      this.loadData = () => {
        this.boardViewModels.clear();
        const boardIds = this.boardsAndTasksModel.listBoardIds();
        for (const boardId of boardIds) {
          const boardInfo = this.boardsAndTasksModel.getBoardInfo(boardId);
          if (boardInfo == null) continue;
          this.showBoardInList(boardInfo);
        }
        this.updateBoardIndices();
        this.openLastUsedBoard();
      };
      this.chatViewModel = chatViewModel;
      this.loadData();
      boardsAndTasksModel.boardHandlerManager.addHandler(
        (boardInfoFileContent) => {
          this.showBoardInList(boardInfoFileContent);
          this.updateBoardIndices();
        }
      );
    }
  };

  // src/ViewModel/Chat/chatViewModel.ts
  var ChatViewModel2 = class {
    // init
    constructor(coreViewModel2, chatModel, settingsViewModel2, notificationViewModel, connectionViewModel2, chatListViewModel2) {
      this.coreViewModel = coreViewModel2;
      this.chatModel = chatModel;
      this.settingsViewModel = settingsViewModel2;
      this.notificationViewModel = notificationViewModel;
      this.connectionViewModel = connectionViewModel2;
      this.chatListViewModel = chatListViewModel2;
      // state
      this.displayedColor = new State("standard" /* Standard */);
      this.selectedPage = new State(
        "messages" /* Messages */
      );
      this.index = new State(0);
      this.hasUnreadMessages = new State(false);
      this.taskBoardSuggestions = new MapState();
      // view
      this.open = () => {
        this.chatListViewModel.openChat(this);
      };
      this.close = () => {
        this.chatListViewModel.closeChat();
      };
      this.closeSubPages = () => {
      };
      this.setColor = (color) => {
        this.setDisplayedColor(color);
        this.chatModel.setColor(color);
      };
      this.setDisplayedColor = (color) => {
        this.displayedColor.value = color;
      };
      this.resetColor = () => {
        this.displayedColor.value = this.settingsPageViewModel.color.value;
      };
      this.updateIndex = () => {
        const index = this.chatListViewModel.chatIndexManager.getIndex(this);
        this.index.value = index;
      };
      // load
      this.loadPageSelection = () => {
        const path = StorageModel.getPath(
          "chat" /* Chat */,
          filePaths.chat.lastUsedPage(this.chatModel.id)
        );
        const lastUsedPage = this.coreViewModel.storageModel.read(path);
        if (lastUsedPage != null) {
          this.selectedPage.value = lastUsedPage;
        }
        this.selectedPage.subscribeSilent((newPage) => {
          this.coreViewModel.storageModel.write(path, newPage);
          this.resetColor();
        });
      };
      this.loadInfo = () => {
        this.updateReadStatus();
        this.taskBoardSuggestions.set(CALENDAR_EVENT_BOARD_ID, [
          CALENDAR_EVENT_BOARD_ID,
          this.coreViewModel.translations.chatPage.calendar.eventsBoard
        ]);
      };
      this.updateReadStatus = () => {
        if (this.chatListViewModel.selectedChat.value == this && this.selectedPage.value == "messages" /* Messages */) {
          this.chatModel.setReadStatus(false);
        }
        this.hasUnreadMessages.value = this.chatModel.info.hasUnreadMessages;
      };
      this.setReadStatus = (hasUnreadMessages) => {
        this.chatModel.setReadStatus(hasUnreadMessages);
        this.hasUnreadMessages.value = hasUnreadMessages;
      };
      this.subscribeReadStatus = () => {
        createProxyState(
          [this.selectedPage, this.chatListViewModel.selectedChat],
          () => {
            if (this.chatListViewModel.selectedChat.value != this) return;
            if (this.selectedPage.value != "messages" /* Messages */) return;
            this.setReadStatus(false);
          }
        );
      };
      this.calendarViewModel = new CalendarPageViewModel(
        coreViewModel2,
        this,
        this.chatModel.fileModel.boardsAndTasksModel.calendarModel,
        this.chatModel.fileModel.boardsAndTasksModel
      );
      this.taskPageViewModel = new TaskPageViewModel(
        this.coreViewModel,
        this,
        this.chatModel.fileModel.boardsAndTasksModel
      );
      this.messagePageViewModel = new MessagePageViewModel(
        this.coreViewModel,
        this
      );
      this.settingsPageViewModel = new SettingsPageViewModel(
        this.coreViewModel,
        this
      );
      chatModel.chatMessageHandlerManager.addHandler(
        (chatMessage) => {
          this.messagePageViewModel.showChatMessage(chatMessage);
          this.updateReadStatus();
          this.notificationViewModel.showNotification(chatMessage);
        }
      );
      chatModel.reactionHandlerManager.addHandler(
        (reaction) => {
          this.messagePageViewModel.handleReaction(reaction);
        }
      );
      this.loadPageSelection();
      this.resetColor();
      this.loadInfo();
      this.subscribeReadStatus();
    }
  };

  // src/ViewModel/Global/notificationViewModel.ts
  var NotificationViewModel = class _NotificationViewModel {
    // init
    constructor(chatListViewModel2) {
      this.chatListViewModel = chatListViewModel2;
      // data
      this.seenMessageIds = /* @__PURE__ */ new Set();
      this.messagesInMarquee = [];
      this.marquee = new State(void 0);
      this.currentIndex = 0;
      this.interval = void 0;
      // main
      this.showNotification = (message) => {
        const notification = _NotificationViewModel.createNotification(message);
        if (this.seenMessageIds.has(message.id)) return;
        const currentChat = this.chatListViewModel.selectedChat.value.chatModel.info.primaryChannel;
        const currentPage = this.chatListViewModel.selectedChat.value.selectedPage.value;
        if (notification.chat == currentChat && currentPage == "messages" /* Messages */)
          return;
        this.messagesInMarquee.push(notification);
        this.startLoop();
      };
      this.openNotification = () => {
        const notification = this.marquee.value;
        if (notification == void 0) return;
        const chat = [
          ...this.chatListViewModel.chatViewModels.value.values()
        ].find(
          (chat2) => chat2.chatModel.info.primaryChannel == notification.chat
        );
        chat.open();
        chat.selectedPage.value = "messages" /* Messages */;
      };
      // loop
      this.loop = () => {
        if (this.messagesInMarquee.length == 0) {
          this.marquee.value = void 0;
          return this.stopLoop();
        }
        const notification = this.messagesInMarquee.shift();
        this.seenMessageIds.delete(notification.messageId);
        this.marquee.value = notification;
      };
      this.startLoop = () => {
        if (this.interval != void 0) return;
        this.loop();
        this.interval = setInterval(() => {
          this.loop();
        }, 5e3);
      };
      this.stopLoop = () => {
        clearInterval(this.interval);
        this.interval = void 0;
      };
      this.skipLoop = () => {
        this.stopLoop();
        this.startLoop();
      };
    }
    // util
    static createNotification(message) {
      return {
        messageId: message.id,
        chat: ChatModel.splitChannel(message.channel)[0],
        sender: message.sender,
        body: message.body
      };
    }
  };

  // src/ViewModel/Chat/chatListViewModel.ts
  var ChatListViewModel = class {
    // init
    constructor(coreViewModel2, settingsViewModel2, connectionViewModel2) {
      this.coreViewModel = coreViewModel2;
      this.settingsViewModel = settingsViewModel2;
      this.connectionViewModel = connectionViewModel2;
      // data
      this.chatIndexManager = new IndexManager(
        (chatViewModel) => chatViewModel.settingsPageViewModel.primaryChannel.value
      );
      // state
      this.newChatPrimaryChannel = new State("");
      this.chatViewModels = new ListState();
      this.selectedChat = new State(
        void 0
      );
      // guards
      this.cannotCreateChat = createProxyState(
        [this.newChatPrimaryChannel],
        () => this.newChatPrimaryChannel.value == ""
      );
      // methods
      this.createChat = () => {
        const chatModel = this.coreViewModel.chatListModel.createChat(
          this.newChatPrimaryChannel.value
        );
        this.newChatPrimaryChannel.value = "";
        const chatViewModel = this.createChatViewModel(chatModel);
        this.trackChat(chatViewModel);
        this.updateIndices();
      };
      this.trackChat = (chatViewModel) => {
        this.chatViewModels.add(chatViewModel);
      };
      this.untrackChat = (chatViewModel) => {
        this.coreViewModel.chatListModel.untrackChat(chatViewModel.chatModel);
        this.chatViewModels.remove(chatViewModel);
      };
      this.createChatViewModel = (chatModel) => {
        return new ChatViewModel2(
          this.coreViewModel,
          chatModel,
          this.settingsViewModel,
          this.notificationViewModel,
          this.connectionViewModel,
          this
        );
      };
      this.updateIndices = () => {
        this.chatIndexManager.update([...this.chatViewModels.value.values()]);
        for (const chatViewModel of this.chatViewModels.value) {
          chatViewModel.updateIndex();
        }
      };
      // view
      this.openChat = (chatViewModel) => {
        this.selectedChat.value = chatViewModel;
        this.notificationViewModel.skipLoop();
      };
      this.closeChat = () => {
        this.selectedChat.value = void 0;
      };
      // load
      this.loadChats = () => {
        this.chatViewModels.clear();
        for (const chatModel of this.coreViewModel.chatListModel.chatModels.values()) {
          const chatViewModel = this.createChatViewModel(chatModel);
          this.trackChat(chatViewModel);
        }
        this.updateIndices();
      };
      this.notificationViewModel = new NotificationViewModel(this);
      this.loadChats();
    }
  };

  // src/View/Components/monthGrid.tsx
  function MonthGrid2(coreViewModel2, monthGrid, selectedDate, handleDrop) {
    const dayLabels = [];
    let currentWeekday = monthGrid.firstDayOfWeek;
    while (dayLabels.length < 7) {
      dayLabels.push(
        /* @__PURE__ */ createElement("span", { class: "secondary" }, coreViewModel2.translations.regional.weekdays.abbreviated[currentWeekday])
      );
      currentWeekday++;
      if (currentWeekday == 7) currentWeekday = 0;
    }
    const offsetElements = [];
    for (let i = 0; i < monthGrid.offset; i++) {
      offsetElements.push(/* @__PURE__ */ createElement("div", null));
    }
    const converter = (taskViewModel) => {
      const view = /* @__PURE__ */ createElement("span", { class: "ellipsis secondary" }, taskViewModel.task.name);
      taskViewModel.index.subscribe((newIndex) => {
        view.style.order = newIndex;
      });
      return view;
    };
    return /* @__PURE__ */ createElement("div", { class: "month-grid-wrapper" }, /* @__PURE__ */ createElement("div", { class: "day-labels" }, ...dayLabels), /* @__PURE__ */ createElement("div", { class: "month-grid" }, ...offsetElements, ...Object.entries(monthGrid.days).sort((a, b) => localeCompare(a[0], b[0])).map((entry) => {
      const [date, mapState] = entry;
      const isSelected = createProxyState(
        [selectedDate],
        () => selectedDate.value == parseInt(date)
      );
      const isToday = monthGrid.isCurrentMonth == true && parseInt(date) == (/* @__PURE__ */ new Date()).getDate();
      const eventCount = createProxyState(
        [mapState],
        () => mapState.value.size
      );
      const hasEvents = createProxyState(
        [eventCount],
        () => eventCount.value != 0
      );
      function select() {
        selectedDate.value = parseInt(date);
      }
      function drop() {
        handleDrop(date);
      }
      return /* @__PURE__ */ createElement(
        "button",
        {
          class: "tile",
          "on:click": select,
          "toggle:selected": isSelected,
          "toggle:today": isToday,
          "on:dragover": allowDrop,
          "on:drop": drop
        },
        /* @__PURE__ */ createElement("div", null, /* @__PURE__ */ createElement("b", null, date), /* @__PURE__ */ createElement(
          "span",
          {
            class: "event-count",
            "toggle:has-events": hasEvents,
            "subscribe:innerText": eventCount
          }
        ), /* @__PURE__ */ createElement(
          "div",
          {
            class: "event-list",
            "children:append": [mapState, converter]
          }
        ))
      );
    })));
  }

  // src/View/Components/option.tsx
  function Option(text, value, selectedOnCreate) {
    return /* @__PURE__ */ createElement("option", { value, "toggle:selected": selectedOnCreate }, text);
  }
  var StringToOption = (string) => {
    return Option(string, string, false);
  };
  var VersionIdToOption = (versionId) => {
    const [date, rest] = versionId.split("T");
    const [time] = rest.split(".");
    const readableName = `${date} ${time}`;
    return Option(readableName, versionId, false);
  };

  // src/View/Components/dangerousActionButton.tsx
  function DangerousActionButton(coreViewModel2, label, icon, action) {
    const isActionRequested = new State(false);
    const cannotConfirm = createProxyState(
      [isActionRequested],
      () => isActionRequested.value == false
    );
    function requestAction() {
      isActionRequested.value = true;
    }
    function abort() {
      isActionRequested.value = false;
    }
    return /* @__PURE__ */ createElement("div", { class: "flex-row" }, /* @__PURE__ */ createElement("button", { class: "flex", "on:click": abort, "toggle:hidden": cannotConfirm }, coreViewModel2.translations.general.abortButton, /* @__PURE__ */ createElement("span", { class: "icon" }, "undo")), /* @__PURE__ */ createElement(
      "button",
      {
        class: "danger flex",
        "on:click": requestAction,
        "toggle:hidden": isActionRequested
      },
      label,
      /* @__PURE__ */ createElement("span", { class: "icon" }, icon)
    ), /* @__PURE__ */ createElement(
      "button",
      {
        class: "danger flex",
        "on:click": action,
        "toggle:hidden": cannotConfirm
      },
      coreViewModel2.translations.general.confirmButton,
      /* @__PURE__ */ createElement("span", { class: "icon" }, "warning")
    ));
  }

  // src/View/Modals/taskSettingsModal.tsx
  function TaskSettingsModal(coreViewModel2, taskViewModel) {
    const categorySuggestionId = v4_default();
    const statusSuggestionId = v4_default();
    const BoardOptionConverter = (entry) => {
      const isSelected = entry[0] == taskViewModel.task.boardId;
      return Option(entry[1], entry[0], isSelected);
    };
    return /* @__PURE__ */ createElement("div", { class: "modal", open: true, "keystroke:s": taskViewModel.closeAndSave }, /* @__PURE__ */ createElement("div", null, /* @__PURE__ */ createElement("main", null, /* @__PURE__ */ createElement("h2", null, coreViewModel2.translations.chatPage.task.taskSettingsHeadline), /* @__PURE__ */ createElement("label", { class: "tile flex-no" }, /* @__PURE__ */ createElement("span", { class: "icon" }, "history"), /* @__PURE__ */ createElement("div", null, /* @__PURE__ */ createElement("span", null, coreViewModel2.translations.general.fileVersionLabel), /* @__PURE__ */ createElement(
      "select",
      {
        "bind:value": taskViewModel.selectedVersionId,
        "children:append": [
          taskViewModel.versionIds,
          VersionIdToOption
        ]
      }
    ), /* @__PURE__ */ createElement("span", { class: "icon" }, "arrow_drop_down"))), /* @__PURE__ */ createElement("hr", null), /* @__PURE__ */ createElement("label", { class: "tile flex-no" }, /* @__PURE__ */ createElement("span", { class: "icon" }, "label"), /* @__PURE__ */ createElement("div", null, /* @__PURE__ */ createElement("span", null, coreViewModel2.translations.chatPage.task.taskNameLabel), /* @__PURE__ */ createElement(
      "input",
      {
        "bind:value": taskViewModel.name,
        id: "focused"
      }
    ))), /* @__PURE__ */ createElement("label", { class: "tile flex-no" }, /* @__PURE__ */ createElement("span", { class: "icon" }, "category"), /* @__PURE__ */ createElement("div", null, /* @__PURE__ */ createElement("span", null, coreViewModel2.translations.chatPage.task.taskBoardLabel), /* @__PURE__ */ createElement(
      "select",
      {
        "bind:value": taskViewModel.boardId,
        "children:append": [
          taskViewModel.chatViewModel.taskBoardSuggestions,
          BoardOptionConverter
        ]
      }
    ), /* @__PURE__ */ createElement("span", { class: "icon" }, "arrow_drop_down"))), /* @__PURE__ */ createElement("label", { class: "tile flex-no" }, /* @__PURE__ */ createElement("span", { class: "icon" }, "description"), /* @__PURE__ */ createElement("div", null, /* @__PURE__ */ createElement("span", null, coreViewModel2.translations.chatPage.task.taskDescriptionLabel), /* @__PURE__ */ createElement(
      "textarea",
      {
        rows: "10",
        "bind:value": taskViewModel.description
      }
    ))), /* @__PURE__ */ createElement("hr", null), /* @__PURE__ */ createElement("label", { class: "tile flex-no" }, /* @__PURE__ */ createElement("span", { class: "icon" }, "category"), /* @__PURE__ */ createElement("div", null, /* @__PURE__ */ createElement("span", null, coreViewModel2.translations.chatPage.task.taskCategoryLabel), /* @__PURE__ */ createElement(
      "input",
      {
        "bind:value": taskViewModel.category,
        list: categorySuggestionId
      }
    ))), /* @__PURE__ */ createElement(
      "datalist",
      {
        hidden: true,
        id: categorySuggestionId,
        "children:append": [
          taskViewModel.coreViewModel.taskCategorySuggestions,
          StringToOption
        ]
      }
    ), /* @__PURE__ */ createElement("label", { class: "tile flex-no" }, /* @__PURE__ */ createElement("span", { class: "icon" }, "clock_loader_40"), /* @__PURE__ */ createElement("div", null, /* @__PURE__ */ createElement("span", null, coreViewModel2.translations.chatPage.task.taskStatusLabel), /* @__PURE__ */ createElement(
      "input",
      {
        "bind:value": taskViewModel.status,
        list: statusSuggestionId
      }
    ))), /* @__PURE__ */ createElement(
      "datalist",
      {
        hidden: true,
        id: statusSuggestionId,
        "children:append": [
          taskViewModel.coreViewModel.taskStatusSuggestions,
          StringToOption
        ]
      }
    ), /* @__PURE__ */ createElement("label", { class: "tile flex-no" }, /* @__PURE__ */ createElement("span", { class: "icon" }, "priority_high"), /* @__PURE__ */ createElement("div", null, /* @__PURE__ */ createElement("span", null, coreViewModel2.translations.chatPage.task.taskPriorityLabel), /* @__PURE__ */ createElement(
      "input",
      {
        type: "number",
        "bind:value": taskViewModel.priority
      }
    ))), /* @__PURE__ */ createElement("hr", null), /* @__PURE__ */ createElement("label", { class: "tile flex-no" }, /* @__PURE__ */ createElement("span", { class: "icon" }, "calendar_month"), /* @__PURE__ */ createElement("div", null, /* @__PURE__ */ createElement("span", null, coreViewModel2.translations.chatPage.task.taskDateLabel), /* @__PURE__ */ createElement(
      "input",
      {
        type: "date",
        "bind:value": taskViewModel.date
      }
    ))), /* @__PURE__ */ createElement("label", { class: "tile flex-no" }, /* @__PURE__ */ createElement("span", { class: "icon" }, "schedule"), /* @__PURE__ */ createElement("div", null, /* @__PURE__ */ createElement("span", null, coreViewModel2.translations.chatPage.task.taskTimeLabel), /* @__PURE__ */ createElement(
      "input",
      {
        type: "time",
        "bind:value": taskViewModel.time
      }
    ))), /* @__PURE__ */ createElement("hr", null), /* @__PURE__ */ createElement("div", { class: "width-input" }, DangerousActionButton(
      coreViewModel2,
      coreViewModel2.translations.chatPage.task.deleteTaskButton,
      "delete_forever",
      taskViewModel.deleteTask
    ))), /* @__PURE__ */ createElement("div", { class: "flex-row width-100" }, /* @__PURE__ */ createElement(
      "button",
      {
        class: "flex",
        "on:click": taskViewModel.closeAndDiscard
      },
      coreViewModel2.translations.general.closeButton
    ), /* @__PURE__ */ createElement(
      "button",
      {
        class: "flex primary",
        "on:click": taskViewModel.closeAndSave
      },
      coreViewModel2.translations.general.saveButton,
      /* @__PURE__ */ createElement("span", { class: "icon" }, "save")
    ))));
  }

  // src/View/Components/taskEntry.tsx
  function TaskEntry(taskViewModel) {
    const details = {
      description: taskViewModel.description.value || "---",
      priority_high: taskViewModel.priority.value || "---",
      category: taskViewModel.category.value || "---",
      clock_loader_40: taskViewModel.status.value || "---",
      calendar_month: taskViewModel.date.value || "---",
      schedule: taskViewModel.time.value || "---"
    };
    const view = /* @__PURE__ */ createElement(
      "button",
      {
        draggable: "true",
        class: "tile flex-no",
        style: "user-select: none; -webkit-user-select: none",
        "on:click": taskViewModel.open,
        "on:dragstart": taskViewModel.dragStart
      },
      /* @__PURE__ */ createElement("div", null, /* @__PURE__ */ createElement(
        "b",
        {
          class: "ellipsis",
          "subscribe:innerText": taskViewModel.name
        }
      ), /* @__PURE__ */ createElement("hr", null), /* @__PURE__ */ createElement(
        "div",
        {
          class: "grid secondary",
          style: "grid-template-columns: repeat(2, 1fr); column-gap: 1rem;  row-gap: .5rem"
        },
        ...Object.entries(details).map((entry) => /* @__PURE__ */ createElement(
          "span",
          {
            class: "flex-row align-center width-100 flex-no clip",
            style: "gap: 1rem"
          },
          /* @__PURE__ */ createElement("span", { class: "icon", style: "font-size: 1.1rem" }, entry[0]),
          /* @__PURE__ */ createElement("span", { class: "ellipsis" }, entry[1])
        ))
      ))
    );
    taskViewModel.index.subscribe((newIndex) => {
      view.style.order = newIndex;
    });
    return view;
  }
  var TaskViewModelToEntry = (taskViewModel) => {
    return TaskEntry(taskViewModel);
  };

  // src/View/ChatPages/calendarPage.tsx
  function CalendarPage(coreViewModel2, calendarPageViewModel) {
    calendarPageViewModel.loadData();
    const mainContent = createProxyState(
      [calendarPageViewModel.monthGrid],
      () => {
        const monthGrid = calendarPageViewModel.monthGrid.value;
        if (monthGrid == void 0) {
          return /* @__PURE__ */ createElement("div", null);
        } else {
          let drop = function(date) {
            calendarPageViewModel.handleDrop(
              monthGrid.year.toString(),
              monthGrid.month.toString(),
              date
            );
          };
          return MonthGrid2(
            coreViewModel2,
            monthGrid,
            calendarPageViewModel.selectedDate,
            drop
          );
        }
      }
    );
    const sidePaneContentWrapper = createProxyState(
      [
        calendarPageViewModel.selectedYear,
        calendarPageViewModel.selectedMonth,
        calendarPageViewModel.selectedDate
      ],
      () => {
        const listState = calendarPageViewModel.getEventsForDate();
        if (listState == void 0) {
          return /* @__PURE__ */ createElement("div", null);
        } else {
          const sidePaneContent = createProxyState(
            [listState],
            () => {
              if (listState.value.size == 0) {
                return /* @__PURE__ */ createElement("div", { class: "width-100 height-100 flex-column justify-center align-center" }, /* @__PURE__ */ createElement("span", { class: "secondary slide-up" }, coreViewModel2.translations.chatPage.calendar.noEvents));
              } else {
                return /* @__PURE__ */ createElement(
                  "div",
                  {
                    class: "flex-column gap slide-up padding-bottom",
                    "children:append": [
                      listState,
                      TaskViewModelToEntry
                    ]
                  }
                );
              }
            }
          );
          return /* @__PURE__ */ createElement(
            "div",
            {
              class: "width-100 height-100",
              "children:set": sidePaneContent
            }
          );
        }
      }
    );
    const taskSettingsModal = createProxyState(
      [calendarPageViewModel.selectedTaskViewModel],
      () => {
        if (calendarPageViewModel.selectedTaskViewModel.value == void 0) {
          return /* @__PURE__ */ createElement("div", null);
        } else {
          setFocusWithDelay();
          return TaskSettingsModal(
            coreViewModel2,
            calendarPageViewModel.selectedTaskViewModel.value
          );
        }
      }
    );
    return /* @__PURE__ */ createElement("div", { id: "calendar-page" }, /* @__PURE__ */ createElement("div", { class: "pane-wrapper grid-pane-wrapper" }, /* @__PURE__ */ createElement("div", { class: "pane" }, /* @__PURE__ */ createElement("div", { class: "toolbar" }, /* @__PURE__ */ createElement("span", null, /* @__PURE__ */ createElement(
      "button",
      {
        class: "ghost",
        "aria-label": coreViewModel2.translations.chatPage.calendar.todayButtonAudioLabel,
        "on:click": calendarPageViewModel.showToday
      },
      /* @__PURE__ */ createElement("span", { class: "icon" }, "today")
    )), /* @__PURE__ */ createElement("span", null, /* @__PURE__ */ createElement(
      "button",
      {
        class: "ghost",
        "aria-label": coreViewModel2.translations.chatPage.calendar.previousMonthButtonAudioLabel,
        "on:click": calendarPageViewModel.showPreviousMonth
      },
      /* @__PURE__ */ createElement("span", { class: "icon" }, "arrow_back")
    ), /* @__PURE__ */ createElement("span", { class: "input-wrapper" }, /* @__PURE__ */ createElement(
      "input",
      {
        class: "year-input",
        type: "number",
        "aria-label": coreViewModel2.translations.chatPage.calendar.yearInputAudioLabel,
        placeholder: coreViewModel2.translations.chatPage.calendar.yearInputPlaceholder,
        "bind:value": calendarPageViewModel.selectedYear
      }
    ), /* @__PURE__ */ createElement(
      "input",
      {
        class: "month-input",
        type: "number",
        "aria-label": coreViewModel2.translations.chatPage.calendar.monthInputAudioLabel,
        placeholder: coreViewModel2.translations.chatPage.calendar.monthInputPlaceholder,
        "bind:value": calendarPageViewModel.selectedMonth
      }
    )), /* @__PURE__ */ createElement(
      "button",
      {
        class: "ghost",
        "aria-label": coreViewModel2.translations.chatPage.calendar.nextMonthButtonAudioLabel,
        "on:click": calendarPageViewModel.showNextMonth
      },
      /* @__PURE__ */ createElement("span", { class: "icon" }, "arrow_forward")
    )), /* @__PURE__ */ createElement("span", null, /* @__PURE__ */ createElement(
      "button",
      {
        class: "ghost",
        "aria-label": coreViewModel2.translations.chatPage.task.createTaskButtonAudioLabel,
        "on:click": calendarPageViewModel.createEvent
      },
      /* @__PURE__ */ createElement("span", { class: "icon" }, "add")
    ))), /* @__PURE__ */ createElement(
      "div",
      {
        class: "content padding-0",
        "children:set": mainContent
      }
    ))), /* @__PURE__ */ createElement(
      "div",
      {
        class: "pane-wrapper side background",
        "set:color": calendarPageViewModel.chatViewModel.displayedColor
      },
      /* @__PURE__ */ createElement("div", { class: "pane" }, /* @__PURE__ */ createElement(
        "div",
        {
          class: "content",
          "children:set": sidePaneContentWrapper
        }
      ))
    ), /* @__PURE__ */ createElement("div", { "children:set": taskSettingsModal }));
  }

  // src/View/Components/ribbonButton.tsx
  function RibbonButton(label, icon, isSelected, select, isHighlighted = new State(false)) {
    return /* @__PURE__ */ createElement(
      "button",
      {
        class: "ribbon-button",
        "aria-label": label,
        "toggle:selected": isSelected,
        "toggle:highlight": isHighlighted,
        "on:click": select
      },
      /* @__PURE__ */ createElement("span", { class: "icon" }, icon)
    );
  }

  // src/View/Components/chatViewToggleButton.tsx
  function ChatViewToggleButton(label, icon, page, chatViewModel) {
    function select() {
      chatViewModel.selectedPage.value = page;
    }
    const isSelected = createProxyState(
      [chatViewModel.selectedPage],
      () => chatViewModel.selectedPage.value == page
    );
    const isHighlighted = new State(false);
    if (page == "messages" /* Messages */) {
      chatViewModel.hasUnreadMessages.subscribe(
        (hasUnreadMessages) => isHighlighted.value = hasUnreadMessages
      );
    }
    return RibbonButton(label, icon, isSelected, select, isHighlighted);
  }

  // src/View/Components/messageReactionButton.tsx
  function MessageReactionButton(coreViewModel2, chatMessageViewModel, content) {
    let audioLabel;
    let count;
    let reactionState;
    let isActive = new State(false);
    let isZero = new State(true);
    function sendReaction() {
      chatMessageViewModel.sendReaction(content, isActive.value);
    }
    function getUsername() {
      return chatMessageViewModel.messagePageViewModel.chatViewModel.settingsViewModel.username.value;
    }
    function checkIsHighlighted() {
      return reactionState.value.has(getUsername());
    }
    switch (content) {
      case "\u{1F44D}" /* ThumbsUp */: {
        audioLabel = coreViewModel2.translations.chatPage.message.thumbsUpReaction;
        count = chatMessageViewModel.reactionsThumbsUpCount;
        reactionState = chatMessageViewModel.reactionsThumbsUp;
        break;
      }
      case "\u2705" /* Check */: {
        audioLabel = coreViewModel2.translations.chatPage.message.checkReaction;
        count = chatMessageViewModel.reactionsCheckCount;
        reactionState = chatMessageViewModel.reactionsCheck;
        break;
      }
      case "\u{1F6D1}" /* Stop */: {
        audioLabel = coreViewModel2.translations.chatPage.message.stopReaction;
        count = chatMessageViewModel.reactionsStopCount;
        reactionState = chatMessageViewModel.reactionsStop;
        break;
      }
      case "\u2757\uFE0F" /* Attention */: {
        audioLabel = coreViewModel2.translations.chatPage.message.attentionReaction;
        count = chatMessageViewModel.reactionsAttentionCount;
        reactionState = chatMessageViewModel.reactionsAttention;
        break;
      }
      case "\u203C\uFE0F" /* DoubleAttention */: {
        audioLabel = coreViewModel2.translations.chatPage.message.doubleAttentionReaction;
        count = chatMessageViewModel.reactionsDoubleAttentionCount;
        reactionState = chatMessageViewModel.reactionsDoubleAttention;
        break;
      }
      case "\u2753" /* Question */: {
        audioLabel = coreViewModel2.translations.chatPage.message.questionReaction;
        count = chatMessageViewModel.reactionsQuestionCount;
        reactionState = chatMessageViewModel.reactionsQuestion;
        break;
      }
    }
    reactionState.subscribe(() => {
      isActive.value = checkIsHighlighted();
      isZero.value = reactionState.value.size == 0;
    });
    return /* @__PURE__ */ createElement(
      "button",
      {
        class: "flex",
        "on:click": sendReaction,
        "aria-label": audioLabel,
        "toggle:selected": isActive,
        "toggle:zero": isZero
      },
      content,
      /* @__PURE__ */ createElement("span", { "subscribe:innerText": count })
    );
  }

  // src/View/Components/messageReactionButtonRow.tsx
  function MessageReactionButtonRow(coreViewModel2, chatMessageViewModel) {
    return /* @__PURE__ */ createElement("div", { class: "grid gap width-100 message-reaction-row" }, MessageReactionButton(
      coreViewModel2,
      chatMessageViewModel,
      "\u{1F44D}" /* ThumbsUp */
    ), MessageReactionButton(
      coreViewModel2,
      chatMessageViewModel,
      "\u2705" /* Check */
    ), MessageReactionButton(
      coreViewModel2,
      chatMessageViewModel,
      "\u{1F6D1}" /* Stop */
    ), MessageReactionButton(
      coreViewModel2,
      chatMessageViewModel,
      "\u2757\uFE0F" /* Attention */
    ), MessageReactionButton(
      coreViewModel2,
      chatMessageViewModel,
      "\u203C\uFE0F" /* DoubleAttention */
    ), MessageReactionButton(
      coreViewModel2,
      chatMessageViewModel,
      "\u2753" /* Question */
    ));
  }

  // src/View/Components/infoTile.tsx
  function InfoTile(icon, label, content) {
    let contentState;
    if (typeof content == "string") {
      contentState = new State(content);
    } else {
      contentState = content;
    }
    return /* @__PURE__ */ createElement("div", { class: "tile" }, /* @__PURE__ */ createElement("span", { class: "icon" }, icon), /* @__PURE__ */ createElement("div", null, /* @__PURE__ */ createElement("span", null, label), /* @__PURE__ */ createElement("b", { class: "break-word", "subscribe:innerText": contentState })));
  }

  // src/View/Modals/chatMessageInfoModal.tsx
  function ChatMessageInfoModal(coreViewModel2, chatMessageViewModel) {
    return /* @__PURE__ */ createElement(
      "div",
      {
        class: "modal",
        "toggle:open": chatMessageViewModel.isPresentingInfoModal
      },
      /* @__PURE__ */ createElement("div", null, /* @__PURE__ */ createElement("main", null, /* @__PURE__ */ createElement("h2", null, coreViewModel2.translations.chatPage.message.messageInfoHeadline), /* @__PURE__ */ createElement("div", { class: "flex-column gap" }, InfoTile(
        "account_circle",
        coreViewModel2.translations.chatPage.message.sentBy,
        chatMessageViewModel.sender
      ), InfoTile(
        "schedule",
        coreViewModel2.translations.chatPage.message.timeSent,
        chatMessageViewModel.dateSent
      ), InfoTile(
        "forum",
        coreViewModel2.translations.chatPage.message.channel,
        chatMessageViewModel.channel
      ), InfoTile(
        "description",
        coreViewModel2.translations.chatPage.message.messageContent,
        chatMessageViewModel.body
      )), /* @__PURE__ */ createElement("hr", null), /* @__PURE__ */ createElement("div", { class: "flex-column gap" }, /* @__PURE__ */ createElement("button", { "on:click": chatMessageViewModel.copyMessage }, coreViewModel2.translations.chatPage.message.copyMessageButton, /* @__PURE__ */ createElement("span", { class: "icon" }, "content_copy")), /* @__PURE__ */ createElement("button", { "on:click": chatMessageViewModel.resendMessage }, coreViewModel2.translations.chatPage.message.resendMessageButton, /* @__PURE__ */ createElement("span", { class: "icon" }, "redo")), /* @__PURE__ */ createElement("button", { "on:click": chatMessageViewModel.decryptMessage }, coreViewModel2.translations.chatPage.message.decryptMessageButton, /* @__PURE__ */ createElement("span", { class: "icon" }, "key"))), /* @__PURE__ */ createElement("hr", null), MessageReactionButtonRow(
        coreViewModel2,
        chatMessageViewModel
      )), /* @__PURE__ */ createElement("button", { "on:click": chatMessageViewModel.hideInfoModal }, coreViewModel2.translations.general.closeButton, /* @__PURE__ */ createElement("span", { class: "icon" }, "close")))
    );
  }

  // src/View/Components/chatMessage.tsx
  function ChatMessage4(coreViewModel2, chatMessageViewModel) {
    const statusIcon = createProxyState(
      [chatMessageViewModel.status],
      () => {
        switch (chatMessageViewModel.status.value) {
          case "outbox" /* Outbox */:
            return "hourglass_top";
          case "sent" /* Sent */:
            return "check";
          case "received" /* Received */:
            return "done_all";
          default:
            return "warning";
        }
      }
    );
    return /* @__PURE__ */ createElement(
      "div",
      {
        class: "message-bubble",
        "toggle:sentbyuser": chatMessageViewModel.sentByUser
      },
      /* @__PURE__ */ createElement("div", { class: "main tile" }, /* @__PURE__ */ createElement("div", { class: "text-container" }, /* @__PURE__ */ createElement("span", { class: "sender-name ellipsis" }, chatMessageViewModel.sender), /* @__PURE__ */ createElement(
        "span",
        {
          class: "body",
          "subscribe:innerText": chatMessageViewModel.body
        }
      ), /* @__PURE__ */ createElement("span", { class: "timestamp ellipsis" }, /* @__PURE__ */ createElement(
        "span",
        {
          class: "icon",
          "subscribe:innerText": statusIcon
        }
      ), chatMessageViewModel.dateSent)), /* @__PURE__ */ createElement("div", { class: "button-container" }, /* @__PURE__ */ createElement(
        "button",
        {
          "on:click": chatMessageViewModel.showInfoModal,
          "aria-label": coreViewModel2.translations.chatPage.message.showMessageInfoButtonAudioLabel
        },
        /* @__PURE__ */ createElement("span", { class: "icon" }, "info")
      ))),
      MessageReactionButtonRow(coreViewModel2, chatMessageViewModel),
      ChatMessageInfoModal(coreViewModel2, chatMessageViewModel)
    );
  }

  // src/View/ChatPages/messagePage.tsx
  function MessagePage(coreViewModel2, messagePageViewModel) {
    messagePageViewModel.loadData();
    const ChatMessageViewModelToView = (chatMessageViewModel) => {
      return ChatMessage4(coreViewModel2, chatMessageViewModel);
    };
    const messageContainer = /* @__PURE__ */ createElement(
      "div",
      {
        id: "message-container",
        "children:append": [
          messagePageViewModel.chatMessageViewModels,
          ChatMessageViewModelToView
        ]
      }
    );
    function scrollDown(hard = false) {
      if (hard) {
        messageContainer.setAttribute("scroll-hard", "");
      }
      messageContainer.scrollTop = messageContainer.scrollHeight;
      messageContainer.removeAttribute("scroll-hard");
    }
    function scrollDownIfApplicable() {
      const scrollFromBottom = messageContainer.scrollHeight - (messageContainer.scrollTop + messageContainer.offsetHeight);
      if (scrollFromBottom > 400) return;
      scrollDown();
    }
    messagePageViewModel.chatMessageViewModels.subscribeSilent(
      scrollDownIfApplicable
    );
    setTimeout(() => scrollDown(true), 100);
    return /* @__PURE__ */ createElement("div", { id: "message-page" }, /* @__PURE__ */ createElement("div", { class: "pane-wrapper" }, /* @__PURE__ */ createElement("div", { class: "pane" }, /* @__PURE__ */ createElement("div", { class: "toolbar" }, /* @__PURE__ */ createElement("span", { class: "title" }, coreViewModel2.translations.chatPage.message.messagesHeadline)), /* @__PURE__ */ createElement("div", { class: "content" }, messageContainer, /* @__PURE__ */ createElement("div", { id: "composer" }, /* @__PURE__ */ createElement("div", { class: "content-width-constraint" }, /* @__PURE__ */ createElement("div", { class: "input-width-constraint" }, /* @__PURE__ */ createElement(
      "input",
      {
        "bind:value": messagePageViewModel.composingMessage,
        "on:enter": messagePageViewModel.sendMessage,
        placeholder: coreViewModel2.translations.chatPage.message.composerInputPlaceholder
      }
    ), /* @__PURE__ */ createElement(
      "button",
      {
        class: "primary",
        "aria-label": coreViewModel2.translations.chatPage.message.sendMessageButtonAudioLabel,
        "on:click": messagePageViewModel.sendMessage,
        "toggle:disabled": messagePageViewModel.cannotSendMessage
      },
      /* @__PURE__ */ createElement("span", { class: "icon" }, "send")
    ))))))));
  }

  // src/View/Components/colorPicker.tsx
  function ColorPicker(selectedColor) {
    return /* @__PURE__ */ createElement("div", { class: "flex-row gap width-input" }, ...Object.values(Colors).map((color) => {
      const isSelected = createProxyState(
        [selectedColor],
        () => selectedColor.value == color
      );
      function setColor() {
        selectedColor.value = color;
      }
      return /* @__PURE__ */ createElement(
        "button",
        {
          color,
          class: "fill-color width-100 flex",
          style: "height: 2rem",
          "toggle:selected": isSelected,
          "on:click": setColor
        }
      );
    }));
  }

  // src/View/Components/deletableListItem.tsx
  function DeletableListItem(coreViewModel2, text, primaryButton, ondelete) {
    return /* @__PURE__ */ createElement("div", { class: "tile flex-row justify-apart align-center padding-0" }, /* @__PURE__ */ createElement("span", { class: "padding-h ellipsis" }, text), /* @__PURE__ */ createElement("div", { class: "flex-row justify-end" }, primaryButton, /* @__PURE__ */ createElement(
      "button",
      {
        class: "danger",
        "aria-label": coreViewModel2.translations.general.deleteItemButtonAudioLabel,
        "on:click": ondelete
      },
      /* @__PURE__ */ createElement("span", { class: "icon" }, "delete")
    )));
  }

  // src/View/ChatPages/settingsPage.tsx
  function SettingsPage(coreViewModel2, settingsPageViewModel) {
    settingsPageViewModel.loadData();
    const secondaryChannelConverter = (secondaryChannel) => {
      return DeletableListItem(
        coreViewModel2,
        secondaryChannel,
        /* @__PURE__ */ createElement("span", null),
        () => {
          settingsPageViewModel.removeSecondaryChannel(secondaryChannel);
        }
      );
    };
    return /* @__PURE__ */ createElement("div", { id: "settings-page" }, /* @__PURE__ */ createElement("div", { class: "pane-wrapper" }, /* @__PURE__ */ createElement("div", { class: "pane" }, /* @__PURE__ */ createElement("div", { class: "toolbar" }, /* @__PURE__ */ createElement("span", { class: "title" }, coreViewModel2.translations.chatPage.settings.settingsHeadline)), /* @__PURE__ */ createElement("div", { class: "content" }, /* @__PURE__ */ createElement("label", { class: "tile flex-no" }, /* @__PURE__ */ createElement("span", { class: "icon" }, "forum"), /* @__PURE__ */ createElement("div", null, /* @__PURE__ */ createElement("span", null, coreViewModel2.translations.chatPage.settings.primaryChannelLabel), /* @__PURE__ */ createElement(
      "input",
      {
        "bind:value": settingsPageViewModel.primaryChannelInput,
        "on:enter": settingsPageViewModel.setPrimaryChannel
      }
    ))), /* @__PURE__ */ createElement("div", { class: "flex-row justify-end width-input" }, /* @__PURE__ */ createElement(
      "button",
      {
        class: "width-50",
        "aria-label": coreViewModel2.translations.chatPage.settings.setPrimaryChannelButtonAudioLabel,
        "on:click": settingsPageViewModel.setPrimaryChannel,
        "toggle:disabled": settingsPageViewModel.cannotSetPrimaryChannel
      },
      coreViewModel2.translations.general.setButton,
      /* @__PURE__ */ createElement("span", { class: "icon" }, "check")
    )), /* @__PURE__ */ createElement("hr", null), /* @__PURE__ */ createElement("div", { class: "flex-row width-input margin-bottom" }, /* @__PURE__ */ createElement(
      "input",
      {
        "aria-label": coreViewModel2.translations.chatPage.settings.newSecondaryChannelAudioLabel,
        placeholder: coreViewModel2.translations.chatPage.settings.newSecondaryChannelPlaceholder,
        "bind:value": settingsPageViewModel.newSecondaryChannelInput,
        "on:enter": settingsPageViewModel.addSecondaryChannel
      }
    ), /* @__PURE__ */ createElement(
      "button",
      {
        class: "primary",
        "aria-label": coreViewModel2.translations.chatPage.settings.addSecondaryChannelButtonAudioLabel,
        "on:click": settingsPageViewModel.addSecondaryChannel,
        "toggle:disabled": settingsPageViewModel.cannotAddSecondaryChannel
      },
      /* @__PURE__ */ createElement("span", { class: "icon" }, "add")
    )), /* @__PURE__ */ createElement(
      "div",
      {
        class: "flex-column gap width-input",
        "children:append": [
          settingsPageViewModel.secondaryChannels,
          secondaryChannelConverter
        ]
      }
    ), /* @__PURE__ */ createElement("hr", null), /* @__PURE__ */ createElement("label", { class: "tile flex-no" }, /* @__PURE__ */ createElement("span", { class: "icon" }, "key"), /* @__PURE__ */ createElement("div", null, /* @__PURE__ */ createElement("span", null, coreViewModel2.translations.chatPage.settings.encryptionKeyLabel), /* @__PURE__ */ createElement(
      "input",
      {
        "bind:value": settingsPageViewModel.encryptionKeyInput,
        "on:enter": settingsPageViewModel.setEncryptionKey,
        "set:type": settingsPageViewModel.encryptionKeyInputType
      }
    ))), /* @__PURE__ */ createElement("div", { class: "flex-row justify-end width-input" }, /* @__PURE__ */ createElement(
      "button",
      {
        class: "width-50",
        "aria-label": coreViewModel2.translations.chatPage.settings.setEncryptionKeyButtonAudioLabel,
        "on:click": settingsPageViewModel.setEncryptionKey,
        "toggle:disabled": settingsPageViewModel.cannotSetEncryptionKey
      },
      coreViewModel2.translations.general.setButton,
      /* @__PURE__ */ createElement("span", { class: "icon" }, "check")
    )), /* @__PURE__ */ createElement("label", { class: "inline" }, /* @__PURE__ */ createElement(
      "input",
      {
        type: "checkbox",
        "bind:checked": settingsPageViewModel.shouldShowEncryptionKey
      }
    ), coreViewModel2.translations.chatPage.settings.showEncryptionKey), /* @__PURE__ */ createElement("hr", null), ColorPicker(settingsPageViewModel.color), /* @__PURE__ */ createElement("hr", null), /* @__PURE__ */ createElement("div", { class: "width-input" }, DangerousActionButton(
      coreViewModel2,
      coreViewModel2.translations.chatPage.settings.deleteChatButton,
      "chat_error",
      settingsPageViewModel.remove
    ))))));
  }

  // src/View/Components/propertyValueList.tsx
  function PropertyValueList(propertyKey, stringEntryObjectConverter, objects, viewBuilder) {
    const propertyValues = new ListState();
    const sortedPropertyValues = createSortedPropertyValueState(propertyValues);
    objects.subscribe(() => {
      collectPropertyValuesToState(
        propertyKey,
        stringEntryObjectConverter,
        objects,
        propertyValues
      );
    });
    return viewBuilder(propertyValues, sortedPropertyValues);
  }
  function collectPropertyValuesToState(propertyKey, stringEntryObjectConverter, objects, propertyValues) {
    const values = collectObjectValuesForKey(
      propertyKey,
      stringEntryObjectConverter,
      [...objects.value.values()]
    );
    for (const existingValue of values) {
      if (propertyValues.value.has(existingValue)) continue;
      propertyValues.add(existingValue);
    }
    for (const displayedValue of propertyValues.value.values()) {
      if (values.includes(displayedValue)) continue;
      propertyValues.remove(displayedValue);
    }
  }
  function createSortedPropertyValueState(propertyValues) {
    return createProxyState(
      [propertyValues],
      () => [...propertyValues.value.values()].sort(localeCompare)
    );
  }
  function createPropertyValueIndexState(sortedKeys, key) {
    return createProxyState(
      [sortedKeys],
      () => sortedKeys.value.indexOf(key)
    );
  }

  // src/View/Components/filteredList.tsx
  function FilteredList(reference, stringEntryObjectConverter, objects, viewBuilder) {
    const matchingObjects = new ListState();
    objects.handleAddition((newObject) => {
      const doesMatch = checkDoesObjectMatchReference(
        reference,
        stringEntryObjectConverter(newObject),
        true
      );
      if (doesMatch == false) return;
      matchingObjects.add(newObject);
      objects.handleRemoval(newObject, () => {
        matchingObjects.remove(newObject);
      });
    });
    return viewBuilder(matchingObjects);
  }

  // src/ViewModel/Utility/taskPropertyBulkChangeViewModel.ts
  var TaskPropertyBulkChangeViewModel = class {
    // init
    constructor(taskViewModels, valueSetter, initialValue) {
      // state
      this.inputValue = new State("");
      // methods
      this.set = () => {
        if (this.cannotSet.value == true) return;
        this.taskViewModels.value.forEach((taskViewModel) => {
          this.setValue(this.inputValue.value, taskViewModel);
        });
      };
      this.taskViewModels = taskViewModels;
      this.inputValue.value = initialValue;
      this.setValue = valueSetter;
      this.cannotSet = createProxyState(
        [this.inputValue],
        () => this.inputValue.value == "" || this.inputValue.value == initialValue
      );
    }
  };
  var TaskCategoryBulkChangeViewModel = class extends TaskPropertyBulkChangeViewModel {
    constructor(taskViewModels, initialValue) {
      super(
        taskViewModels,
        (newCategory, taskViewModel) => {
          taskViewModel.category.value = newCategory;
          taskViewModel.save();
        },
        initialValue
      );
    }
  };
  var TaskStatusBulkChangeViewModel = class extends TaskPropertyBulkChangeViewModel {
    constructor(taskViewModels, initialValue) {
      super(
        taskViewModels,
        (newStatus, taskViewModel) => {
          taskViewModel.status.value = newStatus;
          taskViewModel.save();
        },
        initialValue
      );
    }
  };

  // src/View/ChatPages/boardKanbanPage.tsx
  function BoardKanbanPage(coreViewModel2, boardViewModel) {
    return PropertyValueList(
      "category",
      (taskViewModel) => taskViewModel.task,
      boardViewModel.filteredTaskViewModels,
      (categories, sortedCategories) => {
        const categoryNameConverter = (categoryName) => {
          const index = createPropertyValueIndexState(
            sortedCategories,
            categoryName
          );
          return Column(
            coreViewModel2,
            categoryName,
            index,
            boardViewModel
          );
        };
        return /* @__PURE__ */ createElement(
          "div",
          {
            class: "kanban-board-wrapper",
            "children:append": [categories, categoryNameConverter]
          }
        );
      }
    );
  }
  function Column(coreViewModel2, categoryName, index, boardViewModel) {
    return FilteredList(
      { category: categoryName },
      (taskViewModel) => taskViewModel.task,
      boardViewModel.filteredTaskViewModels,
      (taskViewModels) => {
        const viewModel = new TaskCategoryBulkChangeViewModel(
          taskViewModels,
          categoryName
        );
        function drop() {
          boardViewModel.handleDropWithinBoard(categoryName);
        }
        const view = /* @__PURE__ */ createElement(
          "div",
          {
            class: "flex-column flex-no",
            "on:dragover": allowDrop,
            "on:drop": drop
          },
          /* @__PURE__ */ createElement("div", { class: "flex-row width-input" }, /* @__PURE__ */ createElement(
            "input",
            {
              placeholder: coreViewModel2.translations.chatPage.task.renameCategoryInputPlaceholder,
              "bind:value": viewModel.inputValue,
              "on:enter": viewModel.set
            }
          ), /* @__PURE__ */ createElement(
            "button",
            {
              class: "primary",
              "on:click": viewModel.set,
              "toggle:disabled": viewModel.cannotSet
            },
            /* @__PURE__ */ createElement("span", { class: "icon" }, "check")
          )),
          /* @__PURE__ */ createElement("hr", null),
          /* @__PURE__ */ createElement(
            "div",
            {
              class: "kanban-column",
              "children:append": [taskViewModels, TaskViewModelToEntry]
            }
          )
        );
        index.subscribe((newIndex) => {
          view.style.order = newIndex;
        });
        return view;
      }
    );
  }

  // src/View/Modals/boardSettingsModal.tsx
  function BoardSettingsModal(coreViewModel2, boardViewModel) {
    return /* @__PURE__ */ createElement(
      "div",
      {
        class: "modal",
        "toggle:open": boardViewModel.isPresentingSettingsModal
      },
      /* @__PURE__ */ createElement("div", null, /* @__PURE__ */ createElement("main", null, /* @__PURE__ */ createElement("h2", null, coreViewModel2.translations.chatPage.task.boardSettingsHeadline), /* @__PURE__ */ createElement("label", { class: "tile flex-no" }, /* @__PURE__ */ createElement("span", { class: "icon" }, "label"), /* @__PURE__ */ createElement("div", null, /* @__PURE__ */ createElement("span", null, coreViewModel2.translations.chatPage.task.boardNameInputLabel), /* @__PURE__ */ createElement(
        "input",
        {
          "on:enter": boardViewModel.saveSettings,
          "bind:value": boardViewModel.name
        }
      ))), /* @__PURE__ */ createElement("hr", null), ColorPicker(boardViewModel.color), /* @__PURE__ */ createElement("hr", null), /* @__PURE__ */ createElement("div", { class: "width-input" }, DangerousActionButton(
        coreViewModel2,
        coreViewModel2.translations.chatPage.task.deleteBoardButton,
        "delete_forever",
        boardViewModel.deleteBoard
      ))), /* @__PURE__ */ createElement("button", { "on:click": boardViewModel.hideSettings }, coreViewModel2.translations.general.closeButton, /* @__PURE__ */ createElement("span", { class: "icon" }, "close")))
    );
  }

  // src/View/ChatPages/boardStatusGridPage.tsx
  function BoardStatusGridPage(coreViewModel2, boardViewModel) {
    const statuses = new ListState();
    const sortedStatuses = createSortedPropertyValueState(statuses);
    boardViewModel.filteredTaskViewModels.subscribe(() => {
      collectPropertyValuesToState(
        "status",
        (taskViewModel) => taskViewModel.task,
        boardViewModel.filteredTaskViewModels,
        statuses
      );
    });
    const statusNameCellConverter = (statusName) => {
      const index = createPropertyValueIndexState(sortedStatuses, statusName);
      return StatusNameCell(coreViewModel2, statusName, index, boardViewModel);
    };
    return /* @__PURE__ */ createElement("div", { class: "status-page-content" }, /* @__PURE__ */ createElement(
      "div",
      {
        class: "status-name-row",
        "children:append": [statuses, statusNameCellConverter]
      }
    ), PropertyValueList(
      "category",
      (taskViewModel) => taskViewModel.task,
      boardViewModel.filteredTaskViewModels,
      (categories, sortedCategories) => {
        const categoryRowConverter = (categoryName) => {
          const index = createPropertyValueIndexState(
            sortedCategories,
            categoryName
          );
          return CategoryRow(
            coreViewModel2,
            categoryName,
            index,
            statuses,
            sortedStatuses,
            boardViewModel
          );
        };
        return /* @__PURE__ */ createElement(
          "div",
          {
            class: "status-grid-wrapper",
            "children:append": [categories, categoryRowConverter]
          }
        );
      }
    ));
  }
  function StatusNameCell(coreViewModel2, statusName, index, boardViewModel) {
    const taskViewModelsWithMatchingStatus = new ListState();
    boardViewModel.filteredTaskViewModels.handleAddition(
      (taskViewModel) => {
        const doesMatchStatus = taskViewModel.task.status == statusName;
        if (doesMatchStatus == false) return;
        taskViewModelsWithMatchingStatus.add(taskViewModel);
        boardViewModel.filteredTaskViewModels.handleRemoval(
          taskViewModel,
          () => {
            taskViewModelsWithMatchingStatus.remove(taskViewModel);
          }
        );
      }
    );
    const viewModel = new TaskStatusBulkChangeViewModel(
      taskViewModelsWithMatchingStatus,
      statusName
    );
    const view = /* @__PURE__ */ createElement("div", { class: "flex-row" }, /* @__PURE__ */ createElement("div", { class: "property-input-wrapper" }, /* @__PURE__ */ createElement(
      "input",
      {
        placeholder: coreViewModel2.translations.chatPage.task.renameStatusInputPlaceholder,
        "bind:value": viewModel.inputValue,
        "on:enter": viewModel.set
      }
    ), /* @__PURE__ */ createElement(
      "button",
      {
        class: "primary",
        "on:click": viewModel.set,
        "toggle:disabled": viewModel.cannotSet
      },
      /* @__PURE__ */ createElement("span", { class: "icon" }, "check")
    )));
    index.subscribe((newIndex) => {
      view.style.order = newIndex;
    });
    return view;
  }
  function CategoryRow(coreViewModel2, categoryName, index, allStatuses, sortedStatuses, boardViewModel) {
    return FilteredList(
      { category: categoryName },
      (taskViewModel) => taskViewModel.task,
      boardViewModel.filteredTaskViewModels,
      (taskViewModels) => {
        const statusNameConverter = (statusName) => {
          const index2 = createPropertyValueIndexState(
            sortedStatuses,
            statusName
          );
          return StatusColumn(
            categoryName,
            statusName,
            index2,
            boardViewModel,
            taskViewModels
          );
        };
        const viewModel = new TaskCategoryBulkChangeViewModel(
          taskViewModels,
          categoryName
        );
        const view = /* @__PURE__ */ createElement("div", { class: "flex-row flex-no large-gap" }, /* @__PURE__ */ createElement("div", { class: "property-input-wrapper" }, /* @__PURE__ */ createElement(
          "input",
          {
            placeholder: coreViewModel2.translations.chatPage.task.renameCategoryInputPlaceholder,
            "bind:value": viewModel.inputValue,
            "on:enter": viewModel.set
          }
        ), /* @__PURE__ */ createElement(
          "button",
          {
            class: "primary",
            "on:click": viewModel.set,
            "toggle:disabled": viewModel.cannotSet
          },
          /* @__PURE__ */ createElement("span", { class: "icon" }, "check")
        )), /* @__PURE__ */ createElement(
          "div",
          {
            class: "flex-row large-gap padding-right",
            "children:append": [allStatuses, statusNameConverter]
          }
        ));
        index.subscribe((newIndex) => {
          view.style.order = newIndex;
        });
        return view;
      }
    );
  }
  function StatusColumn(categoryName, statusName, index, boardViewModel, taskViewModelsWithMatchingCategory) {
    const taskViewModels = new ListState();
    taskViewModelsWithMatchingCategory.handleAddition((taskViewModel) => {
      const doesMatchStatus = taskViewModel.status.value == statusName;
      if (doesMatchStatus == false) return;
      taskViewModels.add(taskViewModel);
      taskViewModelsWithMatchingCategory.handleRemoval(taskViewModel, () => {
        taskViewModels.remove(taskViewModel);
      });
    });
    function drop() {
      boardViewModel.handleDropWithinBoard(categoryName, statusName);
    }
    const view = /* @__PURE__ */ createElement(
      "div",
      {
        class: "status-column gap",
        "on:dragover": allowDrop,
        "on:drop": drop,
        "children:append": [taskViewModels, TaskViewModelToEntry]
      }
    );
    index.subscribe((newIndex) => {
      view.style.order = newIndex;
    });
    return view;
  }

  // src/View/Components/boardViewToggleButton.tsx
  function BoardViewToggleButton(label, icon, page, boardViewModel) {
    function select() {
      boardViewModel.selectedPage.value = page;
    }
    const isSelected = createProxyState(
      [boardViewModel.selectedPage],
      () => boardViewModel.selectedPage.value == page
    );
    return RibbonButton(label, icon, isSelected, select);
  }

  // src/View/Modals/searchModal.tsx
  function SearchModal(coreViewModel2, searchViewModel, headline, converter, isOpen) {
    function close() {
      isOpen.value = false;
    }
    const suggestionId = v4_default();
    return /* @__PURE__ */ createElement("div", { class: "modal", "toggle:open": isOpen }, /* @__PURE__ */ createElement("div", { style: "max-width: 64rem" }, /* @__PURE__ */ createElement("main", null, /* @__PURE__ */ createElement("h2", null, headline), /* @__PURE__ */ createElement("div", { class: "flex-row width-input" }, /* @__PURE__ */ createElement(
      "input",
      {
        placeholder: coreViewModel2.translations.general.searchLabel,
        "bind:value": searchViewModel.searchInput,
        "on:enter": searchViewModel.applySearch,
        list: suggestionId
      }
    ), /* @__PURE__ */ createElement(
      "datalist",
      {
        hidden: true,
        id: suggestionId,
        "children:append": [
          searchViewModel.suggestions,
          StringToOption
        ]
      }
    ), /* @__PURE__ */ createElement(
      "button",
      {
        class: "primary",
        "aria-label": coreViewModel2.translations.general.searchButtonAudioLabel,
        "on:click": searchViewModel.applySearch,
        "toggle:disabled": searchViewModel.cannotApplySearch
      },
      /* @__PURE__ */ createElement("span", { class: "icon" }, "search")
    )), /* @__PURE__ */ createElement("hr", null), /* @__PURE__ */ createElement(
      "div",
      {
        class: "grid gap",
        style: "grid-template-columns: repeat(auto-fit, minmax(12rem, 1fr))",
        "children:append": [
          searchViewModel.matchingObjects,
          converter
        ]
      }
    )), /* @__PURE__ */ createElement("button", { "on:click": close }, coreViewModel2.translations.general.closeButton, /* @__PURE__ */ createElement("span", { class: "icon" }, "close"))));
  }

  // src/View/ChatPages/boardPage.tsx
  function BoardPage(coreViewModel2, boardViewModel) {
    boardViewModel.loadData();
    const mainContent = createProxyState(
      [boardViewModel.selectedPage],
      () => {
        switch (boardViewModel.selectedPage.value) {
          case "kanban" /* Kanban */: {
            return BoardKanbanPage(coreViewModel2, boardViewModel);
          }
          case "status-grid" /* StatusGrid */: {
            return BoardStatusGridPage(coreViewModel2, boardViewModel);
          }
          default: {
            return /* @__PURE__ */ createElement(
              "div",
              {
                class: "task-grid",
                "children:append": [
                  boardViewModel.filteredTaskViewModels,
                  TaskViewModelToEntry
                ]
              }
            );
          }
        }
      }
    );
    const taskSettingsModal = createProxyState(
      [boardViewModel.selectedTaskViewModel],
      () => {
        if (boardViewModel.selectedTaskViewModel.value == void 0) {
          return /* @__PURE__ */ createElement("div", null);
        } else {
          setFocusWithDelay();
          return TaskSettingsModal(
            coreViewModel2,
            boardViewModel.selectedTaskViewModel.value
          );
        }
      }
    );
    return /* @__PURE__ */ createElement("div", { class: "pane" }, /* @__PURE__ */ createElement("div", { class: "toolbar" }, /* @__PURE__ */ createElement("span", null, /* @__PURE__ */ createElement(
      "button",
      {
        class: "ghost board-close-button",
        "aria-label": coreViewModel2.translations.chatPage.task.closeBoardButtonAudioLabel,
        "on:click": boardViewModel.close
      },
      /* @__PURE__ */ createElement("span", { class: "icon" }, "arrow_back")
    ), /* @__PURE__ */ createElement(
      "button",
      {
        class: "ghost board-toggle-button inset-outline",
        "aria-label": coreViewModel2.translations.chatPage.task.toggleBoardButtonAudioLabel,
        "on:click": boardViewModel.taskPageViewModel.toggleBoardList,
        "toggle:selected": boardViewModel.taskPageViewModel.isShowingBoadList
      },
      /* @__PURE__ */ createElement("span", { class: "icon" }, "dock_to_right")
    ), /* @__PURE__ */ createElement(
      "button",
      {
        class: "ghost",
        "aria-label": coreViewModel2.translations.chatPage.task.boardSettingsHeadline,
        "on:click": boardViewModel.showSettings
      },
      /* @__PURE__ */ createElement("span", { class: "icon" }, "settings")
    )), /* @__PURE__ */ createElement("span", { class: "scroll-h ribbon" }, BoardViewToggleButton(
      coreViewModel2.translations.chatPage.task.listViewButtonAudioLabel,
      "view_list",
      "list" /* List */,
      boardViewModel
    ), BoardViewToggleButton(
      coreViewModel2.translations.chatPage.task.kanbanViewButtonAudioLabel,
      "view_kanban",
      "kanban" /* Kanban */,
      boardViewModel
    ), BoardViewToggleButton(
      coreViewModel2.translations.chatPage.task.statusViewButtonAudioLabel,
      "grid_view",
      "status-grid" /* StatusGrid */,
      boardViewModel
    )), /* @__PURE__ */ createElement("span", null, /* @__PURE__ */ createElement(
      "button",
      {
        class: "ghost",
        "aria-label": coreViewModel2.translations.chatPage.task.filterTasksButtonAudioLabel,
        "on:click": boardViewModel.showFilterModal
      },
      /* @__PURE__ */ createElement("span", { class: "icon" }, "filter_alt")
    ), /* @__PURE__ */ createElement(
      "button",
      {
        class: "ghost",
        "aria-label": coreViewModel2.translations.chatPage.task.createTaskButtonAudioLabel,
        "on:click": boardViewModel.createTask
      },
      /* @__PURE__ */ createElement("span", { class: "icon" }, "add")
    ))), /* @__PURE__ */ createElement("div", { class: "content main-content", "children:set": mainContent }), BoardSettingsModal(coreViewModel2, boardViewModel), SearchModal(
      coreViewModel2,
      boardViewModel.searchViewModel,
      coreViewModel2.translations.chatPage.task.filterTasksHeadline,
      TaskViewModelToEntry,
      boardViewModel.isPresentingFilterModal
    ), /* @__PURE__ */ createElement("div", { "children:set": taskSettingsModal }));
  }

  // src/View/Components/boardEntry.tsx
  function BoardEntry(boardViewModel) {
    const view = /* @__PURE__ */ createElement(
      "button",
      {
        "set:color": boardViewModel.color,
        class: "tile colored-tile",
        "toggle:selected": boardViewModel.isSelected,
        "on:click": boardViewModel.select,
        "on:dragover": allowDrop,
        "on:drop": boardViewModel.handleDropBetweenBoards
      },
      /* @__PURE__ */ createElement(
        "span",
        {
          class: "shadow",
          "subscribe:innerText": boardViewModel.name
        }
      ),
      /* @__PURE__ */ createElement("b", { "subscribe:innerText": boardViewModel.name })
    );
    boardViewModel.index.subscribe((newIndex) => {
      view.style.order = newIndex;
    });
    return view;
  }
  var BoardViewModelToEntry = (boardViewModel) => {
    return BoardEntry(boardViewModel);
  };

  // src/View/ChatPages/taskPage.tsx
  function TaskPage(coreViewModel2, taskPageViewModel) {
    taskPageViewModel.loadData();
    const isShowingBoard = createProxyState(
      [taskPageViewModel.selectedBoardId],
      () => taskPageViewModel.selectedBoardId.value != void 0
    );
    const paneContent = createProxyState(
      [taskPageViewModel.selectedBoardId],
      () => {
        const selectedBoardId = taskPageViewModel.selectedBoardId.value;
        if (selectedBoardId == void 0) {
          return /* @__PURE__ */ createElement("div", { class: "pane align-center justify-center" }, /* @__PURE__ */ createElement("span", { class: "secondary" }, coreViewModel2.translations.chatPage.task.noBoardSelected));
        }
        const selectedBoard = taskPageViewModel.boardViewModels.value.get(selectedBoardId);
        if (selectedBoard == void 0) {
          return /* @__PURE__ */ createElement("div", { class: "pane align-center justify-center" }, /* @__PURE__ */ createElement("span", { class: "secondary" }, coreViewModel2.translations.chatPage.task.boardNotFound));
        }
        return BoardPage(coreViewModel2, selectedBoard);
      }
    );
    return /* @__PURE__ */ createElement(
      "div",
      {
        id: "task-page",
        "toggle:isshowingboard": isShowingBoard,
        "set:showingboardlist": taskPageViewModel.isShowingBoadList
      },
      /* @__PURE__ */ createElement(
        "div",
        {
          id: "board-list",
          class: "pane-wrapper side background",
          "set:color": taskPageViewModel.chatViewModel.displayedColor
        },
        /* @__PURE__ */ createElement("div", { class: "pane" }, /* @__PURE__ */ createElement("div", { class: "toolbar" }, /* @__PURE__ */ createElement("div", { class: "flex-row width-input" }, /* @__PURE__ */ createElement(
          "input",
          {
            class: "no-outline",
            "bind:value": taskPageViewModel.newBoardNameInput,
            "on:enter": taskPageViewModel.createBoard,
            placeholder: coreViewModel2.translations.chatPage.task.newBoardNamePlaceholder
          }
        ), /* @__PURE__ */ createElement(
          "button",
          {
            class: "primary",
            "aria-label": coreViewModel2.translations.chatPage.task.createBoardButtonAudioLabel,
            "on:click": taskPageViewModel.createBoard,
            "toggle:disabled": taskPageViewModel.cannotCreateBoard
          },
          /* @__PURE__ */ createElement("span", { class: "icon" }, "add")
        ))), /* @__PURE__ */ createElement("div", { class: "content" }, /* @__PURE__ */ createElement(
          "div",
          {
            class: "grid gap",
            style: "grid-template-columns: repeat(auto-fill, minmax(12rem, 1fr))",
            "children:append": [
              taskPageViewModel.boardViewModels,
              BoardViewModelToEntry
            ]
          }
        )))
      ),
      /* @__PURE__ */ createElement(
        "div",
        {
          id: "board-content",
          class: "pane-wrapper",
          "children:set": paneContent
        }
      )
    );
  }

  // src/View/chatPage.tsx
  function ChatPage(coreViewModel2, chatViewModel) {
    const mainContent = createProxyState(
      [chatViewModel.selectedPage],
      () => {
        chatViewModel.closeSubPages();
        switch (chatViewModel.selectedPage.value) {
          case "settings" /* Settings */: {
            return SettingsPage(
              coreViewModel2,
              chatViewModel.settingsPageViewModel
            );
          }
          case "tasks" /* Tasks */: {
            return TaskPage(
              coreViewModel2,
              chatViewModel.taskPageViewModel
            );
          }
          case "calendar" /* Calendar */: {
            return CalendarPage(
              coreViewModel2,
              chatViewModel.calendarViewModel
            );
          }
          default: {
            return MessagePage(
              coreViewModel2,
              chatViewModel.messagePageViewModel
            );
          }
        }
      }
    );
    const marqueeContent = createProxyState(
      [chatViewModel.notificationViewModel.marquee],
      () => {
        const value = chatViewModel.notificationViewModel.marquee.value;
        if (value == void 0) return /* @__PURE__ */ createElement("span", null);
        return /* @__PURE__ */ createElement(
          "span",
          {
            "on:click": chatViewModel.notificationViewModel.openNotification
          },
          /* @__PURE__ */ createElement("b", null, value.sender),
          /* @__PURE__ */ createElement("span", { class: "secondary" }, value.chat, ": "),
          /* @__PURE__ */ createElement("span", null, value.body)
        );
      }
    );
    return /* @__PURE__ */ createElement(
      "article",
      {
        id: "chat-page",
        "set:color": chatViewModel.displayedColor,
        class: "subtle-background"
      },
      /* @__PURE__ */ createElement("div", null, /* @__PURE__ */ createElement("div", { id: "ribbon" }, /* @__PURE__ */ createElement(
        "button",
        {
          class: "ghost",
          "aria-label": coreViewModel2.translations.chatPage.closeChatAudioLabe,
          "on:click": chatViewModel.close
        },
        /* @__PURE__ */ createElement("span", { class: "icon" }, "close")
      ), /* @__PURE__ */ createElement(
        "button",
        {
          class: "danger",
          "aria-label": coreViewModel2.translations.general.restoreConnection,
          "on:click": chatViewModel.connectionViewModel.showConnectionModal,
          "toggle:hidden": chatViewModel.connectionViewModel.isConnected
        },
        /* @__PURE__ */ createElement("span", { class: "icon" }, "signal_disconnected")
      ), /* @__PURE__ */ createElement("span", { class: "marquee", "children:set": marqueeContent }), /* @__PURE__ */ createElement("span", { class: "navigation-buttons" }, ChatViewToggleButton(
        coreViewModel2.translations.chatPage.pages.calendar,
        "calendar_month",
        "calendar" /* Calendar */,
        chatViewModel
      ), ChatViewToggleButton(
        coreViewModel2.translations.chatPage.pages.tasks,
        "task_alt",
        "tasks" /* Tasks */,
        chatViewModel
      ), ChatViewToggleButton(
        coreViewModel2.translations.chatPage.pages.messages,
        "forum",
        "messages" /* Messages */,
        chatViewModel
      ), ChatViewToggleButton(
        coreViewModel2.translations.chatPage.pages.settings,
        "settings",
        "settings" /* Settings */,
        chatViewModel
      ))), /* @__PURE__ */ createElement("div", { id: "main", "children:set": mainContent }))
    );
  }

  // src/View/chatPageWrapper.tsx
  function ChatPageWrapper(coreViewModel2, chatListViewModel2) {
    const chatPageContent = createProxyState(
      [chatListViewModel2.selectedChat],
      () => {
        if (chatListViewModel2.selectedChat.value == void 0) {
          return /* @__PURE__ */ createElement("div", null);
        } else {
          return ChatPage(
            coreViewModel2,
            chatListViewModel2.selectedChat.value
          );
        }
      }
    );
    return /* @__PURE__ */ createElement("div", { id: "chat-page-wrapper", "children:set": chatPageContent });
  }

  // src/View/Modals/connectionModal.tsx
  function ConnectionModal(coreViewModel2, connectionViewModel2) {
    const previousAddressConverter = (address) => {
      function connnect() {
        connectionViewModel2.connectToAddress(address);
      }
      const cannotConnect = createProxyState(
        [connectionViewModel2.isConnected],
        () => connectionViewModel2.isConnected.value == true && connectionViewModel2.coreViewModel.connectionModel.address == address
      );
      return DeletableListItem(
        coreViewModel2,
        address,
        /* @__PURE__ */ createElement(
          "button",
          {
            class: "primary",
            "on:click": connnect,
            "toggle:disabled": cannotConnect,
            "aria-label": coreViewModel2.translations.connectionModal.connectButtonAudioLabel
          },
          /* @__PURE__ */ createElement("span", { class: "icon" }, "link")
        ),
        () => {
          connectionViewModel2.removePreviousAddress(address);
        }
      );
    };
    return /* @__PURE__ */ createElement(
      "div",
      {
        class: "modal",
        "toggle:open": connectionViewModel2.isShowingConnectionModal
      },
      /* @__PURE__ */ createElement("div", null, /* @__PURE__ */ createElement("main", null, /* @__PURE__ */ createElement("h2", null, coreViewModel2.translations.connectionModal.connectionModalHeadline), /* @__PURE__ */ createElement(
        "div",
        {
          class: "flex-column gap",
          "children:append": [
            connectionViewModel2.previousAddresses,
            previousAddressConverter
          ]
        }
      )), /* @__PURE__ */ createElement("button", { "on:click": connectionViewModel2.hideConnectionModal }, coreViewModel2.translations.general.closeButton, /* @__PURE__ */ createElement("span", { class: "icon" }, "close")))
    );
  }

  // node_modules/udn-frontend/index.ts
  var UDNFrontend = class {
    ws;
    // HANDLERS
    connectionHandler = () => {
    };
    disconnectionHandler = () => {
    };
    messageHandler = (data) => {
    };
    mailboxHandler = (mailboxId) => {
    };
    mailboxConnectionHandler = (mailboxId) => {
    };
    mailboxDeleteHandler = (mailboxId) => {
    };
    // INIT
    set onconnect(handler) {
      this.connectionHandler = handler;
    }
    set ondisconnect(handler) {
      this.disconnectionHandler = handler;
    }
    set onmessage(handler) {
      this.messageHandler = handler;
    }
    set onmailboxcreate(handler) {
      this.mailboxHandler = handler;
    }
    set onmailboxconnect(handler) {
      this.mailboxConnectionHandler = handler;
    }
    set onmailboxdelete(handler) {
      this.mailboxDeleteHandler = handler;
    }
    // UTILITY METHODS
    send(messageObject) {
      if (this.ws == void 0) return false;
      if (this.ws.readyState != 1) return false;
      const messageString = JSON.stringify(messageObject);
      this.ws.send(messageString);
      return true;
    }
    // PUBLIC METHODS
    // connection
    connect(address) {
      try {
        this.disconnect();
        this.ws = new WebSocket(address);
        this.ws.addEventListener("open", this.connectionHandler);
        this.ws.addEventListener("close", this.disconnectionHandler);
        this.ws.addEventListener("message", (message) => {
          const dataString = message.data.toString();
          const data = JSON.parse(dataString);
          if (data.assignedMailboxId) {
            return this.mailboxHandler(data.assignedMailboxId);
          } else if (data.connectedMailboxId) {
            return this.mailboxConnectionHandler(data.connectedMailboxId);
          } else if (data.deletedMailbox) {
            return this.mailboxDeleteHandler(data.deletedMailbox);
          } else {
            this.send({ uuid: data.uuid, confirmingMessageReceived: true });
            this.messageHandler(data);
          }
        });
      } catch (error) {
        console.error(error);
      }
    }
    disconnect() {
      this.ws?.close();
    }
    // message
    sendMessage(channel, body) {
      const messageObject = {
        messageChannel: channel,
        messageBody: body
      };
      return this.send(messageObject);
    }
    // subscription
    subscribe(channel) {
      const messageObject = {
        subscribeChannel: channel
      };
      return this.send(messageObject);
    }
    unsubscribe(channel) {
      const messageObject = {
        unsubscribeChannel: channel
      };
      return this.send(messageObject);
    }
    // mailbox
    requestMailbox() {
      const messageObject = {
        requestingMailboxSetup: true
      };
      return this.send(messageObject);
    }
    connectMailbox(mailboxId) {
      const messageObject = {
        requestedMailbox: mailboxId
      };
      return this.send(messageObject);
    }
    deleteMailbox(mailboxId) {
      const messageObject = {
        deletingMailbox: mailboxId
      };
      return this.send(messageObject);
    }
  };

  // src/Model/Global/connectionModel.ts
  var ConnectionModel = class {
    // init
    constructor(storageModel2) {
      this.reconnectInterval = void 0;
      this.shouldAttemptReconnect = false;
      this.connectionChangeHandlerManager = new HandlerManager();
      this.messageHandlerManager = new HandlerManager();
      this.messageSentHandlerManager = new HandlerManager();
      this.channelsToSubscribe = /* @__PURE__ */ new Set();
      // handlers
      this.handleMessage = (data) => {
        this.messageHandlerManager.trigger(data);
      };
      this.handleConnectionChange = () => {
        console.log("connection status:", this.isConnected, this.address);
        this.connectionChangeHandlerManager.trigger();
        if (this.address == void 0) return;
        this.storeAddress(this.address);
        this.sendSubscriptionRequest();
        this.sendMessagesInOutbox();
      };
      // connection
      this.connect = (address) => {
        console.log("connecting...", address);
        this.shouldAttemptReconnect = true;
        this.udn.connect(address);
      };
      this.disconnect = () => {
        this.shouldAttemptReconnect = false;
        this.udn.disconnect();
        const reconnectAddressPath = StorageModel.getPath(
          "connection" /* ConnectionModel */,
          filePaths.connectionModel.reconnectAddress
        );
        this.storageModel.remove(reconnectAddressPath);
      };
      this.reconnect = () => {
        const reconnectAddressPath = this.getReconnectAddressPath();
        const reconnectAddress = this.storageModel.read(reconnectAddressPath);
        if (reconnectAddress == null) return;
        console.log("reconnecting...");
        this.connect(reconnectAddress);
      };
      // mailbox
      this.getMailboxPath = (address) => {
        const mailboxDirPath = StorageModel.getPath(
          "connection" /* ConnectionModel */,
          filePaths.connectionModel.mailboxes
        );
        const mailboxFilePath = [...mailboxDirPath, address];
        return mailboxFilePath;
      };
      this.requestNewMailbox = () => {
        console.log("requesting new mailbox");
        this.udn.requestMailbox();
      };
      this.connectMailbox = () => {
        if (this.address == void 0) return;
        const mailboxId = this.storageModel.read(
          this.getMailboxPath(this.address)
        );
        console.log("connecting mailbox", mailboxId);
        if (mailboxId == null) return this.requestNewMailbox();
        this.udn.connectMailbox(mailboxId);
      };
      this.storeMailbox = (mailboxId) => {
        if (this.address == void 0) return;
        this.storageModel.write(this.getMailboxPath(this.address), mailboxId);
      };
      // subscription
      this.addChannel = (channel) => {
        this.channelsToSubscribe.add(channel);
        this.sendSubscriptionRequest();
      };
      this.sendSubscriptionRequest = () => {
        if (this.isConnected == false) return;
        for (const channel of this.channelsToSubscribe) {
          this.udn.subscribe(channel);
        }
        this.connectMailbox();
      };
      // outbox
      this.getOutboxPath = () => {
        return StorageModel.getPath(
          "connection" /* ConnectionModel */,
          filePaths.connectionModel.outbox
        );
      };
      this.getOutboxMessags = () => {
        const outboxPath = this.getOutboxPath();
        const messageIds = this.storageModel.list(outboxPath);
        let chatMessages = [];
        for (const messageId of messageIds) {
          const chatMessage = this.storageModel.readStringifiable(
            [...outboxPath, messageId],
            ChatMessageReference
          );
          if (chatMessage == null) continue;
          chatMessages.push(chatMessage);
        }
        return chatMessages;
      };
      this.addToOutbox = (chatMessage) => {
        const messagePath = [...this.getOutboxPath(), chatMessage.id];
        this.storageModel.writeStringifiable(messagePath, chatMessage);
      };
      this.removeFromOutbox = (chatMessage) => {
        const messagePath = [...this.getOutboxPath(), chatMessage.id];
        this.storageModel.remove(messagePath);
      };
      this.sendMessagesInOutbox = () => {
        const messages = this.getOutboxMessags();
        for (const message of messages) {
          const isSent = this.tryToSendMessage(message);
          if (isSent == false) return;
          this.removeFromOutbox(message);
        }
      };
      // messaging
      this.sendMessageOrStore = (chatMessage) => {
        const isSent = this.tryToSendMessage(chatMessage);
        if (isSent == true) return;
        this.addToOutbox(chatMessage);
      };
      this.tryToSendMessage = (chatMessage) => {
        const stringifiedBody = stringify(chatMessage);
        const isSent = this.sendPlainMessage(
          chatMessage.channel,
          stringifiedBody
        );
        if (isSent) this.messageSentHandlerManager.trigger(chatMessage);
        return isSent;
      };
      this.sendPlainMessage = (channel, body) => {
        return this.udn.sendMessage(channel, body);
      };
      // storage
      this.getPreviousAddressPath = () => {
        return StorageModel.getPath(
          "connection" /* ConnectionModel */,
          filePaths.connectionModel.previousAddresses
        );
      };
      this.getAddressPath = (address) => {
        const dirPath = this.getPreviousAddressPath();
        return [...dirPath, address];
      };
      this.getReconnectAddressPath = () => {
        return StorageModel.getPath(
          "connection" /* ConnectionModel */,
          filePaths.connectionModel.reconnectAddress
        );
      };
      this.storeAddress = (address) => {
        const addressPath = this.getAddressPath(address);
        this.storageModel.write(addressPath, "");
        const reconnectAddressPath = this.getReconnectAddressPath();
        this.storageModel.write(reconnectAddressPath, address);
      };
      this.removeAddress = (address) => {
        const addressPath = this.getAddressPath(address);
        this.storageModel.remove(addressPath);
      };
      this.udn = new UDNFrontend();
      this.storageModel = storageModel2;
      this.udn.onmessage = (data) => {
        this.handleMessage(data);
      };
      this.udn.onconnect = () => {
        this.handleConnectionChange();
      };
      this.udn.ondisconnect = () => {
        this.handleConnectionChange();
      };
      this.udn.onmailboxcreate = (mailboxId) => {
        console.log("created mailbox", mailboxId);
        this.storeMailbox(mailboxId);
        this.connectMailbox();
      };
      this.udn.onmailboxdelete = (mailboxId) => {
        console.log(`mailbox ${mailboxId} deleted`);
        this.requestNewMailbox();
      };
      this.udn.onmailboxconnect = (mailboxId) => {
        console.log(`using mailbox ${mailboxId}`);
      };
      setInterval(() => {
        if (this.isConnected == true) return;
        if (this.shouldAttemptReconnect == false) return;
        this.reconnect();
      }, 5e3);
      this.reconnect();
    }
    // data
    get isConnected() {
      return this.udn.ws != void 0 && this.udn.ws.readyState == 1;
    }
    get address() {
      return this.udn.ws?.url;
    }
    get addresses() {
      const dirPath = this.getPreviousAddressPath();
      return this.storageModel.list(dirPath);
    }
  };

  // src/ViewModel/Global/connectionViewModel.ts
  var ConnectionViewModel = class {
    // init
    constructor(coreViewModel2) {
      this.coreViewModel = coreViewModel2;
      // state
      this.serverAddressInput = new State("");
      this.isConnected = new State(false);
      this.isShowingConnectionModal = new State(false);
      this.previousAddresses = new ListState();
      // guards
      this.cannotConnect = createProxyState(
        [this.serverAddressInput, this.isConnected],
        () => this.isConnected.value == true && this.serverAddressInput.value == this.coreViewModel.connectionModel.address || this.serverAddressInput.value == ""
      );
      this.cannotDisonnect = createProxyState(
        [this.isConnected],
        () => this.isConnected.value == false
      );
      this.hasNoPreviousConnections = createProxyState(
        [this.previousAddresses],
        () => this.previousAddresses.value.size == 0
      );
      // handlers
      this.connectionChangeHandler = () => {
        this.isConnected.value = this.coreViewModel.connectionModel.isConnected;
        if (this.coreViewModel.connectionModel.isConnected == false) return;
        if (this.coreViewModel.connectionModel.address == void 0) return;
        this.serverAddressInput.value = this.coreViewModel.connectionModel.address;
        if (!this.previousAddresses.value.has(
          this.coreViewModel.connectionModel.address
        )) {
          this.previousAddresses.add(
            this.coreViewModel.connectionModel.address
          );
        }
      };
      // methods
      this.connect = () => {
        this.connectToAddress(this.serverAddressInput.value);
      };
      this.connectToAddress = (address) => {
        console.log(address);
        this.coreViewModel.connectionModel.connect(address);
      };
      this.disconnect = () => {
        this.coreViewModel.connectionModel.disconnect();
      };
      this.removePreviousAddress = (address) => {
        this.coreViewModel.connectionModel.removeAddress(address);
        this.updatePreviousAddresses();
      };
      // view
      this.showConnectionModal = () => {
        this.isShowingConnectionModal.value = true;
      };
      this.hideConnectionModal = () => {
        this.isShowingConnectionModal.value = false;
      };
      this.updatePreviousAddresses = () => {
        this.previousAddresses.clear();
        this.previousAddresses.add(
          ...this.coreViewModel.connectionModel.addresses
        );
      };
      this.updatePreviousAddresses();
      coreViewModel2.connectionModel.connectionChangeHandlerManager.addHandler(
        this.connectionChangeHandler
      );
    }
  };

  // src/View/translations.ts
  var englishTranslations = {
    updater: {
      migrated: "Migrated"
    },
    general: {
      deleteItemButtonAudioLabel: "delete item",
      searchButtonAudioLabel: "search",
      abortButton: "Abort",
      cancelButton: "Cancel",
      closeButton: "Close",
      backButton: "Back",
      continueButton: "Continue",
      confirmButton: "Confirm",
      saveButton: "Save",
      setButton: "Set",
      reloadAppButton: "Reload App",
      fileVersionLabel: "Version",
      searchLabel: "Search",
      waitingLabel: "Waiting...",
      restoreConnection: "Restore connection"
    },
    regional: {
      weekdays: {
        full: [
          "Sunday",
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday"
        ],
        abbreviated: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
      }
    },
    homePage: {
      appName: "Comms",
      ///
      overviewHeadline: "Overview",
      serverAddress: "Server address",
      serverAddressPlaceholder: "wss://192.168.0.69:3000",
      connectAudioLabel: "connect to server",
      disconnectAudioLabel: "disconnect from server",
      manageConnectionsAudioLabel: "manage connections",
      yourNameLabel: "Your name",
      yourNamePlaceholder: "Jane Doe",
      setNameButtonAudioLabel: "set name",
      settingsButton: "Settings",
      manageStorageButton: "Manage storage",
      transferDataButton: "Data Transfer",
      scrollToChatButton: "Chats",
      ///
      backToOverviewAudioLabel: "go back to overview",
      chatsHeadline: "Chats",
      addChatAudioLabel: "name of new chat",
      addChatPlaceholder: "Add chat",
      addChatButton: "Add chat"
    },
    settings: {
      pages: {
        appearance: "Appearance",
        regional: "Language & Region",
        info: "About Comms"
      },
      themes: {
        dark: "Dark",
        light: "Light",
        system: "Device theme"
      },
      version: "Version",
      language: "Language",
      firstDayOfWeekLabel: "First day of week"
    },
    connectionModal: {
      connectionModalHeadline: "Manage Connections",
      ///
      connectButtonAudioLabel: "connect"
    },
    dataTransferModal: {
      transferDataHeadline: "Data Transfer",
      selectionDescription: "Select the data that you want to transfer.",
      dataEntryDescription: "Enter this data on the other device.",
      dataEntryInputDescription: "Enter the data displayed on the other device.",
      notConnectedError: "You are not connected to any server.",
      ///
      fromThisDeviceButton: "From this device",
      toThisDeviceButton: "To this device",
      ///
      generalHeadline: "General",
      connectionData: "Connection Data",
      settingsData: "Settings Data",
      chatsHeadline: "Chats",
      ///
      transferChannelHeadline: "Transfer Chanel",
      transferKeyHeadline: "Transfer Encryption Key",
      sendButton: "Send",
      sendAgainButton: "Send again",
      ///
      filesSentCount: (count) => `Files sent: ${count}.`,
      allFilesSent: "Done.",
      filesReceivedCount: (count) => `Files received: ${count}.`
    },
    storage: {
      noItemSelected: "No item selected",
      notAFile: "(not a file)",
      contentEmpty: "(empty)",
      path: "Path",
      content: "Content",
      deleteItem: "Delete item",
      removeJunkButton: "Delete junk files"
    },
    chatPage: {
      closeChatAudioLabe: "close chat",
      chatSettingsAudioLabel: "chat settings",
      pages: {
        settings: "Settings",
        messages: "Messages",
        tasks: "Tasks",
        calendar: "Calendar"
      },
      settings: {
        settingsHeadline: "Settings",
        primaryChannelLabel: "Primary channel",
        setPrimaryChannelButtonAudioLabel: "set primary channel",
        newSecondaryChannelPlaceholder: "Add secondary channel",
        newSecondaryChannelAudioLabel: "name of new secondary channel",
        addSecondaryChannelButtonAudioLabel: "add secondary channel",
        encryptionKeyLabel: "Encryption key",
        setEncryptionKeyButtonAudioLabel: "set encryption key",
        showEncryptionKey: "Show encryption key",
        deleteChatButton: "Delete entire chat"
      },
      message: {
        messagesHeadline: "Messages",
        ///
        composerInputPlaceholder: "Type a message...",
        sendMessageButtonAudioLabel: "send message",
        ///
        showMessageInfoButtonAudioLabel: "show message info",
        messageInfoHeadline: "Message Info",
        sentBy: "Sent by",
        timeSent: "Time sent",
        channel: "Channel",
        messageContent: "Message content",
        copyMessageButton: "Copy message",
        resendMessageButton: "Resend message",
        decryptMessageButton: "Decrypt message",
        deleteMessageButton: "Delete message",
        //
        thumbsUpReaction: "Reaction: thumbs up",
        checkReaction: "Reaction: check",
        stopReaction: "Reaction: stop sign",
        attentionReaction: "Reaction: exclamation mark",
        doubleAttentionReaction: "Reaction: double exclamation mark",
        questionReaction: "Reaction: question mark"
      },
      task: {
        newBoardNamePlaceholder: "Create a board",
        createBoardButtonAudioLabel: "create board",
        ///
        noBoardSelected: "No board selected",
        boardNotFound: "Board not found",
        ///
        closeBoardButtonAudioLabel: "close board",
        toggleBoardButtonAudioLabel: "toggle board list",
        showBoardSettingsButtonAudioLabel: "show board settigns",
        listViewButtonAudioLabel: "list view",
        kanbanViewButtonAudioLabel: "kanban view",
        statusViewButtonAudioLabel: "status grid view",
        filterTasksButtonAudioLabel: "filter tasks",
        createTaskButtonAudioLabel: "create new task",
        ///
        boardSettingsHeadline: "Board Settings",
        boardNameInputLabel: "Board name",
        deleteBoardButton: "Delete board and all tasks",
        ///
        taskSettingsHeadline: "Edit Task",
        taskNameLabel: "Title",
        taskBoardLabel: "Board",
        taskCategoryLabel: "Category",
        taskStatusLabel: "Status",
        taskPriorityLabel: "Priority",
        taskDescriptionLabel: "Description",
        taskDateLabel: "Date",
        taskTimeLabel: "Time",
        deleteTaskButton: "Delete task",
        ///
        filterTasksHeadline: "Filter Tasks",
        ///
        renameCategoryInputPlaceholder: "Rename category",
        renameStatusInputPlaceholder: "Rename status"
      },
      calendar: {
        eventsBoard: "Events",
        ///
        todayButtonAudioLabel: "go to today",
        previousMonthButtonAudioLabel: "previous month",
        nextMonthButtonAudioLabel: "next month",
        yearInputAudioLabel: "year",
        monthInputAudioLabel: "month",
        yearInputPlaceholder: "2000",
        monthInputPlaceholder: "01",
        ///
        searchEventsHeadline: "Search Events",
        ///
        events: "Events",
        noEvents: "No events"
      }
    }
  };
  var allTranslations = {
    en: englishTranslations,
    de: {
      updater: {
        migrated: "Migriert"
      },
      general: {
        deleteItemButtonAudioLabel: "element l\xF6schen",
        searchButtonAudioLabel: "suchen",
        abortButton: "Abbrechen",
        cancelButton: "Abbrechen",
        closeButton: "Schlie\xDFen",
        backButton: "Zur\xFCck",
        continueButton: "Weiter",
        confirmButton: "Best\xE4tigen",
        saveButton: "Speichern",
        setButton: "OK",
        reloadAppButton: "Neu laden",
        fileVersionLabel: "Version",
        searchLabel: "Suche",
        waitingLabel: "Warten...",
        restoreConnection: "Verbindung wiederherstellen"
      },
      regional: {
        weekdays: {
          full: [
            "Sonntag",
            "Montag",
            "Dienstag",
            "Mittwoch",
            "Donnerstag",
            "Freitag",
            "Samstag"
          ],
          abbreviated: ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"]
        }
      },
      homePage: {
        appName: "Comms",
        overviewHeadline: "\xDCbersicht",
        serverAddress: "Serveradresse",
        serverAddressPlaceholder: "wss://192.168.0.69:3000",
        connectAudioLabel: "mit Server verbinden",
        disconnectAudioLabel: "vom Server trennen",
        manageConnectionsAudioLabel: "Verbindungen verwalten",
        yourNameLabel: "Dein Name",
        yourNamePlaceholder: "Max Mustermann",
        setNameButtonAudioLabel: "Name speichern",
        settingsButton: "Einstellungen",
        manageStorageButton: "Daten verwalten",
        transferDataButton: "Daten\xFCbertragung",
        scrollToChatButton: "Chats",
        backToOverviewAudioLabel: "zur\xFCck zur \xFCbersicht",
        chatsHeadline: "Chats",
        addChatAudioLabel: "Name des neuen Chats",
        addChatPlaceholder: "Chat hinzuf\xFCgen",
        addChatButton: "Chat hinzuf\xFCgen"
      },
      settings: {
        pages: {
          appearance: "Erscheinungsbild",
          regional: "Sprache & Region",
          info: "\xDCber Comms"
        },
        themes: {
          dark: "Dunkel",
          light: "Hell",
          system: "Ger\xE4teeinstellung"
        },
        version: "Version",
        language: "Sprache",
        firstDayOfWeekLabel: "Erster Wochentag"
      },
      connectionModal: {
        connectionModalHeadline: "Verbindungen verwalten",
        connectButtonAudioLabel: "verbinden"
      },
      dataTransferModal: {
        transferDataHeadline: "Daten\xFCbertragung",
        selectionDescription: "W\xE4hle die Daten aus, die du \xFCbertragen m\xF6chtest.",
        dataEntryDescription: "Gib diese Informationen auf dem anderen Ger\xE4t ein.",
        dataEntryInputDescription: "Gib die auf dem anderen Ger\xE4t angezeigten Informationen ein.",
        notConnectedError: "Du bist mit keinem Server verbunden.",
        fromThisDeviceButton: "Von diesem Ger\xE4t",
        toThisDeviceButton: "An dieses Ger\xE4t",
        generalHeadline: "Allgemein",
        connectionData: "Verbindungsdaten",
        settingsData: "Einstellungen",
        chatsHeadline: "Chats",
        transferChannelHeadline: "\xDCbertragungskanal",
        transferKeyHeadline: "Schl\xFCssel",
        sendButton: "Senden",
        sendAgainButton: "Erneut senden",
        filesSentCount: (count) => `Dateien gesendet: ${count}.`,
        allFilesSent: "Fertig.",
        filesReceivedCount: (count) => `Dateien empfangen: ${count}.`
      },
      storage: {
        noItemSelected: "Kein Element ausgew\xE4hlt",
        notAFile: "(keine Datei)",
        contentEmpty: "(leer)",
        path: "Pfad",
        content: "Inhalt",
        deleteItem: "Element l\xF6schen",
        removeJunkButton: "Datenm\xFCll l\xF6schen"
      },
      chatPage: {
        closeChatAudioLabe: "Chat schlie\xDFen",
        chatSettingsAudioLabel: "Chateinstellungen",
        pages: {
          settings: "Einstellungen",
          messages: "Nachrichten",
          tasks: "Aufgaben",
          calendar: "Kalender"
        },
        settings: {
          settingsHeadline: "Einstellungen",
          primaryChannelLabel: "Hauptkanal",
          setPrimaryChannelButtonAudioLabel: "Hauptkanal festlegen",
          newSecondaryChannelPlaceholder: "Sekund\xE4ren Kanal hinzuf\xFCgen",
          newSecondaryChannelAudioLabel: "Name des neuen sekund\xE4ren Kanals",
          addSecondaryChannelButtonAudioLabel: "Sekund\xE4ren Kanal hinzuf\xFCgen",
          encryptionKeyLabel: "Schl\xFCssel",
          setEncryptionKeyButtonAudioLabel: "Schl\xFCssel festlegen",
          showEncryptionKey: "Schl\xFCssel anzeigen",
          deleteChatButton: "Gesamten Chat l\xF6schen"
        },
        message: {
          messagesHeadline: "Nachrichten",
          composerInputPlaceholder: "Schreib eine Nachricht...",
          sendMessageButtonAudioLabel: "nachricht senden",
          showMessageInfoButtonAudioLabel: "nachrichteninfo anzeigen",
          messageInfoHeadline: "Nachrichteninfo",
          sentBy: "Gesendet von",
          timeSent: "Sendezeit",
          channel: "Kanal",
          messageContent: "Nachrichteninhalt",
          copyMessageButton: "Nachricht kopieren",
          resendMessageButton: "Nachricht erneut senden",
          decryptMessageButton: "Nachricht entschl\xFCsseln",
          deleteMessageButton: "Nachricht l\xF6schen",
          //
          thumbsUpReaction: "Reaktion: Daumen hoch",
          checkReaction: "Reaktion: Haken",
          stopReaction: "Reaktion: Stopp",
          attentionReaction: "Reaktion: Ausrufezeichen",
          doubleAttentionReaction: "Reaktion: doppeltes Ausrufezeichen",
          questionReaction: "Reaktion: Fragezeichen"
        },
        task: {
          newBoardNamePlaceholder: "Board erstellen",
          createBoardButtonAudioLabel: "board erstellen",
          noBoardSelected: "Kein Board ausgew\xE4hlt",
          boardNotFound: "Board nicht gefunden",
          closeBoardButtonAudioLabel: "board schlie\xDFen",
          toggleBoardButtonAudioLabel: "board-liste ein/ausblenden",
          showBoardSettingsButtonAudioLabel: "Board-Einstellungen anzeigen",
          listViewButtonAudioLabel: "Listenansicht",
          kanbanViewButtonAudioLabel: "Kanban-Ansicht",
          statusViewButtonAudioLabel: "Statusrasteransicht",
          filterTasksButtonAudioLabel: "Aufgaben filtern",
          createTaskButtonAudioLabel: "Neue Aufgabe erstellen",
          boardSettingsHeadline: "Board-Einstellungen",
          boardNameInputLabel: "Boardname",
          deleteBoardButton: "Board und alle Aufgaben l\xF6schen",
          taskSettingsHeadline: "Aufgabe bearbeiten",
          taskNameLabel: "Titel",
          taskBoardLabel: "Board",
          taskCategoryLabel: "Kategorie",
          taskStatusLabel: "Status",
          taskPriorityLabel: "Priorit\xE4t",
          taskDescriptionLabel: "Beschreibung",
          taskDateLabel: "Datum",
          taskTimeLabel: "Uhrzeit",
          deleteTaskButton: "Aufgabe l\xF6schen",
          filterTasksHeadline: "Aufgaben filtern",
          renameCategoryInputPlaceholder: "Kategorie umbenennen",
          renameStatusInputPlaceholder: "Status umbenennen"
        },
        calendar: {
          eventsBoard: "Ereignisse",
          ///
          todayButtonAudioLabel: "gehe zu heute",
          previousMonthButtonAudioLabel: "vorheriger monat",
          nextMonthButtonAudioLabel: "n\xE4chster monat",
          yearInputAudioLabel: "Jahr",
          monthInputAudioLabel: "Monat",
          yearInputPlaceholder: "2000",
          monthInputPlaceholder: "01",
          searchEventsHeadline: "Ereignisse suchen",
          events: "Ereignisse",
          noEvents: "Keine Ereignisse"
        }
      }
    },
    es: {
      updater: {
        migrated: "Migrado"
      },
      general: {
        deleteItemButtonAudioLabel: "eliminar elemento",
        searchButtonAudioLabel: "buscar",
        abortButton: "Abortar",
        cancelButton: "Cancelar",
        closeButton: "Cerrar",
        backButton: "Atr\xE1s",
        continueButton: "Continuar",
        confirmButton: "Confirmar",
        saveButton: "Guardar",
        setButton: "OK",
        reloadAppButton: "Recargar app",
        fileVersionLabel: "Versi\xF3n",
        searchLabel: "Buscar",
        waitingLabel: "Esperando...",
        restoreConnection: "Conectar de nuevo"
      },
      regional: {
        weekdays: {
          full: [
            "Domingo",
            "Lunes",
            "Martes",
            "Mi\xE9rcoles",
            "Jueves",
            "Viernes",
            "S\xE1bado"
          ],
          abbreviated: ["Dom", "Lun", "Mar", "Mi\xE9", "Jue", "Vie", "S\xE1b"]
        }
      },
      homePage: {
        appName: "Comms",
        overviewHeadline: "Resumen",
        serverAddress: "Direcci\xF3n del servidor",
        serverAddressPlaceholder: "wss://192.168.0.69:3000",
        connectAudioLabel: "conectar al servidor",
        disconnectAudioLabel: "desconectar del servidor",
        manageConnectionsAudioLabel: "gestionar conexiones",
        yourNameLabel: "Tu nombre",
        yourNamePlaceholder: "Juan P\xE9rez",
        setNameButtonAudioLabel: "establecer nombre",
        settingsButton: "Ajustes",
        manageStorageButton: "Gestionar almacenamiento",
        transferDataButton: "Transferencia de datos",
        scrollToChatButton: "Chats",
        backToOverviewAudioLabel: "volver al resumen",
        chatsHeadline: "Chats",
        addChatAudioLabel: "nombre del nuevo chat",
        addChatPlaceholder: "A\xF1adir chat",
        addChatButton: "A\xF1adir chat"
      },
      settings: {
        pages: {
          appearance: "Aspecto",
          regional: "Idioma y Regi\xF3n",
          info: "Sobre Comms"
        },
        themes: {
          dark: "Oscuro",
          light: "Claro",
          system: "Seg\xFAn dispositivo"
        },
        version: "Versi\xF3n",
        language: "Idioma",
        firstDayOfWeekLabel: "Primer d\xEDa de la semana"
      },
      connectionModal: {
        connectionModalHeadline: "Gestionar Conexiones",
        connectButtonAudioLabel: "conectar"
      },
      dataTransferModal: {
        transferDataHeadline: "Transferencia de Datos",
        selectionDescription: "Selecciona los datos que quieres transferir.",
        dataEntryDescription: "Introduce estos datos en el otro dispositivo.",
        dataEntryInputDescription: "Introduce los datos mostrados en el otro dispositivo.",
        notConnectedError: "No est\xE1s conectado a ning\xFAn servidor.",
        fromThisDeviceButton: "Desde este dispositivo",
        toThisDeviceButton: "A este dispositivo",
        generalHeadline: "General",
        connectionData: "Datos de Conexi\xF3n",
        settingsData: "Datos de Configuraci\xF3n",
        chatsHeadline: "Chats",
        transferChannelHeadline: "Canal de Transferencia",
        transferKeyHeadline: "Clave de Encriptaci\xF3n de Transferencia",
        sendButton: "Enviar",
        sendAgainButton: "Enviar otra vez",
        filesSentCount: (count) => `Archivos enviados: ${count}.`,
        allFilesSent: "Hecho.",
        filesReceivedCount: (count) => `Archivos recibidos: ${count}.`
      },
      storage: {
        noItemSelected: "Ning\xFAn elemento seleccionado",
        notAFile: "(no es un archivo)",
        contentEmpty: "(vac\xEDo)",
        path: "Ruta",
        content: "Contenido",
        deleteItem: "Eliminar elemento",
        removeJunkButton: "Eliminar archivos basura"
      },
      chatPage: {
        closeChatAudioLabe: "cerrar chat",
        chatSettingsAudioLabel: "configuraci\xF3n del chat",
        pages: {
          settings: "Configuraci\xF3n",
          messages: "Mensajes",
          tasks: "Tareas",
          calendar: "Calendario"
        },
        settings: {
          settingsHeadline: "Configuraci\xF3n",
          primaryChannelLabel: "Canal principal",
          setPrimaryChannelButtonAudioLabel: "establecer canal principal",
          newSecondaryChannelPlaceholder: "A\xF1adir canal secundario",
          newSecondaryChannelAudioLabel: "nombre del nuevo canal secundario",
          addSecondaryChannelButtonAudioLabel: "a\xF1adir canal secundario",
          encryptionKeyLabel: "Clave de encriptaci\xF3n",
          setEncryptionKeyButtonAudioLabel: "establecer clave de encriptaci\xF3n",
          showEncryptionKey: "Mostrar clave de encriptaci\xF3n",
          deleteChatButton: "Eliminar todo el chat"
        },
        message: {
          messagesHeadline: "Mensajes",
          composerInputPlaceholder: "Escribe un mensaje...",
          sendMessageButtonAudioLabel: "enviar mensaje",
          showMessageInfoButtonAudioLabel: "mostrar informaci\xF3n del mensaje",
          messageInfoHeadline: "Informaci\xF3n del Mensaje",
          sentBy: "Enviado por",
          timeSent: "Hora de env\xEDo",
          channel: "Canal",
          messageContent: "Contenido del mensaje",
          copyMessageButton: "Copiar mensaje",
          resendMessageButton: "Reenviar mensaje",
          decryptMessageButton: "Desencriptar mensaje",
          deleteMessageButton: "Eliminar mensaje",
          //
          thumbsUpReaction: "Reacci\xF3n: pulgar hacia arriba",
          checkReaction: "Reacci\xF3n: marca de verificaci\xF3n",
          stopReaction: "Reacci\xF3n: signo de parada",
          attentionReaction: "Reaccion: signo de atenci\xF3n",
          doubleAttentionReaction: "Reaccion: signo de atenci\xF3n doble",
          questionReaction: "Reaccion: signo de interrogaci\xF3n"
        },
        task: {
          newBoardNamePlaceholder: "Crear un tablero",
          createBoardButtonAudioLabel: "crear tablero",
          noBoardSelected: "Ning\xFAn tablero seleccionado",
          boardNotFound: "Tablero no encontrado",
          closeBoardButtonAudioLabel: "cerrar tablero",
          toggleBoardButtonAudioLabel: "mostrar o ocultar lista de tableros",
          showBoardSettingsButtonAudioLabel: "mostrar configuraci\xF3n del tablero",
          listViewButtonAudioLabel: "vista de lista",
          kanbanViewButtonAudioLabel: "vista kanban",
          statusViewButtonAudioLabel: "vista de cuadr\xEDcula de estado",
          filterTasksButtonAudioLabel: "filtrar tareas",
          createTaskButtonAudioLabel: "crear nueva tarea",
          boardSettingsHeadline: "Configuraci\xF3n del Tablero",
          boardNameInputLabel: "Nombre del tablero",
          deleteBoardButton: "Eliminar tablero y todas las tareas",
          taskSettingsHeadline: "Editar Tarea",
          taskNameLabel: "T\xEDtulo",
          taskBoardLabel: "Tablero",
          taskCategoryLabel: "Categor\xEDa",
          taskStatusLabel: "Estado",
          taskPriorityLabel: "Prioridad",
          taskDescriptionLabel: "Descripci\xF3n",
          taskDateLabel: "Fecha",
          taskTimeLabel: "Hora",
          deleteTaskButton: "Eliminar tarea",
          filterTasksHeadline: "Filtrar Tareas",
          renameCategoryInputPlaceholder: "Renombrar categor\xEDa",
          renameStatusInputPlaceholder: "Renombrar estado"
        },
        calendar: {
          eventsBoard: "Eventos",
          ///
          todayButtonAudioLabel: "ir a hoy",
          previousMonthButtonAudioLabel: "mes anterior",
          nextMonthButtonAudioLabel: "mes siguiente",
          yearInputAudioLabel: "a\xF1o",
          monthInputAudioLabel: "mes",
          yearInputPlaceholder: "2000",
          monthInputPlaceholder: "01",
          searchEventsHeadline: "Buscar Eventos",
          events: "Eventos",
          noEvents: "No hay eventos"
        }
      }
    }
  };
  var languageNames = {
    en: "English",
    de: "Deutsch",
    es: "Espa\xF1ol"
  };

  // src/ViewModel/Global/coreViewModel.ts
  var CoreViewModel = class {
    // init
    constructor(storageModel2, settingsModel2, connectionModel2, chatListModel2, fileTransferModel2) {
      this.storageModel = storageModel2;
      this.settingsModel = settingsModel2;
      this.connectionModel = connectionModel2;
      this.chatListModel = chatListModel2;
      this.fileTransferModel = fileTransferModel2;
      this.BUILD = "Build 26.04.09.D";
      // DRAG & DROP
      this.draggedObject = new State(void 0);
      // SUGGESTIONS
      // boards & tasks
      this.boardFilterStringSuggestions = new ListState();
      this.taskCategorySuggestions = new ListState();
      this.taskStatusSuggestions = new ListState();
      this.translations = allTranslations[settingsModel2.language] || allTranslations.en;
    }
  };

  // src/ViewModel/Global/fileTransferViewModel.ts
  var FileTransferViewModel = class {
    // init
    constructor(coreViewModel2) {
      this.coreViewModel = coreViewModel2;
      // state
      this.presentedModal = new State(void 0);
      this.generalFileOptions = new ListState();
      this.chatFileOptions = new ListState();
      this.selectedPaths = new ListState();
      this.transferChannel = new State("");
      this.transferKey = new State("");
      this.receivingTransferChannel = new State("");
      this.receivingTransferKey = new State("");
      this.filePathsSent = new ListState();
      this.filesSentCount = createProxyState(
        [this.filePathsSent],
        () => this.filePathsSent.value.size
      );
      this.filesSentText = createProxyState(
        [this.filesSentCount],
        () => this.coreViewModel.translations.dataTransferModal.filesSentCount(
          this.filesSentCount.value
        )
      );
      this.filePathsReceived = new ListState();
      this.filesReceivedCount = createProxyState(
        [this.filePathsReceived],
        () => this.filePathsReceived.value.size
      );
      this.filesReceivedText = createProxyState(
        [this.filesReceivedCount],
        () => this.coreViewModel.translations.dataTransferModal.filesReceivedCount(
          this.filesReceivedCount.value
        )
      );
      // guards
      this.hasNoPathsSelected = createProxyState(
        [this.selectedPaths],
        () => this.selectedPaths.value.size == 0
      );
      this.didNotFinishSending = new State(true);
      this.cannotPrepareToReceive = createProxyState(
        [this.receivingTransferChannel, this.receivingTransferKey],
        () => this.receivingTransferChannel.value == "" || this.receivingTransferKey.value == ""
      );
      // handlers
      this.handleReceivedFile = (path) => {
        this.filePathsReceived.add(path);
      };
      // methods
      this.getOptions = () => {
        this.generalFileOptions.clear();
        this.chatFileOptions.clear();
        this.selectedPaths.clear();
        this.generalFileOptions.add(
          {
            label: this.coreViewModel.translations.dataTransferModal.connectionData,
            path: StorageModel.getPath(
              "connection" /* ConnectionModel */,
              filePaths.connectionModel.previousAddresses
            )
          },
          {
            label: this.coreViewModel.translations.dataTransferModal.settingsData,
            path: StorageModel.getPath(
              "settings" /* SettingsModel */,
              []
            )
          }
        );
        const chatModels = this.coreViewModel.chatListModel.chatModels;
        for (const chatModel of chatModels) {
          this.chatFileOptions.add({
            label: chatModel.info.primaryChannel,
            path: chatModel.getBasePath()
          });
        }
      };
      this.getTransferData = () => {
        const transferData = this.coreViewModel.fileTransferModel.generateTransferData();
        this.transferChannel.value = transferData.channel;
        this.transferKey.value = transferData.key;
      };
      // view
      this.showDirectionSelectionModal = () => {
        this.presentedModal.value = 0 /* DirectionSelection */;
        this.getOptions();
      };
      this.showFileSelectionModal = () => {
        this.presentedModal.value = 1 /* FileSelection */;
      };
      this.showTransferDataModal = () => {
        this.presentedModal.value = 2 /* TransferDataDisplay */;
        this.getTransferData();
        this.coreViewModel.fileTransferModel.prepareToSend();
      };
      this.initiateTransfer = () => {
        this.presentedModal.value = 3 /* TransferDisplay */;
        this.didNotFinishSending.value = true;
        this.filePathsSent.clear();
        this.coreViewModel.fileTransferModel.sendFiles(
          this.selectedPaths.value.values(),
          (path) => {
            console.log(path);
            this.filePathsSent.add(path);
          }
        );
        this.didNotFinishSending.value = false;
      };
      this.showTransferDataInputModal = () => {
        this.presentedModal.value = 4 /* TransferDataInput */;
      };
      this.prepareReceivingData = () => {
        this.presentedModal.value = 5 /* ReceptionDisplay */;
        this.filePathsReceived.clear();
        const transferData = {
          channel: this.receivingTransferChannel.value,
          key: this.receivingTransferKey.value
        };
        this.coreViewModel.fileTransferModel.prepareToReceive(transferData);
      };
      this.hideModal = () => {
        this.presentedModal.value = void 0;
      };
      this.coreViewModel.fileTransferModel.fileHandlerManager.addHandler(
        this.handleReceivedFile
      );
      this.coreViewModel.fileTransferModel.readyToSendHandlerManager.addHandler(
        () => this.initiateTransfer()
      );
    }
  };

  // src/View/Components/textSpan.tsx
  var StringToTextSpan = (string) => {
    return /* @__PURE__ */ createElement("span", { class: "ellipsis" }, string);
  };

  // src/View/Modals/dataTransferModal.tsx
  function DataTransferModalWrapper(coreViewModel2, connectionViewModel2, fileTransferViewModel2) {
    return /* @__PURE__ */ createElement("div", null, DirectionSelectionModal(
      coreViewModel2,
      connectionViewModel2,
      fileTransferViewModel2
    ), FileSelectionModal(coreViewModel2, fileTransferViewModel2), TransferDataDisplayModal(coreViewModel2, fileTransferViewModel2), TransferDisplayModal(coreViewModel2, fileTransferViewModel2), TransferDataInputModal(coreViewModel2, fileTransferViewModel2), DataReceptionModal(coreViewModel2, fileTransferViewModel2));
  }
  function DirectionSelectionModal(coreViewModel2, connectionViewModel2, fileTransferViewModel2) {
    const isPresented = createProxyState(
      [fileTransferViewModel2.presentedModal],
      () => fileTransferViewModel2.presentedModal.value == 0 /* DirectionSelection */
    );
    const isDisconnected = createProxyState(
      [connectionViewModel2.isConnected],
      () => connectionViewModel2.isConnected.value == false
    );
    return /* @__PURE__ */ createElement("div", { class: "modal", "toggle:open": isPresented }, /* @__PURE__ */ createElement("div", null, /* @__PURE__ */ createElement("main", null, /* @__PURE__ */ createElement("h2", null, coreViewModel2.translations.dataTransferModal.transferDataHeadline), /* @__PURE__ */ createElement(
      "p",
      {
        class: "error",
        "toggle:hidden": connectionViewModel2.isConnected
      },
      coreViewModel2.translations.dataTransferModal.notConnectedError
    ), /* @__PURE__ */ createElement(
      "div",
      {
        class: "flex-column gap content-margin-bottom",
        "toggle:hidden": isDisconnected
      },
      /* @__PURE__ */ createElement(
        "button",
        {
          class: "tile",
          "on:click": fileTransferViewModel2.showFileSelectionModal
        },
        /* @__PURE__ */ createElement("span", { class: "icon" }, "upload"),
        /* @__PURE__ */ createElement("div", null, /* @__PURE__ */ createElement("b", null, coreViewModel2.translations.dataTransferModal.fromThisDeviceButton)),
        /* @__PURE__ */ createElement("span", { class: "icon" }, "arrow_forward")
      ),
      /* @__PURE__ */ createElement(
        "button",
        {
          class: "tile",
          "on:click": fileTransferViewModel2.showTransferDataInputModal
        },
        /* @__PURE__ */ createElement("span", { class: "icon" }, "download"),
        /* @__PURE__ */ createElement("div", null, /* @__PURE__ */ createElement("b", null, coreViewModel2.translations.dataTransferModal.toThisDeviceButton)),
        /* @__PURE__ */ createElement("span", { class: "icon" }, "arrow_forward")
      )
    )), /* @__PURE__ */ createElement("button", { "on:click": fileTransferViewModel2.hideModal }, coreViewModel2.translations.general.closeButton, /* @__PURE__ */ createElement("span", { class: "icon" }, "close"))));
  }
  function FileSelectionModal(coreViewModel2, fileTransferViewModel2) {
    const OptionConverter = (fileOption) => {
      return OptionEntry(fileOption, fileTransferViewModel2);
    };
    function OptionEntry(fileOption, fileTransferViewModel3) {
      const isSelected = new State(false);
      if (fileTransferViewModel3.selectedPaths.value.has(fileOption.path)) {
        isSelected.value = true;
      }
      isSelected.subscribeSilent((isSelected2) => {
        if (isSelected2 == true) {
          fileTransferViewModel3.selectedPaths.add(fileOption.path);
        } else {
          fileTransferViewModel3.selectedPaths.remove(fileOption.path);
        }
      });
      function toggle() {
        isSelected.value = !isSelected.value;
      }
      return /* @__PURE__ */ createElement("button", { class: "tile", "toggle:selected": isSelected, "on:click": toggle }, /* @__PURE__ */ createElement("div", null, /* @__PURE__ */ createElement("b", { class: "ellipsis" }, fileOption.label), /* @__PURE__ */ createElement("span", { class: "secondary ellipsis" }, StorageModel.pathComponentsToString(
        ...fileOption.path
      ))));
    }
    const isPresented = createProxyState(
      [fileTransferViewModel2.presentedModal],
      () => fileTransferViewModel2.presentedModal.value == 1 /* FileSelection */
    );
    return /* @__PURE__ */ createElement("div", { class: "modal", "toggle:open": isPresented }, /* @__PURE__ */ createElement("div", null, /* @__PURE__ */ createElement("main", null, /* @__PURE__ */ createElement("h2", null, coreViewModel2.translations.dataTransferModal.transferDataHeadline), /* @__PURE__ */ createElement("span", { class: "secondary" }, coreViewModel2.translations.dataTransferModal.selectionDescription), /* @__PURE__ */ createElement("hr", null), /* @__PURE__ */ createElement("h3", null, coreViewModel2.translations.dataTransferModal.generalHeadline), /* @__PURE__ */ createElement(
      "div",
      {
        class: "flex-column gap content-margin-bottom",
        "children:append": [
          fileTransferViewModel2.generalFileOptions,
          OptionConverter
        ]
      }
    ), /* @__PURE__ */ createElement("h3", null, coreViewModel2.translations.dataTransferModal.chatsHeadline), /* @__PURE__ */ createElement(
      "div",
      {
        class: "flex-column gap",
        "children:append": [
          fileTransferViewModel2.chatFileOptions,
          OptionConverter
        ]
      }
    )), /* @__PURE__ */ createElement("div", { class: "flex-row width-100" }, /* @__PURE__ */ createElement(
      "button",
      {
        class: "flex",
        "on:click": fileTransferViewModel2.showDirectionSelectionModal
      },
      coreViewModel2.translations.general.backButton
    ), /* @__PURE__ */ createElement(
      "button",
      {
        class: "primary flex",
        "on:click": fileTransferViewModel2.showTransferDataModal,
        "toggle:disabled": fileTransferViewModel2.hasNoPathsSelected
      },
      coreViewModel2.translations.general.continueButton,
      /* @__PURE__ */ createElement("span", { class: "icon" }, "arrow_forward")
    ))));
  }
  function TransferDataDisplayModal(coreViewModel2, fileTransferViewModel2) {
    const isPresented = createProxyState(
      [fileTransferViewModel2.presentedModal],
      () => fileTransferViewModel2.presentedModal.value == 2 /* TransferDataDisplay */
    );
    return /* @__PURE__ */ createElement("div", { class: "modal", "toggle:open": isPresented }, /* @__PURE__ */ createElement("div", null, /* @__PURE__ */ createElement("main", null, /* @__PURE__ */ createElement("h2", null, coreViewModel2.translations.dataTransferModal.transferDataHeadline), /* @__PURE__ */ createElement("span", { class: "secondary" }, coreViewModel2.translations.dataTransferModal.dataEntryDescription), /* @__PURE__ */ createElement("hr", null), /* @__PURE__ */ createElement("div", { class: "flex-column gap content-margin-bottom" }, /* @__PURE__ */ createElement("div", { class: "tile" }, /* @__PURE__ */ createElement("span", { class: "icon" }, "forum"), /* @__PURE__ */ createElement("div", null, /* @__PURE__ */ createElement("span", { class: "secondary" }, coreViewModel2.translations.dataTransferModal.transferChannelHeadline), /* @__PURE__ */ createElement(
      "b",
      {
        "subscribe:innerText": fileTransferViewModel2.transferChannel
      }
    ))), /* @__PURE__ */ createElement("div", { class: "tile" }, /* @__PURE__ */ createElement("span", { class: "icon" }, "key"), /* @__PURE__ */ createElement("div", null, /* @__PURE__ */ createElement("span", { class: "secondary" }, coreViewModel2.translations.dataTransferModal.transferKeyHeadline), /* @__PURE__ */ createElement(
      "b",
      {
        "subscribe:innerText": fileTransferViewModel2.transferKey
      }
    ))))), /* @__PURE__ */ createElement("div", { class: "flex-row width-100" }, /* @__PURE__ */ createElement(
      "button",
      {
        class: "flex",
        "on:click": fileTransferViewModel2.showFileSelectionModal
      },
      coreViewModel2.translations.general.backButton
    ), /* @__PURE__ */ createElement("button", { disabled: true, class: "flex" }, coreViewModel2.translations.general.waitingLabel))));
  }
  function TransferDisplayModal(coreViewModel2, fileTransferViewModel2) {
    const isPresented = createProxyState(
      [fileTransferViewModel2.presentedModal],
      () => fileTransferViewModel2.presentedModal.value == 3 /* TransferDisplay */
    );
    return /* @__PURE__ */ createElement("div", { class: "modal", "toggle:open": isPresented }, /* @__PURE__ */ createElement("div", null, /* @__PURE__ */ createElement("main", null, /* @__PURE__ */ createElement("h2", null, coreViewModel2.translations.dataTransferModal.transferDataHeadline), /* @__PURE__ */ createElement(
      "p",
      {
        class: "secondary",
        "subscribe:innerText": fileTransferViewModel2.filesSentText
      }
    ), /* @__PURE__ */ createElement(
      "p",
      {
        class: "secondary",
        "toggle:hidden": fileTransferViewModel2.didNotFinishSending
      },
      coreViewModel2.translations.dataTransferModal.allFilesSent
    ), /* @__PURE__ */ createElement("hr", null), /* @__PURE__ */ createElement(
      "div",
      {
        class: "tile flex-column align-start",
        "children:append": [
          fileTransferViewModel2.filePathsSent,
          StringToTextSpan
        ]
      }
    )), /* @__PURE__ */ createElement("div", { class: "flex-row width-100" }, /* @__PURE__ */ createElement(
      "button",
      {
        class: "flex",
        "on:click": fileTransferViewModel2.initiateTransfer
      },
      coreViewModel2.translations.dataTransferModal.sendAgainButton,
      /* @__PURE__ */ createElement("span", { class: "icon" }, "restart_alt")
    ), /* @__PURE__ */ createElement(
      "button",
      {
        class: "flex",
        "on:click": fileTransferViewModel2.hideModal,
        "toggle:disabled": fileTransferViewModel2.didNotFinishSending
      },
      coreViewModel2.translations.general.closeButton,
      /* @__PURE__ */ createElement("span", { class: "icon" }, "close")
    ))));
  }
  function TransferDataInputModal(coreViewModel2, fileTransferViewModel2) {
    const isPresented = createProxyState(
      [fileTransferViewModel2.presentedModal],
      () => fileTransferViewModel2.presentedModal.value == 4 /* TransferDataInput */
    );
    return /* @__PURE__ */ createElement("div", { class: "modal", "toggle:open": isPresented }, /* @__PURE__ */ createElement("div", null, /* @__PURE__ */ createElement("main", null, /* @__PURE__ */ createElement("h2", null, coreViewModel2.translations.dataTransferModal.transferDataHeadline), /* @__PURE__ */ createElement("span", { class: "secondary" }, coreViewModel2.translations.dataTransferModal.dataEntryInputDescription), /* @__PURE__ */ createElement("hr", null), /* @__PURE__ */ createElement("div", { class: "flex-column gap content-margin-bottom" }, /* @__PURE__ */ createElement("label", { class: "tile" }, /* @__PURE__ */ createElement("span", { class: "icon" }, "forum"), /* @__PURE__ */ createElement("div", null, /* @__PURE__ */ createElement("span", { class: "secondary" }, coreViewModel2.translations.dataTransferModal.transferChannelHeadline), /* @__PURE__ */ createElement(
      "input",
      {
        "bind:value": fileTransferViewModel2.receivingTransferChannel
      }
    ))), /* @__PURE__ */ createElement("label", { class: "tile" }, /* @__PURE__ */ createElement("span", { class: "icon" }, "key"), /* @__PURE__ */ createElement("div", null, /* @__PURE__ */ createElement("span", { class: "secondary" }, coreViewModel2.translations.dataTransferModal.transferKeyHeadline), /* @__PURE__ */ createElement(
      "input",
      {
        "bind:value": fileTransferViewModel2.receivingTransferKey
      }
    ))))), /* @__PURE__ */ createElement("div", { class: "flex-row width-100" }, /* @__PURE__ */ createElement(
      "button",
      {
        class: "flex",
        "on:click": fileTransferViewModel2.showDirectionSelectionModal
      },
      coreViewModel2.translations.general.backButton
    ), /* @__PURE__ */ createElement(
      "button",
      {
        class: "primary flex",
        "on:click": fileTransferViewModel2.prepareReceivingData,
        "toggle:disabled": fileTransferViewModel2.cannotPrepareToReceive
      },
      coreViewModel2.translations.general.continueButton,
      /* @__PURE__ */ createElement("span", { class: "icon" }, "arrow_forward")
    ))));
  }
  function DataReceptionModal(coreViewModel2, fileTransferViewModel2) {
    const isPresented = createProxyState(
      [fileTransferViewModel2.presentedModal],
      () => fileTransferViewModel2.presentedModal.value == 5 /* ReceptionDisplay */
    );
    return /* @__PURE__ */ createElement("div", { class: "modal", "toggle:open": isPresented }, /* @__PURE__ */ createElement("div", null, /* @__PURE__ */ createElement("main", null, /* @__PURE__ */ createElement("h2", null, coreViewModel2.translations.dataTransferModal.transferDataHeadline), /* @__PURE__ */ createElement(
      "p",
      {
        class: "secondary",
        "subscribe:innerText": fileTransferViewModel2.filesReceivedText
      }
    ), /* @__PURE__ */ createElement("hr", null), /* @__PURE__ */ createElement(
      "div",
      {
        class: "tile flex-column align-start",
        "children:append": [
          fileTransferViewModel2.filePathsReceived,
          StringToTextSpan
        ]
      }
    )), /* @__PURE__ */ createElement("button", { "on:click": reload }, coreViewModel2.translations.general.reloadAppButton, /* @__PURE__ */ createElement("span", { class: "icon" }, "refresh"))));
  }

  // src/Model/Global/fileTransferModel.ts
  var FileTransferModel = class _FileTransferModel {
    // init
    constructor(storageModel2, connectionModel2) {
      this.fileHandlerManager = new HandlerManager();
      this.readyToSendHandlerManager = new HandlerManager();
      this.direction = 0 /* Send */;
      // general
      this.generateTransferData = () => {
        const transferData = {
          channel: generateRandomToken(4),
          key: generateRandomToken(6)
        };
        this.transferData = transferData;
        return transferData;
      };
      this.prepareToSend = () => {
        this.direction = 0 /* Send */;
        this.connectionModel.addChannel(this.transferData.channel);
      };
      this.prepareToReceive = (transferData) => {
        this.direction = 1 /* Receive */;
        this.connectionModel.addChannel(transferData.channel);
        this.transferData = transferData;
        this.connectionModel.sendPlainMessage(
          transferData.channel,
          _FileTransferModel.READY_MESSAGE
        );
      };
      // handlers
      this.handleMessage = (data) => {
        if (this.transferData == void 0) return;
        if (data.messageChannel != this.transferData.channel) return;
        if (data.messageBody == _FileTransferModel.READY_MESSAGE && this.direction == 0 /* Send */) {
          this.readyToSendHandlerManager.trigger(true);
        }
        if (this.transferData == void 0) return;
        if (data.messageBody == void 0) return;
        this.handleFile(data.messageBody);
      };
      this.handleFile = async (encryptedFileData) => {
        if (this.transferData == void 0) return;
        const decrypted = await decryptString(
          encryptedFileData,
          this.transferData.key
        );
        const parsed = parse(decrypted);
        const isFileData = checkMatchesObjectStructure(
          parsed,
          FileDataReference
        );
        if (isFileData == false) return;
        const fileData = parsed;
        this.storageModel.write(fileData.path, fileData.body);
        const pathString = StorageModel.pathComponentsToString(
          ...fileData.path
        );
        this.fileHandlerManager.trigger(pathString);
      };
      // sending
      this.sendFiles = (directoryPaths, callback) => {
        for (const directoryPath of directoryPaths) {
          this.storageModel.recurse(directoryPath, (filePath) => {
            this.sendFile(filePath);
            const pathString = StorageModel.pathComponentsToString(
              ...filePath
            );
            callback(pathString);
          });
        }
      };
      this.sendFile = async (filePath) => {
        if (this.transferData == void 0) return;
        const fileContent = this.storageModel.read(filePath);
        if (fileContent == null) return;
        const fileData = {
          path: filePath,
          body: fileContent
        };
        const stringifiedFileData = stringify(fileData);
        const encryptedFileData = await encryptString(
          stringifiedFileData,
          this.transferData.key
        );
        this.connectionModel.sendPlainMessage(
          this.transferData.channel,
          encryptedFileData
        );
      };
      this.storageModel = storageModel2;
      this.connectionModel = connectionModel2;
      this.connectionModel.messageHandlerManager.addHandler(
        this.handleMessage
      );
    }
    static {
      this.READY_MESSAGE = "ready";
    }
  };
  var FileDataReference = {
    path: [""],
    body: ""
  };

  // src/View/Components/chatEntry.tsx
  function ChatEntry(chatViewModel) {
    const view = /* @__PURE__ */ createElement(
      "button",
      {
        class: "tile colored-tile chat-entry",
        "set:color": chatViewModel.settingsPageViewModel.color,
        style: "height: 8rem",
        "on:click": chatViewModel.open,
        "toggle:unread": chatViewModel.hasUnreadMessages
      },
      /* @__PURE__ */ createElement(
        "span",
        {
          class: "shadow",
          "subscribe:innerText": chatViewModel.settingsPageViewModel.primaryChannel
        }
      ),
      /* @__PURE__ */ createElement(
        "h2",
        {
          "subscribe:innerText": chatViewModel.settingsPageViewModel.primaryChannel
        }
      )
    );
    chatViewModel.index.subscribe((newIndex) => {
      view.style.order = newIndex;
    });
    return view;
  }
  var ChatViewModelToChatEntry = (chatViewModel) => {
    return ChatEntry(chatViewModel);
  };

  // src/View/Components/homePageButton.tsx
  function HomePageButton(action, label, icon) {
    return /* @__PURE__ */ createElement("button", { class: "tile flex-no", "on:click": action }, /* @__PURE__ */ createElement("span", { class: "icon" }, icon), /* @__PURE__ */ createElement("div", null, /* @__PURE__ */ createElement("span", null, label)));
  }

  // src/View/homePage.tsx
  function HomePage(coreViewModel2, storageViewModel2, settingsViewModel2, connectionViewModel2, fileTransferViewModel2, chatListViewModel2) {
    const overviewSection = /* @__PURE__ */ createElement("div", { id: "overview-section" }, /* @__PURE__ */ createElement("h2", null, coreViewModel2.translations.homePage.overviewHeadline), /* @__PURE__ */ createElement("label", { class: "tile flex-no" }, /* @__PURE__ */ createElement("span", { class: "icon" }, "cell_tower"), /* @__PURE__ */ createElement("div", null, /* @__PURE__ */ createElement("span", null, coreViewModel2.translations.homePage.serverAddress), /* @__PURE__ */ createElement(
      "input",
      {
        list: "previous-connection-list",
        placeholder: coreViewModel2.translations.homePage.serverAddressPlaceholder,
        "bind:value": connectionViewModel2.serverAddressInput,
        "on:enter": connectionViewModel2.connect
      }
    ), /* @__PURE__ */ createElement(
      "datalist",
      {
        hidden: true,
        id: "previous-connection-list",
        "children:append": [
          connectionViewModel2.previousAddresses,
          StringToOption
        ]
      }
    ))), /* @__PURE__ */ createElement("div", { class: "flex-row" }, /* @__PURE__ */ createElement(
      "button",
      {
        class: "danger flex justify-center",
        "aria-label": coreViewModel2.translations.homePage.disconnectAudioLabel,
        "on:click": connectionViewModel2.disconnect,
        "toggle:disabled": connectionViewModel2.cannotDisonnect
      },
      /* @__PURE__ */ createElement("span", { class: "icon" }, "link_off")
    ), /* @__PURE__ */ createElement(
      "button",
      {
        class: "flex justify-center",
        "aria-label": coreViewModel2.translations.homePage.manageConnectionsAudioLabel,
        "on:click": connectionViewModel2.showConnectionModal,
        "toggle:disabled": connectionViewModel2.hasNoPreviousConnections
      },
      /* @__PURE__ */ createElement("span", { class: "icon" }, "history")
    ), /* @__PURE__ */ createElement(
      "button",
      {
        class: "primary flex justify-center",
        "aria-label": coreViewModel2.translations.homePage.connectAudioLabel,
        "on:click": connectionViewModel2.connect,
        "toggle:disabled": connectionViewModel2.cannotConnect
      },
      /* @__PURE__ */ createElement("span", { class: "icon" }, "link")
    )), /* @__PURE__ */ createElement("hr", null), /* @__PURE__ */ createElement("label", { class: "tile flex-no" }, /* @__PURE__ */ createElement("span", { class: "icon" }, "account_circle"), /* @__PURE__ */ createElement("div", null, /* @__PURE__ */ createElement("span", null, coreViewModel2.translations.homePage.yourNameLabel), /* @__PURE__ */ createElement(
      "input",
      {
        placeholder: coreViewModel2.translations.homePage.yourNamePlaceholder,
        "bind:value": settingsViewModel2.usernameInput,
        "on:enter": settingsViewModel2.setName
      }
    ))), /* @__PURE__ */ createElement("div", { class: "flex-row justify-end" }, /* @__PURE__ */ createElement(
      "button",
      {
        class: "width-50",
        "on:click": settingsViewModel2.setName,
        "toggle:disabled": settingsViewModel2.cannotSetName,
        "aria-label": coreViewModel2.translations.homePage.setNameButtonAudioLabel
      },
      coreViewModel2.translations.general.setButton,
      /* @__PURE__ */ createElement("span", { class: "icon" }, "check")
    )), /* @__PURE__ */ createElement("hr", null), HomePageButton(
      settingsViewModel2.showSettingsModal,
      coreViewModel2.translations.homePage.settingsButton,
      "settings"
    ), HomePageButton(
      fileTransferViewModel2.showDirectionSelectionModal,
      coreViewModel2.translations.homePage.transferDataButton,
      "sync_alt"
    ), HomePageButton(
      storageViewModel2.showStorageModal,
      coreViewModel2.translations.homePage.manageStorageButton,
      "hard_drive"
    ), /* @__PURE__ */ createElement("div", { class: "mobile-only" }, /* @__PURE__ */ createElement("hr", null), /* @__PURE__ */ createElement("div", { class: "flex-row justify-end" }, /* @__PURE__ */ createElement("button", { class: "ghost width-50", "on:click": scrollToChat }, coreViewModel2.translations.homePage.scrollToChatButton, /* @__PURE__ */ createElement("span", { class: "icon" }, "arrow_forward")))));
    const chatSection = /* @__PURE__ */ createElement("div", { id: "chat-section" }, /* @__PURE__ */ createElement("h2", null, coreViewModel2.translations.homePage.chatsHeadline), /* @__PURE__ */ createElement("div", { class: "flex-row width-input" }, /* @__PURE__ */ createElement(
      "input",
      {
        placeholder: coreViewModel2.translations.homePage.addChatPlaceholder,
        "aria-label": coreViewModel2.translations.homePage.addChatAudioLabel,
        "bind:value": chatListViewModel2.newChatPrimaryChannel,
        "on:enter": chatListViewModel2.createChat
      }
    ), /* @__PURE__ */ createElement(
      "button",
      {
        class: "primary",
        "aria-label": coreViewModel2.translations.homePage.addChatButton,
        "on:click": chatListViewModel2.createChat,
        "toggle:disabled": chatListViewModel2.cannotCreateChat
      },
      /* @__PURE__ */ createElement("span", { class: "icon" }, "add")
    )), /* @__PURE__ */ createElement(
      "div",
      {
        id: "chat-grid",
        "children:append": [
          chatListViewModel2.chatViewModels,
          ChatViewModelToChatEntry
        ]
      }
    ));
    function scrollToChat() {
      chatSection.scrollIntoView();
    }
    return /* @__PURE__ */ createElement("article", { id: "home-page" }, /* @__PURE__ */ createElement("div", null, overviewSection, chatSection));
  }

  // src/Model/Global/settingsModel.ts
  var SettingsModel = class _SettingsModel {
    // storage
    storeSetting(pathName, value) {
      const path = StorageModel.getPath(
        "settings" /* SettingsModel */,
        filePaths.settingsModel[pathName]
      );
      this.storageModel.write(path, value);
    }
    setName(newValue) {
      this.username = newValue;
      this.storeSetting("username", newValue);
    }
    setFirstDayOfWeek(newValue) {
      this.firstDayOfWeek = newValue;
      this.storeSetting("firstDayOfWeek", newValue);
    }
    setLanguage(newValue) {
      this.language = newValue;
      this.storeSetting("language", newValue);
    }
    setTheme(newValue) {
      this.theme = newValue;
      this.storeSetting("theme", newValue);
    }
    // load
    readSetting(pathName) {
      const path = StorageModel.getPath(
        "settings" /* SettingsModel */,
        filePaths.settingsModel[pathName]
      );
      return this.storageModel.read(path);
    }
    loadUsername() {
      const content = this.readSetting("username");
      this.username = content ?? "";
    }
    loadFirstDayofWeek() {
      const content = this.readSetting("firstDayOfWeek");
      this.firstDayOfWeek = content ?? "0";
    }
    loadLanguage() {
      const content = this.readSetting("language");
      this.language = content ?? _SettingsModel.getSystemLanguage();
    }
    loadTheme() {
      const content = this.readSetting("theme");
      this.theme = content ?? "system" /* System */;
    }
    // init
    constructor(storageModel2) {
      this.storageModel = storageModel2;
      this.loadUsername();
      this.loadFirstDayofWeek();
      this.loadLanguage();
      this.loadTheme();
    }
    static getSystemLanguage() {
      switch (navigator.language.substring(0, 2)) {
        case "de":
          return "de" /* German */;
        case "es":
          return "es" /* Spanish */;
        default:
          return "en" /* English */;
      }
    }
  };
  var Languages = /* @__PURE__ */ ((Languages2) => {
    Languages2["English"] = "en";
    Languages2["German"] = "de";
    Languages2["Spanish"] = "es";
    return Languages2;
  })(Languages || {});

  // src/ViewModel/Global/settingsViewModel.ts
  var SettingsViewModel = class _SettingsViewModel {
    // init
    constructor(coreViewModel2) {
      this.coreViewModel = coreViewModel2;
      // state
      this.username = new State("");
      this.usernameInput = new State("");
      this.isShowingSettingsModal = new State(false);
      this.selectedModalPage = new State(
        0 /* Appearance */
      );
      this.requiresReload = new State(false);
      this.firstDayOfWeek = new State("0");
      this.language = new State(
        "en" /* English */
      );
      this.theme = new State(
        "system" /* System */
      );
      // guards
      this.cannotSetName = createProxyState(
        [this.usernameInput],
        () => this.usernameInput.value == "" || this.usernameInput.value == this.coreViewModel.settingsModel.username
      );
      // methods
      this.setName = () => {
        this.coreViewModel.settingsModel.setName(this.usernameInput.value);
        this.username.value = this.coreViewModel.settingsModel.username;
        this.usernameInput.callSubscriptions();
      };
      this.setFirstDayofWeek = () => {
        this.coreViewModel.settingsModel.setFirstDayOfWeek(
          this.firstDayOfWeek.value
        );
      };
      this.showSettingsModal = () => {
        this.isShowingSettingsModal.value = true;
      };
      this.hideSettingsModal = () => {
        this.isShowingSettingsModal.value = false;
        if (this.requiresReload.value == true) {
          window.location.reload();
        }
      };
      this.showModalPage = (page) => {
        this.selectedModalPage.value = page;
      };
      // view
      this.applyTheme = () => {
        let theme = this.theme.value;
        if (theme == "system" /* System */) {
          theme = _SettingsViewModel.getSystemTheme();
        }
        document.body.setAttribute("theme", theme);
      };
      this.username.value = coreViewModel2.settingsModel.username;
      this.usernameInput.value = coreViewModel2.settingsModel.username;
      this.firstDayOfWeek.value = coreViewModel2.settingsModel.firstDayOfWeek;
      this.language.value = coreViewModel2.settingsModel.language;
      this.theme.value = coreViewModel2.settingsModel.theme;
      this.firstDayOfWeek.subscribe(this.setFirstDayofWeek);
      this.language.subscribeSilent((newValue) => {
        this.coreViewModel.settingsModel.setLanguage(newValue);
        this.requiresReload.value = true;
      });
      this.theme.subscribeSilent((newValue) => {
        this.coreViewModel.settingsModel.setTheme(newValue);
      });
      this.theme.subscribe(() => {
        this.applyTheme();
      });
      _SettingsViewModel.generateThemeMedia().addEventListener(
        "change",
        () => this.applyTheme()
      );
    }
    static generateThemeMedia() {
      return window.matchMedia("(prefers-color-scheme: dark)");
    }
    static getSystemTheme() {
      const media = _SettingsViewModel.generateThemeMedia();
      return media.matches == true ? "dark" /* Dark */ : "light" /* Light */;
    }
  };

  // src/View/Components/splitModal.tsx
  function SplitModal(leftView, rightView, extendedStyle = false, navigationState) {
    const view = /* @__PURE__ */ createElement("div", { class: "split-modal", "toggle:extended": extendedStyle }, /* @__PURE__ */ createElement("div", null, /* @__PURE__ */ createElement("div", { class: "scroll-area", "children:set": leftView })), /* @__PURE__ */ createElement("div", { class: "scroll-area", "children:set": rightView }));
    function scrollToDetails() {
      view.scrollLeft = view.scrollWidth;
    }
    navigationState?.subscribe(scrollToDetails);
    return view;
  }

  // src/View/Components/directoryItemList.tsx
  function DirectoryItemList(storageViewModel2, pathString = PATH_COMPONENT_SEPARATOR) {
    const StringToDirectoryItemList = (pathString2) => DirectoryItemList(storageViewModel2, pathString2);
    const path = StorageModel.stringToPathComponents(pathString);
    const fileName = StorageModel.getFileName(path);
    const items = new ListState();
    const style = `text-indent: ${path.length}rem`;
    function loadItems() {
      items.clear();
      const directoryItems = storageViewModel2.coreViewModel.storageModel.list(path);
      for (const directoryItem of directoryItems) {
        const itemPath = [...path, directoryItem];
        const pathString2 = StorageModel.pathComponentsToString(...itemPath);
        items.add(pathString2);
      }
    }
    function select() {
      storageViewModel2.selectedPath.value = pathString;
    }
    storageViewModel2.lastDeletedItemPath.subscribe((lastDeletedItemPath) => {
      if (!items.value.has(lastDeletedItemPath)) return;
      select();
      setTimeout(() => loadItems(), 50);
    });
    const isSelected = createProxyState(
      [storageViewModel2.selectedPath],
      () => storageViewModel2.selectedPath.value == pathString
    );
    isSelected.subscribe(() => {
      if (isSelected.value == false) return;
      loadItems();
    });
    return /* @__PURE__ */ createElement("div", { class: "flex-column" }, /* @__PURE__ */ createElement(
      "button",
      {
        class: "width-100 flex-1 clip",
        "toggle:selected": isSelected,
        "on:click": select
      },
      /* @__PURE__ */ createElement("span", { class: "ellipsis width-100 flex-1", style }, fileName)
    ), /* @__PURE__ */ createElement(
      "div",
      {
        class: "flex-column",
        "children:append": [items, StringToDirectoryItemList]
      }
    ));
  }

  // src/View/Modals/storageModal.tsx
  function StorageModal(coreViewModel2, storageViewModel2) {
    const detailView = createProxyState(
      [storageViewModel2.selectedPath],
      () => {
        if (storageViewModel2.selectedPath.value == PATH_COMPONENT_SEPARATOR)
          return /* @__PURE__ */ createElement("div", null, /* @__PURE__ */ createElement("span", { class: "secondary" }, coreViewModel2.translations.storage.noItemSelected), /* @__PURE__ */ createElement("hr", null), DangerousActionButton(
            coreViewModel2,
            coreViewModel2.translations.storage.removeJunkButton,
            "delete_forever",
            storageViewModel2.removeJunk
          ));
        return /* @__PURE__ */ createElement("div", { class: "flex-column gap" }, /* @__PURE__ */ createElement("div", { class: "tile flex-no" }, /* @__PURE__ */ createElement("div", null, /* @__PURE__ */ createElement("b", null, coreViewModel2.translations.storage.path), /* @__PURE__ */ createElement(
          "span",
          {
            class: "break-all",
            "subscribe:innerText": storageViewModel2.selectedPath
          }
        ))), /* @__PURE__ */ createElement("div", { class: "tile flex-no" }, /* @__PURE__ */ createElement("div", null, /* @__PURE__ */ createElement("b", null, coreViewModel2.translations.storage.content), /* @__PURE__ */ createElement(
          "code",
          {
            "subscribe:innerText": storageViewModel2.selectedFileContent
          }
        ))), DangerousActionButton(
          coreViewModel2,
          coreViewModel2.translations.storage.deleteItem,
          "delete_forever",
          storageViewModel2.deleteSelectedItem
        ));
      }
    );
    return /* @__PURE__ */ createElement("div", { class: "modal", "toggle:open": storageViewModel2.isShowingStorageModal }, /* @__PURE__ */ createElement("div", null, /* @__PURE__ */ createElement("main", { class: "padding-0" }, SplitModal(
      new State(DirectoryItemList(storageViewModel2)),
      detailView,
      true
    )), /* @__PURE__ */ createElement("button", { "on:click": storageViewModel2.hideStorageModal }, coreViewModel2.translations.general.closeButton, /* @__PURE__ */ createElement("span", { class: "icon" }, "close"))));
  }

  // src/ViewModel/Global/storageViewModel.ts
  var StorageViewModel = class {
    // init
    constructor(coreViewModel2) {
      this.coreViewModel = coreViewModel2;
      // state
      this.isShowingStorageModal = new State(false);
      this.selectedPath = new State(
        PATH_COMPONENT_SEPARATOR
      );
      this.didMakeChanges = new State(false);
      this.lastDeletedItemPath = new State("");
      // methods
      this.getSelectedItemContent = () => {
        const path = StorageModel.stringToPathComponents(
          this.selectedPath.value
        );
        const content = this.coreViewModel.storageModel.read(path);
        return (content ?? this.coreViewModel.translations.storage.notAFile) || this.coreViewModel.translations.storage.contentEmpty;
      };
      this.deleteSelectedItem = () => {
        const path = StorageModel.stringToPathComponents(
          this.selectedPath.value
        );
        this.lastDeletedItemPath.value = this.selectedPath.value;
        this.coreViewModel.storageModel.removeRecursively(path);
        this.didMakeChanges.value = true;
      };
      this.removeJunk = () => {
        this.coreViewModel.storageModel.removeJunk();
        this.selectedPath.value = PATH_COMPONENT_SEPARATOR;
      };
      // view
      this.showStorageModal = () => {
        this.isShowingStorageModal.value = true;
      };
      this.hideStorageModal = () => {
        if (this.didMakeChanges.value == true) {
          window.location.reload();
          return;
        }
        this.isShowingStorageModal.value = false;
      };
      this.selectedFileName = createProxyState(
        [this.selectedPath],
        () => StorageModel.getFileNameFromString(this.selectedPath.value)
      );
      this.selectedFileContent = createProxyState(
        [this.selectedPath],
        () => this.getSelectedItemContent()
      );
    }
  };

  // src/Upgrader/v1.ts
  var v1Upgrader = class {
    // init
    constructor(coreViewModel2) {
      this.coreViewModel = coreViewModel2;
      // general
      this.migrateSettings = () => {
        const name = getLocalStorageItemAndClear("sender-name");
        if (name != null) {
          const parsedName = parseOrFallback(name);
          this.coreViewModel.settingsModel.setName(parsedName);
        }
        const firstDayOfWeek = getLocalStorageItemAndClear("first-day-of-week");
        if (firstDayOfWeek != null) {
          const parsedFirstDayOfWeek = parseOrFallback(firstDayOfWeek);
          this.coreViewModel.settingsModel.setFirstDayOfWeek(
            parsedFirstDayOfWeek
          );
        }
      };
      this.migrateConnections = () => {
        const previousAddressString = getLocalStorageItemAndClear("previous-addresses");
        if (previousAddressString == null) return;
        const previousAddresses = parseArray(previousAddressString);
        for (const address of previousAddresses) {
          if (typeof address != "string") continue;
          this.coreViewModel.connectionModel.storeAddress(address);
        }
      };
      // chats
      this.migrateChats = () => {
        const chatIdString = getLocalStorageItemAndClear("chat-ids");
        if (chatIdString == null) return;
        const chatIds = parseArray(chatIdString);
        for (const chatId of chatIds) {
          if (typeof chatId != "string") continue;
          this.migrateChatById(chatId);
        }
      };
      this.migrateChatById = (id) => {
        const primaryChannel = getLocalStorageItemAndClear(
          storageKeys.primaryChannel(id)
        );
        if (primaryChannel == null) return;
        const parsedPriamryChannel = parseOrFallback(primaryChannel);
        const chatModel = this.coreViewModel.chatListModel.createChat(parsedPriamryChannel);
        const secondaryChannelString = getLocalStorageItemAndClear(storageKeys.secondaryChannels(id));
        if (secondaryChannelString != null) {
          const potentialSecondaryChannels = parseArray(
            secondaryChannelString
          );
          const confirmedSecondaryChannels = [];
          for (const secondaryChannel of potentialSecondaryChannels) {
            if (typeof secondaryChannel != "string") continue;
            confirmedSecondaryChannels.push(secondaryChannel);
          }
          chatModel.setSecondaryChannels(confirmedSecondaryChannels);
        }
        const encryptionKey = getLocalStorageItemAndClear(
          storageKeys.encyptionKey(id)
        );
        if (encryptionKey != null) {
          const parsedEncryptionKey = parseOrFallback(encryptionKey);
          chatModel.setEncryptionKey(parsedEncryptionKey);
        }
        const messagesString = getLocalStorageItemAndClear(storageKeys.messages(id)) ?? "";
        const messageOutboxString = getLocalStorageItemAndClear(storageKeys.outbox(id)) ?? "";
        const potentialMessages = parseArray(messagesString);
        const potentialMessagesInOutbox = parseArray(messageOutboxString);
        const addMessages = (potentialMessages2, status) => {
          for (const potentialMessage of potentialMessages2) {
            const isV1ChatMessage = checkMatchesObjectStructure(
              potentialMessage,
              V1ChatMessageReference
            );
            if (isV1ChatMessage == false) continue;
            const v1ChatMessage = potentialMessage;
            const convertedChatMessage = {
              dataVersion: "v2",
              id: v4_default(),
              channel: v1ChatMessage.channel,
              sender: v1ChatMessage.sender,
              body: v1ChatMessage.body,
              dateSent: v1ChatMessage.isoDate,
              status,
              stringifiedFile: ""
            };
            chatModel.addMessage(convertedChatMessage);
            if (status == "outbox" /* Outbox */) {
              this.coreViewModel.connectionModel.sendMessageOrStore(
                convertedChatMessage
              );
            }
          }
        };
        addMessages(potentialMessages, "received" /* Received */);
        addMessages(potentialMessagesInOutbox, "outbox" /* Outbox */);
        const objectsString = getLocalStorageItemAndClear(storageKeys.objects(id)) ?? "";
        const objectOutboxString = getLocalStorageItemAndClear(storageKeys.itemOutbox(id)) ?? "";
        const potentialObjects = parseArray(objectsString);
        const potentialObjectsInOutbox = parseArray(objectOutboxString);
        const addObjects = (potentialObjects2) => {
          const board = chatModel.fileModel.boardsAndTasksModel.createBoard(
            this.coreViewModel.translations.updater.migrated
          );
          chatModel.fileModel.boardsAndTasksModel.updateBoard(board);
          for (const potentialObjectEntry of potentialObjects2) {
            const potentialObject = potentialObjectEntry[1];
            const isV1MessageObject = checkIsV1MessageObject(potentialObject);
            if (isV1MessageObject == false) continue;
            const objectId = potentialObject.id;
            const objectName = potentialObject.title;
            const contentVersions = Object.values(
              potentialObject.contentVersions
            );
            for (const potentialVersion of contentVersions) {
              const isV1MessageObjectContent = checkIsV1MessageObjectContent(potentialVersion);
              if (isV1MessageObjectContent == false) continue;
              const convertedTaskFileContent = {
                dataVersion: "v2",
                fileId: objectId,
                fileContentId: FileModel2.generateFileContentId(
                  potentialVersion.isoDateVersionCreated
                ),
                creationDate: potentialVersion.isoDateVersionCreated,
                type: "task",
                name: objectName ?? "",
                boardId: board.fileId ?? "",
                description: potentialVersion.noteContent ?? "",
                category: potentialVersion.categoryName ?? "",
                status: potentialVersion.status ?? "",
                priority: potentialVersion.priority ?? "",
                date: potentialVersion.date ?? "",
                time: potentialVersion.time ?? ""
              };
              console.log(convertedTaskFileContent);
              chatModel.fileModel.handleFileContent(
                convertedTaskFileContent
              );
            }
          }
        };
        addObjects([...potentialObjects, ...potentialObjectsInOutbox]);
      };
      this.migrateSettings();
      this.migrateConnections();
      this.migrateChats();
    }
  };
  var storageKeys = {
    viewType(id) {
      return id + "view-type";
    },
    hasUnread(id) {
      return id + "has-unread-messages";
    },
    primaryChannel(id) {
      return id + "primary-channel";
    },
    secondaryChannels(id) {
      return id + "secondary-channels";
    },
    encyptionKey(id) {
      return id + "encryption-key";
    },
    messages(id) {
      return id + "messages";
    },
    objects(id) {
      return id + "items";
    },
    outbox(id) {
      return id + "outbox";
    },
    itemOutbox(id) {
      return id + "item-outbox";
    },
    composingMessage(id) {
      return id + "composing-message";
    }
  };
  var V1ChatMessageReference = {
    channel: "",
    sender: "",
    body: "",
    isoDate: ""
  };
  function checkIsV1MessageObject(object) {
    if (object.id == void 0) return false;
    if (object.title == void 0) return false;
    if (object.contentVersions == void 0) return false;
    return true;
  }
  function checkIsV1MessageObjectContent(object) {
    if (object.id == void 0) return false;
    if (object.isoDateVersionCreated == void 0) return false;
    return true;
  }

  // src/View/Components/optionButton.tsx
  function OptionButton(text, value, selection) {
    function select() {
      selection.value = value;
    }
    const isSelected = createProxyState(
      [selection],
      () => selection.value == value
    );
    return /* @__PURE__ */ createElement("button", { class: "standard", "toggle:selected": isSelected, "on:click": select }, text);
  }

  // src/View/Components/optionButtonList.tsx
  function OptionButtonList(options, selection) {
    function OptionToView(option) {
      const [text, value] = option;
      return OptionButton(text, value, selection);
    }
    return /* @__PURE__ */ createElement(
      "div",
      {
        class: "flex-column gap",
        "children:append": [options, OptionToView]
      }
    );
  }

  // src/View/Modals/settingsModal.tsx
  function SettingsModal(coreViewModel2, settingsViewModel2) {
    const detailView = createProxyState(
      [settingsViewModel2.selectedModalPage],
      () => {
        switch (settingsViewModel2.selectedModalPage.value) {
          case 0 /* Appearance */:
            return SettingsAppearancePane(
              coreViewModel2,
              settingsViewModel2
            );
          case 1 /* Regional */:
            return SettingsRegionalPane(
              coreViewModel2,
              settingsViewModel2
            );
          case 2 /* Info */:
            return SettingsInfoPane(coreViewModel2, settingsViewModel2);
        }
      }
    );
    return /* @__PURE__ */ createElement(
      "div",
      {
        class: "modal",
        "toggle:open": settingsViewModel2.isShowingSettingsModal
      },
      /* @__PURE__ */ createElement("div", null, /* @__PURE__ */ createElement("main", { class: "padding-0" }, SplitModal(
        new State(
          SettingsLeftPane(coreViewModel2, settingsViewModel2)
        ),
        detailView,
        true,
        settingsViewModel2.selectedModalPage
      )), /* @__PURE__ */ createElement("button", { "on:click": settingsViewModel2.hideSettingsModal }, coreViewModel2.translations.general.closeButton, /* @__PURE__ */ createElement("span", { class: "icon" }, "close")))
    );
  }
  function SettingsLeftPane(coreViewModel2, settingsViewModel2) {
    return /* @__PURE__ */ createElement("div", { class: "flex-column gap" }, SettingsPaneButton(
      settingsViewModel2,
      0 /* Appearance */,
      coreViewModel2.translations.settings.pages.appearance
    ), SettingsPaneButton(
      settingsViewModel2,
      1 /* Regional */,
      coreViewModel2.translations.settings.pages.regional
    ), SettingsPaneButton(
      settingsViewModel2,
      2 /* Info */,
      coreViewModel2.translations.settings.pages.info
    ));
  }
  function SettingsPaneButton(settingsViewModel2, page, label) {
    const isSelected = createProxyState(
      [settingsViewModel2.selectedModalPage],
      () => settingsViewModel2.selectedModalPage.value == page
    );
    return /* @__PURE__ */ createElement(
      "button",
      {
        "toggle:selected": isSelected,
        "on:click": () => settingsViewModel2.showModalPage(page)
      },
      label
    );
  }
  function SettingsInfoPane(coreViewModel2, settingsViewModel2) {
    return /* @__PURE__ */ createElement("div", { class: "slide-up" }, /* @__PURE__ */ createElement("h2", null, coreViewModel2.translations.homePage.appName), /* @__PURE__ */ createElement("hr", null), /* @__PURE__ */ createElement("div", { class: "flex-column gap" }, InfoTile(
      "build",
      coreViewModel2.translations.settings.version,
      settingsViewModel2.coreViewModel.BUILD
    )));
  }
  function SettingsRegionalPane(coreViewModel2, settingsViewModel2) {
    return /* @__PURE__ */ createElement("div", { class: "slide-up" }, /* @__PURE__ */ createElement("h2", null, coreViewModel2.translations.settings.pages.regional), /* @__PURE__ */ createElement("hr", null), /* @__PURE__ */ createElement("h3", null, coreViewModel2.translations.settings.language), OptionButtonList(
      new ListState(
        Object.values(Languages).map(
          (x) => [languageNames[x], x]
        )
      ),
      settingsViewModel2.language
    ), /* @__PURE__ */ createElement("hr", null), /* @__PURE__ */ createElement("h3", null, coreViewModel2.translations.settings.firstDayOfWeekLabel), OptionButtonList(
      new ListState(
        coreViewModel2.translations.regional.weekdays.full.map(
          (x, i) => [x, i.toString()]
        )
      ),
      settingsViewModel2.firstDayOfWeek
    ));
  }
  function SettingsAppearancePane(coreViewModel2, settingsViewModel2) {
    return /* @__PURE__ */ createElement("div", { class: "slide-up" }, /* @__PURE__ */ createElement("h2", null, coreViewModel2.translations.settings.pages.appearance), /* @__PURE__ */ createElement("hr", null), OptionButtonList(
      new ListState([
        [
          coreViewModel2.translations.settings.themes.dark,
          "dark" /* Dark */
        ],
        [
          coreViewModel2.translations.settings.themes.light,
          "light" /* Light */
        ],
        [
          coreViewModel2.translations.settings.themes.system,
          "system" /* System */
        ]
      ]),
      settingsViewModel2.theme
    ));
  }

  // src/index.tsx
  var storageModel = new StorageModel();
  var settingsModel = new SettingsModel(storageModel);
  var connectionModel = new ConnectionModel(storageModel);
  var chatListModel = new ChatListModel(
    storageModel,
    settingsModel,
    connectionModel
  );
  var fileTransferModel = new FileTransferModel(storageModel, connectionModel);
  var coreViewModel = new CoreViewModel(
    storageModel,
    settingsModel,
    connectionModel,
    chatListModel,
    fileTransferModel
  );
  new v1Upgrader(coreViewModel);
  var storageViewModel = new StorageViewModel(coreViewModel);
  var settingsViewModel = new SettingsViewModel(coreViewModel);
  var connectionViewModel = new ConnectionViewModel(coreViewModel);
  var chatListViewModel = new ChatListViewModel(
    coreViewModel,
    settingsViewModel,
    connectionViewModel
  );
  var fileTransferViewModel = new FileTransferViewModel(coreViewModel);
  chatListViewModel.selectedChat.subscribe(() => {
    document.body.toggleAttribute(
      "showing-chat",
      chatListViewModel.selectedChat.value != void 0
    );
  });
  document.body.append(
    /* @__PURE__ */ createElement("div", { id: "background-wrapper" }, /* @__PURE__ */ createElement("div", { id: "sky" }), /* @__PURE__ */ createElement("div", { id: "grass-1" }), /* @__PURE__ */ createElement("div", { id: "grass-2" }))
  );
  document.querySelector("main").append(
    HomePage(
      coreViewModel,
      storageViewModel,
      settingsViewModel,
      connectionViewModel,
      fileTransferViewModel,
      chatListViewModel
    ),
    ChatPageWrapper(coreViewModel, chatListViewModel),
    ConnectionModal(coreViewModel, connectionViewModel),
    DataTransferModalWrapper(
      coreViewModel,
      connectionViewModel,
      fileTransferViewModel
    ),
    StorageModal(coreViewModel, storageViewModel),
    SettingsModal(coreViewModel, settingsViewModel)
  );
})();
