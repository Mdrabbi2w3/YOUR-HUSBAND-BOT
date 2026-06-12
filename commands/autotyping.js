const fs = require('fs');
const path = require('path');
const isOwnerOrSudo = require('../lib/isOwner');

const configPath = path.join(__dirname, '../data/autotyping.json');

const DEFAULT_CONFIG = { enabled: false };

/* ---------------- CONFIG ---------------- */

function loadConfig() {
    try {
        if (!fs.existsSync(configPath)) {
            fs.writeFileSync(configPath, JSON.stringify(DEFAULT_CONFIG, null, 2));
            return DEFAULT_CONFIG;
        }
        return JSON.parse(fs.readFileSync(configPath, 'utf8'));
    } catch {
        return DEFAULT_CONFIG;
    }
}

function saveConfig(config) {
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
}

/* ---------------- COMMAND ---------------- */

async function autotypingCommand(sock, chatId, message) {
    try {
        const senderId = message.key.participant || message.key.remoteJid;
        const isOwner = await isOwnerOrSudo(senderId, sock, chatId);

        if (!message.key.fromMe && !isOwner) {
            return await sock.sendMessage(chatId, {
                text: '❌ Owner only command'
            }, { quoted: message });
        }

        const args =
            (message.message?.conversation || message.message?.extendedTextMessage?.text || '')
                .trim()
                .split(' ')
                .slice(1);

        const config = loadConfig();

        if (!args.length) {
            config.enabled = !config.enabled;
        } else {
            const cmd = args[0].toLowerCase();

            if (cmd === 'on') config.enabled = true;
            else if (cmd === 'off') config.enabled = false;
            else {
                return await sock.sendMessage(chatId, {
                    text: '❌ Use: .autotyping on/off'
                }, { quoted: message });
            }
        }

        saveConfig(config);

        return await sock.sendMessage(chatId, {
            text:
`⌨️ *Auto Typing*

Status: ${config.enabled ? 'ON ✅' : 'OFF ❌'}`
        }, { quoted: message });

    } catch (err) {
        console.error('[AUTOTYPING CMD ERROR]', err);
    }
}

/* ---------------- CORE PRESENCE ---------------- */

async function sendTyping(sock, chatId, duration = 1500) {
    try {
        if (!loadConfig().enabled) return false;

        await sock.presenceSubscribe(chatId);

        await sock.sendPresenceUpdate('composing', chatId);

        await new Promise(res => setTimeout(res, duration));

        await sock.sendPresenceUpdate('paused', chatId);

        return true;

    } catch (err) {
        console.error('[TYPING ERROR]', err);
        return false;
    }
}

/* ---------------- MESSAGE HANDLER ---------------- */

async function handleAutotypingForMessage(sock, chatId, text) {
    const delay = Math.max(1200, Math.min(5000, text.length * 80));
    return await sendTyping(sock, chatId, delay);
}

/* ---------------- COMMAND TYPING (OPTIONAL) ---------------- */

async function handleAutotypingForCommand(sock, chatId) {
    return await sendTyping(sock, chatId, 2000);
}

/* ---------------- AFTER COMMAND ---------------- */

async function showTypingAfterCommand(sock, chatId) {
    return await sendTyping(sock, chatId, 1000);
}

/* ---------------- EXPORT ---------------- */

module.exports = {
    autotypingCommand,
    isAutotypingEnabled: () => loadConfig().enabled,
    handleAutotypingForMessage,
    handleAutotypingForCommand,
    showTypingAfterCommand
};
