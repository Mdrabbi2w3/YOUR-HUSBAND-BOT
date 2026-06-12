const fs = require('fs');
const path = require('path');
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
const { writeFile } = require('fs/promises');

const messageStore = new Map();

const CONFIG_PATH = path.join(__dirname, '../data/antidelete.json');
const TEMP_MEDIA_DIR = path.join(__dirname, '../tmp');

// Ensure temp dir exists
if (!fs.existsSync(TEMP_MEDIA_DIR)) {
    fs.mkdirSync(TEMP_MEDIA_DIR, { recursive: true });
}

/* ---------------- UTIL ---------------- */

const getFolderSizeInMB = (folderPath) => {
    try {
        const files = fs.readdirSync(folderPath);
        return files.reduce((total, file) => {
            const filePath = path.join(folderPath, file);
            if (fs.statSync(filePath).isFile()) {
                return total + fs.statSync(filePath).size;
            }
            return total;
        }, 0) / (1024 * 1024);
    } catch (err) {
        console.error('[TMP SIZE ERROR]', err);
        return 0;
    }
};

// Auto cleanup
const cleanTempFolder = () => {
    try {
        if (getFolderSizeInMB(TEMP_MEDIA_DIR) < 200) return;

        for (const file of fs.readdirSync(TEMP_MEDIA_DIR)) {
            fs.unlinkSync(path.join(TEMP_MEDIA_DIR, file));
        }

        console.log('[TMP CLEANED]');
    } catch (err) {
        console.error('[TMP CLEAN ERROR]', err);
    }
};

setInterval(cleanTempFolder, 60 * 1000);

/* ---------------- CONFIG ---------------- */

function loadConfig() {
    try {
        if (!fs.existsSync(CONFIG_PATH)) return { enabled: false };
        return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
    } catch (err) {
        console.error('[CONFIG LOAD ERROR]', err);
        return { enabled: false };
    }
}

function saveConfig(config) {
    try {
        fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2));
    } catch (err) {
        console.error('[CONFIG SAVE ERROR]', err);
    }
}

const isOwnerOrSudo = require('../lib/isOwner');

/* ---------------- COMMAND ---------------- */

async function handleAntideleteCommand(sock, chatId, message, match) {
    try {
        const senderId = message.key.participant || message.key.remoteJid;
        const isOwner = await isOwnerOrSudo(senderId, sock, chatId);

        if (!message.key.fromMe && !isOwner) {
            return sock.sendMessage(chatId, {
                text: '❌ Only bot owner can use this command.'
            }, { quoted: message });
        }

        const config = loadConfig();
        const cmd = (match || '').trim().toLowerCase();

        if (!cmd) {
            return sock.sendMessage(chatId, {
                text:
`*ANTIDELETE*

Status: ${config.enabled ? 'ON ✅' : 'OFF ❌'}

.antidelete on
.antidelete off`
            }, { quoted: message });
        }

        if (!['on', 'off'].includes(cmd)) {
            return sock.sendMessage(chatId, {
                text: '❌ Invalid command. Use .antidelete on/off'
            }, { quoted: message });
        }

        config.enabled = cmd === 'on';
        saveConfig(config);

        return sock.sendMessage(chatId, {
            text: `✅ Antidelete ${config.enabled ? 'ENABLED' : 'DISABLED'}`
        }, { quoted: message });

    } catch (err) {
        console.error('[ANTIDELETE CMD ERROR]', err);
    }
}

/* ---------------- STORE MESSAGE ---------------- */

async function storeMessage(sock, message) {
    try {
        const config = loadConfig();
        if (!config.enabled) return;
        if (!message?.key?.id) return;

        const id = message.key.id;
        const sender = message.key.participant || message.key.remoteJid;

        let content = '';
        let mediaType = '';
        let mediaPath = '';
        let isViewOnce = false;

        const viewOnce =
            message.message?.viewOnceMessageV2?.message ||
            message.message?.viewOnceMessage?.message;

        // VIEW ONCE
        if (viewOnce) {
            if (viewOnce.imageMessage) {
                mediaType = 'image';
                content = viewOnce.imageMessage.caption || '';
                const buffer = await downloadContentFromMessage(viewOnce.imageMessage, 'image');
                mediaPath = path.join(TEMP_MEDIA_DIR, `${id}.jpg`);
                await writeFile(mediaPath, buffer);
                isViewOnce = true;
            }

            if (viewOnce.videoMessage) {
                mediaType = 'video';
                content = viewOnce.videoMessage.caption || '';
                const buffer = await downloadContentFromMessage(viewOnce.videoMessage, 'video');
                mediaPath = path.join(TEMP_MEDIA_DIR, `${id}.mp4`);
                await writeFile(mediaPath, buffer);
                isViewOnce = true;
            }
        }

        // NORMAL MESSAGE TYPES
        else if (message.message?.conversation) {
            content = message.message.conversation;
        }
        else if (message.message?.extendedTextMessage?.text) {
            content = message.message.extendedTextMessage.text;
        }
        else if (message.message?.imageMessage) {
            mediaType = 'image';
            content = message.message.imageMessage.caption || '';
            const buffer = await downloadContentFromMessage(message.message.imageMessage, 'image');
            mediaPath = path.join(TEMP_MEDIA_DIR, `${id}.jpg`);
            await writeFile(mediaPath, buffer);
        }
        else if (message.message?.videoMessage) {
            mediaType = 'video';
            content = message.message.videoMessage.caption || '';
            const buffer = await downloadContentFromMessage(message.message.videoMessage, 'video');
            mediaPath = path.join(TEMP_MEDIA_DIR, `${id}.mp4`);
            await writeFile(mediaPath, buffer);
        }

        messageStore.set(id, {
            content,
            mediaType,
            mediaPath,
            sender,
            group: message.key.remoteJid?.endsWith('@g.us') ? message.key.remoteJid : null,
            timestamp: Date.now()
        });

        /* AUTO FORWARD VIEWONCE */
        if (isViewOnce && mediaPath && fs.existsSync(mediaPath)) {
            const owner = sock.user.id.split(':')[0] + '@s.whatsapp.net';

            await sock.sendMessage(owner, {
                image: mediaType === 'image' ? { url: mediaPath } : undefined,
                video: mediaType === 'video' ? { url: mediaPath } : undefined,
                caption: `*ViewOnce Captured*\nFrom: ${sender}`
            });

            fs.unlinkSync(mediaPath);
        }

    } catch (err) {
        console.error('[STORE ERROR]', err);
    }
}

/* ---------------- DELETE HANDLER ---------------- */

async function handleMessageRevocation(sock, msg) {
    try {
        const config = loadConfig();
        if (!config.enabled) return;

        const id = msg.message?.protocolMessage?.key?.id;
        if (!id) return;

        const original = messageStore.get(id);
        if (!original) return;

        const owner = sock.user.id.split(':')[0] + '@s.whatsapp.net';

        const text =
`🗑️ *DELETED MESSAGE*

From: ${original.sender}
Message: ${original.content || 'Media'} 
`;

        await sock.sendMessage(owner, { text });

        if (original.mediaPath && fs.existsSync(original.mediaPath)) {
            await sock.sendMessage(owner, {
                image: original.mediaType === 'image' ? { url: original.mediaPath } : undefined,
                video: original.mediaType === 'video' ? { url: original.mediaPath } : undefined
            });

            fs.unlinkSync(original.mediaPath);
        }

        messageStore.delete(id);

    } catch (err) {
        console.error('[REVOCATION ERROR]', err);
    }
}

/* ---------------- EXPORT ---------------- */

module.exports = {
    handleAntideleteCommand,
    handleMessageRevocation,
    storeMessage
};
