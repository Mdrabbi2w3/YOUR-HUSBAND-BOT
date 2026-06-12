const axios = require('axios');

async function imagineCommand(sock, chatId, message) {
    try {
        const text =
            message.message?.conversation ||
            message.message?.extendedTextMessage?.text ||
            '';

        const imagePrompt = text.replace(/^\.imagine/i, '').trim();

        if (!imagePrompt) {
            return sock.sendMessage(chatId, {
                text: '🎨 Example:\n!imagine a beautiful sunset over mountains'
            }, { quoted: message });
        }

        await sock.sendMessage(chatId, {
            text: '🎨 Generating image... please wait...'
        }, { quoted: message });

        const enhancedPrompt = enhancePrompt(imagePrompt);

        const { data } = await axios.get(
            `https://shizoapi.onrender.com/api/ai/imagine?apikey=shizo&query=${encodeURIComponent(enhancedPrompt)}`,
            { responseType: 'arraybuffer', timeout: 60000 }
        );

        const imageBuffer = Buffer.from(data);

        await sock.sendMessage(chatId, {
            image: imageBuffer,
            caption: `🎨 Prompt:\n${imagePrompt}`
        }, { quoted: message });

    } catch (error) {
        console.error('Imagine error:', error.message);
        await sock.sendMessage(chatId, {
            text: '❌ Image generation failed. Try again later.'
        }, { quoted: message });
    }
}

// ---------------- PROMPT ENHANCER ----------------
function enhancePrompt(prompt) {
    const enhancers = [
        'high quality',
        'ultra detailed',
        '4k',
        'cinematic lighting',
        'professional',
        'sharp focus',
        'realistic'
    ];

    const shuffled = enhancers.sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 3);

    return `${prompt}, ${selected.join(', ')}`;
}

module.exports = imagineCommand;
