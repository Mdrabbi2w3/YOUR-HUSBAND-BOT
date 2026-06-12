const { spawn } = require('child_process');
const fs = require('fs');
const { writeExifVid } = require('../lib/exif');

async function attpCommand(sock, chatId, message) {
    try {
        const text =
            message.message?.conversation ||
            message.message?.extendedTextMessage?.text ||
            '';

        const args = text.split(' ').slice(1).join(' ').trim();

        if (!args) {
            return await sock.sendMessage(chatId, {
                text: '❌ Please provide text.\nExample: .attp hello'
            }, { quoted: message });
        }

        const videoBuffer = await renderBlinkingVideo(args);

        const webpPath = await writeExifVid(videoBuffer, {
            packname: 'Knight Bot',
            author: 'ATTP'
        });

        const sticker = fs.readFileSync(webpPath);
        fs.unlinkSync(webpPath);

        return await sock.sendMessage(chatId, {
            sticker
        }, { quoted: message });

    } catch (err) {
        console.error('[ATTP ERROR]', err);

        return await sock.sendMessage(chatId, {
            text: '❌ Failed to generate sticker.'
        }, { quoted: message });
    }
}

module.exports = attpCommand;
