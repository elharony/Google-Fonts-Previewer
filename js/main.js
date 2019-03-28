const content = document.querySelector("#content")

const fonts = document.querySelector("#fonts")
fonts.addEventListener("change", () => {
    content.style.fontFamily = fonts.value
})