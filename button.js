const breakB = document.getElementById("breakB");
const jumpB = document.getElementById("jump");
const wB = document.getElementById("w");
const aB = document.getElementById("a");
const sB = document.getElementById("s");
const dB = document.getElementById("d");
const kisyuB = document.getElementById("kisyuB");

const spaceK = { key: " ", code: "Space", bubbles: true, cancelable: true };

const wK = { key: "w", code: "KeyW", bubbles: true, cancelable: true };
const aK = { key: "a", code: "KeyA", bubbles: true, cancelable: true };
const sK = { key: "s", code: "KeyS", bubbles: true, cancelable: true };
const dK = { key: "d", code: "KeyD", bubbles: true, cancelable: true };

breakB.addEventListener("click", () => {
    breakBlock();
});

jumpB.addEventListener("pointerdown", () => {
    const fakeKeyEvent = new KeyboardEvent("keydown", spaceK);
    document.dispatchEvent(fakeKeyEvent);
});
jumpB.addEventListener("pointerup", () => {
    const fakeKeyEvent = new KeyboardEvent("keyup", spaceK);
    document.dispatchEvent(fakeKeyEvent);
});

wB.addEventListener("pointerdown", () => {
    const fakeKeyEvent = new KeyboardEvent("keydown", wK);
    document.dispatchEvent(fakeKeyEvent);
});
wB.addEventListener("pointerup", () => {
    const fakeKeyEvent = new KeyboardEvent("keyup", wK);
    document.dispatchEvent(fakeKeyEvent);
});

aB.addEventListener("pointerdown", () => {
    const fakeKeyEvent = new KeyboardEvent("keydown", aK);
    document.dispatchEvent(fakeKeyEvent);
});
aB.addEventListener("pointerup", () => {
    const fakeKeyEvent = new KeyboardEvent("keyup", aK);
    document.dispatchEvent(fakeKeyEvent);
});

sB.addEventListener("pointerdown", () => {
    const fakeKeyEvent = new KeyboardEvent("keydown", sK);
    document.dispatchEvent(fakeKeyEvent);
});
sB.addEventListener("pointerup", () => {
    const fakeKeyEvent = new KeyboardEvent("keyup", sK);
    document.dispatchEvent(fakeKeyEvent);
});

dB.addEventListener("pointerdown", () => {
    const fakeKeyEvent = new KeyboardEvent("keydown", dK);
    document.dispatchEvent(fakeKeyEvent);
});
dB.addEventListener("pointerup", () => {
    const fakeKeyEvent = new KeyboardEvent("keyup", dK);
    document.dispatchEvent(fakeKeyEvent);
});

kisyuB.addEventListener("click", () => {
    breakB.classList.toggle("hidden");
    jumpB.classList.toggle("hidden");
    wB.classList.toggle("hidden");
    aB.classList.toggle("hidden");
    sB.classList.toggle("hidden");
    dB.classList.toggle("hidden");
});
