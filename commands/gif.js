const axios = require('axios');
const settings = require('../settings');

async function gifCommand(sock, chatId, message, query) {
    try {
        const apiKey = settings?.giphyApiKey;

        if (!apiKey) {
            return await sock.sendMessage(chatId, {
                text: '❌ Giphy API key not set!'
            });
        }

        if (!query) {
            return await sock.sendMessage(chatId, {
                text: 'Please provide a search term for the GIF.'
            });
        }

        const response = await axios.get(
            'https://api.giphy.com/v1/gifs/search',
            {
                params: {
                    api_key: apiKey,
                    q: query,
                    limit: 1,
                    rating: 'g'
                },
                timeout: 15000
            }
        );

        const gifUrl =
            response.data?.data?.[0]?.images?.original?.url ||
            response.data?.data?.[0]?.images?.downsized_medium?.url;

        if (!gifUrl) {
            return await sock.sendMessage(chatId, {
                text: '❌ No GIF found for your search term.'
            });
        }

        await sock.sendMessage(chatId, {
            video: { url: gifUrl },
            caption: `🎬 GIF for: "${query}"`
        });

    } catch (error) {
        console.error('Error fetching GIF:', error);

        await sock.sendMessage(chatId, {
            text: '❌ Failed to fetch GIF. Please try again later.'
        });
    }
}

module.exports = gifCommand;
