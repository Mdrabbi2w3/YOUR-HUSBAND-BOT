const { setAntilink, getAntilink, removeAntilink } = require('../lib/index');
const isAdmin = require('../lib/isAdmin');

async function handleAntilinkCommand(sock, chatId, userMessage, senderId, isSenderAdmin, message) {
    try {
        if (!isSenderAdmin) {
            return await sock.sendMessage(chatId, {
                text: '❌ Group admins only!'
            }, { quoted: message });
        }

        const prefix = '.';
        const args = userMessage.slice(9).trim().split(/\s+/);
        const action = args[0]?.toLowerCase();

        if (!action) {
            return await sock.sendMessage(chatId, {
                text:
`*ANTILINK COMMAND*

${prefix}antilink on
${prefix}antilink off
${prefix}antilink set delete | kick | warn`
            }, { quoted: message });
        }

        switch (action) {

            case 'on':
                await setAntilink(chatId, 'on', 'delete');
                return await sock.sendMessage(chatId, {
                    text: '✅ Antilink ENABLED (default: delete)'
                }, { quoted: message });

            case 'off':
                await removeAntilink(chatId, 'on');
                return await sock.sendMessage(chatId, {
                    text: '❌ Antilink DISABLED'
                }, { quoted: message });

            case 'set':
                const type = args[1]?.toLowerCase();
                if (!['delete', 'kick', 'warn'].includes(type)) {
                    return await sock.sendMessage(chatId, {
                        text: '❌ Choose: delete | kick | warn'
                    }, { quoted: message });
                }

                await setAntilink(chatId, 'on', type);
                return await sock.sendMessage(chatId, {
                    text: `✅ Action set to ${type}`
                }, { quoted: message });
        }

    } catch (err) {
        console.error('[ANTILINK CMD ERROR]', err);
    }
}

/* ---------------- LINK DETECTION ---------------- */

async function handleLinkDetection(sock, chatId, message, userMessage, senderId) {
    try {
        const setting = await getAntilink(chatId, 'on');

        if (!setting?.enabled) return;

        const action = setting?.action || 'delete';

        const linkRegex =
            /https?:\/\/\S+|www\.\S+|t\.me\/\S+|chat\.whatsapp\.com\/\S+/i;

        if (!linkRegex.test(userMessage)) return;

        const msgId = message.key.id;
        const participant = message.key.participant || senderId;

        /* -------- DELETE -------- */
        if (action === 'delete' || action === 'kick') {
            await sock.sendMessage(chatId, {
                delete: {
                    remoteJid: chatId,
                    fromMe: false,
                    id: msgId,
                    participant
                }
            });
        }

        /* -------- KICK -------- */
        if (action === 'kick') {
            await sock.groupParticipantsUpdate(chatId, [senderId], 'remove');
        }

        /* -------- WARN -------- */
        if (action === 'warn') {
            await sock.sendMessage(chatId, {
                text: `⚠️ @${senderId.split('@')[0]} links not allowed!`,
                mentions: [senderId]
            });
        }

    } catch (err) {
        console.error('[ANTILINK ERROR]', err);
    }
}

module.exports = {
    handleAntilinkCommand,
    handleLinkDetection
};
