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

// let map, mapEvent; // no longer necessary after refactor

class Workout {
    date = new Date();
    id = (Date.now() + '').slice(-10); // date/time now, converted to string, then select last 10 chars; any newly creasted object should have identifier so we can select later; in real world, typically you create id's using a library
    clicks = 0;
    // below are new fields added by me after initial refactor for architecture
        // month = this.date.getMonth();
        // day = this.date.getDate();
        // hour = this.date.getHours();
        // minute = this.date.getMinutes();
        // amOrPm = this.hour >= 12 ? "PM" : "AM";

    constructor(coords, distance, duration) {
        this.coords = coords; // [lat, lng]
        this.distance = distance; // in km
        this.duration = duration; // in min
    }

    _setDescription() {
        // prettier-ignore
        const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

        this.description = `${this.type[0].toUppercase()}${this.type.slice(1)} on ${months[this.date.getMonth()]} ${[this.date.getDate()]}`
    }

    click() {
        this.click++;
    }
}

class Running extends Workout {
    type = 'running';

    constructor(coords, distance, duration, cadence) {
        super(coords, distance, duration);
        this.cadence = cadence;
        this.calcPace();
        this._setDescription(); // needs to be here in Child, beacuase 'Type' is here
    }

    calcPace() { // min/km
        this.pace = this.duration / this.distance;
        return this.pace;
    }
}

class Cycling extends Workout {
    type = 'cycling';

    constructor(coords, distance, duration, elevationGain) {
        super(coords, distance, duration);
        this.elevationGain = elevationGain;
        // this.type = 'cycling'
        this.calcSpeed();
        this._setDescription(); // needs to be here in Child, beacuase 'Type' is here
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
    #mapZoomLevel = 13;
    #mapEvent;
    #workoutArray = [];

    constructor() { // constructor immediately gets called on page load (b/c of new Object defined in global scope)
        // Get user's position
        this._getPosition();
        // Get data from local storage
        this._getLocalStorage();
        // Attach event handlers
        form.addEventListener('submit', this._newWorkout.bind(this)); // need to 'bind' b/c in event listener functions, the 'this' keyword points to the DOM object; so here, it points to 'form' and no longer the 'App' object we are in 
        inputType.addEventListener('change', this._toggleElevationField.bind(this)); // since constructor is immediately called on page load, these event listeners are immediately available in the global scope
        containerWorkouts.addEventListener('click', this._moveToPopup.bind(this));
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

        this.#map = L.map('map').setView(this.coords, this.#mapZoomLevel); // 'map' is id of map element in html

        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(this.#map);
        
        // to get lat/long of click event, so marker can be generated at clicked location
        this.#map.on('click', this._showForm.bind(this)); // need to bind 'this' to the App object

        this.#workoutArray.forEach(work => { // have to call this here instead of beg, b/c map not loaded yet in beg
            this._renderWorkoutMarker(work)
        })
    } 

    _showForm(mapE) {
        this.#mapEvent = mapE; // copy to global variable so we can use in the event listener step below where we do need it
        form.classList.remove('hidden'); // enables form to be rendered by removing "hidden" as class
        inputDistance.focus(); // cursor moves to "Distance" input box upon click
        return this;
    };

    _hideForm() {
        // empty inputs
        inputDistance.value = inputDuration.value = inputCadence.value = "";

        form.style.display = 'none'; // there is silding animation on "form" from CSS
        form.classList.add('hidden');
        setTimeout(() => (form.style.display = 'grid'), 1000)
    }

    _toggleElevationField() {
        inputElevation.closest('.form__row').classList.toggle('form__row--hidden') // .closest = reverse querySelector, selects closest parent 
        inputCadence.closest('.form__row').classList.toggle('form__row--hidden') // .toggle switches between two states
        return this;
    };

    _newWorkout(e) {
        const validInputs = (...inputs) => 
            inputs.every(inp => Number.isFinite(inp)) // helper function for the check data valid IF statments below; loops over array, in each will check if number is finite, then in end the every method only returns true if that value is true for all of them, if oinly one of values is not finite, then every returns 'false', which is return value of arrow function
        const allPositive = (...inputs) =>
            inputs.every(inp => inp > 0)
        // solves problem of form/marker popup closing right after; now it stays on 
        e.preventDefault(); 

        // Get Data from form
        const workoutType = inputType.value
        const workoutDistance = inputDistance.value
        const workoutDuration = inputDuration.value
        const workoutCadence = inputCadence.value
        const workoutElevation = inputElevation.value
        const { lat, lng } = this.#mapEvent.latlng
        let workout;

        // If running, create running object
        if (workoutType === "running") {
            const cadence = +inputCadence.value;

            // Validate data -- solution
            if (
                !validInputs(workoutDistance, workoutDuration, workoutCadence) // aka " If all of these are numbers, then return true "
                || !allPositive(workoutDistance, workoutDuration, workoutCadence)
            )
            return alert('Inputs have ot be positive enumbers!')

            workout = new Running([lat, lng], workoutDistance, workoutDuration, workoutCadence);
        }

        if (workoutType === "cycling") {
            if (
                !validInputs(workoutDistance, workoutDuration, workoutElevation) // aka " If all of these are numbers, then return true "
                || !allPositive(workoutDistance, workoutDuration) // excluded elevation, b/c could be negative
            )
            return alert('Inputs have ot be positive enumbers!')

            workout = new Cycling([lat, lng], workoutDistance, workoutDuration, workoutElevation);

        }
        
        // add new object to workout array
        this.#workoutArray.push(workout)

        // render workout on map as marker
        this.renderWorkoutMarker(workout)

        // render workout in sidepanel list
        this._renderWorkout(workout)

        // hide form + clear input fields
        this._hideForm()

        // set local storage for all workouts
        this._setLocalStorage()

    };
            
            // else {

    //         //     const runObject = new Running([lat, lng], workoutDistance, workoutDuration, workoutCadence);
                
    //         //     // Add new object to workout array
    //         //     this.workoutArray.push(runObject);
    //         //         console.log(this.workoutArray)

    //             // Render workout on map as marker
    //             L.marker([ lat, lng ]) // replaced hard-codes with "coords" array
    //                 .addTo(this.#map)
    //                 .bindPopup(L.popup({ // binds popup to marker; can use object instead of string
    //                     maxWidth: 250,
    //                     minWidth: 100,
    //                     autoClose: false,
    //                     closeOnClick: false,
    //                     className: `${type}-popup`,
    //                 })
    //             )
    //                 .setPopupContent("Running")
    //                 .openPopup();

    //             // Render workout on list
    //             const newWorkoutNode = document.createElement("li") 
    //             newWorkoutNode.innerHTML = `<li class="workout workout--running" data-id="${runObject.id}">
    //                                                 <h2 class="workout__title">Running on 
    //                                                 ${months[runObject.month]}
    //                                                 ${" "}
    //                                                 ${runObject.day}
    //                                                 ${" "}
    //                                                 at 
    //                                                 ${" "}
    //                                                 ${runObject.hour}
    //                                                 :
    //                                                 ${runObject.minute}
    //                                                 ${" "}
    //                                                 ${runObject.amOrPm}
    //                                                 </h2>
    //                                                 <div class="workout__details">
    //                                                     <span class="workout__icon">🏃‍♂️</span>
    //                                                     <span class="workout__value">${workoutDistance}</span>
    //                                                     <span class="workout__unit">km</span>
    //                                                 </div>
    //                                                 <div class="workout__details">
    //                                                     <span class="workout__icon">⏱</span>
    //                                                     <span class="workout__value">${workoutDuration}</span>
    //                                                     <span class="workout__unit">min</span>
    //                                                 </div>
    //                                                 <div class="workout__details">
    //                                                     <span class="workout__icon">⚡️</span>
    //                                                     <span class="workout__value">${(workoutDuration/workoutDistance).toFixed(1)}</span>
    //                                                     <span class="workout__unit">min/km</span>
    //                                                 </div>
    //                                                 <div class="workout__details">
    //                                                     <span class="workout__icon">🦶🏼</span>
    //                                                     <span class="workout__value">${workoutCadence}</span>
    //                                                     <span class="workout__unit">spm</span>
    //                                                 </div>
    //                                             </li>`
    //             containerWorkouts.appendChild(newWorkoutNode)


    //             // Clear form input fields
                
    //         }

    //     // Else cycling, create cycling object
    //     else {


    //         // Validate data -- solution
    //         if (
    //             !validInputs(workoutDistance, workoutDuration, workoutElevation) // aka " If all of these are numbers, then return true "
    //             || !allPositive(workoutDistance, workoutDuration) // excluded elevation, b/c could be negative
    //         )
    //         return alert('Inputs have ot be positive enumbers!')

    //         // Validate data -- my way
    //         // if ( !(workoutDistance && workoutDuration && workoutElevation > 0 ) ) {
    //         //     alert("Inputs have to be positive numbers!")
    //         // } 
    //         workout = new Cycling([lat, lng], workoutDistance, workoutDuration, workoutElevation);
    //         this.#workoutArray.push(workout);

    //         this.renderWorkoutMarker(workout)

    //         //
    //         // else {
                
    //         //     const cycleObject = new Cycling([lat, lng], workoutDistance, workoutDuration, workoutElevation);
                
    //         //     // Add new object to workout array
    //         //     this.workoutArray.push(cycleObject);
    //         //         console.log(this.workoutArray)

    //             // Render workout on map as marker
    //             const { lat, lng } = this.#mapEvent.latlng
  
    //             // Render workout on list
    //             const newWorkoutNode = document.createElement("li")
    //             newWorkoutNode.innerHTML = `
    //                 <li class="workout workout--running" data-id="${cycleObject.id}">
    //                     <h2 class="workout__title">Cycling on 
    //                     ${months[cycleObject.month]}
    //                     ${" "}
    //                     ${cycleObject.day}
    //                     ${" "}
    //                     at
    //                     ${" "}
    //                     ${cycleObject.hour}
    //                     :
    //                     ${cycleObject.minute}
    //                     ${" "}
    //                     ${cycleObject.amOrPm}
    //                     </h2>
    //                     <div class="workout__details">
    //                         <span class="workout__icon">🚴‍♀️</span>
    //                         <span class="workout__value">${workoutDistance}</span>
    //                         <span class="workout__unit">km</span>
    //                     </div>
    //                     <div class="workout__details">
    //                         <span class="workout__icon">⏱</span>
    //                         <span class="workout__value">${workoutDuration}</span>
    //                         <span class="workout__unit">min</span>
    //                     </div>
    //                     <div class="workout__details">
    //                         <span class="workout__icon">⚡️</span>
    //                         <span class="workout__value">${(workoutDistance/workoutDuration).toFixed(1)}</span>
    //                         <span class="workout__unit">km/h</span>
    //                     </div>
    //                     <div class="workout__details">
    //                         <span class="workout__icon">⛰</span>
    //                         <span class="workout__value">${workoutElevation}</span>
    //                         <span class="workout__unit">m</span>
    //                     </div>

    //                             </li>
    //             `
                                            
    //         containerWorkouts.appendChild(newWorkoutNode)

    //         // Clear form input fields
    //         inputDistance.value = inputDuration.value = inputElevation.value = "";
    //     };
    //     return this;
    // }

    _renderWorkoutMarker(workout) {
        L.marker(workout.coords) // replaced hard-codes with "coords" array
            .addTo(this.#map)
            .bindPopup(L.popup({ // binds popup to marker; can use object instead of string
                maxWidth: 250,
                minWidth: 100,
                autoClose: false,
                closeOnClick: false,
                className: `${workout.type}-popup`, // only worked after adding 'type' property to both child classes
            })
        )
            .setPopupContent(`${ workout.name === 'running' ? '🏃‍♂️' : '🚴‍♀️' } ${workout.description}`)
            .openPopup();

        }
        
        _renderWorkout(workout) { // create markup and insert into DOM
            let html = `
                <li class="workout workout--${workout.name}" data-id="${workout.id}">
                <h2 class="workout__title">${workout.description}</h2>
                <div class="workout__details">
                    <span class="workout__icon">${
                        workout.name === 'running' ? '🏃‍♂️' : '🚴‍♀️'
                    }</span>
                    <span class="workout__value">${workout.workoutDistance}</span>
                    <span class="workout__unit">km</span>
                </div>
                <div class="workout__details">
                    <span class="workout__icon">⏱</span>
                    <span class="workout__value">${workout.workoutDuration}</span>
                    <span class="workout__unit">min</span>
                </div>
            </li>`;

            if (workout.type === 'running')
                html += `
                    <li>
                        <div class="workout__details">
                            <span class="workout__icon">⚡️</span>
                            <span class="workout__value">${(workout.pace).toFixed(1)}</span>
                            <span class="workout__unit">min/km</span>
                        </div>
                        <div class="workout__details">
                            <span class="workout__icon">🦶🏼</span>
                            <span class="workout__value">${workout.workoutCadence}</span>
                            <span class="workout__unit">spm</span>
                        </div>
                    </li>`

            if (workout.type === 'running')
                html += `
                    <li>
                        <div class="workout__details">
                            <span class="workout__icon">⚡️</span>
                            <span class="workout__value">${(workout.workoutSpeed).toFixed(1)}</span>
                            <span class="workout__unit">km/h</span>
                        </div>
                        <div class="workout__details">
                            <span class="workout__icon">⛰</span>
                            <span class="workout__value">${workout.workoutElevation}</span>
                            <span class="workout__unit">m</span>
                        </div>
                    </li>`

            form.insertAdjacentHTML('afterend, html'); // add as sibling element; because we don't want to be first or last child, which is what awould happen if we jhust append to UL
                
        }

        _moveToPopup(e) {
            const workoutEl = e.target.closest('.workout'); // selects closest parent, here would be 'li' which has class '.workout'
            // console.log(workoutEl);

            if (!workoutEl) return;

            const workout = this.#workoutArray.find(work => work.id === workoutEl.dataset.id);
            // console.log(workout)

            this.#map.setView(workout.coords, this.#mapZoomLevel, { // seView is Leaflet method; (coordinates, zoom level)
                animate: true,
                pan: {
                    duration: 1
                }
            })

            // using public interface
            // workout.click(); // need to disable b/c objects stored in local, get returned as regular objects
        }

        // to make persist across reloads
        _setLocalStorage() {
            localStorage.setItem('workouts', JSON.stringify(this.#workoutArray)) // basically storing "key: value" pairs; stored as string in key
        }

        _getLocalStorage() {
            const data = JSON.parse(localStorage.getItem('workoutArray')) // parse turns string back to object
            // console.log(data)

            if (!data) return // guard clause

            this.#workoutArray = data

            this.#workoutArray.forEach(work => {
                this._renderWorkout(work)
            })
        }

        reset() { // the only public interface
            localStorage.removeItem('workoutArray')
            location.reload() // location is a prebuilt function with many methods
        }
    };


// create App object
const mapty = new App() // so code executes soon as page loads

// console.log(app.reset())

// ### END OF PROGRAM