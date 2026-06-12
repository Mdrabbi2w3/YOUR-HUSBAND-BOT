const axios = require('axios');

async function spotifyCommand(sock, chatId, message) {
    try {
        const rawText = message.message?.conversation?.trim() ||
            message.message?.extendedTextMessage?.text?.trim() ||
            message.message?.imageMessage?.caption?.trim() ||
            message.message?.videoMessage?.caption?.trim() ||
            '';

        const used = (rawText || '').split(/\s+/)[0] || '!spotify';
        const query = rawText.slice(used.length).trim();

        if (!query) {
            await sock.sendMessage(chatId, { 
                text: '✨ *YOUR HUSBAND BOT* ✨\n\n*Usage:* !spotify <song/artist/keywords>\n*Example:* !spotify con calma\n\n*Powered by RABBI*' 
            }, { quoted: message });
            return;
        }

        // Show processing reaction
        await sock.sendMessage(chatId, { react: { text: '🎵', key: message.key } });

        const apiUrl = `https://okatsu-rolezapiiz.vercel.app/search/spotify?q=${encodeURIComponent(query)}`;
        const { data } = await axios.get(apiUrl, { timeout: 20000, headers: { 'user-agent': 'Mozilla/5.0' } });

        if (!data?.status || !data?.result) {
            throw new Error('No result from Spotify API');
        }

        const r = data.result;
        const audioUrl = r.audio;
        if (!audioUrl) {
            await sock.sendMessage(chatId, { 
                text: '❌ *YOUR HUSBAND BOT* ❌\n\nNo downloadable audio found for this query. Try another song!' 
            }, { quoted: message });
            return;
        }

        const caption = `🎵 *YOUR HUSBAND BOT - SPOTIFY PLAY* 🎵\n\n📌 *Title:* ${r.title || r.name || 'Unknown Title'}\n👤 *Artist:* ${r.artist || 'Unknown'}\n⏱ *Duration:* ${r.duration || 'Unknown'}\n🔗 *Link:* ${r.url || 'N/A'}\n\n*Powered by RABBI*`.trim();

         // Send cover and info
         if (r.thumbnails) {
            await sock.sendMessage(chatId, { image: { url: r.thumbnails }, caption }, { quoted: message });
        } else if (caption) {
            await sock.sendMessage(chatId, { text: caption }, { quoted: message });
        }

        // Send Audio File
        await sock.sendMessage(chatId, {
            audio: { url: audioUrl },
            mimetype: 'audio/mpeg',
            fileName: `${(r.title || r.name || 'track').replace(/[\\/:*?"<>|]/g, '')}.mp3`
        }, { quoted: message });

    } catch (error) {
        console.error('[SPOTIFY] error:', error?.message || error);
        await sock.sendMessage(chatId, { 
            text: '❌ *YOUR HUSBAND BOT* ❌\n\nFailed to fetch Spotify audio. Please try another query later or check your API.' 
        }, { quoted: message });
    }
}

module.exports = spotifyCommand;
