const isAdmin = require('../lib/isAdmin');

async function muteCommand(sock, chatId, senderId, message, durationInMinutes) {
    try {
        const adminData = await isAdmin(sock, chatId, senderId);

        const isSenderAdmin = adminData?.isSenderAdmin;
        const isBotAdmin = adminData?.isBotAdmin;

        if (!isBotAdmin) {
            return sock.sendMessage(
                chatId,
                { text: 'Please make the bot an admin first.' },
                { quoted: message }
            );
        }

        if (!isSenderAdmin) {
            return sock.sendMessage(
                chatId,
                { text: 'Only group admins can use the mute command.' },
                { quoted: message }
            );
        }

        // MUTE GROUP
        await sock.groupSettingUpdate(chatId, 'announcement');

        if (durationInMinutes && durationInMinutes > 0) {
            const ms = durationInMinutes * 60 * 1000;

            await sock.sendMessage(chatId, {
                text: `🔇 Group muted for ${durationInMinutes} minute(s).`
            }, { quoted: message });

            setTimeout(async () => {
                try {
                    await sock.groupSettingUpdate(chatId, 'not_announcement');

                    await sock.sendMessage(chatId, {
                        text: '🔊 Group unmuted automatically.'
                    });
                } catch (err) {
                    console.error('Auto unmute error:', err);
                }
            }, ms);

        } else {
            await sock.sendMessage(chatId, {
                text: '🔇 Group has been muted.'
            }, { quoted: message });
        }

    } catch (error) {
        console.error('Mute command error:', error);

        await sock.sendMessage(chatId, {
            text: '❌ Failed to mute/unmute group. Try again.'
        }, { quoted: message });
    }
}

module.exports = muteCommand;
