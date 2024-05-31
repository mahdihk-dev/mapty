'use strict';

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');
// let map;
// let mapEvent;

// ====================================================================

// __ LECTURES __

// ====================================================================

// + watch 4th lecture of this section (it is about planning for an application)

// - for building an application we need to plan for it first , planning can be done using these steps :
// 1.User Stories (functionality of application)
// 2.Creating Features (features and things that are needed for implementing functionality)
// 3.Flowchart (a plan for what we will build step by step)
// 4.Architecture (a plan for how we will build using Selected Language like JS)
// 5.Developing the project (building the project according to what we've done)

// ======================================================================
// ----------- Note This APP IS BUILT WITH OOP PROCEDURE !! -------------
// ======================================================================

// - Using The Geolocation API

// + geolocation is an API for dealing with GPS locations and is called an API cuz it is something like internationalization or timers and date or ... , something that browser gives us , but it's a modern one

// + APIs can do a lot like accessing browser to camera or vibrating the phone or ...

// we can get the user's current position using .getCurrentPosition method and the first argument of getCurrentPosition method is a callback function which will be called when getting the coordinates was successful , and second one is a callback function whihc will be called when getting coordinates had an error)

// navigator.geolocation?.getCurrentPosition(
//   // + success function has a parameter for position which is an object demonstrating the info's regarding to the current position of user
//   function (position) {
//     // + these two properties are important to get the user's location and they are available inside of the position.coords object (child object)
//     const { latitude } = position.coords;
//     const { longitude } = position.coords;

//     // - Display a Map using a third party external library called Leaflet
//     // + a library is merely a pack of codes which we can connect and link to our codes and use it as if it's our codes

//     // put latitude and longitude of user taken by geolocation.getCurrentPosition
//     const coords = [latitude, longitude];

//     // Leaflet Library (the namespace is L and it has method and properties inside) :
//     map = L.map('map').setView(coords, 13);

//     L.tileLayer('https://tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
//       attribution:
//         '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
//     }).addTo(map);

//     // - Handling Clicks on Map +++
//     // using a leaflet libray method (.on) to get the clicked point coordinates , it works just like .addEventListener() :
//     map.on(
//       'click',
//       function (mapE) {
//         // - Rendering workout input form
//         mapEvent = mapE;
//         form.classList.remove('hidden');
//         inputDistance.focus();
//       },
//       function () {
//         alert('Could not get your position !');
//       }
//     );

//     // - Rendering workout input form when the form is submited

//     form.addEventListener('submit', function (e) {
//       e.preventDefault();

//       // clear input fields :
//       inputDistance.value =
//         inputDuration.value =
//         inputCadence.value =
//         inputElevation.value =
//           '';

//       // Display the Marker
//       const { lat, lng } = mapEvent.latlng;

//       L.marker([lat, lng])
//         .addTo(map)
//         .bindPopup(
//           L.popup({
//             maxWidth: 250,
//             minWidth: 100,
//             autoClose: false,
//             closeOnClick: false,
//             className: 'running-popup',
//           })
//         )
//         .setPopupContent('Workout')
//         .openPopup();
//     });
//   }
// );

// // changing form input type
// inputType.addEventListener('change', function () {
//   inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
//   inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
// });

// ============================================================================
// ============================================================================
// ============================================================================
// ============================================================================
// ============================================================================

// ---- Refactor All Codes Within OOP :

// +++ DATAS IN OBJECT FORM
class Workout {
  // public fields
  date = new Date();
  id = (Date.now() + '').slice(-10);
  clicks = 0;

  constructor(coords, distance, duration) {
    this.coords = coords; // in lat,lang
    this.distance = distance; // in km
    this.duration = duration; // in min
  }

  _setDescription() {
    // prettier-ignore
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    this.description = `${this.type[0].toUpperCase()}${this.type.slice(1)} on ${
      months[this.date.getMonth()]
    } ${this.date.getDate()}`;
  }

  click() {
    this.clicks++;
  }
}

class Running extends Workout {
  type = 'running';

  constructor(coords, distance, duration, cadence) {
    super(coords, distance, duration);
    this.cadence = cadence;
    this.calcPace();
    this._setDescription();
  }

  calcPace() {
    // min / km
    this.pace = this.duration / this.distance;
    return this;
  }
}

class Cycling extends Workout {
  type = 'cycling';

  constructor(coords, distance, duration, elevationGain) {
    super(coords, distance, duration);
    this.elevationGain = elevationGain;
    this.calcSpeed();
    this._setDescription();
  }

  calcSpeed() {
    // km / h
    this.speed = this.distance / (this.duration * 60);
    return this.speed;
  }
}

// - Experiment with Data objects
// const running1 = new Running([], 5.2, 23, 134);
// const cycling1 = new Cycling([], 5.2, 23, 134);
// console.log(running1);
// console.log(cycling1);

/////////////////////////////////////////////////////////////////
// +++ APP ARCHITECTURE
class App {
  // Private Class Fields :
  #map;
  #mapZoomLevel = 13;
  #mapEvent;
  #workouts = [];

  constructor() {
    // + Get user's position
    this._getPosition();

    // + Get data from Local Storage
    this._getLocalStorage();

    // + Attach event handlers
    form.addEventListener('submit', this._newWorkout.bind(this));
    // changing form input type
    inputType.addEventListener('change', this._toggleElevationField.bind(this));
    // Event Delegation (for elements which are not ready to attach Event listener to)
    containerWorkouts.addEventListener('click', this._moveToPopup.bind(this));
  }

  _getPosition() {
    navigator.geolocation?.getCurrentPosition(
      this._loadMap.bind(this),
      function () {
        alert('Could not get your position !');
      }
    );
  }

  _loadMap(position) {
    const { latitude } = position.coords;
    const { longitude } = position.coords;

    const coords = [latitude, longitude];

    this.#map = L.map('map').setView(coords, this.#mapZoomLevel);

    L.tileLayer('https://tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);

    this.#map.on('click', this._showForm.bind(this));

    this.#workouts.forEach(work => {
      this._renderWorkoutMarker(work);
    });
  }

  _showForm(mapE) {
    this.#mapEvent = mapE;
    form.classList.remove('hidden');
    inputDistance.focus();
  }

  _hideForm() {
    // clear Inputs
    inputDistance.value =
      inputDuration.value =
      inputCadence.value =
      inputElevation.value =
        '';
    // hide form
    form.style.display = 'none';
    form.classList.add('hidden');
    setTimeout(function () {
      form.style.display = 'grid';
    }, 1000);
  }

  _toggleElevationField() {
    inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
    inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
  }

  _newWorkout(e) {
    // Valid input Function helpers
    const validInput = (...inputs) => inputs.every(inp => Number.isFinite(inp));
    const allPositive = (...inputs) => inputs.every(inp => inp > 0);

    e.preventDefault();

    // Steps :

    // Get data from form
    const type = inputType.value;
    const distance = +inputDistance.value;
    const duration = +inputDuration.value;
    const { lat, lng } = this.#mapEvent.latlng;
    let workout;

    // if workout running, create running object
    if (type === 'running') {
      const cadence = +inputCadence.value;
      // Check if data is valid
      if (
        !validInput(distance, duration, cadence) ||
        !allPositive(distance, duration, cadence)
      )
        return alert('Inputs have to be positive numbers !');

      workout = new Running([lat, lng], distance, duration, cadence);
    }

    // if workout cycling, create cycling object
    if (type === 'cycling') {
      const elevation = +inputElevation.value;
      // Check if data is valid
      if (
        !validInput(distance, duration, elevation) ||
        !allPositive(distance, duration)
      )
        return alert('Inputs have to be positive numbers !');

      workout = new Cycling([lat, lng], distance, duration, elevation);
    }

    // Add new object to workout array
    this.#workouts.push(workout);

    // Render workout on map as marker
    this._renderWorkoutMarker(workout);

    // Render workout on list
    this._renderWorkout(workout);

    // Hide form + clear input fields :
    this._hideForm();

    // Set Local Storage to all the workouts
    this._setLocalStorage();
  }

  _renderWorkoutMarker(workout) {
    L.marker(workout.coords)
      .addTo(this.#map)
      .bindPopup(
        L.popup({
          maxWidth: 250,
          minWidth: 100,
          autoClose: false,
          closeOnClick: false,
          className: `${workout.type}-popup`,
        })
      )
      .setPopupContent(
        `${workout.type === 'running' ? '🏃‍♂️' : '🚴'} ${workout.description}`
      )
      .openPopup();
  }

  _renderWorkout(workout) {
    let html = `
    <li class="workout workout--${workout.type}" data-id="${workout.id}">
      <h2 class="workout__title">${workout.description}</h2>
    <div class="workout__details">
      <span class="workout__icon">${
        workout.type === 'running' ? '🏃‍♂️' : '🚴'
      }</span>
      <span class="workout__value">${workout.distance}</span>
      <span class="workout__unit">km</span>
    </div>
    <div class="workout__details">
      <span class="workout__icon">⏱</span>
      <span class="workout__value">${workout.duration}</span>
      <span class="workout__unit">min</span>
    </div>`;
    if (workout.type === 'running')
      html += `          
       <div class="workout__details">
          <span class="workout__icon">⚡️</span>
          <span class="workout__value">${workout.pace.toFixed(1)}</span>
          <span class="workout__unit">min/km</span>
       </div>
       <div class="workout__details">
         <span class="workout__icon">🦶🏼</span>
         <span class="workout__value">${workout.cadence}</span>
         <span class="workout__unit">spm</span>
       </div>
    </li>`;

    if (workout.type === 'cycling')
      html += `          
       <div class="workout__details">
         <span class="workout__icon">⚡️</span>
         <span class="workout__value">${workout.speed.toFixed(1)}</span>
         <span class="workout__unit">km/h</span>
       </div>
       <div class="workout__details">
         <span class="workout__icon">⛰</span>
         <span class="workout__value">${workout.elevationGain}</span>
         <span class="workout__unit">m</span>
       </div>
    </li>`;

    form.insertAdjacentHTML('afterend', html);
  }

  _moveToPopup(e) {
    const workoutEl = e.target.closest('.workout');

    if (!workoutEl) return;

    const workout = this.#workouts.find(
      work => work.id === workoutEl.dataset.id
    );

    this.#map.setView(workout.coords, this.#mapZoomLevel, {
      animate: true,
      pan: {
        duration: 1,
      },
    });

    // using public interface
    // workout.click();
  }

  // Using LocalStorage Browser API to Save Data in Browser Storage
  _setLocalStorage() {
    // for saving and setting an item we use setItem method on localStorage Object of localStorage API , and first argument is the key name of our item (data) in string and the second is the data we want to set (save) also in string (we converted object to string using JSON.stringify)
    localStorage.setItem('workouts', JSON.stringify(this.#workouts));

    // + This API is very simple , but we should not use it in case of large data saving on browser , it slows down our project tremendousely
  }

  _getLocalStorage() {
    // for getting an item that was stored in browser we use gettItem method on localStorage Object of localStorage API , and first argument is the key name of our item (we converted string back to object using JSON.parse)
    const data = JSON.parse(localStorage.getItem('workouts'));

    // guard clause :
    if (!data) return;

    this.#workouts = data;
    this.#workouts.forEach(work => {
      this._renderWorkout(work);
    });

    // + note : when we convert an object to string and again we convert it back to object , we will lose the prototype chain of that object
  }

  // + reseting and deleting app's data (local storage)
  reset() {
    // removing from localStorage browser
    localStorage.removeItem('workouts');

    // location object is a huge object with lots of methods and ability to reload the page 
    location.reload();
  }
}

const app = new App();
console.log(app);
