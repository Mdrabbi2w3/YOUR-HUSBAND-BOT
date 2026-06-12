const isAdmin = require('../lib/isAdmin');
const store = require('../lib/lightweight_store');

async function deleteCommand(sock, chatId, message, senderId) {
    try {
        const { isSenderAdmin, isBotAdmin } = await isAdmin(sock, chatId, senderId);

        if (!isBotAdmin) {
            await sock.sendMessage(chatId, {
                text: 'I need to be an admin to delete messages.'
            }, { quoted: message });
            return;
        }

        if (!isSenderAdmin) {
            await sock.sendMessage(chatId, {
                text: 'Only admins can use the .delete command.'
            }, { quoted: message });
            return;
        }

        const text = message.message?.conversation ||
            message.message?.extendedTextMessage?.text || '';

        const parts = text.trim().split(/\s+/);

        let countArg = null;

        if (parts.length > 1) {
            const maybeNum = parseInt(parts[1], 10);
            if (!isNaN(maybeNum) && maybeNum > 0) {
                countArg = Math.min(maybeNum, 50);
            }
        }

        const ctxInfo = message.message?.extendedTextMessage?.contextInfo || {};
        const repliedParticipant = ctxInfo.participant || null;
        const mentioned = Array.isArray(ctxInfo.mentionedJid) && ctxInfo.mentionedJid.length
            ? ctxInfo.mentionedJid[0]
            : null;

        if (countArg === null && !repliedParticipant && !mentioned) {
            await sock.sendMessage(chatId, {
                text: '❌ Please specify number.\n\n.del 5\n.del 3 @user\n.reply + .del 2'
            }, { quoted: message });
            return;
        }

        if (countArg === null) countArg = 1;

        let targetUser = null;
        let repliedMsgId = null;
        let deleteGroupMessages = false;

        if (repliedParticipant && ctxInfo.stanzaId) {
            targetUser = repliedParticipant;
            repliedMsgId = ctxInfo.stanzaId;
        } else if (mentioned) {
            targetUser = mentioned;
        } else {
            deleteGroupMessages = true;
        }

        const chatMessages = Array.isArray(store.messages?.[chatId])
            ? store.messages[chatId]
            : [];

        const toDelete = [];
        const seen = new Set();

        if (deleteGroupMessages) {
            for (let i = chatMessages.length - 1;
                i >= 0 && toDelete.length < countArg;
                i--) {

                const m = chatMessages[i];

                if (!m?.key?.id) continue;

                if (!seen.has(m.key.id)) {
                    if (!m.message?.protocolMessage && !m.key.fromMe) {
                        toDelete.push(m);
                        seen.add(m.key.id);
                    }
                }
            }
        } else {

            if (repliedMsgId) {
                const found = chatMessages.find(
                    m => m.key.id === repliedMsgId
                );

                if (found) {
                    toDelete.push(found);
                    seen.add(found.key.id);
                } else {
                    try {
                        await sock.sendMessage(chatId, {
                            delete: {
                                remoteJid: chatId,
                                fromMe: false,
                                id: repliedMsgId,
                                participant: repliedParticipant
                            }
                        });
                        countArg = Math.max(0, countArg - 1);
                    } catch {}
                }
            }

            for (let i = chatMessages.length - 1;
                i >= 0 && toDelete.length < countArg;
                i--) {

                const m = chatMessages[i];
                const participant = m.key?.participant || m.key?.remoteJid;

                if (participant === targetUser && !seen.has(m.key.id)) {
                    if (!m.message?.protocolMessage) {
                        toDelete.push(m);
                        seen.add(m.key.id);
                    }
                }
            }
        }

        if (!toDelete.length) {
            await sock.sendMessage(chatId, {
                text: 'No messages found to delete.'
            }, { quoted: message });
            return;
        }

        for (const m of toDelete) {
            try {
                await sock.sendMessage(chatId, {
                    delete: {
                        remoteJid: chatId,
                        fromMe: false,
                        id: m.key.id,
                        participant: m.key.participant || targetUser
                    }
                });

                await new Promise(r => setTimeout(r, 250));
            } catch {}
        }

    } catch (err) {
        console.error(err);
        await sock.sendMessage(chatId, {
            text: 'Failed to delete messages.'
        }, { quoted: message });
    }
}

module.exports = deleteCommand;
