const axios = require('axios');
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
const { uploadImage } = require('../lib/uploadImage');

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

async function reminiCommand(sock, chatId, message, args = []) {
    try {
        let imageUrl = null;

        // URL input
        if (args.length > 0) {
            const url = args.join(' ').trim();

            if (!isValidUrl(url)) {
                return sock.sendMessage(chatId, {
                    text: '❌ Invalid URL!\nUsage: .remini <image_url>'
                }, { quoted: message });
            }

            imageUrl = url;
        } else {
            // image from message
            imageUrl = await getQuotedOrOwnImageUrl(sock, message);

            if (!imageUrl) {
                return sock.sendMessage(chatId, {
                    text:
`✨ *YOUR HUSBAND BOT REMINI*

Usage:
• Reply image: .remini
• URL: .remini <link>`
                }, { quoted: message });
            }
        }

        const apiUrl =
            `https://api.princetechn.com/api/tools/remini?apikey=prince_tech_api_azfsbshfb&url=${encodeURIComponent(imageUrl)}`;

        const response = await axios.get(apiUrl, { timeout: 60000 });

        const result = response.data?.result;

        if (!response.data?.success || !result?.image_url) {
            throw new Error('Invalid API response');
        }

        const img = await axios.get(result.image_url, {
            responseType: 'arraybuffer',
            timeout: 30000
        });

        await sock.sendMessage(chatId, {
            image: img.data,
            caption:
`✨ *IMAGE ENHANCED*

🤖 Powered by YOUR HUSBAND BOT`
        }, { quoted: message });

    } catch (error) {
        console.error('Remini Error:', error);

        let msg = '❌ Failed to enhance image!';

        if (error.code === 'ECONNABORTED') msg = '⏰ Timeout, try again.';
        if (error.response?.status === 429) msg = '⏰ Rate limit exceeded.';
        if (error.response?.status === 400) msg = '❌ Invalid image.';

        await sock.sendMessage(chatId, { text: msg }, { quoted: message });
    }
}

module.exports = { reminiCommand };
