const axios = require('axios');
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
const { uploadImage } = require('../lib/uploadImage');

// URL validator
function isValidUrl(str) {
    try {
        new URL(str);
        return true;
    } catch {
        return false;
    }
}

async function getQuotedOrOwnImageUrl(sock, message) {
    const quoted = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;

    if (quoted?.imageMessage) {
        const stream = await downloadContentFromMessage(quoted.imageMessage, 'image');
        const chunks = [];
        for await (const c of stream) chunks.push(c);
        const buffer = Buffer.concat(chunks);
        return await uploadImage(buffer);
    }

    if (message.message?.imageMessage) {
        const stream = await downloadContentFromMessage(message.message.imageMessage, 'image');
        const chunks = [];
        for await (const c of stream) chunks.push(c);
        const buffer = Buffer.concat(chunks);
        return await uploadImage(buffer);
    }

    return null;
}

module.exports = {
    name: 'removebg',
    alias: ['rmbg', 'nobg'],
    category: 'general',
    desc: 'Remove background from images',

    async exec(sock, message, args = []) {
        try {
            const chatId = message.key.remoteJid;
            let imageUrl = null;

            // URL input
            if (args.length > 0) {
                const url = args.join(' ').trim();

                if (!isValidUrl(url)) {
                    return sock.sendMessage(chatId, {
                        text: '❌ Invalid URL!\nUsage: .removebg <image_url>'
                    }, { quoted: message });
                }

                imageUrl = url;
            } else {
                imageUrl = await getQuotedOrOwnImageUrl(sock, message);

                if (!imageUrl) {
                    return sock.sendMessage(chatId, {
                        text:
`🖼️ *YOUR HUSBAND BOT REMOVE BG*

Reply image or:
.removebg <image_url>`
                    }, { quoted: message });
                }
            }

            const apiUrl =
                `https://api.siputzx.my.id/api/iloveimg/removebg?image=${encodeURIComponent(imageUrl)}`;

            const response = await axios.get(apiUrl, {
                responseType: 'arraybuffer',
                timeout: 30000
            });

            if (!response.data) throw new Error('No image returned');

            await sock.sendMessage(chatId, {
                image: response.data,
                caption:
`✨ Background Removed

🤖 Powered by YOUR HUSBAND BOT`
            }, { quoted: message });

        } catch (error) {
            console.error('RemoveBG Error:', error);

            let msg = '❌ Failed to remove background';

            if (error.code === 'ECONNABORTED') msg = '⏰ Timeout, try again';
            if (error.response?.status === 429) msg = '⏰ Rate limited';

            await sock.sendMessage(
                message.key.remoteJid,
                { text: msg },
                { quoted: message }
            );
        }
    }
};
