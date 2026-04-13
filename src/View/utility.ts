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
    const focusedInModal = document.querySelector(".modal[open] #focused") as HTMLElement;
    if (focusedInModal) return focusedInModal.focus();
    document.getElementById("focused")?.focus();
}

export function setFocusWithDelay() {
    setTimeout(setFocus, 100);
}
