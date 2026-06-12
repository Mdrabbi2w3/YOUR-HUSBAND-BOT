const fs = require('fs');
const path = require('path');
const isOwnerOrSudo = require('../lib/isOwner');

const configPath = path.join(__dirname, '..', 'data', 'autoread.json');

/* ---------------- BOT INFO ---------------- */

const BOT_NAME =
    global.botname ||
    'YOUR HUSBEND';

const OWNER_NAME =
    global.ownername ||
    'RABBI';

/* ---------------- CONFIG ---------------- */

function initConfig() {
    try {
        if (!fs.existsSync(configPath)) {
            fs.writeFileSync(configPath, JSON.stringify({ enabled: false }, null, 2));
        }
        return JSON.parse(fs.readFileSync(configPath));
    } catch {
        return { enabled: false };
    }
}

/* ---------------- COMMAND ---------------- */

async function autoreadCommand(sock, chatId, message) {
    try {
        const senderId = message.key.participant || message.key.remoteJid;
        const isOwner = await isOwnerOrSudo(senderId, sock, chatId);

        if (!message.key.fromMe && !isOwner) {
            return await sock.sendMessage(chatId, {
                text: `❌ Only *${OWNER_NAME}* can use this command!`
            }, { quoted: message });
        }

        const args =
            (message.message?.conversation || message.message?.extendedTextMessage?.text || '')
                .trim()
                .split(' ')
                .slice(1);

        const config = initConfig();

        if (args.length > 0) {
            const action = args[0].toLowerCase();

            if (action === 'on') config.enabled = true;
            else if (action === 'off') config.enabled = false;
            else {
                return await sock.sendMessage(chatId, {
                    text: `❌ Use: .autoread on/off`
                }, { quoted: message });
            }
        } else {
            config.enabled = !config.enabled;
        }

        fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

        return await sock.sendMessage(chatId, {
            text:
`🤖 *${BOT_NAME}*

Auto-read is now *${config.enabled ? 'ENABLED ✅' : 'DISABLED ❌'}*

👑 Owner: ${OWNER_NAME}`
        }, { quoted: message });

    } catch (err) {
        console.error('[AUTOREAD ERROR]', err);
    }
}

/* ---------------- HELPERS ---------------- */

function isAutoreadEnabled() {
    try {
        const config = initConfig();
        return config.enabled;
    } catch {
        return false;
    }
}

/* ---------------- MENTION CHECK ---------------- */

function isBotMentionedInMessage(message, botNumber) {
    const text =
        message.message?.conversation ||
        message.message?.extendedTextMessage?.text ||
        message.message?.imageMessage?.caption ||
        message.message?.videoMessage?.caption ||
        '';

    if (!text) return false;

    const botJid = botNumber.split('@')[0];

    const botNames = [
        BOT_NAME.toLowerCase(),
        OWNER_NAME.toLowerCase(),
        'bot',
        'knight'
    ];

    const lowerText = text.toLowerCase();

    return (
        text.includes(`@${botJid}`) ||
        botNames.some(name => lowerText.includes(name))
    );
}

/* ---------------- AUTO READ ---------------- */

async function handleAutoread(sock, message) {
    try {
        if (!isAutoreadEnabled()) return false;

        const botNumber = sock.user.id.split(':')[0] + '@s.whatsapp.net';

        const mentioned = isBotMentionedInMessage(message, botNumber);

        if (mentioned) {
            // keep unread if bot mentioned
            return false;
        }

        const key = {
            remoteJid: message.key.remoteJid,
            id: message.key.id,
            participant: message.key.participant
        };

        await sock.readMessages([key]);
        return true;

    } catch (err) {
        console.error('[AUTOREAD ERROR]', err);
        return false;
    }
}

module.exports = {
    autoreadCommand,
    isAutoreadEnabled,
    isBotMentionedInMessage,
    handleAutoread
};
