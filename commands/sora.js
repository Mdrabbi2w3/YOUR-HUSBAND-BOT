const axios = require('axios');

async function soraCommand(sock, chatId, message) {
    try {
        const getText = (msg) =>
            msg?.conversation ||
            msg?.extendedTextMessage?.text ||
            msg?.imageMessage?.caption ||
            msg?.videoMessage?.caption ||
            '';

        const rawText =
            getText(message.message) ||
            '';

        // command extraction
        const command = rawText.split(/\s+/)[0]?.toLowerCase() || '.sora';
        const args = rawText.slice(command.length).trim();

        // quoted message support
        const quoted = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        const quotedText = getText(quoted);

        const input = args || quotedText;

        if (!input || input.trim().length < 3) {
            return await sock.sendMessage(chatId, {
                text: `🎬 *SORA AI VIDEO GENERATOR*\n\n👉 Usage:\n.sora anime girl in rain\n\n💡 Tip: Give clear & detailed prompt`,
            }, { quoted: message });
        }

        // loading message
        const loadingMsg = await sock.sendMessage(chatId, {
            text: '🎥 Generating your AI video... please wait...'
        }, { quoted: message });

        const apiUrl = `https://okatsu-rolezapiiz.vercel.app/ai/txt2video?text=${encodeURIComponent(input)}`;

        const { data } = await axios.get(apiUrl, {
            timeout: 120000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
            }
        });

        const videoUrl =
            data?.videoUrl ||
            data?.result ||
            data?.data?.videoUrl;

        if (!videoUrl) {
            throw new Error('No video URL returned from API');
        }

        await sock.sendMessage(chatId, {
            video: { url: videoUrl },
            mimetype: 'video/mp4',
            caption: `🎬 *SORA AI VIDEO*\n\n📝 Prompt: ${input}\n\n✨ Generated Successfully`
        }, { quoted: message });

    } catch (error) {
        console.error('[SORA ERROR]', error);

        let msg = '❌ Failed to generate video. Try again later.';

        if (error.code === 'ECONNABORTED') {
            msg = '⏳ Request timeout. AI is taking too long.';
        }

        await sock.sendMessage(chatId, { text: msg }, { quoted: message });
    }
}

module.exports = soraCommand;
