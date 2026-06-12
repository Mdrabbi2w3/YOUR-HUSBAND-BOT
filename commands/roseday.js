const fetch = require('node-fetch');

async function rosedayCommand(sock, chatId, message) {
    try {
        const res = await fetch(
            `https://api.princetechn.com/api/fun/roseday?apikey=prince`
        );

        if (!res.ok) {
            throw await res.text();
        }

        const json = await res.json();

        const rosedayMessage =
            json?.result ||
            '❌ No quote found right now. Try again later.';

        await sock.sendMessage(
            chatId,
            {
                text:
`${rosedayMessage}

🤖 YOUR HUSBAND BOT
👑 Owner: RABBI`
            },
            { quoted: message }
        );

    } catch (error) {
        console.error('Error in roseday command:', error);

        await sock.sendMessage(
            chatId,
            {
                text:
`❌ Failed to get roseday quote. Please try again later!

🤖 YOUR HUSBAND BOT`
            },
            { quoted: message }
        );
    }
}

module.exports = { rosedayCommand };
