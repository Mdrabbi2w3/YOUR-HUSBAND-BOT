
 * YOUR HUSBAND BOT - Group Automation Welcome & Goodbye Message Middleware
 * Copyright (c) 2026 Professor
 * * This program is free software: you can redistribute it and/or modify
 * it under the terms of the MIT License.
 */

const { addWelcome, delWelcome, isWelcomeOn, addGoodbye, delGoodBye, isGoodByeOn } = require('../lib/index');
const { delay } = require('@whiskeysockets/baileys');

/**
 * Handles incoming welcome configuration and variable directives
 */
async function handleWelcome(sock, chatId, message, match) {
    if (!match) {
        return sock.sendMessage(chatId, {
            text: `📥 *Welcome Message Setup Matrix*\n\n◽ \`.welcome on\` — Enable welcome messages\n◽ \`.welcome set Your custom message\` — Set a custom welcome message\n◽ \`.welcome off\` — Disable welcome messages\n\n*Available Framework Variables:*\n• \`{user}\` - Mentions the new member array\n• \`{group}\` - Shows active group name\n• \`{description}\` - Shows group description profile`,
            quoted: message
        });
    }

    const [command, ...args] = match.trim().split(/\s+/);
    const lowerCommand = command.toLowerCase();
    const customMessage = args.join(' ');

    if (lowerCommand === 'on') {
        if (await isWelcomeOn(chatId)) {
            return sock.sendMessage(chatId, { text: '⚠️ Welcome messages are *already enabled* for this chat array.', quoted: message });
        }
        await addWelcome(chatId, true, 'Welcome {user} to {group}! 🎉');
        return sock.sendMessage(chatId, { text: '✅ Welcome messages *enabled* with base message profile. Use \`.welcome set [your message]\` to inject custom layout.', quoted: message });
    }

    if (lowerCommand === 'off') {
        if (!(await isWelcomeOn(chatId))) {
            return sock.sendMessage(chatId, { text: '⚠️ Welcome messages are *already disabled* inside this routing group.', quoted: message });
        }
        await delWelcome(chatId);
        return sock.sendMessage(chatId, { text: '✅ Welcome messages *deactivated* successfully for this group.', quoted: message });
    }

    if (lowerCommand === 'set') {
        if (!customMessage) {
            return sock.sendMessage(chatId, { text: '⚠️ Processing failure: Please provide a valid custom welcome string content. Example: \`.welcome set Welcome to the family!\`', quoted: message });
        }
        await addWelcome(chatId, true, customMessage);
        return sock.sendMessage(chatId, { text: '✅ Custom group welcome template parameters *saved successfully*.', quoted: message });
    }

    return sock.sendMessage(chatId, {
        text: `❌ Unrecognized routing command configuration. Interface options:\n◽ \`.welcome on\` - Activate automation\n◽ \`.welcome set [message]\` - Configure layout template\n◽ \`.welcome off\` - Terminate routing`,
        quoted: message
    });
}

/**
 * Handles incoming goodbye message pipeline events configuration updates
 */
async function handleGoodbye(sock, chatId, message, match) {
    if (!match) {
        return sock.sendMessage(chatId, {
            text: `📤 *Goodbye Message Setup Matrix*\n\n◽ \`.goodbye on\` — Enable departure notifications\n◽ \`.goodbye set Your custom message\` — Set custom goodbye statement layouts\n◽ \`.goodbye off\` — Disable goodbye alerts routing\n\n*Available Framework Variables:*\n• \`{user}\` - Mentions the leaving member profile metadata\n• \`{group}\` - Shows active group name parameters`,
            quoted: message
        });
    }

    // Unified command parser sequence routing structure alignment
    const [command, ...args] = match.trim().split(/\s+/);
    const lowerCommand = command.toLowerCase();
    const customMessage = args.join(' ');

    if (lowerCommand === 'on') {
        if (await isGoodByeOn(chatId)) {
            return sock.sendMessage(chatId, { text: '⚠️ Departure warning arrays are *already enabled* for this chat.', quoted: message });
        }
        await addGoodbye(chatId, true, 'Goodbye {user} 👋');
        return sock.sendMessage(chatId, { text: '✅ Goodbye alerts *activated* across group sequence tracking loops. Use \`.goodbye set [your message]\` to override layout rules.', quoted: message });
    }

    if (lowerCommand === 'off') {
        if (!(await isGoodByeOn(chatId))) {
            return sock.sendMessage(chatId, { text: '⚠️ Goodbye routing notifications are *already disabled* inside this workspace.', quoted: message });
        }
        await delGoodBye(chatId);
        return sock.sendMessage(chatId, { text: '✅ Goodbye monitoring routines *deactivated* for this workspace array.', quoted: message });
    }

    if (lowerCommand === 'set') {
        if (!customMessage) {
            return sock.sendMessage(chatId, { text: '⚠️ Processing failure: Please provide custom departure alert text strings. Example: \`.goodbye set Safe travels {user}!\`', quoted: message });
        }
        await addGoodbye(chatId, true, customMessage);
        return sock.sendMessage(chatId, { text: '✅ Custom goodbye template strings *saved successfully* inside database records.', quoted: message });
    }

    return sock.sendMessage(chatId, {
        text: `❌ Unrecognized routing command configuration. Interface options:\n◽ \`.goodbye on\` - Activate automation loops\n◽ \`.goodbye set [message]\` - Set departure configuration layouts\n◽ \`.goodbye off\` - Terminate routing`,
        quoted: message
    });
}

module.exports = { handleWelcome, handleGoodbye };

