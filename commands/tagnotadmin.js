const isAdmin = require('../lib/isAdmin');

async function tagNotAdminCommand(sock, chatId, senderId, message) {
    try {
        const { isSenderAdmin, isBotAdmin } = await isAdmin(sock, chatId, senderId);

        if (!isBotAdmin) {
            await sock.sendMessage(chatId, { 
                text: '❌ *YOUR HUSBAND* ❌\n\nPlease make the bot an admin first, otherwise I cannot tag members!' 
            }, { quoted: message });
            return;
        }

        if (!isSenderAdmin) {
            await sock.sendMessage(chatId, { 
                text: '❌ *YOUR HUSBAND* \n\nOnly group admins can use the *!tagnotadmin* command.' 
            }, { quoted: message });
            return;
        }

        const groupMetadata = await sock.groupMetadata(chatId);
        const participants = groupMetadata.participants || [];

        const nonAdmins = participants.filter(p => !p.admin).map(p => p.id);
        if (nonAdmins.length === 0) {
            await sock.sendMessage(chatId, { 
                text: '❌ *YOUR HUSBAND* \n\nThere are no non-admin members to tag in this group.' 
            }, { quoted: message });
            return;
        }

        // Create message with each non-admin member on a new line branded for YOUR HUSBAND
        let text = '🔊 *YOUR HUSBAND NON-ADMIN TAGGER* 🔊\n\n📢 *Hello Members:*\n\n';
        nonAdmins.forEach(jid => {
            text += `👥 @${jid.split('@')[0]}\n`;
        });

        await sock.sendMessage(chatId, { text, mentions: nonAdmins }, { quoted: message });
    } catch (error) {
        console.error('Error in tagnotadmin command:', error);
        await sock.sendMessage(chatId, { 
            text: '❌ Failed to tag non-admin members.' 
        }, { quoted: message });
    }
}

module.exports = tagNotAdminCommand;
