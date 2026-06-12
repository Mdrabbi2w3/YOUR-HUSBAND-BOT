const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '../data');
const ANTICALL_PATH = path.join(DATA_DIR, 'anticall.json');

// Read Anticall State
function readState() {
    try {
        if (!fs.existsSync(ANTICALL_PATH)) {
            return { enabled: false };
        }

        const data = JSON.parse(
            fs.readFileSync(ANTICALL_PATH, 'utf8')
        );

        return {
            enabled: Boolean(data.enabled)
        };
    } catch (error) {
        console.error('[ANTICALL READ ERROR]', error);
        return { enabled: false };
    }
}

// Save Anticall State
function writeState(enabled) {
    try {
        if (!fs.existsSync(DATA_DIR)) {
            fs.mkdirSync(DATA_DIR, { recursive: true });
        }

        fs.writeFileSync(
            ANTICALL_PATH,
            JSON.stringify(
                { enabled: Boolean(enabled) },
                null,
                2
            )
        );

        return true;
    } catch (error) {
        console.error('[ANTICALL WRITE ERROR]', error);
        return false;
    }
}

// Command Handler
async function anticallCommand(sock, chatId, message, args) {
    try {
        const state = readState();
        const subCommand = (args || '').trim().toLowerCase();

        if (!['on', 'off', 'status'].includes(subCommand)) {
            return await sock.sendMessage(
                chatId,
                {
                    text:
`📞 *ANTICALL MENU*

➤ .anticall on
Enable auto block on incoming calls

➤ .anticall off
Disable anticall system

➤ .anticall status
Check current status`
                },
                { quoted: message }
            );
        }

        if (subCommand === 'status') {
            return await sock.sendMessage(
                chatId,
                {
                    text: `📊 Anticall Status: *${state.enabled ? 'ON ✅' : 'OFF ❌'}*`
                },
                { quoted: message }
            );
        }

        const enabled = subCommand === 'on';

        if (!writeState(enabled)) {
            return await sock.sendMessage(
                chatId,
                {
                    text: '❌ Failed to update anticall settings.'
                },
                { quoted: message }
            );
        }

        await sock.sendMessage(
            chatId,
            {
                text: `✅ Anticall has been *${enabled ? 'ENABLED' : 'DISABLED'}*.`
            },
            { quoted: message }
        );

    } catch (error) {
        console.error('[ANTICALL COMMAND ERROR]', error);

        await sock.sendMessage(
            chatId,
            {
                text: '⚠️ An unexpected error occurred.'
            },
            { quoted: message }
        );
    }
}

module.exports = {
    anticallCommand,
    readState,
    writeState
};
