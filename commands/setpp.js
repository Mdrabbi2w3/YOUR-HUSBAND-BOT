const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
const isOwnerOrSudo = require('../lib/isOwner');

async function setProfilePicture(sock, chatId, msg) {
    try {
        const senderId = msg.key.participant || msg.key.remoteJid;

        const isOwner = await isOwnerOrSudo(senderId, sock, chatId);

        if (!msg.key.fromMe && !isOwner) {
            await sock.sendMessage(chatId, {
                text: '❌ This command is only available for the owner!'
            });
            return;
        }

        const quoted =
            msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;

        if (!quoted) {
            await sock.sendMessage(chatId, {
                text: '⚠️ Please reply to an image with the .setpp command!'
            });
            return;
        }

        const imageMessage = quoted.imageMessage || quoted.stickerMessage;

        if (!imageMessage) {
            await sock.sendMessage(chatId, {
                text: '❌ The replied message must contain an image!'
            });
            return;
        }

        // Download image buffer
        const stream = await downloadContentFromMessage(imageMessage, 'image');

        let buffer = Buffer.alloc(0);
        for await (const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk]);
        }

        // Direct update (NO temp file needed)
        await sock.updateProfilePicture(sock.user.id, buffer);

        await sock.sendMessage(chatId, {
            text:
`✅ Successfully updated bot profile picture!

🤖 YOUR HUSBAND BOT
👑 Owner: RABBI`
        });

    } catch (error) {
        console.error('Error in setpp command:', error);

        await sock.sendMessage(chatId, {
            text: '❌ Failed to update profile picture!'
        });
    }
}

module.exports = setProfilePicture;
