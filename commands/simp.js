const fetch = require('node-fetch');

async function simpCommand(sock, chatId, quotedMsg, mentionedJid, sender) {
    try {
        // target user detection (safe)
        let who =
            quotedMsg?.sender ||
            (mentionedJid && mentionedJid[0]) ||
            sender;

        // profile picture fallback
        let avatarUrl;
        try {
            avatarUrl = await sock.profilePictureUrl(who, 'image');
        } catch (err) {
            console.log('PP fetch failed:', err.message);
            avatarUrl = 'https://telegra.ph/file/24fa902ead26340f3df2c.png';
        }

        const apiUrl =
            `https://some-random-api.com/canvas/misc/simpcard?avatar=${encodeURIComponent(avatarUrl)}`;

        const response = await fetch(apiUrl);

        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }

        const imageBuffer = await response.buffer();

        await sock.sendMessage(chatId, {
            image: imageBuffer,
            caption:
`💘 SIMP CARD

😳 Status: Certified Simp

🤖 YOUR HUSBAND BOT
👑 Owner: RABBI`,
        }, { quoted: null });

    } catch (error) {
        console.error('Error in simp command:', error);

        await sock.sendMessage(chatId, {
            text:
`❌ Failed to generate simp card. Try again later.

🤖 YOUR HUSBAND BOT`
        });
    }
}

module.exports = { simpCommand };
