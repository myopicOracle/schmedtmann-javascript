'use strict';

// grab DOM elements
const wrapper = document.querySelector("body")
const headerText = document.querySelector("h1")
const againButton = document.querySelector("button.again")
const displayNumber = document.querySelector(".number")
const userInput = document.querySelector(".guess")
const checkButton = document.querySelector("button.check")
const alertHighOrLow = document.querySelector(".message")
const currentScore = document.querySelector(".score")
const highScore = document.querySelector(".highscore")

// needed since currentScore is string in DOM
let scoreAsNumber = Number(currentScore.textContent)

// 'secretNumber' var immediately available in global scope
let secretNumber = (function() {
    return Math.floor(Math.random() * 20) + 1
})();

// necessary since implementing make bg red if wrong guess
const _inputHandler = function() {
    headerText.textContent = "You Can Do It!"
    wrapper.style.backgroundColor = "#222"
    displayNumber.textContent = "?"
    userInput.value = ""
}

// break this apart to be less cumbersome?
const _checkGuess = function() {
    console.log(+userInput.value)
    console.log(secretNumber)
    if (+userInput.value === secretNumber) {
        wrapper.style.backgroundColor = "limegreen"
        headerText.textContent = `
        Woohoo! You Win!!! \n
        The Secret Number Was:
        `
        displayNumber.textContent = `${secretNumber}`
        alertHighOrLow.textContent = "You are correct!"
        if (currentScore.textContent > highScore.textContent) highScore.textContent = currentScore.textContent 
    } else if (+userInput.value !== secretNumber) {
        wrapper.style.backgroundColor = "darkred"
        headerText.textContent = "Oops... Try Again!"
        displayNumber.textContent = ":("
        if (+userInput.value > secretNumber) {
            alertHighOrLow.textContent = "Your guess is too HIGH!"
        } else if (+userInput.value < secretNumber) {
            alertHighOrLow.textContent = "Your guess is too LOW!"
        }
        --scoreAsNumber
        currentScore.textContent = scoreAsNumber
        userInput.value = ""
    }
}

const _playAgain = function() {
    headerText.textContent = "Guess My Number!"
    displayNumber.textContent = "?"
    userInput.value = ""
    alertHighOrLow.textContent = "Start guessing..."
    currentScore.textContent = "20"
    scoreAsNumber = 20
    wrapper.style.backgroundColor = "#222"
    secretNumber = Math.floor(Math.random() * 20) + 1
}

userInput.addEventListener("click", _inputHandler)
checkButton.addEventListener("click", _checkGuess)
againButton.addEventListener("click", _playAgain)