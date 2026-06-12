const { setAntitag, getAntitag, removeAntitag } = require('../lib/index');
const isAdmin = require('../lib/isAdmin');

/* ---------------- COMMAND ---------------- */

async function handleAntitagCommand(sock, chatId, userMessage, senderId, isSenderAdmin, message) {
    try {
        if (!isSenderAdmin) {
            return await sock.sendMessage(chatId, {
                text: '❌ For group admins only!'
            }, { quoted: message });
        }

        const prefix = '.';
        const args = userMessage.slice(8).trim().split(/\s+/);
        const action = args[0]?.toLowerCase();

        if (!action) {
            return await sock.sendMessage(chatId, {
                text:
`*ANTITAG COMMAND*

${prefix}antitag on
${prefix}antitag off
${prefix}antitag set delete | kick`
            }, { quoted: message });
        }

        switch (action) {

            case 'on':
                await setAntitag(chatId, 'on', 'delete');
                return await sock.sendMessage(chatId, {
                    text: '✅ Antitag ENABLED'
                }, { quoted: message });

            case 'off':
                await removeAntitag(chatId, 'on');
                return await sock.sendMessage(chatId, {
                    text: '❌ Antitag DISABLED'
                }, { quoted: message });

            case 'set':
                const type = args[1]?.toLowerCase();

                if (!['delete', 'kick'].includes(type)) {
                    return await sock.sendMessage(chatId, {
                        text: '❌ Use: delete | kick'
                    }, { quoted: message });
                }

                await setAntitag(chatId, 'on', type);

                return await sock.sendMessage(chatId, {
                    text: `✅ Action set to ${type}`
                }, { quoted: message });
        }

    } catch (err) {
        console.error('[ANTITAG CMD ERROR]', err);
    }
}

/* ---------------- DETECTION ---------------- */

async function handleTagDetection(sock, chatId, message, senderId) {
    try {
        const config = await getAntitag(chatId, 'on');
        if (!config?.enabled) return;

        const action = config?.action || 'delete';

        const text =
            message.message?.conversation ||
            message.message?.extendedTextMessage?.text ||
            message.message?.imageMessage?.caption ||
            message.message?.videoMessage?.caption ||
            '';

        // Better + faster mention detection
        const mentions = text.match(/@\d{5,}/g) || [];
        const mentionCount = mentions.length;

        if (mentionCount < 3) return;

        const metadata = await sock.groupMetadata(chatId);
        const members = metadata.participants.length;

        const limit = Math.ceil(members * 0.5);

        if (mentionCount < limit) return;

        /* ---------------- DELETE ---------------- */
        if (action === 'delete' || action === 'kick') {
            await sock.sendMessage(chatId, {
                delete: {
                    remoteJid: chatId,
                    fromMe: false,
                    id: message.key.id,
                    participant: senderId
                }
            });
        }

        /* ---------------- KICK ---------------- */
        if (action === 'kick') {
            await sock.groupParticipantsUpdate(chatId, [senderId], 'remove');
        }

        /* ---------------- WARN ---------------- */
        if (action === 'delete') {
            await sock.sendMessage(chatId, {
                text: `⚠️ Tag detected from @${senderId.split('@')[0]}`,
                mentions: [senderId]
            });
        }

    } catch (err) {
        console.error('[ANTITAG ERROR]', err);
    }
}

module.exports = {
    handleAntitagCommand,
    handleTagDetection
};
