const axios = require('axios');

module.exports = async function (sock, chatId, message, city) {
    try {
        // Clean and validate city input parameter
        const targetCity = city ? city.trim() : '';
        
        if (!targetCity) {
            await sock.sendMessage(chatId, { 
                text: '⚠️ Please provide a city name!\n\n*Usage:*\n!weather <city_name>\n\n*Example:*\n!weather Dhaka' 
            }, { quoted: message });
            return;
        }

        // Show a temporary processing status indicators
        await sock.sendMessage(chatId, {
            react: { text: '🌤️', key: message.key }
        });

        const apiKey = '4902c0f2550f58298ad4146a92b65e10'; // OpenWeather API Key
        const response = await axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(targetCity)}&appid=${apiKey}&units=metric`);
        
        const weather = response.data;
        
        // Extract weather data properties from object metrics mapping
        const cityName = weather.name;
        const country = weather.sys?.country ? `, ${weather.sys.country}` : '';
        const description = weather.weather[0].description;
        const temp = weather.main.temp;
        const feelsLike = weather.main.feels_like;
        const humidity = weather.main.humidity;
        const windSpeed = weather.wind.speed;

        // Capitalize description text string pipeline layout logic
        const formattedDesc = description.charAt(0).toUpperCase() + description.slice(1);

        const weatherText = `🌍 *WEATHER REPORT* 🌍\n\n` +
            `📍 *Location:* ${cityName}${country}\n` +
            `🌤️ *Condition:* ${formattedDesc}\n` +
            `🌡️ *Temperature:* ${temp}°C\n` +
            `👤 *Feels Like:* ${feelsLike}°C\n` +
            `💧 *Humidity:* ${humidity}%\n` +
            `💨 *Wind Speed:* ${windSpeed} m/s`;

        await sock.sendMessage(chatId, { text: weatherText }, { quoted: message });

    } catch (error) {
        console.error('Error fetching weather:', error?.message || error);
        
        let errorMessage = '❌ Sorry, I could not fetch the weather report at the moment.';
        if (error.response?.status === 404) {
            errorMessage = '❌ Error: City not found! Please check the spelling and try again.';
        }
        
        await sock.sendMessage(chatId, { text: errorMessage }, { quoted: message });
    }
};
