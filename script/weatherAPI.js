/*
 * Open-Meteo 날씨 데이터 모듈
 * 화면과 분리하여 API 요청과 응답 검증만 담당합니다.
 */

const WEATHER_API_URL =
    "https://api.open-meteo.com/v1/forecast";

export async function fetchCurrentWeather(
    latitude,
    longitude,
    options = {}
) {
    const numericLatitude = Number(latitude);
    const numericLongitude = Number(longitude);

    if (
        !Number.isFinite(numericLatitude) ||
        !Number.isFinite(numericLongitude)
    ) {
        throw new Error("도시 좌표가 올바르지 않습니다.");
    }

    const requestURL = new URL(WEATHER_API_URL);

    requestURL.search = new URLSearchParams({
        latitude: String(numericLatitude),
        longitude: String(numericLongitude),
        current:
            "temperature_2m,relative_humidity_2m",
        timezone: "auto"
    }).toString();

    const response = await fetch(
        requestURL,
        {
            signal: options.signal,
            headers: {
                Accept: "application/json"
            }
        }
    );

    if (!response.ok) {
        throw new Error(
            `날씨 요청에 실패했습니다. (${response.status})`
        );
    }

    const weatherData = await response.json();
    const currentWeather = weatherData.current;

    if (
        !currentWeather ||
        !Number.isFinite(
            currentWeather.temperature_2m
        ) ||
        !Number.isFinite(
            currentWeather.relative_humidity_2m
        )
    ) {
        throw new Error("날씨 응답 데이터가 올바르지 않습니다.");
    }

    return {
        temperature:
            currentWeather.temperature_2m,
        humidity:
            currentWeather.relative_humidity_2m,
        observedAt:
            currentWeather.time ?? "",
        temperatureUnit:
            weatherData.current_units
                ?.temperature_2m ?? "°C",
        humidityUnit:
            weatherData.current_units
                ?.relative_humidity_2m ?? "%"
    };
}
