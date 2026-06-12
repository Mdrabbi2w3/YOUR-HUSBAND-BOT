async function resetlinkCommand(sock, chatId, senderId) {
    try {
        const groupMetadata = await sock.groupMetadata(chatId);

        const admins = groupMetadata.participants
            .filter(p => p.admin)
            .map(p => p.id);

        const isAdmin = admins.includes(senderId);

        const botId =
            sock.user?.id?.split(':')[0] + '@s.whatsapp.net';

        const isBotAdmin = admins.includes(botId);

        if (!isAdmin) {
            await sock.sendMessage(chatId, {
                text: '❌ Only admins can use this command!'
            });
            return;
        }

        if (!isBotAdmin) {
            await sock.sendMessage(chatId, {
                text: '❌ Bot must be admin to reset group link!'
            });
            return;
        }

        const newCode = await sock.groupRevokeInvite(chatId);

        await sock.sendMessage(chatId, {
            text:
`✅ Group link has been successfully reset

📌 New link:
https://chat.whatsapp.com/${newCode}

🤖 Bot: YOUR HUSBAND BOT
👑 Owner: RABBI`
        });

    } catch (error) {
        console.error('Error in resetlink command:', error);
        await sock.sendMessage(chatId, {
            text: '❌ Failed to reset group link!'
        });
    }
}

module.exports = resetlinkCommand;
