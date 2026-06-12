const isAdmin = require('../lib/isAdmin');
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
const fs = require('fs');
const path = require('path');

// ensure temp folder exists
const tempDir = path.join(__dirname, '../temp');
if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
}

async function downloadMediaMessage(message, mediaType) {
    const stream = await downloadContentFromMessage(message, mediaType);
    let buffer = Buffer.from([]);

    for await (const chunk of stream) {
        buffer = Buffer.concat([buffer, chunk]);
    }

    const filePath = path.join(tempDir, `${Date.now()}.${mediaType}`);
    fs.writeFileSync(filePath, buffer);

    return filePath;
}

async function hideTagCommand(sock, chatId, senderId, messageText, replyMessage, message) {
    const { isSenderAdmin, isBotAdmin } = await isAdmin(sock, chatId, senderId);

    if (!isBotAdmin) {
        await sock.sendMessage(chatId, { text: '❌ Please make the bot an admin first.' }, { quoted: message });
        return;
    }

    if (!isSenderAdmin) {
        await sock.sendMessage(chatId, { text: '❌ Only admins can use .hidetag' }, { quoted: message });
        return;
    }

    const groupMetadata = await sock.groupMetadata(chatId);
    const participants = groupMetadata.participants || [];

    // ALL MEMBERS EXCEPT ADMINS
    const nonAdmins = participants
        .filter(p => !p.admin)
        .map(p => p.id);

    let content = { mentions: nonAdmins };

    if (replyMessage) {

        if (replyMessage.imageMessage) {
            const filePath = await downloadMediaMessage(replyMessage.imageMessage, 'image');
            content.image = { url: filePath };
            content.caption = messageText || replyMessage.imageMessage.caption || '';

        } else if (replyMessage.videoMessage) {
            const filePath = await downloadMediaMessage(replyMessage.videoMessage, 'video');
            content.video = { url: filePath };
            content.caption = messageText || replyMessage.videoMessage.caption || '';

        } else if (replyMessage.documentMessage) {
            const filePath = await downloadMediaMessage(replyMessage.documentMessage, 'document');
            content.document = { url: filePath };
            content.fileName = replyMessage.documentMessage.fileName || 'file';

        } else {
            content.text = messageText || replyMessage.conversation || replyMessage.extendedTextMessage?.text || '';
        }

    } else {
        content.text = messageText || '📢 Tagged all members (excluding admins).';
    }

    await sock.sendMessage(chatId, content);

    // optional cleanup (avoid storage leak)
    setTimeout(() => {
        try {
            fs.readdirSync(tempDir).forEach(file => {
                const filePath = path.join(tempDir, file);
                const stat = fs.statSync(filePath);
                if (Date.now() - stat.mtimeMs > 5 * 60 * 1000) {
                    fs.unlinkSync(filePath);
                }
            });
        } catch (e) {}
    }, 5000);
}

module.exports = hideTagCommand;
