const input = document.getElementById("cityInput")

// Helper function to fetch weather by coordinates
async function fetchWeatherByCoords(lat, lon) {
  const resultDiv = document.getElementById("result");

  resultDiv.innerHTML = `<p class="text-gray-500 animate-pulse">Loading your local weather...</p>`;

  try {
    const weatherRes = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code,wind_speed_10m`
    );
    const weatherData = await weatherRes.json();
    const current = weatherData.current;

    // Weather emoji mapping
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

    const weatherDesc = weatherMap[current.weather_code] || "🌈 Unknown weather";

    // Update background gradient based on weather
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
    const gradientClass = bgWeatherMap[current.weather_code] || "from-sky-400 to-blue-600";
    document.body.className = `min-h-screen flex justify-center items-center bg-gradient-to-br ${gradientClass}`;

    // Display
    resultDiv.innerHTML = `
      <div class="space-y-1">
        <p class="text-2xl font-semibold">${weatherDesc}</p>
        <p class="text-lg text-gray-700">Latitude: ${lat.toFixed(2)}, Longitude: ${lon.toFixed(2)}</p>
        <p class="text-gray-800">🌡️ ${current.temperature_2m}°C</p>
        <p class="text-gray-800">💨 ${current.wind_speed_10m} km/h wind</p>
      </div>
    `;
  } catch (error) {
    console.error(error);
    resultDiv.innerHTML = `<p class="text-red-500">Error fetching weather.</p>`;
  }
}

// Existing city input function
async function Fetch() {
  const city = input.value.trim();
  if (!city) return;

  const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`);
  const geoData = await geoRes.json();

  if (!geoData.results || geoData.results.length === 0) {
    document.getElementById("result").innerHTML = `<p class="text-red-500">City not found.</p>`;
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
        console.warn("Geolocation failed, user must enter city manually.", error);
      }
    );
  }
});

input.addEventListener("keydown", function(event) {
  if (event.key === "Enter") {
    Fetch()
  }
})