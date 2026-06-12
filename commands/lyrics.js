async function lyricsCommand(sock, chatId, songTitle, message) {
    if (!songTitle) {
        return await sock.sendMessage(chatId, {
            text: '🔍 Please enter a song name!\nUsage: .lyrics <song name>'
        }, { quoted: message });
    }

    try {
        const apiUrl = `https://lyricsapi.fly.dev/api/lyrics?q=${encodeURIComponent(songTitle)}`;
        const res = await fetch(apiUrl);

        if (!res.ok) {
            return await sock.sendMessage(chatId, {
                text: '❌ Failed to fetch lyrics from API.'
            }, { quoted: message });
        }

        const data = await res.json();
        const lyrics = data?.result?.lyrics;

        if (!lyrics) {
            return await sock.sendMessage(chatId, {
                text: `❌ No lyrics found for "${songTitle}".`
            }, { quoted: message });
        }

        // WhatsApp safe limit handling
        const maxLength = 3500;
        const output = lyrics.length > maxLength
            ? lyrics.slice(0, maxLength) + '\n\n... (truncated)'
            : lyrics;

        await sock.sendMessage(chatId, {
            text: `🎵 *Lyrics: ${songTitle}*\n\n${output}`
        }, { quoted: message });

    } catch (error) {
        console.error('Lyrics error:', error);
        await sock.sendMessage(chatId, {
            text: '❌ Something went wrong while fetching lyrics.'
        }, { quoted: message });
    }
}

module.exports = { lyricsCommand };
