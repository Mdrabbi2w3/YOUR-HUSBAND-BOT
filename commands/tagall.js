const isAdmin = require('../lib/isAdmin');  // Move isAdmin to helpers

async function tagAllCommand(sock, chatId, senderId, message) {
    try {
        const { isSenderAdmin, isBotAdmin } = await isAdmin(sock, chatId, senderId);
        

        if (!isBotAdmin) {
            await sock.sendMessage(chatId, { 
                text: '❌ *YOUR HUSBAND* ❌\n\nPlease make the bot an admin first, otherwise I cannot tag everyone!' 
            }, { quoted: message });
            return;
        }

        if (!isSenderAdmin) {
            await sock.sendMessage(chatId, { 
                text: '❌ *YOUR HUSBAND* \n\nOnly group admins can use the *!tagall* command.' 
            }, { quoted: message });
            return;
        }

        // Get group metadata
        const groupMetadata = await sock.groupMetadata(chatId);
        const participants = groupMetadata.participants;

        if (!participants || participants.length === 0) {
            await sock.sendMessage(chatId, { text: '❌ No participants found in the group.' });
            return;
        }

        // Create message with each member on a new line branded for YOUR HUSBAND
        let messageText = '🔊 *YOUR HUSBAND TAGALL TOOL* 🔊\n\n📢 *Hello Everyone:*\n\n';
        participants.forEach(participant => {
            messageText += `👥 @${participant.id.split('@')[0]}\n`; // Add \n for new line
        });

        // Send message with mentions
        await sock.sendMessage(chatId, {
            text: messageText,
            mentions: participants.map(p => p.id)
        }, { quoted: message });

    } catch (error) {
        console.error('Error in tagall command:', error);
        await sock.sendMessage(chatId, { text: '❌ Failed to tag all members.' });
    }
}

module.exports = tagAllCommand;  // Export directly
