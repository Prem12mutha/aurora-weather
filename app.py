from flask import Flask, render_template, request, jsonify
import urllib.request
import json
import urllib.parse

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/weather')
def get_weather():
    city = request.args.get('city')
    if not city:
        return jsonify({"error": "City is required"}), 400
        
    try:
        # Step 1: Geocoding API - Get latitude and longitude
        geo_url = f"https://geocoding-api.open-meteo.com/v1/search?name={urllib.parse.quote(city)}&count=1&language=en&format=json"
        
        with urllib.request.urlopen(geo_url) as response:
            geo_data = json.loads(response.read().decode('utf-8'))
            
        if not geo_data.get('results'):
            return jsonify({"error": f"Could not find location for: '{city}'. Please check the spelling."}), 404

        location = geo_data['results'][0]
        lat = location['latitude']
        lon = location['longitude']
        country = location.get('country', '')
        state = location.get('admin1', '')
        
        location_name = f"{location['name']}"
        if state: location_name += f", {state}"
        if country: location_name += f", {country}"
        
        # Step 2: Open-Meteo Weather API
        # Added daily forecast for the week!
        weather_url = (f"https://api.open-meteo.com/v1/forecast?"
                       f"latitude={lat}&longitude={lon}&"
                       f"current=temperature_2m,relative_humidity_2m,apparent_temperature,wind_speed_10m,cloud_cover,precipitation,surface_pressure&"
                       f"daily=temperature_2m_max,temperature_2m_min,weather_code&"
                       f"timezone=auto")
        
        with urllib.request.urlopen(weather_url) as response:
            weather_data = json.loads(response.read().decode('utf-8'))
            
        return jsonify({
            "location": location_name,
            "current": weather_data['current'],
            "daily": weather_data.get('daily', {}),
            "units": weather_data['current_units']
        })
        
    except Exception as e:
        return jsonify({"error": "An error occurred while fetching weather data."}), 500

if __name__ == '__main__':
    # Runs the Flask server on http://localhost:5000
    app.run(debug=True, port=5000)
