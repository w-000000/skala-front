/*
 * 브라우저 GPS/Wi-Fi 기반 실시간 위치 정보
 * 정확한 좌표와 가장 가까운 등록 도시를 표시합니다.
 */

const locationCard =
    document.querySelector(".location-card");

const currentLocationValue =
    document.querySelector("#currentLocationValue");

const currentLocationDetails =
    document.querySelector("#currentLocationDetails");

const locationRefreshButton =
    document.querySelector("#locationRefreshButton");

const weatherCityOptions =
    document.querySelectorAll(
        "#weatherCitySelect option"
    );

const knownCities = Array.from(
    weatherCityOptions,
    (option) => ({
        name: option.dataset.name,
        latitude: Number(
            option.dataset.latitude
        ),
        longitude: Number(
            option.dataset.longitude
        )
    })
).filter(
    (city) =>
        city.name &&
        Number.isFinite(city.latitude) &&
        Number.isFinite(city.longitude)
);

let locationWatchId = null;
let locationRequestVersion = 0;
let hasCurrentLocation = false;

function formatPosition(value) {
    return Number(value).toFixed(4);
}

function toRadians(value) {
    return value * Math.PI / 180;
}

function getDistanceInKilometers(
    firstLatitude,
    firstLongitude,
    secondLatitude,
    secondLongitude
) {
    const earthRadius = 6371;
    const latitudeDistance = toRadians(
        secondLatitude - firstLatitude
    );
    const longitudeDistance = toRadians(
        secondLongitude - firstLongitude
    );

    const calculation =
        Math.sin(latitudeDistance / 2) ** 2 +
        Math.cos(toRadians(firstLatitude)) *
        Math.cos(toRadians(secondLatitude)) *
        Math.sin(longitudeDistance / 2) ** 2;

    return earthRadius * 2 * Math.atan2(
        Math.sqrt(calculation),
        Math.sqrt(1 - calculation)
    );
}

function findNearestKnownCity(
    latitude,
    longitude
) {
    let nearestCity = null;
    let nearestDistance = Infinity;

    for (const city of knownCities) {
        const distance =
            getDistanceInKilometers(
                latitude,
                longitude,
                city.latitude,
                city.longitude
            );

        if (distance < nearestDistance) {
            nearestCity = city;
            nearestDistance = distance;
        }
    }

    return {
        city: nearestCity,
        distance: nearestDistance
    };
}

function renderLocation(position) {
    const latitude =
        position.coords.latitude;

    const longitude =
        position.coords.longitude;

    const accuracy = Math.round(
        position.coords.accuracy
    );

    const nearestLocation =
        findNearestKnownCity(
            latitude,
            longitude
        );

    if (
        nearestLocation.city &&
        nearestLocation.distance <= 120
    ) {
        currentLocationValue.textContent =
            nearestLocation.city.name + " 인근";
    } else {
        currentLocationValue.textContent =
            formatPosition(latitude) + ", " +
            formatPosition(longitude);
    }

    currentLocationDetails.textContent =
        "위도 " + formatPosition(latitude) +
        " · 경도 " + formatPosition(longitude) +
        " · 정확도 약 ±" + accuracy + "m";

    hasCurrentLocation = true;
    locationCard.classList.remove("is-error");
    locationCard.classList.add("is-active");
}

function getLocationErrorValue(error) {
    const errorValues = {
        1: {
            title: "위치 권한 필요",
            message:
                "Safari와 macOS 위치 권한을 허용한 뒤 다시 눌러 주세요."
        },
        2: {
            title: "위치 서비스 필요",
            message:
                "macOS 위치 서비스를 켠 뒤 다시 시도해 주세요."
        },
        3: {
            title: "위치 확인 지연",
            message:
                "위치 확인 시간이 초과되었습니다. 다시 눌러 주세요."
        }
    };

    return errorValues[error.code] ?? {
        title: "확인할 수 없음",
        message:
            "위치 정보를 불러오지 못했습니다."
    };
}

function renderLocationError(error) {
    if (
        hasCurrentLocation &&
        error.code !== 1
    ) {
        currentLocationDetails.textContent =
            "새 위치를 기다리는 중입니다. 마지막 위치를 유지합니다.";
        return;
    }

    const errorValue =
        getLocationErrorValue(error);

    currentLocationValue.textContent =
        errorValue.title;

    currentLocationDetails.textContent =
        errorValue.message;

    locationCard.classList.remove("is-active");
    locationCard.classList.add("is-error");
}

function stopLocationWatch() {
    if (locationWatchId === null) {
        return;
    }

    navigator.geolocation.clearWatch(
        locationWatchId
    );

    locationWatchId = null;
}

function requestPosition(options) {
    return new Promise(
        (resolve, reject) => {
            navigator.geolocation.getCurrentPosition(
                resolve,
                reject,
                options
            );
        }
    );
}

function beginContinuousLocationUpdates(
    requestVersion
) {
    locationWatchId =
        navigator.geolocation.watchPosition(
            (position) => {
                if (
                    requestVersion ===
                    locationRequestVersion
                ) {
                    renderLocation(position);
                }
            },
            (error) => {
                if (
                    requestVersion ===
                    locationRequestVersion
                ) {
                    renderLocationError(error);
                }
            },
            {
                enableHighAccuracy: false,
                maximumAge: 60000,
                timeout: 30000
            }
        );
}

async function startLocationWatch() {
    if (!window.isSecureContext) {
        currentLocationValue.textContent =
            "보안 연결 필요";

        currentLocationDetails.textContent =
            "위치 확인은 HTTPS 또는 localhost에서만 사용할 수 있습니다.";

        locationCard.classList.add("is-error");
        return;
    }

    if (!navigator.geolocation) {
        currentLocationValue.textContent =
            "지원되지 않음";

        currentLocationDetails.textContent =
            "이 브라우저는 위치 기능을 지원하지 않습니다.";

        locationCard.classList.add("is-error");
        return;
    }

    stopLocationWatch();
    locationRequestVersion += 1;

    const requestVersion =
        locationRequestVersion;

    hasCurrentLocation = false;
    currentLocationValue.textContent =
        "확인 중...";

    currentLocationDetails.textContent =
        "GPS와 Wi-Fi를 이용해 정확한 위치를 확인하고 있습니다.";

    locationCard.classList.remove(
        "is-active",
        "is-error"
    );

    try {
        let position;

        try {
            position = await requestPosition({
                enableHighAccuracy: true,
                maximumAge: 0,
                timeout: 15000
            });
        } catch (highAccuracyError) {
            if (highAccuracyError.code === 1) {
                throw highAccuracyError;
            }

            currentLocationDetails.textContent =
                "Wi-Fi 기반 일반 위치로 다시 확인하고 있습니다.";

            position = await requestPosition({
                enableHighAccuracy: false,
                maximumAge: 300000,
                timeout: 20000
            });
        }

        if (
            requestVersion !==
            locationRequestVersion
        ) {
            return;
        }

        renderLocation(position);
        beginContinuousLocationUpdates(
            requestVersion
        );
    } catch (error) {
        if (
            requestVersion ===
            locationRequestVersion
        ) {
            renderLocationError(error);
        }
    }
}

if (
    locationCard &&
    currentLocationValue &&
    currentLocationDetails &&
    locationRefreshButton
) {
    locationRefreshButton.addEventListener(
        "click",
        startLocationWatch
    );

    window.addEventListener(
        "pagehide",
        stopLocationWatch
    );

    startLocationWatch();
}
