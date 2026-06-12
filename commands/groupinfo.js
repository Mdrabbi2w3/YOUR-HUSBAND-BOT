async function groupInfoCommand(sock, chatId, msg) {
    try {
        const groupMetadata = await sock.groupMetadata(chatId);

        let pp;
        try {
            pp = await sock.profilePictureUrl(chatId, 'image');
        } catch {
            pp = 'https://i.imgur.com/2wzGhpF.jpeg';
        }

        const participants = groupMetadata.participants || [];

        const admins = participants.filter(p => p.admin);
        const adminList = admins
            .map((v, i) => `• @${v.id.split('@')[0]}`)
            .join('\n');

        const owner =
            groupMetadata.owner ||
            admins.find(p => p.admin === 'superadmin')?.id ||
            null;

        const ownerTag = owner ? `@${owner.split('@')[0]}` : 'Unknown';

        const text =
`┌──「 *INFO GROUP* 」
▢ *ID:* ${groupMetadata.id}
▢ *NAME:* ${groupMetadata.subject}
▢ *MEMBERS:* ${participants.length}

▢ *OWNER:* ${ownerTag}

▢ *ADMINS:*
${adminList || 'No admins found'}

▢ *DESCRIPTION:*
${groupMetadata.desc || 'No description'}`.trim();

        const mentions = [
            ...admins.map(v => v.id),
            owner
        ].filter(Boolean);

        await sock.sendMessage(chatId, {
            image: { url: pp },
            caption: text,
            mentions
        });

    } catch (error) {
        console.error('Error in groupinfo command:', error);

        await sock.sendMessage(chatId, {
            text: '❌ Failed to get group info!'
        });
    }
}

module.exports = groupInfoCommand;
