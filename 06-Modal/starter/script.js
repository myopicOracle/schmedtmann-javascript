'use strict';

const modal = document.querySelector(".modal")

const buttonShowModal = Array.from(document.querySelectorAll(".show-modal"))

const buttonCloseModal = document.querySelector(".close-modal")

buttonShowModal.forEach(item => item.addEventListener("click", (e) => {
    modal.classList.remove("hidden")
    e.target.style.backgroundColor = "gold"
}))

buttonCloseModal.addEventListener("click", () => {
    modal.classList.add("hidden")
    buttonShowModal.forEach(item => item.style.backgroundColor = "white")
})

// trying out toggle -- not part of final solution

const wrapper = document.querySelector("body")

const buttonToggle = document.createElement("button")
buttonToggle.setAttribute("class", "toggle")
buttonToggle.textContent = "Toggle Modal"
buttonToggle.style.cssText = "width: 100px; height: 50px; padding: 10px; border: 4px solid blue; color: darkorange; background-color: lightgreen; align-self: end;"
wrapper.appendChild(buttonToggle)

buttonToggle.addEventListener("click", (e) => {
    modal.classList.toggle("hidden")
    if (modal.classList[1] === "hidden") {
        e.target.style.backgroundColor = "lightgreen"
        e.target.style.color = "darkorange"
        e.target.style.fontWeight = "400"
    } else {
        e.target.style.backgroundColor = "magenta"
        e.target.style.color = "white"
        e.target.style.fontWeight = "900"
    }
})