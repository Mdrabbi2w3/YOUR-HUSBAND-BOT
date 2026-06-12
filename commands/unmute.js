async function unmuteCommand(sock, chatId, message) {
    try {
        await sock.groupSettingUpdate(chatId, 'not_announcement'); // Unmute the group
        await sock.sendMessage(chatId, { 
            text: '✅ The group has been unmuted. Everyone can send messages now!' 
        }, { quoted: message });
    } catch (error) {
        console.error('Error in unmute command:', error);
        await sock.sendMessage(chatId, { 
            text: '❌ Failed to unmute the group. Please check if the bot has admin privileges.' 
        }, { quoted: message });
    }
}

module.exports = unmuteCommand;
