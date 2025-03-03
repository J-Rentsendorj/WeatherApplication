const searchBtn = document.getElementById("search-btn");
const cityInput = document.getElementById("city-input");
const historyList = document.getElementById("history-list");
const currentWeatherSection = document.getElementById("current-weather");
const forecastCardsContainer = document.getElementById("forecast-cards");

const errorModal = new bootstrap.Modal(document.getElementById("errorModal"));
const errorModalBody = document.getElementById("errorModalBody");

searchBtn.addEventListener("click", handleSearch);

renderSearchHistory();

function handleSearch() {
    const city = cityInput.value.trim();
    if (!city) {
        showErrorModal("Please enter a city name.");
        return;
    }
    getCoordinates(city);
}

function showErrorModal(message) {
    errorModalBody.textContent = message;
    errorModal.show();
}

function getCoordinates(city) {
    const geoUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${API_KEY}`;

    fetch(geoUrl)
        .then((res) => res.json())
        .then((data) => {
            if (!data || data.length === 0) {
                showErrorModal("City not found. Please try again.");
                return;
            }
            const { lat, lon, name } = data[0];
            saveSearchHistory(name);
            getWeatherData(lat, lon, name);
        })
        .catch((err) => {
            console.error(err);
            showErrorModal("An error occurred while fetching city coordinates.");
        });
}

function getWeatherData(lat, lon, cityName) {
    const weatherUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=imperial`;

    fetch(weatherUrl)
        .then((res) => res.json())
        .then((data) => {
            displayCurrentWeather(data, cityName);
            displayForecast(data);
        })
        .catch((err) => {
            console.error(err);
            showErrorModal("An error occurred while fetching weather data.");
        });
}

function displayCurrentWeather(weatherData, cityName) {
    currentWeatherSection.innerHTML = "";

    const current = weatherData.list[0];
    const date = new Date(current.dt_txt).toLocaleDateString();
    const iconCode = current.weather[0].icon;
    const iconUrl = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
    const temp = current.main.temp;
    const humidity = current.main.humidity;
    const windSpeed = current.wind.speed;

    const cardHTML = `
    <h2 class="card-title">${cityName} (${date}) <img src="${iconUrl}" alt="weather icon" /></h2>
    <p class="card-text">Temp: ${temp} °F</p>
    <p class="card-text">Wind: ${windSpeed} MPH</p>
    <p class="card-text">Humidity: ${humidity}%</p>
    `;

    currentWeatherSection.innerHTML = cardHTML;
}

function displayForecast(weatherData) {
    forecastCardsContainer.innerHTML = "";

    for (let i = 7; i < weatherData.list.length; i += 8) {
        const forecastObj = weatherData.list[i];
        const date = new Date(forecastObj.dt_txt).toLocaleDateString();
        const iconCode = forecastObj.weather[0].icon;
        const iconUrl = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
        const temp = forecastObj.main.temp;
        const wind = forecastObj.wind.speed;
        const humidity = forecastObj.main.humidity;

        const col = document.createElement("div");
        col.classList.add("col-md-2", "col-sm-4", "mb-3");

        col.innerHTML =
        `<div class="card text-white bg-primary h-100">
            <div class="card-body">
                <h5 class="card-title">${date}</h5>
                <img src="${iconUrl}" alt="Weather icon" />
                <p class="card-text">Temp: ${temp} °F</p>
                <p class="card-text">Wind: ${wind} MPH</p>
                <p class="card-text">Humidity: ${humidity}%</p>
            </div>
        </div>`;
        forecastCardsContainer.appendChild(col);
    }
}


function saveSearchHistory(city) {
    let history = JSON.parse(localStorage.getItem("weatherSearchHistory")) || [];
    if (!history.includes(city)) {
        history.push(city);
        localStorage.setItem("weatherSearchHistory", JSON.stringify(history));
        renderSearchHistory();
    }
}

function renderSearchHistory() {
    historyList.innerHTML = "";
    const history = JSON.parse(localStorage.getItem("weatherSearchHistory")) || [];

    history.forEach((city) => {
        const li = document.createElement("li");
        li.classList.add("list-group-item", "text-primary", "cursor-pointer");
        li.textContent = city;
        li.addEventListener("click", () => {
            getCoordinates(city);
        });
        historyList.appendChild(li);
    });
}
