const { downloadMediaMessage } = require('@whiskeysockets/baileys');
const sharp = require('sharp');

async function blurCommand(sock, chatId, message, quotedMessage) {
    try {

        let imageBuffer;

        // ✅ Case 1: Reply message
        if (quotedMessage?.imageMessage) {

            imageBuffer = await downloadMediaMessage(
                { message: { imageMessage: quotedMessage.imageMessage } },
                'buffer',
                {}
            );

        }
        // ✅ Case 2: Direct image message
        else if (message.message?.imageMessage) {

            imageBuffer = await downloadMediaMessage(
                message,
                'buffer',
                {}
            );

        } else {
            return await sock.sendMessage(chatId, {
                text: '❌ Please reply to an image or send image with .blur'
            }, { quoted: message });
        }

        // ✅ Blur process (clean & optimized)
        const blurredImage = await sharp(imageBuffer)
            .resize(800, 800, { fit: 'inside', withoutEnlargement: true })
            .blur(12)
            .jpeg({ quality: 80 })
            .toBuffer();

        // ✅ Send result
        await sock.sendMessage(chatId, {
            image: blurredImage,
            caption: '*✅ Image Blurred Successfully*',
            contextInfo: {
                forwardingScore: 1,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363161513685998@newsletter',
                    newsletterName: 'YOUR HUSBAND BOT',
                    serverMessageId: -1
                }
            }
        }, { quoted: message });

    } catch (error) {
        console.error('Blur Error:', error);
        await sock.sendMessage(chatId, {
            text: '❌ Failed to blur image. Try again later.'
        }, { quoted: message });
    }
}

module.exports = blurCommand;
