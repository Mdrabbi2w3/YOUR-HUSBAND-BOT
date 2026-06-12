const yts = require('yt-search');
const axios = require('axios');

const BOT_NAME = 'YOUR HUSBAND BOT';

async function playCommand(sock, chatId, message) {
    try {
        const text =
            message.message?.conversation ||
            message.message?.extendedTextMessage?.text ||
            '';

        const searchQuery = text.split(' ').slice(1).join(' ').trim();

        if (!searchQuery) {
            return await sock.sendMessage(chatId, {
                text: `🎵 What song do you want to download?`
            }, { quoted: message });
        }

        // Search YouTube
        const { videos } = await yts(searchQuery);

        if (!videos || videos.length === 0) {
            return await sock.sendMessage(chatId, {
                text: "❌ No songs found!"
            }, { quoted: message });
        }

        await sock.sendMessage(chatId, {
            text: "⏳ Please wait, downloading your song..."
        }, { quoted: message });

        const video = videos[0];
        const urlYt = video.url;

        // Download API
        const response = await axios.get(
            `https://apis-keith.vercel.app/download/dlmp3?url=${urlYt}`
        );

        const data = response.data;

        if (!data?.status || !data?.result?.downloadUrl) {
            return await sock.sendMessage(chatId, {
                text: "❌ Failed to fetch audio. Try again later."
            }, { quoted: message });
        }

        const audioUrl = data.result.downloadUrl;
        const title = data.result.title || 'song';

        await sock.sendMessage(chatId, {
            audio: { url: audioUrl },
            mimetype: "audio/mpeg",
            fileName: `${title}.mp3`,
            caption: `🎧 ${title}\n🤖 ${BOT_NAME}`
        }, { quoted: message });

    } catch (error) {
        console.error('playCommand error:', error);

        await sock.sendMessage(chatId, {
            text: "❌ Download failed. Please try again later."
        }, { quoted: message });
    }
}

module.exports = playCommand;
