const fetch = require('node-fetch');

async function goodnightCommand(sock, chatId, message) {
    try {
        const apiKey = 'shizo';

        const res = await fetch(
            `https://shizoapi.onrender.com/api/texts/lovenight?apikey=${apiKey}`
        );

        if (!res.ok) {
            throw new Error(await res.text());
        }

        const json = await res.json();

        const goodnightMessage = json?.result;

        if (!goodnightMessage) {
            throw new Error('No result from API');
        }

        await sock.sendMessage(
            chatId,
            { text: goodnightMessage },
            { quoted: message }
        );

    } catch (error) {
        console.error('Error in goodnight command:', error);

        await sock.sendMessage(
            chatId,
            {
                text: '❌ Failed to get goodnight message. Please try again later!'
            },
            { quoted: message }
        );
    }
}

module.exports = { goodnightCommand };
