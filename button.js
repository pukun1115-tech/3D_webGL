const breakB = document.getElementById("breakB");

breakB.addEventListener("click", () => {
    breakBlock();
});

const jumpB = document.getElementById("jump");

jumpB.addEventListener("click", () => {
    const fakeKeyEvent = new KeyboardEvent(
        "keydown",
        {
            key: " ",
            code: "Space",
            bubbles: true,
            cancelable: true
        }
    );

    window.dispatchEvent(fakeKeyEvent);
});

const kisyuB = document.getElementById("kisyuB");

kisyuB.addEventListener("click", () => {
    breakB.classList.toggle("hidden");
    jumpB.classList.toggle("hidden");
});
