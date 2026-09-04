const breakB = document.getElementById("breakB");

breakB.addEventListener("click", () => {
    breakBlock();
});

const kisyuB = document.getElementById("kisyuB");

kisyuB.addEventListener("click", () => {
    breakB.classList.toggle("hidden");
});
