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

// overall class - I found it easier to fill after finishing the Workout/Running/Cycling Classes 
class App {
    #map;
    #mapEvent;

    constructor() { // constructor immediately gets called on page load (b/c of new Object defined in global scope)
        this._getPosition();
        form.addEventListener('submit', this._newWorkout.bind(this)); // need to 'bind' b/c in event listener functions, the 'this' keyword points to the DOM object; so here, it points to 'form' and no longer the 'App' object we are in 
        inputType.addEventListener('change', this._toggleElevationField.bind(this)); // since constructor is immediately called on page load, these event listeners are immediately available in the global scope
    }

    _getPosition() {
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

        const coords = [ latitude, longitude ]

        this.#map = L.map('map').setView(coords, 13); // 'map' is id of map element in html

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

        // Clear input fields
        inputDistance.value = inputDuration.value = inputCadence.value = inputElevation.value = "";

        // Display marker
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
            .setPopupContent("Workout")
            .openPopup();

        return this;
    };

}

// const app = new App();
// app._getPosition(); // so code executes soon as page loads

class Workout {
    constructor(id, distance, duration, coords) {
        this.id = id;
        this.distance = distance;
        this.duration = duration;
        this.coords = coords;
        this.date = new Date().getDate
    }
}


class Running extends Workout {
    constructor(id, distance, duration, coords, cadence) {
        super(id, distance, duration, coords);
        this.cadence = cadence;
    }
}


class Cycling extends Workout {
    constructor(id, distance, duration, coords, elevation) {
        super(id, distance, duration, coords);
        this.elevation = elevation;
    }
}


// create App object
const mapty = new App()

// on page load, based on flowchart
mapty()
    ._getPosition()
    ._loadMap()
    ._showForm();

const run1 = new Running(1, 2, [3,4], 5)
console.log(run1)

const cycle1 = new Cycling(1, 2, [3,4], 5)
console.log(cycle1)



//////////////////////////////////////////////////////////////////////////////////////////
// ### everything below is old code unfactored for architecture
//////////////////////////////////////////////////////////////////////////////////////////

// let map, mapEvent;

// if (navigator.geolocation)
//     navigator.geolocation.getCurrentPosition(
//         function(position){
//             const { latitude } = position.coords;
//             const { longitude } = position.coords;
//             // console.log(latitude)
//             // console.log(longitude)
//             // console.log(`https://www.google.com/maps/@${latitude},@${longitude}`)

//             const coords = [ latitude, longitude ]

//             map = L.map('map').setView(coords, 13); // 'map' is id of map element in html

//             L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
//                 attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
//             }).addTo(map);
            
//             // to get lat/long of click event, so marker can be generated at clicked location
//             map.on('click', function(mapE) { // here, "map" is special object generated by Leaflet, result of calling L.map(); L is namespace created by Leaflet; using .on instead of .addEventListener
//                 mapEvent = mapE; // copy to global variable so we can use in the event listener step below where we do need it
//                 form.classList.remove('hidden'); // enables form to be rendered by removing "hidden" as class
//                 inputDistance.focus(); // cursor moves to "Distance" input box upon click
//             }) 
//         },

//         function(){
//             console.log("Unable to find location")
//         }
//     )

//     // move workflow we did in previous step - latlng & marker - down the architecture chain; need to render marker upon user submit of form
//     form.addEventListener('submit', function(e) {
//         e.preventDefault(); // solves problem of form/marker popup closing right after; now it stays on 
//         // Clear input fields
//         inputDistance.value = inputDuration.value = inputCadence.value = inputElevation.value = "";

//         // Display marker
//         console.log(mapEvent) // {originalEvent: PointerEvent, containerPoint: p, layerPoint: p, latlng: v, type: 'click', …}
//         const { lat, lng } = mapEvent.latlng

//         L.marker([ lat, lng ])
//             .addTo(map) // replaced hard-codes with "coords" array
//             .bindPopup(L.popup({
//                 maxWidth: 250,
//                 minWidth: 100,
//                 autoClose: false,
//                 closeOnClick: false,
//                 className: 'running-popup',
//             })
//         ) // binds popup to marker; can use object instead of string
//             .setPopupContent("Workout")
//             .openPopup();
//     })
    
//     // NEW listener event type learned -> "change"
//     inputType.addEventListener('change', function() {
//             inputElevation.closest('.form__row').classList.toggle('form__row--hidden') // .closest = reverse querySelector, selects closest parent 
//             inputCadence.closest('.form__row').classList.toggle('form__row--hidden') // .toggle switches between two states
//     })

// ### END