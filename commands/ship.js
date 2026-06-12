async function shipCommand(sock, chatId, msg, groupMetadata) {
    try {
        const metadata = groupMetadata || await sock.groupMetadata(chatId);
        const participants = metadata.participants || [];

        const users = participants.map(v => v.id);

        if (users.length < 2) {
            return sock.sendMessage(chatId, {
                text: '❌ Not enough members to ship!'
            }, { quoted: msg });
        }

        const firstUser = users[Math.floor(Math.random() * users.length)];

        let secondUser = firstUser;

        while (secondUser === firstUser) {
            secondUser = users[Math.floor(Math.random() * users.length)];
        }

        const format = id => `@${id.split('@')[0]}`;

        await sock.sendMessage(chatId, {
            text:
`${format(firstUser)} ❤️ ${format(secondUser)}
💖 Congratulations! You are now shipped!

━━━━━━━━━━━━
🤖 YOUR HUSBAND BOT
👑 Owner: RABBI
━━━━━━━━━━━━`,
            mentions: [firstUser, secondUser]
        }, { quoted: msg });

    } catch (error) {
        console.error('Error in ship command:', error);

        await sock.sendMessage(chatId, {
            text: '❌ Failed to ship! Make sure this is a group.'
        }, { quoted: msg });
    }
}

module.exports = shipCommand;
