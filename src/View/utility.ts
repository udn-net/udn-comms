export function allowDrop(event: DragEvent) {
    event.preventDefault();
}

export function allowDrag(event: DragEvent) {
    event.dataTransfer?.setData("text", "");
}

export function reload() {
    window.location.reload();
}

export function setFocus() {
    document.getElementById("focused")?.focus();
}

export function setFocusWithDelay() {
    setTimeout(setFocus, 100);
}