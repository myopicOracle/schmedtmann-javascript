'use strict';

// prettier-ignore
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');

// basic geolocation API - takes 2 callbacks
// navigator.geolocation.getCurrentPosition(function(){},function(){})

// let map, mapEvent; // no longer necessary after refactor

class Workout {
    date = new Date();
    id = (Date.now() + '').slice(-10); // date/time now, converted to string, then select last 10 chars; any newly creasted object should have identifier so we can select later; in real world, typically you create id's using a library
    // below are new fields added by me after initial refactor for architecture
    month = this.date.getMonth();
    day = this.date.getDate();
    hour = this.date.getHours();
    minute = this.date.getMinutes();
    amOrPm = this.hour >= 12 ? "PM" : "AM";

    constructor(coords, distance, duration) {
        // this.date = ... // no need to do this again here with ES6, you already defined in field above
        // this.id = ... // no need to do this again here with ES6, you already defined in field above
        this.coords = coords; // [lat, lng]
        this.distance = distance; // in km
        this.duration = duration; // in min
    }
}

class Running extends Workout {
    // month = this.date.getMonth();
    // day = this.date.getDate();
    // hour = this.date.getHours();
    // minute = this.date.getMinute();
    // amOrPm = this.hour >= 12 ? "PM" : "AM";

    constructor(coords, distance, duration, cadence) {
        super(coords, distance, duration);
        this.cadence = cadence;
        this.calcPace();
    }

    calcPace() { // min/km
        this.pace = this.duration / this.distance;
        return this.pace;
    }
}

class Cycling extends Workout {
    // month = this.date.getMonth();
    // day = this.date.getDate();
    // hour = this.date.getHours();
    // minute = this.date.getMinute();
    // amOrPm = this.hour >= 12 ? "PM" : "AM";

    constructor(coords, distance, duration, elevationGain) {
        super(coords, distance, duration);
        this.elevationGain = elevationGain;
        this.calcSpeed();
    }

    calcSpeed() { // km/h
        this.speed = this.distance / (this.duration / 60); // speed = opposite of pace
        return this.speed;
    }
}

// const run1 = new Running([39, -12], 5.2, 65, 184)
// console.log(run1)

// const cycle1 = new Cycling([39, -12], 32, 103, 675)
// console.log(cycle1)

///////////////////////////////////////////////////////////////
// APPLICATION ARCHITECTURE
class App {
    #map;
    #mapEvent;

    constructor() { // constructor immediately gets called on page load (b/c of new Object defined in global scope)
        this.workoutArray = [];
        this._getPosition();
        form.addEventListener('submit', this._newWorkout.bind(this)); // need to 'bind' b/c in event listener functions, the 'this' keyword points to the DOM object; so here, it points to 'form' and no longer the 'App' object we are in 
        inputType.addEventListener('change', this._toggleElevationField.bind(this)); // since constructor is immediately called on page load, these event listeners are immediately available in the global scope
    }

    _getPosition() { // no need for 'return this...' since called in constructor
        if (navigator.geolocation)
            navigator.geolocation.getCurrentPosition(
            this._loadMap.bind(this), 
            function(){ // need to bind b/c otherwise this = undefined, as this is regular function call
                    alert("Unable to find location")
                }
            );
    };

    _loadMap(position) {
        const { latitude } = position.coords;
        const { longitude } = position.coords;
        console.log(`https://www.google.com/maps/@${latitude},@${longitude}`)

        this.coords = [ latitude, longitude ]

        this.#map = L.map('map').setView(this.coords, 13); // 'map' is id of map element in html

        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(this.#map);
        
        // to get lat/long of click event, so marker can be generated at clicked location
        this.#map.on('click', this._showForm.bind(this)); // need to bind 'this' to the App object
    } 

    _showForm(mapE) {
        this.#mapEvent = mapE; // copy to global variable so we can use in the event listener step below where we do need it
        form.classList.remove('hidden'); // enables form to be rendered by removing "hidden" as class
        inputDistance.focus(); // cursor moves to "Distance" input box upon click
        return this;
    };

    _toggleElevationField() {
        inputElevation.closest('.form__row').classList.toggle('form__row--hidden') // .closest = reverse querySelector, selects closest parent 
        inputCadence.closest('.form__row').classList.toggle('form__row--hidden') // .toggle switches between two states
        return this;
    };

    _newWorkout(e) {
        // solves problem of form/marker popup closing right after; now it stays on 
        e.preventDefault(); 

        // Get Data from form
        const workoutType = inputType.value
        const workoutDistance = inputDistance.value
        const workoutDuration = inputDuration.value
        const workoutCadence = inputCadence.value
        const workoutElevation = inputElevation.value

        // ** Moved to "fields" in parent Workout Class; since should be available to all child classes, and created upon initialization of new class objects
        // const month = date.getMonth();
        // const day = date.getDate();
        // const hour = date.getHour();
        // const minute = date.getMinute();
        // const amOrPm = hour >= 12 ? "PM" : "AM";

        // If running, create running object
        if (workoutType === "running") {

            // Validate data
            if ( !( workoutDistance && workoutDuration && workoutCadence > 0 ) ) {
                alert("Inputs have to be positive numbers!")
            } 
            
            else {

                const runObject = new Running(this.coords, workoutDistance, workoutDuration, workoutCadence);
                
                // Add new object to workout array
                this.workoutArray.push(runObject);
                    console.log(this.workoutArray)

                // Render workout on map as marker
                const { lat, lng } = this.#mapEvent.latlng
                L.marker([ lat, lng ]) // replaced hard-codes with "coords" array
                    .addTo(this.#map)
                    .bindPopup(L.popup({ // binds popup to marker; can use object instead of string
                        maxWidth: 250,
                        minWidth: 100,
                        autoClose: false,
                        closeOnClick: false,
                        className: 'running-popup',
                    })
                )
                    .setPopupContent("Running")
                    .openPopup();

                // Render workout on list
                const newWorkoutNode = document.createElement("li") 
                newWorkoutNode.innerHTML = `<li class="workout workout--running" data-id="${runObject.id}">
                                                    <h2 class="workout__title">Running on 
                                                    ${months[runObject.month]}
                                                    ${" "}
                                                    ${runObject.day}
                                                    ${" "}
                                                    at 
                                                    ${" "}
                                                    ${runObject.hour}
                                                    :
                                                    ${runObject.minute}
                                                    ${" "}
                                                    ${runObject.amOrPm}
                                                    </h2>
                                                    <div class="workout__details">
                                                        <span class="workout__icon">🏃‍♂️</span>
                                                        <span class="workout__value">${workoutDistance}</span>
                                                        <span class="workout__unit">km</span>
                                                    </div>
                                                    <div class="workout__details">
                                                        <span class="workout__icon">⏱</span>
                                                        <span class="workout__value">${workoutDuration}</span>
                                                        <span class="workout__unit">min</span>
                                                    </div>
                                                    <div class="workout__details">
                                                        <span class="workout__icon">⚡️</span>
                                                        <span class="workout__value">${(workoutDuration/workoutDistance).toFixed(1)}</span>
                                                        <span class="workout__unit">min/km</span>
                                                    </div>
                                                    <div class="workout__details">
                                                        <span class="workout__icon">🦶🏼</span>
                                                        <span class="workout__value">${workoutCadence}</span>
                                                        <span class="workout__unit">spm</span>
                                                    </div>
                                                </li>`
                containerWorkouts.appendChild(newWorkoutNode)


                // Clear form input fields
                inputDistance.value = inputDuration.value = inputCadence.value = "";
            };
        }

        // Else cycling, create cycling object
        else {

            // Validate data
            if ( !(workoutDistance && workoutDuration && workoutElevation > 0 ) ) {
                alert("Inputs have to be positive numbers!")
            } 
            
            else {
                
                const cycleObject = new Cycling(this.coords, workoutDistance, workoutDuration, workoutElevation);
                
                // Add new object to workout array
                this.workoutArray.push(cycleObject);
                    console.log(this.workoutArray)

                // Render workout on map as marker
                const { lat, lng } = this.#mapEvent.latlng
                L.marker([ lat, lng ]) // replaced hard-codes with "coords" array
                    .addTo(this.#map)
                    .bindPopup(L.popup({ // binds popup to marker; can use object instead of string
                        maxWidth: 250,
                        minWidth: 100,
                        autoClose: false,
                        closeOnClick: false,
                        className: 'cycling-popup',
                    })
                )
                    .setPopupContent("Cycling")
                    .openPopup();

                // Render workout on list
                const newWorkoutNode = document.createElement("li")
                newWorkoutNode.innerHTML = `<li class="workout workout--running" data-id="${cycleObject.id}">
                                                    <h2 class="workout__title">Cycling on 
                                                    ${months[cycleObject.month]}
                                                    ${" "}
                                                    ${cycleObject.day}
                                                    ${" "}
                                                    at
                                                    ${" "}
                                                    ${cycleObject.hour}
                                                    :
                                                    ${cycleObject.minute}
                                                    ${" "}
                                                    ${cycleObject.amOrPm}
                                                    </h2>
                                                    <div class="workout__details">
                                                        <span class="workout__icon">🚴‍♀️</span>
                                                        <span class="workout__value">${workoutDistance}</span>
                                                        <span class="workout__unit">km</span>
                                                    </div>
                                                    <div class="workout__details">
                                                        <span class="workout__icon">⏱</span>
                                                        <span class="workout__value">${workoutDuration}</span>
                                                        <span class="workout__unit">min</span>
                                                    </div>
                                                    <div class="workout__details">
                                                        <span class="workout__icon">⚡️</span>
                                                        <span class="workout__value">${(workoutDistance/workoutDuration).toFixed(1)}</span>
                                                        <span class="workout__unit">km/h</span>
                                                    </div>
                                                    <div class="workout__details">
                                                        <span class="workout__icon">⛰</span>
                                                        <span class="workout__value">${workoutElevation}</span>
                                                        <span class="workout__unit">m</span>
                                                    </div>
                                                </li>`
                containerWorkouts.appendChild(newWorkoutNode)

                // Clear form input fields
                inputDistance.value = inputDuration.value = inputElevation.value = "";
            };
        }

        return this;
    };

};


// create App object
const mapty = new App() // so code executes soon as page loads

// ### END OF PROGRAM