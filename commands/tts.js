const gTTS = require('gtts');
const fs = require('fs');
const path = require('path');

async function ttsCommand(sock, chatId, text, message, language = 'en') {
    if (!text) {
        await sock.sendMessage(chatId, { text: '❌ Please provide the text for TTS conversion.' });
        return;
    }

    const fileName = `tts-${Date.now()}.mp3`;
    const assetsDir = path.join(__dirname, '..', 'assets');
    
    // Ensure assets directory exists
    if (!fs.existsSync(assetsDir)) {
        fs.mkdirSync(assetsDir, { recursive: true });
    }
    
    const filePath = path.join(assetsDir, fileName);

    try {
        const gtts = new gTTS(text, language);
        gtts.save(filePath, async function (err) {
            if (err) {
                console.error('gTTS save error:', err);
                await sock.sendMessage(chatId, { text: '❌ Error generating TTS audio.' });
                return;
            }

            await sock.sendMessage(chatId, {
                audio: { url: filePath },
                mimetype: 'audio/mpeg',
                ptt: true // true dile direct voice note/audio record hishebe jabe
            }, { quoted: message });

            // Safe file deletion after sending
            setTimeout(() => {
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                }
            }, 5000);
        });
    } catch (error) {
        console.error('Error in tts command execution:', error);
        await sock.sendMessage(chatId, { text: '❌ An error occurred while processing TTS.' });
    }
}

module.exports = ttsCommand;
