const fs = require('fs');
const path = require('path');
const { channelInfo } = require('../lib/messageConfig');
const isAdmin = require('../lib/isAdmin');
const { isSudo } = require('../lib/index');

const banPath = path.join(__dirname, '../data/banned.json');

/* ---------------- SAFE FILE LOAD ---------------- */

function loadBanned() {
    try {
        if (!fs.existsSync(banPath)) {
            fs.writeFileSync(banPath, JSON.stringify([]));
            return [];
        }
        return JSON.parse(fs.readFileSync(banPath, 'utf8'));
    } catch {
        return [];
    }
}

function saveBanned(list) {
    fs.writeFileSync(banPath, JSON.stringify(list, null, 2));
}

/* ---------------- BAN COMMAND ---------------- */

async function banCommand(sock, chatId, message) {
    try {
        const isGroup = chatId.endsWith('@g.us');
        const senderId = message.key.participant || message.key.remoteJid;

        /* -------- GROUP CHECK -------- */
        if (isGroup) {
            const { isSenderAdmin, isBotAdmin } = await isAdmin(sock, chatId, senderId);

            if (!isBotAdmin) {
                return await sock.sendMessage(chatId, {
                    text: '⚠️ Bot must be admin to use ban',
                    ...channelInfo
                }, { quoted: message });
            }

            if (!isSenderAdmin && !message.key.fromMe) {
                return await sock.sendMessage(chatId, {
                    text: '❌ Only group admins can use this command',
                    ...channelInfo
                }, { quoted: message });
            }
        }

        /* -------- PRIVATE CHECK -------- */
        else {
            const senderIsSudo = await isSudo(senderId);
            if (!message.key.fromMe && !senderIsSudo) {
                return await sock.sendMessage(chatId, {
                    text: '❌ Owner/Sudo only command',
                    ...channelInfo
                }, { quoted: message });
            }
        }

        /* -------- TARGET USER -------- */
        let userToBan =
            message.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0] ||
            message.message?.extendedTextMessage?.contextInfo?.participant;

        if (!userToBan) {
            return await sock.sendMessage(chatId, {
                text: '⚠️ Reply or mention a user to ban',
                ...channelInfo
            }, { quoted: message });
        }

        /* -------- PREVENT BOT BAN -------- */
        const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net';
        if (userToBan === botId || userToBan.includes(sock.user.id.split(':')[0])) {
            return await sock.sendMessage(chatId, {
                text: '❌ You cannot ban the bot',
                ...channelInfo
            }, { quoted: message });
        }

        /* -------- LOAD BAN LIST -------- */
        const bannedUsers = loadBanned();

        if (bannedUsers.includes(userToBan)) {
            return await sock.sendMessage(chatId, {
                text: `⚠️ @${userToBan.split('@')[0]} is already banned`,
                mentions: [userToBan],
                ...channelInfo
            }, { quoted: message });
        }

        /* -------- ADD BAN -------- */
        bannedUsers.push(userToBan);
        saveBanned(bannedUsers);

        return await sock.sendMessage(chatId, {
            text: `🚫 Successfully banned @${userToBan.split('@')[0]}`,
            mentions: [userToBan],
            ...channelInfo
        }, { quoted: message });

    } catch (err) {
        console.error('[BAN ERROR]', err);
        return await sock.sendMessage(chatId, {
            text: '❌ Failed to ban user',
            ...channelInfo
        }, { quoted: message });
    }
}

module.exports = banCommand;
