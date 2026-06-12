const fs = require('fs');
const path = require('path');
const isOwnerOrSudo = require('../lib/isOwner');

const configPath = path.join(__dirname, '../data/autoStatus.json');

const DEFAULT_CONFIG = {
    enabled: false,
    reactOn: false
};

/* ---------------- INIT CONFIG ---------------- */

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

async function autoStatusCommand(sock, chatId, msg, args) {
    try {
        const senderId = msg.key.participant || msg.key.remoteJid;
        const isOwner = await isOwnerOrSudo(senderId, sock, chatId);

        if (!msg.key.fromMe && !isOwner) {
            return await sock.sendMessage(chatId, {
                text: '❌ Owner only command!'
            }, { quoted: msg });
        }

        const config = loadConfig();
        const command = args?.[0]?.toLowerCase();

        if (!command) {
            return await sock.sendMessage(chatId, {
                text:
`📱 *AUTO STATUS*

View: ${config.enabled ? 'ON ✅' : 'OFF ❌'}
React: ${config.reactOn ? 'ON 💚' : 'OFF ❌'}

Commands:
.autostatus on/off
.autostatus react on/off`
            }, { quoted: msg });
        }

        /* -------- VIEW -------- */
        if (command === 'on') {
            config.enabled = true;
            saveConfig(config);

            return await sock.sendMessage(chatId, {
                text: '✅ Auto Status VIEW ENABLED'
            }, { quoted: msg });
        }

        if (command === 'off') {
            config.enabled = false;
            saveConfig(config);

            return await sock.sendMessage(chatId, {
                text: '❌ Auto Status VIEW DISABLED'
            }, { quoted: msg });
        }

        /* -------- REACTION -------- */
        if (command === 'react') {
            const type = args?.[1]?.toLowerCase();

            if (!['on', 'off'].includes(type)) {
                return await sock.sendMessage(chatId, {
                    text: '❌ Use: .autostatus react on/off'
                }, { quoted: msg });
            }

            config.reactOn = type === 'on';
            saveConfig(config);

            return await sock.sendMessage(chatId, {
                text: `💚 Status React ${type.toUpperCase()}`
            }, { quoted: msg });
        }

    } catch (err) {
        console.error('[AUTOSTATUS CMD ERROR]', err);
    }
}

/* ---------------- CHECKERS ---------------- */

function isAutoStatusEnabled() {
    return loadConfig().enabled;
}

function isStatusReactionEnabled() {
    return loadConfig().reactOn;
}

/* ---------------- REACTION ---------------- */

async function reactToStatus(sock, key) {
    try {
        if (!isStatusReactionEnabled()) return;

        await sock.relayMessage(
            'status@broadcast',
            {
                reactionMessage: {
                    key: {
                        remoteJid: 'status@broadcast',
                        id: key.id,
                        participant: key.participant || key.remoteJid,
                        fromMe: false
                    },
                    text: '💚'
                }
            },
            {
                statusJidList: [key.participant || key.remoteJid]
            }
        );

    } catch (err) {
        console.error('[STATUS REACT ERROR]', err);
    }
}

/* ---------------- STATUS HANDLER ---------------- */

async function handleStatusUpdate(sock, data) {
    try {
        if (!isAutoStatusEnabled()) return;

        const msg =
            data.messages?.[0] ||
            data.key ||
            data.reaction?.key;

        if (!msg?.key || msg.key.remoteJid !== 'status@broadcast') return;

        await sock.readMessages([msg.key]);

        await reactToStatus(sock, msg.key);

    } catch (err) {
        console.error('[STATUS ERROR]', err);
    }
}

module.exports = {
    autoStatusCommand,
    handleStatusUpdate
};
