const fetch = require('node-fetch');
const fs = require('fs');
const { exec } = require('child_process');
const path = require('path');

async function emojimixCommand(sock, chatId, msg) {
    try {
        const text =
            msg.message?.conversation ||
            msg.message?.extendedTextMessage?.text ||
            "";

        const args = text.trim().split(' ').slice(1);

        if (!args[0]) {
            await sock.sendMessage(chatId, {
                text: '🎴 Example: .emojimix 😎+🥰'
            });
            return;
        }

        if (!args[0].includes('+')) {
            await sock.sendMessage(chatId, {
                text: '✳️ Use + between emojis\nExample: .emojimix 😎+🥰'
            });
            return;
        }

        let [emoji1, emoji2] = args[0].split('+').map(e => e.trim());

        const url =
            `https://tenor.googleapis.com/v2/featured?key=AIzaSyAyimkuYQY_FXVALexPuGQctUWRURdCYQ` +
            `&contentfilter=high&media_filter=png_transparent&component=proactive` +
            `&collection=emoji_kitchen_v5&q=${encodeURIComponent(emoji1)}_${encodeURIComponent(emoji2)}`;

        const response = await fetch(url);
        const data = await response.json();

        if (!data?.results?.length) {
            await sock.sendMessage(chatId, {
                text: '❌ These emojis cannot be mixed!'
            });
            return;
        }

        const imageUrl = data.results[0].url;

        const tmpDir = path.join(process.cwd(), 'tmp');
        if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });

        const tempFile = path.join(tmpDir, `emoji_${Date.now()}.png`);
        const outputFile = path.join(tmpDir, `emoji_${Date.now()}.webp`);

        // Download image safely
        const imageRes = await fetch(imageUrl);
        const buffer = await imageRes.buffer();
        fs.writeFileSync(tempFile, buffer);

        // Convert to sticker
        const ffmpegCmd =
            `ffmpeg -y -i "${tempFile}" ` +
            `-vf "scale=512:512:force_original_aspect_ratio=decrease,` +
            `pad=512:512:(ow-iw)/2:(oh-ih)/2:color=#00000000" ` +
            `"${outputFile}"`;

        await new Promise((resolve, reject) => {
            exec(ffmpegCmd, (err) => {
                if (err) return reject(err);
                resolve();
            });
        });

        if (!fs.existsSync(outputFile)) {
            throw new Error('Sticker creation failed');
        }

        const sticker = fs.readFileSync(outputFile);

        await sock.sendMessage(chatId, {
            sticker
        }, { quoted: msg });

        // cleanup
        try {
            fs.unlinkSync(tempFile);
            fs.unlinkSync(outputFile);
        } catch {}

    } catch (error) {
        console.error('emojimix error:', error);
        await sock.sendMessage(chatId, {
            text: '❌ Failed to mix emojis. Try again!'
        });
    }
}

module.exports = emojimixCommand;
