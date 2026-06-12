const fetch = require('node-fetch');

async function dareCommand(sock, chatId, message) {
    try {
        const shizokeys = 'shizo';

        const res = await fetch(`https://shizoapi.onrender.com/api/texts/dare?apikey=${shizokeys}`);

        if (!res.ok) {
            throw new Error(await res.text());
        }

        const json = await res.json();

        const dareMessage = json?.result;

        if (!dareMessage) {
            throw new Error('Invalid API response');
        }

        await sock.sendMessage(
            chatId,
            { text: dareMessage },
            { quoted: message }
        );

    } catch (error) {
        console.error('Error in dare command:', error);

        try {
            await sock.sendMessage(
                chatId,
                { text: '❌ Failed to get dare. Please try again later!' },
                { quoted: message }
            );
        } catch (e) {
            console.error('Failed to send error message:', e);
        }
    }
}

module.exports = { dareCommand };
