const isAdmin = require('../lib/isAdmin');

async function demoteCommand(sock, chatId, mentionedJids, message) {
    try {
        if (!chatId.endsWith('@g.us')) {
            await sock.sendMessage(chatId, {
                text: 'This command can only be used in groups!'
            });
            return;
        }

        const senderId = message.key?.participant || message.key?.remoteJid;

        try {
            const adminStatus = await isAdmin(sock, chatId, senderId);

            if (!adminStatus.isBotAdmin) {
                await sock.sendMessage(chatId, {
                    text: '❌ Error: Please make the bot an admin first to use this command.'
                });
                return;
            }

            if (!adminStatus.isSenderAdmin) {
                await sock.sendMessage(chatId, {
                    text: '❌ Error: Only group admins can use the demote command.'
                });
                return;
            }
        } catch (err) {
            console.error('Admin check error:', err);
            await sock.sendMessage(chatId, {
                text: '❌ Error: Bot admin access required.'
            });
            return;
        }

        let userToDemote = [];

        if (mentionedJids?.length > 0) {
            userToDemote = mentionedJids;
        } else if (message.message?.extendedTextMessage?.contextInfo?.participant) {
            userToDemote = [message.message.extendedTextMessage.contextInfo.participant];
        }

        if (userToDemote.length === 0) {
            await sock.sendMessage(chatId, {
                text: '❌ Please mention or reply to a user to demote!'
            });
            return;
        }

        await sock.groupParticipantsUpdate(chatId, userToDemote, "demote");

        const usernames = userToDemote.map(jid => `@${jid.split('@')[0]}`);

        const demotionMessage =
            `*『 GROUP DEMOTION 』*\n\n` +
            `👤 *Demoted User(s):*\n` +
            `${usernames.map(n => `• ${n}`).join('\n')}\n\n` +
            `👑 *Demoted By:* @${senderId.split('@')[0]}\n\n` +
            `📅 *Date:* ${new Date().toLocaleString()}`;

        await sock.sendMessage(chatId, {
            text: demotionMessage,
            mentions: [...userToDemote, senderId]
        });

    } catch (error) {
        console.error('Demote command error:', error);

        await sock.sendMessage(chatId, {
            text: '❌ Failed to demote user(s). Make sure bot is admin.'
        });
    }
}

// ---------------- HANDLE EVENT ----------------

async function handleDemotionEvent(sock, groupId, participants, author) {
    try {
        if (!Array.isArray(participants) || participants.length === 0) return;

        await new Promise(r => setTimeout(r, 1000));

        const demotedUsernames = participants.map(jid => {
            const jidStr = typeof jid === 'string' ? jid : (jid?.id || '');
            return `@${jidStr.split('@')[0]}`;
        });

        const mentionList = participants.map(jid =>
            typeof jid === 'string' ? jid : (jid?.id || '')
        );

        let demotedBy = 'System';

        if (author) {
            const authorJid = typeof author === 'string' ? author : (author?.id || '');
            demotedBy = `@${authorJid.split('@')[0]}`;
            mentionList.push(authorJid);
        }

        const msg =
            `*『 GROUP DEMOTION 』*\n\n` +
            `👤 *Demoted User(s):*\n` +
            `${demotedUsernames.map(n => `• ${n}`).join('\n')}\n\n` +
            `👑 *Demoted By:* ${demotedBy}\n\n` +
            `📅 *Date:* ${new Date().toLocaleString()}`;

        await sock.sendMessage(groupId, {
            text: msg,
            mentions: mentionList
        });

    } catch (error) {
        console.error('Handle demotion error:', error);
    }
}

module.exports = { demoteCommand, handleDemotionEvent };
