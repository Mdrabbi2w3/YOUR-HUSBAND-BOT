async function clearCommand(sock, chatId, message) {
    try {
        // Send temporary message
        const sent = await sock.sendMessage(chatId, {
            text: '🧹 Cleaning messages...'
        });

        const key = sent?.key;

        // Small delay (better UX)
        await new Promise(res => setTimeout(res, 800));

        // Delete bot's own message
        if (key) {
            await sock.sendMessage(chatId, {
                delete: key
            });
        }

    } catch (err) {
        console.error('[CLEAR ERROR]', err);

        try {
            await sock.sendMessage(chatId, {
                text: '❌ Failed to clear messages'
            });
        } catch {}
    }
}

module.exports = { clearCommand };
