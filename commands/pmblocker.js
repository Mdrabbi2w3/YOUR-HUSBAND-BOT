const fs = require('fs');
const isOwnerOrSudo = require('../lib/isOwner');

const PMBLOCKER_PATH = './data/pmblocker.json';

const DEFAULT_MESSAGE =
    '⚠️ Direct messages are blocked!\nYou cannot DM THIS BOT. Please contact owner in group chats only.';

function readState() {
    try {
        if (!fs.existsSync(PMBLOCKER_PATH)) {
            return { enabled: false, message: DEFAULT_MESSAGE };
        }

        const raw = fs.readFileSync(PMBLOCKER_PATH, 'utf8');
        const data = JSON.parse(raw || '{}');

        return {
            enabled: !!data.enabled,
            message: typeof data.message === 'string' && data.message.trim()
                ? data.message
                : DEFAULT_MESSAGE
        };
    } catch (e) {
        return { enabled: false, message: DEFAULT_MESSAGE };
    }
}

function writeState(enabled, message) {
    try {
        if (!fs.existsSync('./data')) {
            fs.mkdirSync('./data', { recursive: true });
        }

        const current = readState();

        const payload = {
            enabled: !!enabled,
            message: typeof message === 'string' && message.trim()
                ? message
                : current.message
        };

        fs.writeFileSync(PMBLOCKER_PATH, JSON.stringify(payload, null, 2));
    } catch (e) {
        console.error('PMBlocker write error:', e);
    }
}

async function pmblockerCommand(sock, chatId, message, args) {
    const senderId = message.key.participant || message.key.remoteJid;
    const isOwner = await isOwnerOrSudo(senderId, sock, chatId);

    if (!message.key.fromMe && !isOwner) {
        return sock.sendMessage(chatId, {
            text: '❌ Only YOUR HUSBAND BOT owner can use this command!'
        }, { quoted: message });
    }

    const argStr = (args || '').trim();
    const [sub, ...rest] = argStr.split(' ');
    const state = readState();

    const cmd = (sub || '').toLowerCase();

    if (!cmd || !['on', 'off', 'status', 'setmsg'].includes(cmd)) {
        return sock.sendMessage(chatId, {
            text:
`🤖 *YOUR HUSBAND BOT PMBLOCKER*

.pmblocker on
.pmblocker off
.pmblocker status
.pmblocker setmsg <text>`
        }, { quoted: message });
    }

    if (cmd === 'status') {
        return sock.sendMessage(chatId, {
            text: `🤖 *YOUR HUSBAND BOT*\n\nPM Blocker: *${state.enabled ? 'ON' : 'OFF'}*\n\nMessage:\n${state.message}`
        }, { quoted: message });
    }

    if (cmd === 'setmsg') {
        const newMsg = rest.join(' ').trim();

        if (!newMsg) {
            return sock.sendMessage(chatId, {
                text: '❌ Usage: .pmblocker setmsg <message>'
            }, { quoted: message });
        }

        writeState(state.enabled, newMsg);

        return sock.sendMessage(chatId, {
            text: '✅ PM Blocker message updated for YOUR HUSBAND BOT.'
        }, { quoted: message });
    }

    const enable = cmd === 'on';
    writeState(enable);

    return sock.sendMessage(chatId, {
        text: `🤖 YOUR HUSBAND BOT\nPM Blocker is now *${enable ? 'ENABLED' : 'DISABLED'}*`
    }, { quoted: message });
}

module.exports = { pmblockerCommand, readState };
