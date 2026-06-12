const isAdmin = require('../lib/isAdmin');

async function kickCommand(sock, chatId, senderId, mentionedJids, message) {
    try {

        // 🔐 permission check
        const { isSenderAdmin, isBotAdmin } = await isAdmin(sock, chatId, senderId);

        if (!isBotAdmin) {
            return await sock.sendMessage(chatId, {
                text: "❌ Please make the bot admin first."
            }, { quoted: message });
        }

        if (!isSenderAdmin) {
            return await sock.sendMessage(chatId, {
                text: "❌ Only group admins can use this command."
            }, { quoted: message });
        }

        // 👤 target users
        let users = [];

        if (mentionedJids?.length) {
            users = mentionedJids;
        } else {
            const ctx = message.message?.extendedTextMessage?.contextInfo;
            if (ctx?.participant) users = [ctx.participant];
        }

        if (!users.length) {
            return await sock.sendMessage(chatId, {
                text: "❌ Mention or reply to a user to kick."
            }, { quoted: message });
        }

        const botId = sock.user?.id;

        // 🚫 prevent kicking bot
        if (users.includes(botId)) {
            return await sock.sendMessage(chatId, {
                text: "🤖 I can't kick myself!"
            }, { quoted: message });
        }

        // 👢 kick users
        await sock.groupParticipantsUpdate(chatId, users, "remove");

        const mentions = users.map(j => `@${j.split('@')[0]}`);

        await sock.sendMessage(chatId, {
            text: `👢 Kicked successfully:\n${mentions.join(', ')}`,
            mentions: users
        }, { quoted: message });

    } catch (err) {
        console.error("Kick error:", err);

        await sock.sendMessage(chatId, {
            text: "❌ Failed to kick user(s)."
        }, { quoted: message });
    }
}

module.exports = kickCommand;
