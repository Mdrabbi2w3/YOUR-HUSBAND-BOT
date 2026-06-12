const axios = require('axios');
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
const { uploadImage } = require('../lib/uploadImage');

async function getQuotedOrOwnImageUrl(sock, message) {
    try {
        const quoted = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;

        // 1) quoted image
        if (quoted?.imageMessage) {
            const stream = await downloadContentFromMessage(quoted.imageMessage, 'image');
            const chunks = [];
            for await (const chunk of stream) chunks.push(chunk);
            const buffer = Buffer.concat(chunks);
            return await uploadImage(buffer);
        }

        // 2) current image
        if (message.message?.imageMessage) {
            const stream = await downloadContentFromMessage(message.message.imageMessage, 'image');
            const chunks = [];
            for await (const chunk of stream) chunks.push(chunk);
            const buffer = Buffer.concat(chunks);
            return await uploadImage(buffer);
        }

        // 3) user avatar fallback
        let targetJid;
        const ctx = message.message?.extendedTextMessage?.contextInfo;

        if (ctx?.mentionedJid?.length) {
            targetJid = ctx.mentionedJid[0];
        } else if (ctx?.participant) {
            targetJid = ctx.participant;
        } else {
            targetJid = message.key.participant || message.key.remoteJid;
        }

        if (!targetJid) {
            return 'https://i.imgur.com/2wzGhpF.png';
        }

        try {
            return await sock.profilePictureUrl(targetJid, 'image');
        } catch {
            return 'https://i.imgur.com/2wzGhpF.png';
        }
    } catch {
        return 'https://i.imgur.com/2wzGhpF.png';
    }
}

// helper
async function sendCanvas(sock, chatId, url, message) {
    try {
        const res = await axios.get(url, { responseType: 'arraybuffer' });
        await sock.sendMessage(chatId, {
            image: Buffer.from(res.data)
        }, { quoted: message });
    } catch (e) {
        console.error('Canvas error:', e);
        await sock.sendMessage(chatId, {
            text: '❌ Failed to generate image'
        }, { quoted: message });
    }
}

async function miscCommand(sock, chatId, message, args) {
    const sub = (args[0] || '').toLowerCase();
    const rest = args.slice(1);

    try {
        const avatarUrl = await getQuotedOrOwnImageUrl(sock, message);

        switch (sub) {

            case 'heart':
            case 'horny':
            case 'circle':
            case 'lgbt':
            case 'lied':
            case 'lolice':
            case 'simpcard':
            case 'tonikawa':
                return sendCanvas(
                    sock,
                    chatId,
                    `https://api.some-random-api.com/canvas/misc/${sub}?avatar=${encodeURIComponent(avatarUrl)}`,
                    message
                );

            case 'its-so-stupid': {
                const text = rest.join(' ').trim();
                if (!text) {
                    return sock.sendMessage(chatId, {
                        text: 'Usage: .misc its-so-stupid <text>'
                    }, { quoted: message });
                }

                return sendCanvas(
                    sock,
                    chatId,
                    `https://api.some-random-api.com/canvas/misc/its-so-stupid?dog=${encodeURIComponent(text)}&avatar=${encodeURIComponent(avatarUrl)}`,
                    message
                );
            }

            case 'namecard': {
                const [username, birthday, description] =
                    rest.join(' ').split('|').map(s => s?.trim());

                if (!username || !birthday) {
                    return sock.sendMessage(chatId, {
                        text: 'Usage: .misc namecard username|birthday|description'
                    }, { quoted: message });
                }

                const params = new URLSearchParams({
                    username,
                    birthday,
                    avatar: avatarUrl
                });

                if (description) params.append('description', description);

                return sendCanvas(
                    sock,
                    chatId,
                    `https://api.some-random-api.com/canvas/misc/namecard?${params}`,
                    message
                );
            }

            case 'oogway':
            case 'oogway2': {
                const quote = rest.join(' ').trim();
                if (!quote) {
                    return sock.sendMessage(chatId, {
                        text: `Usage: .misc ${sub} <quote>`
                    }, { quoted: message });
                }

                return sendCanvas(
                    sock,
                    chatId,
                    `https://api.some-random-api.com/canvas/misc/${sub}?quote=${encodeURIComponent(quote)}&avatar=${encodeURIComponent(avatarUrl)}`,
                    message
                );
            }

            case 'tweet': {
                const [displayname, username, comment, theme] =
                    rest.join(' ').split('|').map(s => s?.trim());

                if (!displayname || !username || !comment) {
                    return sock.sendMessage(chatId, {
                        text: 'Usage: tweet name|username|comment|theme'
                    }, { quoted: message });
                }

                const params = new URLSearchParams({
                    displayname,
                    username,
                    comment,
                    avatar: avatarUrl
                });

                if (theme) params.append('theme', theme);

                return sendCanvas(
                    sock,
                    chatId,
                    `https://api.some-random-api.com/canvas/misc/tweet?${params}`,
                    message
                );
            }

            default:
                return sock.sendMessage(chatId, {
                    text: '❌ Invalid command. Use .misc heart / tweet / namecard ...'
                }, { quoted: message });
        }

    } catch (error) {
        console.error('miscCommand error:', error);
        await sock.sendMessage(chatId, {
            text: '❌ Something went wrong'
        }, { quoted: message });
    }
}

module.exports = { miscCommand };
