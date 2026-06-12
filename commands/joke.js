const axios = require('axios');

module.exports = async function (sock, chatId, message) {
    try {

        const res = await axios.get('https://icanhazdadjoke.com/', {
            headers: { Accept: 'application/json' },
            timeout: 10000
        });

        const joke = res.data?.joke;

        if (!joke) {
            return await sock.sendMessage(chatId, {
                text: "❌ No joke found right now."
            }, { quoted: message });
        }

        await sock.sendMessage(chatId, {
            text: `😂 ${joke}`
        }, { quoted: message });

    } catch (error) {
        console.error('Joke error:', error);

        await sock.sendMessage(chatId, {
            text: "❌ Sorry, joke service is currently unavailable."
        }, { quoted: message });
    }
};
