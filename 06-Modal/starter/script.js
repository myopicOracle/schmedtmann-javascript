'use strict';

// DOM els needed for modal window 
const modal = document.querySelector(".modal")
const buttonShowModal = Array.from(document.querySelectorAll(".show-modal"))
const buttonCloseModal = document.querySelector(".close-modal")

// DOM els needed to show overlay
const overlay = document.querySelector(".overlay")

// show modal window on click of any 3 top buttons
buttonShowModal.forEach(item => item.addEventListener("click", (e) => {
    modal.classList.remove("hidden")
    overlay.classList.remove("hidden")
    e.target.style.backgroundColor = "gold"
}))

// close modal window on click "X"
buttonCloseModal.addEventListener("click", () => {
    modal.classList.add("hidden")
    overlay.classList.add("hidden")
    buttonShowModal.forEach(item => item.style.backgroundColor = "white")
})


// trying out toggle -- not part of official solution
const wrapper = document.querySelector("body")
const buttonToggle = document.createElement("button")
    buttonToggle.setAttribute("class", "toggle")
    buttonToggle.textContent = "Toggle Modal"
    buttonToggle.style.cssText = "width: 120px; height: 50px; margin-bottom: 30px; border: 4px solid blue; color: darkorange; font-weight: 900; background-color: lightgreen; align-self: end;"
    wrapper.appendChild(buttonToggle)

buttonToggle.addEventListener("click", (e) => {
    modal.classList.toggle("hidden")
    overlay.classList.toggle("hidden")
    if (modal.classList[1] === "hidden") {
        e.target.style.backgroundColor = "lightgreen"
        e.target.style.color = "darkorange"
        e.target.style.fontWeight = "400"
    } else {
        e.target.style.zIndex = "15"
        e.target.style.backgroundColor = "magenta"
        e.target.style.color = "white"
        e.target.style.fontWeight = "900"
    }
})