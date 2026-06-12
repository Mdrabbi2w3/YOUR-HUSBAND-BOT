const settings = require('../settings');
const { addSudo, removeSudo, getSudoList } = require('../lib/index');
const isOwnerOrSudo = require('../lib/isOwner');

function extractMentionedJid(message) {
    const mentioned = message.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
    if (mentioned.length > 0) return mentioned[0];
    const text = message.message?.conversation || message.message?.extendedTextMessage?.text || '';
    const match = text.match(/\b(\d{7,15})\b/);
    if (match) return match[1] + '@s.whatsapp.net';
    return null;
}

async function sudoCommand(sock, chatId, message) {
    const senderJid = message.key.participant || message.key.remoteJid;
    const isOwner = message.key.fromMe || await isOwnerOrSudo(senderJid, sock, chatId);

    const rawText = message.message?.conversation || message.message?.extendedTextMessage?.text || '';
    const args = rawText.trim().split(' ').slice(1);
    const sub = (args[0] || '').toLowerCase();

    if (!sub || !['add', 'del', 'remove', 'list'].includes(sub)) {
        await sock.sendMessage(chatId, { 
            text: '✨ *YOUR HUSBAND USER MANAGER* ✨\n\n*Usage:*\n!sudo add <@user|number>\n!sudo del <@user|number>\n!sudo list' 
        },{quoted :message});
        return;
    }

    if (sub === 'list') {
        const list = await getSudoList();
        if (list.length === 0) {
            await sock.sendMessage(chatId, { text: '❌ *YOUR HUSBAND* ❌\n\nNo sudo users set yet.' },{quoted :message});
            return;
        }
        const text = list.map((j, i) => `${i + 1}. @${j.split('@')[0]}`).join('\n');
        await sock.sendMessage(chatId, { 
            text: `🛡️ *YOUR HUSBAND SUDO LIST* 🛡️\n\n${text}`,
            mentions: list
        },{quoted :message});
        return;
    }

    if (!isOwner) {
        await sock.sendMessage(chatId, { text: '❌ *YOUR HUSBAND* ❌\n\nOnly the owner can add or remove sudo users. Use *!sudo list* to view current users.' },{quoted :message});
        return;
    }

    const targetJid = extractMentionedJid(message);
    if (!targetJid) {
        await sock.sendMessage(chatId, { text: '❌ Please mention a user or provide a valid phone number.' },{quoted :message});
        return;
    }

    if (sub === 'add') {
        const ok = await addSudo(targetJid);
        await sock.sendMessage(chatId, { text: ok ? `✅ *YOUR HUSBAND* \n\nSuccessfully added to sudo list: @${targetJid.split('@')[0]}` : '❌ Failed to add sudo user.' , mentions: [targetJid]},{quoted :message});
        return;
    }

    if (sub === 'del' || sub === 'remove') {
        const ownerJid = settings.ownerNumber + '@s.whatsapp.net';
        if (targetJid === ownerJid) {
            await sock.sendMessage(chatId, { text: '❌ *YOUR HUSBAND* \n\nThe main owner cannot be removed from the list.' },{quoted :message});
            return;
        }
        const ok = await removeSudo(targetJid);
        await sock.sendMessage(chatId, { text: ok ? `✅ *YOUR HUSBAND* \n\nSuccessfully removed from sudo list: @${targetJid.split('@')[0]}` : '❌ Failed to remove sudo user.' , mentions: [targetJid]},{quoted :message});
        return;
    }
}

module.exports = sudoCommand;
