const fetch = require('node-fetch');

async function truthCommand(sock, chatId, message) {
    try {
        const shizokeys = 'shizo';
        const res = await fetch(`https://shizoapi.onrender.com/api/texts/truth?apikey=${shizokeys}`);
        
        if (!res.ok) {
            throw new Error(`API responded with status: ${res.status}`);
        }
        
        const json = await res.json();
        const truthMessage = json.result;

        // Send the truth message
        await sock.sendMessage(chatId, { text: `🤔 *Truth:* ${truthMessage}` }, { quoted: message });
    } catch (error) {
        console.error('Error in truth command:', error);
        await sock.sendMessage(chatId, { text: '❌ Failed to get truth. Please try again later!' }, { quoted: message });
    }
}

module.exports = { truthCommand };
