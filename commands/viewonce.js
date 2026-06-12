const { downloadContentFromMessage } = require('@whiskeysockets/baileys');

async function viewonceCommand(sock, chatId, message) {
    try {
        // Extract quoted message structure
        const quoted = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        
        // Handle viewOnce inside alternative nested objects if applicable
        const viewOnceMessage = quoted?.viewOnceMessage?.message || quoted?.viewOnceMessageV2?.message || quoted;
        
        const quotedImage = viewOnceMessage?.imageMessage;
        const quotedVideo = viewOnceMessage?.videoMessage;

        // Process View Once Image
        if (quotedImage) {
            await sock.sendMessage(chatId, {
                react: { text: '⏳', key: message.key }
            });

            const stream = await downloadContentFromMessage(quotedImage, 'image');
            let buffer = Buffer.from([]);
            for await (const chunk of stream) {
                buffer = Buffer.concat([buffer, chunk]);
            }
            
            await sock.sendMessage(chatId, { 
                image: buffer, 
                fileName: 'viewonce.jpg', 
                caption: quotedImage.caption ? `📝 *Caption:* ${quotedImage.caption}` : '✅ View-once image extracted successfully.' 
            }, { quoted: message });
            return;
        } 
        
        // Process View Once Video
        if (quotedVideo) {
            await sock.sendMessage(chatId, {
                react: { text: '⏳', key: message.key }
            });

            const stream = await downloadContentFromMessage(quotedVideo, 'video');
            let buffer = Buffer.from([]);
            for await (const chunk of stream) {
                buffer = Buffer.concat([buffer, chunk]);
            }
            
            await sock.sendMessage(chatId, { 
                video: buffer, 
                fileName: 'viewonce.mp4', 
                caption: quotedVideo.caption ? `📝 *Caption:* ${quotedVideo.caption}` : '✅ View-once video extracted successfully.' 
            }, { quoted: message });
            return;
        } 
        
        // If not a view once message
        await sock.sendMessage(chatId, { 
            text: '⚠️ Please reply to a *View-Once* image or video with the *!viewonce* command.' 
        }, { quoted: message });

    } catch (error) {
        console.error('Error in viewonce command:', error);
        await sock.sendMessage(chatId, { 
            text: '❌ Failed to extract view-once media. Content might be expired or corrupted.' 
        }, { quoted: message });
    }
}

module.exports = viewonceCommand;
