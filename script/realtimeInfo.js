/*
 * 실시간 날씨 화면 모듈
 * 도시 선택 이벤트와 DOM 출력을 담당합니다.
 */

import {
    fetchCurrentWeather
} from "./weatherAPI.js";

const citySelect =
    document.querySelector("#weatherCitySelect");

const weatherBox =
    document.querySelector("#weather-box");

let activeRequestController = null;

function escapeHTML(value) {
    const escapeCharacters = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
    };

    return String(value).replace(
        /[&<>"']/g,
        (character) =>
            escapeCharacters[character]
    );
}

function getSelectedCity() {
    const selectedOption =
        citySelect.selectedOptions[0];

    return {
        name: selectedOption.dataset.name,
        country: selectedOption.dataset.country,
        latitude: Number(
            selectedOption.dataset.latitude
        ),
        longitude: Number(
            selectedOption.dataset.longitude
        )
    };
}

function formatCoordinate(value) {
    return Number(value).toFixed(4);
}

function formatObservedAt(value) {
    if (!value) {
        return "방금 업데이트";
    }

    return value.replace("T", " ") + " 기준";
}

function renderLoading(city) {
    const safeCityName = escapeHTML(city.name);

    weatherBox.className =
        "weather-box is-loading";

    weatherBox.innerHTML = `
        <p class="weather-loading">
            <span aria-hidden="true"></span>
            ${safeCityName} 날씨 불러오는 중...
        </p>
        <p class="weather-coordinates">
            LAT ${formatCoordinate(city.latitude)} ·
            LON ${formatCoordinate(city.longitude)}
        </p>
    `;
}

function renderWeather(city, weather) {
    const safeCityName = escapeHTML(city.name);
    const safeCountry = escapeHTML(city.country);
    const safeTemperatureUnit =
        escapeHTML(weather.temperatureUnit);
    const safeHumidityUnit =
        escapeHTML(weather.humidityUnit);
    const safeObservedAt =
        escapeHTML(
            formatObservedAt(weather.observedAt)
        );

    weatherBox.className = "weather-box is-ready";

    weatherBox.innerHTML = `
        <div class="weather-location">
            <span aria-hidden="true">🌍</span>
            <div>
                <small>CURRENT LOCATION</small>
                <strong>${safeCityName} ${safeCountry}</strong>
            </div>
        </div>

        <dl class="weather-values">
            <div>
                <dt>🌡️ 온도</dt>
                <dd>
                    ${weather.temperature}
                    <span>${safeTemperatureUnit}</span>
                </dd>
            </div>
            <div>
                <dt>💧 습도</dt>
                <dd>
                    ${weather.humidity}
                    <span>${safeHumidityUnit}</span>
                </dd>
            </div>
        </dl>

        <p class="weather-coordinates">
            LAT ${formatCoordinate(city.latitude)} ·
            LON ${formatCoordinate(city.longitude)}
        </p>
        <p class="weather-updated">
            ${safeObservedAt}
        </p>
    `;
}

function renderError(city) {
    const safeCityName = escapeHTML(city.name);

    weatherBox.className = "weather-box is-error";

    weatherBox.innerHTML = `
        <p class="weather-error">
            ${safeCityName}의 날씨를 불러오지 못했습니다.<br>
            잠시 후 도시를 다시 선택해 주세요.
        </p>
        <p class="weather-coordinates">
            LAT ${formatCoordinate(city.latitude)} ·
            LON ${formatCoordinate(city.longitude)}
        </p>
    `;
}

async function updateWeather() {
    const city = getSelectedCity();

    if (activeRequestController) {
        activeRequestController.abort();
    }

    activeRequestController =
        new AbortController();

    renderLoading(city);

    try {
        const weather = await fetchCurrentWeather(
            city.latitude,
            city.longitude,
            {
                signal:
                    activeRequestController.signal
            }
        );

        renderWeather(city, weather);
    } catch (error) {
        if (error.name === "AbortError") {
            return;
        }

        console.error(
            "실시간 날씨를 불러오지 못했습니다.",
            error
        );

        renderError(city);
    }
}

if (citySelect && weatherBox) {
    citySelect.addEventListener(
        "change",
        updateWeather
    );

    updateWeather();
}
