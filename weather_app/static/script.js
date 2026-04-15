document.addEventListener('DOMContentLoaded', () => {
    // UI Elements
    const cityInput = document.getElementById('city-input');
    const searchBtn = document.getElementById('search-btn');
    const weatherCard = document.getElementById('weather-card');
    const errorMessage = document.getElementById('error-message');
    const loading = document.getElementById('loading');

    // Theme Elements
    const themeToggleBtn = document.getElementById('theme-toggle');
    const sunIcon = document.getElementById('sun-icon');
    const moonIcon = document.getElementById('moon-icon');

    // Weather Data Elements
    const elements = {
        location: document.getElementById('location-name'),
        temp: document.getElementById('temperature-main'),
        feelsLike: document.getElementById('feels-like'),
        humidity: document.getElementById('humidity'),
        wind: document.getElementById('wind-speed'),
        cloud: document.getElementById('cloud-cover'),
        precipitation: document.getElementById('precipitation'),
        pressure: document.getElementById('pressure')
    };

    /* --- Theme Toggle Logic --- */
    const setTheme = (theme) => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        if (theme === 'light') {
            sunIcon.classList.remove('hidden');
            moonIcon.classList.add('hidden');
        } else {
            sunIcon.classList.add('hidden');
            moonIcon.classList.remove('hidden');
        }
    };

    // Initialize Theme
    const savedTheme = localStorage.getItem('theme') || 'dark';
    setTheme(savedTheme);

    themeToggleBtn.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        setTheme(currentTheme === 'dark' ? 'light' : 'dark');
    });

    /* --- Weather Fetching Logic --- */
    const fetchWeather = async (city) => {
        // Reset and show loader
        weatherCard.classList.add('hidden');
        errorMessage.classList.add('hidden');
        loading.classList.remove('hidden');

        try {
            const response = await fetch(`/api/weather?city=${encodeURIComponent(city)}`);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to fetch weather data :(');
            }

            // Populate the UI with data
            elements.location.textContent = data.location;
            
            // Format existing and new data
            elements.temp.textContent = `${Math.round(data.current.temperature_2m)}${data.units.temperature_2m}`;
            elements.feelsLike.textContent = `${Math.round(data.current.apparent_temperature)}${data.units.apparent_temperature}`;
            elements.humidity.textContent = `${data.current.relative_humidity_2m}${data.units.relative_humidity_2m}`;
            elements.wind.textContent = `${data.current.wind_speed_10m} ${data.units.wind_speed_10m}`;
            elements.cloud.textContent = `${data.current.cloud_cover}${data.units.cloud_cover}`;
            elements.precipitation.textContent = `${data.current.precipitation} ${data.units.precipitation}`;
            elements.pressure.textContent = `${Math.round(data.current.surface_pressure)} ${data.units.surface_pressure}`;

            // Populate 7-Day Forecast Grid
            const forecastGrid = document.getElementById('forecast-grid');
            forecastGrid.innerHTML = '';
            
            if (data.daily && data.daily.time) {
                // We show 7 days
                for (let i = 0; i < Math.min(7, data.daily.time.length); i++) {
                    const dateRaw = new Date(data.daily.time[i] + 'T12:00:00'); // Prevent timezone offset shift by using midday UTC
                    const dayName = i === 0 ? 'Today' : dateRaw.toLocaleDateString('en-US', { weekday: 'short' });
                    
                    const high = Math.round(data.daily.temperature_2m_max[i]);
                    const low = Math.round(data.daily.temperature_2m_min[i]);
                    
                    const card = document.createElement('div');
                    card.className = 'forecast-item';
                    card.innerHTML = `
                        <h4>${dayName}</h4>
                        <div class="forecast-temp">
                            <span class="high" title="High">${high}°</span>
                            <span class="low" title="Low">${low}°</span>
                        </div>
                    `;
                    forecastGrid.appendChild(card);
                }
            }

            // Hide loader and show beautiful card smoothly
            loading.classList.add('hidden');
            weatherCard.classList.remove('hidden');
            
            // Focus input text to end
            cityInput.blur();
            
        } catch (error) {
            loading.classList.add('hidden');
            errorMessage.textContent = error.message;
            errorMessage.classList.remove('hidden');
        }
    };

    const handleSearch = () => {
        const city = cityInput.value.trim();
        if (city) {
            fetchWeather(city);
        }
    };

    searchBtn.addEventListener('click', handleSearch);
    
    cityInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    });

    // Optional: focus the input when loaded
    cityInput.focus();
});
