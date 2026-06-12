const fetch = require('node-fetch');

async function shayariCommand(sock, chatId, message) {
    try {
        const response = await fetch(
            'https://shizoapi.onrender.com/api/texts/shayari?apikey=shizo'
        );

        const data = await response.json();

        const text =
            data?.result ||
            '❌ No shayari found. Try again later.';

        // Safer fallback without buttons (Baileys compatible)
        await sock.sendMessage(
            chatId,
            {
                text:
`${text}

━━━━━━━━━━━━
🤖 YOUR HUSBAND BOT
👑 Owner: RABBI
━━━━━━━━━━━━

Commands:
! .shayari
! .roseday`
            },
            { quoted: message }
        );

    } catch (error) {
        console.error('Error in shayari command:', error);

        await sock.sendMessage(chatId, {
            text:
`❌ Failed to fetch shayari. Please try again later.

🤖 YOUR HUSBAND BOT`
        }, { quoted: message });
    }
}

module.exports = { shayariCommand };
