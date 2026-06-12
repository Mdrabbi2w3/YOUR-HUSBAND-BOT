const fs = require('fs');
const path = require('path');
const isOwnerOrSudo = require('../lib/isOwner');

async function clearSessionCommand(sock, chatId, msg) {
    try {
        const senderId = msg.key.participant || msg.key.remoteJid;
        const isOwner = await isOwnerOrSudo(senderId, sock, chatId);

        if (!msg.key.fromMe && !isOwner) {
            return await sock.sendMessage(chatId, {
                text: '❌ This command can only be used by the owner!'
            });
        }

        const sessionDir = path.join(__dirname, '../session');

        if (!fs.existsSync(sessionDir)) {
            return await sock.sendMessage(chatId, {
                text: '❌ Session folder not found!'
            });
        }

        await sock.sendMessage(chatId, {
            text: '🧹 Clearing session...'
        });

        const files = fs.readdirSync(sessionDir);

        for (const file of files) {
            if (file === 'creds.json') continue;

            const filePath = path.join(sessionDir, file);

            try {
                fs.unlinkSync(filePath);
            } catch (e) {}
        }

        await sock.sendMessage(chatId, {
            text: '✅ Session cleared successfully!'
        });

    } catch (error) {
        console.error('Error in clear session:', error);
        await sock.sendMessage(chatId, {
            text: '❌ Failed to clear session!'
        });
    }
}

module.exports = clearSessionCommand;
