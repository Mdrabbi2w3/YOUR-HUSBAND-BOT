const { igdl } = require('ruhend-scraper');
const axios = require('axios');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const webp = require('node-webpmux');
const crypto = require('crypto');
const settings = require('../settings');
const { stickercropFromBuffer } = require('./stickercrop');

// ensure temp folder
const tmpDir = path.join(process.cwd(), 'tmp');
if (!fs.existsSync(tmpDir)) {
    fs.mkdirSync(tmpDir, { recursive: true });
}

// ---------------- BUFFER TO STICKER ----------------
async function convertBufferToStickerWebp(inputBuffer, isAnimated, cropSquare) {
    const base = path.join(tmpDir, `igs_${Date.now()}_${Math.random().toString(36).slice(2)}`);
    const input = `${base}.${isAnimated ? 'mp4' : 'jpg'}`;
    const output = `${base}_out.webp`;

    fs.writeFileSync(input, inputBuffer);

    const vfImgCrop = "crop=min(iw\\,ih):min(iw\\,ih),scale=512:512";
    const vfImgPad = "scale=512:512:force_original_aspect_ratio=decrease,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=#00000000";

    const vf = isAnimated
        ? (cropSquare ? vfImgCrop + ",fps=8" : vfImgPad + ",fps=8")
        : (cropSquare ? vfImgCrop + ",format=rgba" : vfImgPad + ",format=rgba");

    const cmd = `ffmpeg -y -i "${input}" ${isAnimated ? '-t 2' : ''} -vf "${vf}" -c:v libwebp -loop 0 -pix_fmt yuva420p -quality 40 -compression_level 6 "${output}"`;

    await new Promise((resolve, reject) => {
        exec(cmd, (err) => err ? reject(err) : resolve());
    });

    let buffer = fs.readFileSync(output);

    try { fs.unlinkSync(input); } catch {}
    try { fs.unlinkSync(output); } catch {}

    return buffer;
}

// ---------------- IG COMMAND ----------------
async function igsCommand(sock, chatId, message, crop = false) {
    try {
        const text = message.message?.conversation || message.message?.extendedTextMessage?.text || '';
        const url = text.match(/https?:\/\/\S+/)?.[0];

        if (!url) {
            return sock.sendMessage(chatId, {
                text: '❌ Send Instagram link\nExample: !igs <url>'
            }, { quoted: message });
        }

        await sock.sendMessage(chatId, {
            react: { text: '🔄', key: message.key }
        });

        const data = await igdl(url).catch(() => null);

        if (!data?.data?.length) {
            return sock.sendMessage(chatId, {
                text: '❌ No media found!'
            }, { quoted: message });
        }

        const items = [...new Map(
            data.data.filter(i => i?.url).map(i => [i.url, i])
        ).values()];

        for (let i = 0; i < Math.min(items.length, 8); i++) {
            try {
                const media = items[i];
                const buffer = await axios.get(media.url, { responseType: 'arraybuffer' })
                    .then(r => Buffer.from(r.data));

                const isVideo = media.type === 'video';

                let sticker = crop
                    ? await stickercropFromBuffer(buffer, isVideo)
                    : await convertBufferToStickerWebp(buffer, isVideo, false);

                if (sticker.length > 900 * 1024) {
                    sticker = await convertBufferToStickerWebp(buffer, isVideo, true);
                }

                await sock.sendMessage(chatId, {
                    sticker
                }, { quoted: message });

                await new Promise(r => setTimeout(r, 700));

            } catch (e) {
                console.log('IG item error:', e.message);
            }
        }

    } catch (err) {
        console.error('IGS error:', err);
        await sock.sendMessage(chatId, {
            text: '❌ Failed to process Instagram link'
        }, { quoted: message });
    }
}

module.exports = { igsCommand };
