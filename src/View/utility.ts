export function allowDrop(event: DragEvent) {
    event.preventDefault();
}

export function allowDrag(event: DragEvent) {
    event.dataTransfer?.setData("text", "");
}

export function reload() {
    window.location.reload();
}
