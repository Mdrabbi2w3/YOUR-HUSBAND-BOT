const fetch = require('node-fetch');

module.exports = async function quoteCommand(sock, chatId, message) {
    try {
        const API_KEY = 'shizo';

        const res = await fetch(
            `https://shizoapi.onrender.com/api/texts/quotes?apikey=${API_KEY}`
        );

        if (!res.ok) {
            const err = await res.text();
            throw new Error(err);
        }

        const json = await res.json();

        const quoteMessage = json?.result;

        if (!quoteMessage) {
            return sock.sendMessage(chatId, {
                text: '❌ No quote found!'
            }, { quoted: message });
        }

        const finalText =
`💭 *YOUR HUSBAND BOT QUOTE*

"${quoteMessage}"

━━━━━━━━━━━━━━`;

        await sock.sendMessage(chatId, {
            text: finalText
        }, { quoted: message });

    } catch (error) {
        console.error('Error in quote command:', error);

        await sock.sendMessage(chatId, {
            text: '❌ Failed to get quote. Please try again later!'
        }, { quoted: message });
    }
};
