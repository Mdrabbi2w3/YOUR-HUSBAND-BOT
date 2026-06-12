async function memeCommand(sock, chatId, message) {
    try {
        const response = await fetch('https://shizoapi.onrender.com/api/memes/cheems?apikey=shizo');

        if (!response.ok) {
            return await sock.sendMessage(chatId, {
                text: '❌ Failed to fetch meme.'
            }, { quoted: message });
        }

        const contentType = response.headers.get('content-type') || '';

        if (!contentType.includes('image')) {
            return await sock.sendMessage(chatId, {
                text: '❌ API did not return image.'
            }, { quoted: message });
        }

        const arrayBuffer = await response.arrayBuffer();
        const imageBuffer = Buffer.from(arrayBuffer);

        const buttons = [
            { buttonId: '.meme', buttonText: { displayText: '🎭 Next Meme' }, type: 1 },
            { buttonId: '.joke', buttonText: { displayText: '😄 Joke' }, type: 1 }
        ];

        await sock.sendMessage(chatId, {
            image: imageBuffer,
            caption: "🐕 *Here's your Cheems meme!*",
            buttons,
            headerType: 1
        }, { quoted: message });

    } catch (error) {
        console.error('Meme error:', error);
        await sock.sendMessage(chatId, {
            text: '❌ Something went wrong while fetching meme.'
        }, { quoted: message });
    }
}

module.exports = memeCommand;
