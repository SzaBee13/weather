const input = document.getElementById("cityInput");
const OPENCAGE_API_KEY = "d4b2a8cb57dd40f1b92c6fcbc129b3d7";

// Fetch city and country from coordinates using OpenCage
async function reverseGeocode(lat, lon) {
  try {
    const res = await fetch(
      `https://api.opencagedata.com/geocode/v1/json?q=${lat}+${lon}&key=${OPENCAGE_API_KEY}&no_annotations=1&limit=1`
    );
    const data = await res.json();

    if (!data.results || data.results.length === 0) {
      return { city: "Unknown city", country: "Unknown country" };
    }

    const components = data.results[0].components;
    const city =
      components.city ||
      components.town ||
      components.village ||
      "Unknown city";
    const country = components.country || "Unknown country";

    return { city, country };
  } catch (err) {
    console.error("Reverse geocoding error:", err);
    return { city: "Unknown city", country: "Unknown country" };
  }
}

// Example usage with your weather function
async function fetchWeatherByCoords(lat, lon) {
  const resultDiv = document.getElementById("result");
  resultDiv.innerHTML = `<p class="text-gray-500 animate-pulse">Loading your local weather...</p>`;

  try {
    // 1️⃣ Fetch weather
    const weatherRes = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`
    );
    const weatherData = await weatherRes.json();
    const current = weatherData.current_weather;

    // 2️⃣ Reverse geocode
    const { city, country } = await reverseGeocode(lat, lon);

    // 3️⃣ Weather emojis
    const weatherMap = {
      0: "☀️ Clear sky",
      1: "🌤️ Mainly clear",
      2: "⛅ Partly cloudy",
      3: "☁️ Overcast",
      45: "🌫️ Fog",
      48: "🌫️ Depositing rime fog",
      51: "🌦️ Light drizzle",
      61: "🌧️ Rain",
      71: "❄️ Snow",
      80: "🌦️ Showers",
      95: "⛈️ Thunderstorm",
    };
    const weatherDesc = weatherMap[current.weathercode] || "🌈 Unknown weather";

    // 4️⃣ Background gradient
    const bgWeatherMap = {
      0: "from-yellow-400 to-orange-500",
      1: "from-yellow-300 to-blue-400",
      2: "from-blue-300 to-blue-500",
      3: "from-gray-400 to-gray-600",
      45: "from-gray-300 to-gray-500",
      48: "from-gray-300 to-gray-500",
      51: "from-blue-200 to-blue-400",
      61: "from-blue-400 to-blue-600",
      71: "from-white to-blue-300",
      80: "from-blue-400 to-gray-500",
      95: "from-gray-700 to-gray-900",
    };
    const gradientClass =
      bgWeatherMap[current.weathercode] || "from-sky-400 to-blue-600";
    document.body.className = `min-h-screen flex justify-center items-center bg-gradient-to-br ${gradientClass}`;

    // 5️⃣ Show result
    resultDiv.innerHTML = `
      <div class="space-y-1">
        <p class="text-2xl font-semibold">${weatherDesc}</p>
        <p class="text-lg text-gray-700">📍 ${city}, ${country}</p>
        <p class="text-gray-800">🌡️ ${current.temperature}°C</p>
        <p class="text-gray-800">💨 ${current.windspeed} km/h wind</p>
      </div>
    `;
  } catch (err) {
    console.error(err);
    resultDiv.innerHTML = `<p class="text-red-500">Error fetching weather.</p>`;
  }
}

// Existing city input function
async function Fetch() {
  const city = input.value.trim();
  if (!city) return;

  const geoRes = await fetch(
    `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
      city
    )}&count=1`
  );
  const geoData = await geoRes.json();

  if (!geoData.results || geoData.results.length === 0) {
    document.getElementById(
      "result"
    ).innerHTML = `<p class="text-red-500">City not found.</p>`;
    return;
  }

  const { latitude, longitude } = geoData.results[0];
  fetchWeatherByCoords(latitude, longitude);
}

window.addEventListener("load", () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        await fetchWeatherByCoords(latitude, longitude);
      },
      (error) => {
        console.warn(
          "Geolocation failed, user must enter city manually.",
          error
        );
      }
    );
  }
});

input.addEventListener("keydown", function (event) {
  if (event.key === "Enter") {
    Fetch();
  }
});
