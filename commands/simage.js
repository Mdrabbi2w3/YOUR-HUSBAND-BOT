const sharp = require('sharp');
const fs = require('fs');
const fsPromises = require('fs/promises');
const fsExtra = require('fs-extra');
const path = require('path');
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');

const tempDir = './temp';

// Ensure temp folder exists
if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
}

// Auto delete helper
const scheduleFileDeletion = (filePath, delay = 10000) => {
    setTimeout(async () => {
        try {
            await fsExtra.remove(filePath);
            console.log(`Deleted: ${filePath}`);
        } catch (err) {
            console.error('File delete error:', err);
        }
    }, delay);
};

const convertStickerToImage = async (sock, quotedMessage, chatId) => {
    try {
        const stickerMessage = quotedMessage?.stickerMessage;

        if (!stickerMessage) {
            return sock.sendMessage(chatId, {
                text: '⚠️ Reply to a sticker with .simage to convert it.'
            });
        }

        const stickerPath = path.join(tempDir, `sticker_${Date.now()}.webp`);
        const outputPath = path.join(tempDir, `converted_${Date.now()}.png`);

        // Download sticker
        const stream = await downloadContentFromMessage(stickerMessage, 'sticker');

        let buffer = Buffer.alloc(0);
        for await (const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk]);
        }

        // Save webp
        await fsPromises.writeFile(stickerPath, buffer);

        // Convert using sharp
        await sharp(stickerPath)
            .png()
            .toFile(outputPath);

        const imageBuffer = await fsPromises.readFile(outputPath);

        await sock.sendMessage(chatId, {
            image: imageBuffer,
            caption:
`✨ Sticker converted successfully!

🤖 YOUR HUSBAND BOT
👑 Owner: RABBI`
        }, { quoted: null });

        // cleanup
        scheduleFileDeletion(stickerPath, 10000);
        scheduleFileDeletion(outputPath, 10000);

    } catch (error) {
        console.error('Error converting sticker:', error);

        await sock.sendMessage(chatId, {
            text: '❌ Failed to convert sticker. Try again later.'
        });
    }
};

module.exports = convertStickerToImage;
