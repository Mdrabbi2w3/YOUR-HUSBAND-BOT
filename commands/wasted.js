const axios = require('axios');
const { channelInfo } = require('../lib/messageConfig');

async function wastedCommand(sock, chatId, message) {
    let userToWaste;
    
    // Check for mentioned users
    if (message.message?.extendedTextMessage?.contextInfo?.mentionedJid?.length > 0) {
        userToWaste = message.message.extendedTextMessage.contextInfo.mentionedJid[0];
    }
    // Check for replied message
    else if (message.message?.extendedTextMessage?.contextInfo?.participant) {
        userToWaste = message.message.extendedTextMessage.contextInfo.participant;
    }
    
    if (!userToWaste) {
        await sock.sendMessage(chatId, { 
            text: '⚠️ Please mention a user or reply to their message to generate the overlay effect!', 
            ...channelInfo 
        }, { quoted: message });
        return;
    }

    try {
        // Send a reaction indicating processing
        await sock.sendMessage(chatId, {
            react: { text: '🎨', key: message.key }
        });

        // Get user's profile picture
        let profilePic;
        try {
            profilePic = await sock.profilePictureUrl(userToWaste, 'image');
        } catch {
            profilePic = 'https://i.imgur.com/2wzGhpF.jpeg'; // Default placeholder image if no profile pic
        }

        // Fetch the canvas effect from the API pipeline
        const wastedResponse = await axios.get(
            `https://some-random-api.com/canvas/overlay/wasted?avatar=${encodeURIComponent(profilePic)}`,
            { responseType: 'arraybuffer', timeout: 15000 }
        );

        // Send the finalized canvas image
        await sock.sendMessage(chatId, {
            image: Buffer.from(wastedResponse.data),
            caption: `💀 *Wasted:* @${userToWaste.split('@')[0]}`,
            mentions: [userToWaste],
            ...channelInfo
        }, { quoted: message });

    } catch (error) {
        console.error('Error in wasted command:', error?.message || error);
        await sock.sendMessage(chatId, { 
            text: '❌ Failed to process the image overlay. Please try again later.',
            ...channelInfo 
        }, { quoted: message });
    }
}

module.exports = wastedCommand;
