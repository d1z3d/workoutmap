"use strict";

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const form = document.querySelector(".form");
const containerWorkouts = document.querySelector(".workouts");
const inputType = document.querySelector(".form__input--type");
const inputDistance = document.querySelector(".form__input--distance");
const inputDuration = document.querySelector(".form__input--duration");
const inputCadence = document.querySelector(".form__input--cadence");
const inputElevation = document.querySelector(".form__input--elevation");
const types = new Map([
  ["running", "Бег"],
  ["cycling", "Велосипед"],
]);
class Workout {
  static #id = 0;
  constructor(coords, type, distance, duration) {
    this.id = Workout.#getId();
    this.date = new Date();
    this.coords = coords;
    this.type = type;
    this.distance = distance;
    this.duration = duration;
  }

  static #getId() {
    this.#id += 1;
    return this.#id;
  }
}

class Running extends Workout {
  constructor(cadence, ...data) {
    super(...data);
    this.cadence = cadence;
    this.pace = this.cadence / this.duration;
  }
}

class Cycling extends Workout {
  constructor(elevation, ...data) {
    super(...data);
    this.elevation = elevation;
    this.speed = this.distance / this.duration;
  }
}

class App {
  #map;
  #mapEvent;
  #workouts = [];
  constructor() {
    this.#showMap();
    this.#toggleFields();
    this.#handleFormListener();

    containerWorkouts.addEventListener("click", this.#moveToPopUp.bind(this));
  }
  #setMapEvent(value) {
    this.#mapEvent = value;
  }

  #showMap() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        this.#loadMap.bind(this),
        function () {
          console.log("error");
        }
      );
    }
  }

  #loadMap(position) {
    const { latitude, longitude } = position.coords;
    const coords = [latitude, longitude];

    this.#map = L.map("map").setView(coords, 13);

    L.tileLayer(`https://tile.openstreetmap.org/{z}/{x}/{y}.png`, {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);

    this.#map.on("click", this.#showForm.bind(this));
  }

  #showForm(event) {
    this.#setMapEvent(event);
    form.classList.remove("hidden");
    inputDistance.focus();
  }

  #toggleFields() {
    inputType.addEventListener("change", function (event) {
      inputCadence.closest(".form__row").classList.toggle("form__row--hidden");
      inputElevation
        .closest(".form__row")
        .classList.toggle("form__row--hidden");
    });
  }

  #handleFormListener() {
    form.addEventListener("submit", this.#showMark.bind(this));
  }

  #showMark(event) {
    event.preventDefault();
    const { lat, lng } = this.#mapEvent.latlng;
    let workout;
    switch (inputType.value) {
      case "running":
        workout = new Running(
          inputCadence.value,
          [lat, lng],
          inputType.value,
          inputDistance.value,
          inputDuration.value
        );
        break;
      case "cycling":
        workout = new Cycling(
          inputElevation.value,
          [lat, lng],
          inputType.value,
          inputDistance.value,
          inputDuration.value
        );
        break;
    }

    if (workout) {
      this.#workouts.push(workout);
      let html;
      if (workout.type === "running") {
        html = this.#getRunningElement(workout);
      } else {
        html = this.#getCyclingElement(workout);
      }
      form.classList.add("hidden");
      containerWorkouts.insertAdjacentHTML("beforeend", html);
      inputDistance.value =
        inputDuration.value =
        inputElevation.value =
        inputCadence.value =
          "";

      L.marker(workout.coords)
        .addTo(this.#map)
        .bindPopup(types.get(workout.type), {
          autoClose: false,
          closeOnClick: false,
          className: "mark-popup",
        })
        .openPopup();
    }
  }

  #getRunningElement(workout) {
    let html;
    if (workout.type === "running") {
      html = `
        <li class="workout workout--running" data-id="${workout.id}">
          <h2 class="workout__title">Бег - ${workout.date.getDate()} ${
        months[workout.date.getMonth()]
      }</h2>
          <div class="workout__details">
            <span class="workout__icon">🏃‍♂️</span>
            <span class="workout__value">${workout.distance}</span>
            <span class="workout__unit">км</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">⏱</span>
            <span class="workout__value">${workout.duration}</span>
            <span class="workout__unit">мин</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">⚡️</span>
            <span class="workout__value">${workout.pace}</span>
            <span class="workout__unit">мин/км</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">🦶🏼</span>
            <span class="workout__value">${workout.cadence}</span>
            <span class="workout__unit">шаг</span>
          </div>
        </li>
      `;
      return html;
    } else {
      return html;
    }
  }
  #getCyclingElement(workout) {
    let html;
    if (workout.type === "cycling") {
      html = `
        <li class="workout workout--cycling" data-id="${workout.id}">
          <h2 class="workout__title">Велосипед - ${workout.date.getDate()} ${
        months[workout.date.getMonth()]
      }</h2>
          <div class="workout__details">
            <span class="workout__icon">🚴‍♀️</span>
            <span class="workout__value">${workout.distance}</span>
            <span class="workout__unit">км</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">⏱</span>
            <span class="workout__value">${workout.duration}</span>
            <span class="workout__unit">мин</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">⚡️</span>
            <span class="workout__value">${workout.speed}</span>
            <span class="workout__unit">км/час</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">⛰</span>
            <span class="workout__value">${workout.elevation}</span>
            <span class="workout__unit">м</span>
          </div>
        </li>
      `;
      return html;
    } else {
      return html;
    }
  }

  #moveToPopUp(event) {
    const workoutElement = event.target.closest(".workout");
    console.log(workoutElement);
    if (workoutElement) {
      const workout = this.#workouts.find(
        (w) => w.id == workoutElement.dataset.id
      );
      if (workout) {
        this.#map.setView(workout.coords, 13);
      }
    }
  }
}

const app = new App();
