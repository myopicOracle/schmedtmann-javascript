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

if (navigator.geolocation)
    navigator.geolocation.getCurrentPosition(
        function(position){
            const { latitude } = position.coords;
            const { longitude } = position.coords;
            // console.log(latitude)
            // console.log(longitude)
            // console.log(`https://www.google.com/maps/@${latitude},@${longitude}`)

            const coords = [ latitude, longitude ]

            const map = L.map('map').setView(coords, 13); // 'map' is id of map element in html

            L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(map);
            
            L.marker(coords).addTo(map) // replaced hard-codes with "coords" array
                .bindPopup('A pretty CSS popup.<br> Easily customizable.')
                .openPopup();

        },
        function(){
            console.log("Unable to find location")
        }
    )








// Leaflet sample code to 1. create map; 2. add tiles; 3. add marker
    // const map = L.map('map').setView([latitude, longitude], 13);

    // L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    //     attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    // }).addTo(map);

    // L.marker([51.5, -0.09]).addTo(map)
    //     .bindPopup('A pretty CSS popup.<br> Easily customizable.')
    //     .openPopup();
