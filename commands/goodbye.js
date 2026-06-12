const { handleGoodbye } = require('../lib/welcome');
const { isGoodByeOn, getGoodbye } = require('../lib/index');
const fetch = require('node-fetch');

async function goodbyeCommand(sock, chatId, message) {
    if (!chatId.endsWith('@g.us')) {
        return await sock.sendMessage(chatId, {
            text: 'This command can only be used in groups.'
        });
    }

    const text = message.message?.conversation ||
        message.message?.extendedTextMessage?.text || '';

    const matchText = text.split(' ').slice(1).join(' ');

    await handleGoodbye(sock, chatId, message, matchText);
}

async function handleLeaveEvent(sock, id, participants) {
    const isEnabled = await isGoodByeOn(id);
    if (!isEnabled) return;

    const customMessage = await getGoodbye(id);
    const groupMetadata = await sock.groupMetadata(id);
    const groupName = groupMetadata.subject;

    for (const p of participants) {
        const jid = typeof p === 'string' ? p : (p.id || p.toString());
        const user = jid.split('@')[0];

        let displayName = user;

        try {
            const pp = await sock.getName(jid);
            if (pp) displayName = pp;
        } catch {}

        const finalMessage = customMessage
            ? customMessage
                .replace(/{user}/g, `@${displayName}`)
                .replace(/{group}/g, groupName)
            : `👋 Goodbye @${displayName}!`;

        let imageBuffer = null;

        try {
            const profilePic = await sock.profilePictureUrl(jid, 'image').catch(() => null);

            const apiUrl = `https://api.some-random-api.com/welcome/img/2/gaming1?type=leave&username=${encodeURIComponent(displayName)}&guildName=${encodeURIComponent(groupName)}&avatar=${encodeURIComponent(profilePic || '')}`;

            const response = await fetch(apiUrl);
            if (response.ok) {
                imageBuffer = await response.buffer();
            }
        } catch {}

        if (imageBuffer) {
            await sock.sendMessage(id, {
                image: imageBuffer,
                caption: finalMessage,
                mentions: [jid]
            });
        } else {
            await sock.sendMessage(id, {
                text: finalMessage,
                mentions: [jid]
            });
        }
    }
}

module.exports = { goodbyeCommand, handleLeaveEvent };
