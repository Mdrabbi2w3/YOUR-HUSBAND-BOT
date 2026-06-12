const { isAdmin } = require('../lib/isAdmin');

function cleanBotName(name = '') {
    if (!name) return '';

    // remove KnightBot / Knight Bot / variations
    let cleaned = name.replace(/knight\s*bot/gi, '').trim();

    // if already YOUR HUSBAND exists, keep it
    if (/your\s+husband/i.test(cleaned)) {
        return 'YOUR HUSBAND';
    }

    // if something valid remains, only then return YOUR HUSBAND
    if (cleaned.length > 0) {
        return 'YOUR HUSBAND';
    }

    return '';
}

// Function to handle manual promotions via command
async function promoteCommand(sock, chatId, mentionedJids, message) {
    let userToPromote = [];

    if (mentionedJids && mentionedJids.length > 0) {
        userToPromote = mentionedJids;
    } else if (message.message?.extendedTextMessage?.contextInfo?.participant) {
        userToPromote = [message.message.extendedTextMessage.contextInfo.participant];
    }

    if (userToPromote.length === 0) {
        return sock.sendMessage(chatId, {
            text: 'Please mention user or reply to promote!'
        }, { quoted: message });
    }

    try {
        await sock.groupParticipantsUpdate(chatId, userToPromote, "promote");

        const usernames = userToPromote.map(jid => `@${jid.split('@')[0]}`);

        const promoterJid = sock.user?.id || '';

        let botName = cleanBotName('YOUR HUSBAND');

        const promotionMessage =
`*『 GROUP PROMOTION 』*

👥 *Promoted User(s):*
${usernames.map(n => `• ${n}`).join('\n')}

👑 *Promoted By:* ${botName ? `@${promoterJid.split('@')[0]}` : 'System'}

📅 *Date:* ${new Date().toLocaleString()}`;

        await sock.sendMessage(chatId, {
            text: promotionMessage,
            mentions: [...userToPromote, promoterJid].filter(Boolean)
        });

    } catch (error) {
        console.error('Error in promote command:', error);
        await sock.sendMessage(chatId, { text: 'Failed to promote user(s)!' });
    }
}

// Auto promotion event
async function handlePromotionEvent(sock, groupId, participants, author) {
    try {
        if (!Array.isArray(participants) || !participants.length) return;

        const users = participants.map(jid => `@${(jid.id || jid).split('@')[0]}`);

        let authorJid = author ? (author.id || author) : null;

        let promotedBy =
            cleanBotName('YOUR HUSBAND') && authorJid
                ? `@${authorJid.split('@')[0]}`
                : 'System';

        const promotionMessage =
`*『 GROUP PROMOTION 』*

👥 *Promoted User(s):*
${users.map(u => `• ${u}`).join('\n')}

👑 *Promoted By:* ${promotedBy}

📅 *Date:* ${new Date().toLocaleString()}`;

        const mentions = [
            ...participants.map(j => (j.id || j)),
            authorJid
        ].filter(Boolean);

        await sock.sendMessage(groupId, {
            text: promotionMessage,
            mentions
        });

    } catch (error) {
        console.error('Error handling promotion event:', error);
    }
}

module.exports = { promoteCommand, handlePromotionEvent };
