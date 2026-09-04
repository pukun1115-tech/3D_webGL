const breakB = document.getElementById("breakB");

breakB.addEventListener("click", () => {
    breakBlock();
});

const jumpB = document.getElementById("jump");

jumpB.addEventListener("pointerdown", () => {
    const fakeKeyEvent = new KeyboardEvent(
        "keydown",
        {
            key: " ",
            code: "Space",
            bubbles: true,
            cancelable: true
        }
    );

    document.dispatchEvent(fakeKeyEvent);
});

jumpB.addEventListener("pointerup", () => {
    const fakeKeyEvent = new KeyboardEvent(
        "keyup",
        {
            key: " ",
            code: "Space",
            bubbles: true,
            cancelable: true
        }
    );

    document.dispatchEvent(fakeKeyEvent);
});

const w = document.getElementById("w");

w.addEventListener("pointerdown", () => {
    const fakeKeyEvent = new KeyboardEvent(
        "keydown",
        {
            key: "w",
            code: "KeyW",
            bubbles: true,
            cancelable: true
        }
    );
    document.dispatchEvent(fakeKeyEvent);
});

const kisyuB = document.getElementById("kisyuB");

kisyuB.addEventListener("click", () => {
    breakB.classList.toggle("hidden");
    jumpB.classList.toggle("hidden");
});
