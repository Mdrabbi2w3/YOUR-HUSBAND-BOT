const { handleAntiBadwordCommand } = require('../lib/antibadword');

async function antibadwordCommand(sock, chatId, message, senderId, isSenderAdmin) {
    try {
        // Admin Check
        if (!isSenderAdmin) {
            return await sock.sendMessage(
                chatId,
                { text: '❌ This command is only for group admins.' },
                { quoted: message }
            );
        }

        // Get Message Text
        const text =
            message?.message?.conversation ||
            message?.message?.extendedTextMessage?.text ||
            '';

        // Extract Arguments
        const args = text.trim().split(/\s+/).slice(1).join(' ');

        // Execute Anti-Badword Handler
        await handleAntiBadwordCommand(
            sock,
            chatId,
            message,
            args
        );

    } catch (error) {
        console.error('[ANTIBADWORD ERROR]', error);

        await sock.sendMessage(
            chatId,
            {
                text: '⚠️ An error occurred while processing the antibadword command.'
            },
            { quoted: message }
        );
    }
}

module.exports = antibadwordCommand;
