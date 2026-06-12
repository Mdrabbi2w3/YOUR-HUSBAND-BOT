const fetch = require('node-fetch');

async function flirtCommand(sock, chatId, message) {
    try {
        const apiKey = 'shizo';

        const res = await fetch(
            `https://shizoapi.onrender.com/api/texts/flirt?apikey=${apiKey}`
        );

        if (!res.ok) {
            throw new Error(await res.text());
        }

        const json = await res.json();

        const flirtMessage = json?.result;

        if (!flirtMessage) {
            throw new Error('No result from API');
        }

        await sock.sendMessage(
            chatId,
            { text: flirtMessage },
            { quoted: message }
        );

    } catch (error) {
        console.error('Error in flirt command:', error);

        await sock.sendMessage(
            chatId,
            { text: '❌ Failed to get flirt message. Please try again later!' },
            { quoted: message }
        );
    }
}

module.exports = { flirtCommand };
