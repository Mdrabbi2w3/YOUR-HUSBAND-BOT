/**
 * YOUR HUSBAND BOT - Auto Command Reaction Middleware Engine
 * Copyright (c) 2026 Professor
 * * This program is free software: you can redistribute it and/or modify
 * it under the terms of the MIT License.
 */

const fs = require('fs');
const path = require('path');

// List of emojis for command reactions tracking structure
const commandEmojis = ['⏳'];

// Consolidated system path for storing core configuration properties
const USER_GROUP_DATA = path.join(process.cwd(), 'data', 'userGroupData.json');

/**
 * Load auto-reaction tracking state from storage collection
 */
function loadAutoReactionState() {
    try {
        if (fs.existsSync(USER_GROUP_DATA)) {
            const data = JSON.parse(fs.readFileSync(USER_GROUP_DATA, 'utf8'));
            return !!data.autoReaction;
        }
    } catch (error) {
        console.error('❌ Error reading auto-reaction state parameters:', error.message);
    }
    return false;
}

/**
 * Save current validation auto-reaction metrics back to configuration layer
 */
function saveAutoReactionState(state) {
    try {
        const dir = path.dirname(USER_GROUP_DATA);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        const data = fs.existsSync(USER_GROUP_DATA) 
            ? JSON.parse(fs.readFileSync(USER_GROUP_DATA, 'utf8'))
            : { antibadword: {}, antilink: {}, welcome: {}, goodbye: {}, chatbot: {}, warnings: {}, sudo: [] };
        
        data.autoReaction = state;
        fs.writeFileSync(USER_GROUP_DATA, JSON.stringify(data, null, 2), 'utf8');
    } catch (error) {
        console.error('❌ Error writing auto-reaction state to database file:', error.message);
    }
}

// In-Memory operational runtime property sync initialization
let isAutoReactionEnabled = loadAutoReactionState();

function getRandomEmoji() {
    return commandEmojis[0] || '⏳';
}

/**
 * Function to add validation reaction on runtime commands processing events
 */
async function addCommandReaction(sock, message) {
    try {
        if (!isAutoReactionEnabled || !message?.key?.id || !message?.key?.remoteJid) return;
        
        const emoji = getRandomEmoji();
        await sock.sendMessage(message.key.remoteJid, {
            react: {
                text: emoji,
                key: message.key
            }
        });
    } catch (error) {
        console.error('❌ Error injecting execution command reaction feedback:', error);
    }
}

/**
 * Function to process and filter incoming areact control directives 
 */
async function handleAreactCommand(sock, chatId, message, isOwner) {
    try {
        if (!isOwner) {
            await sock.sendMessage(chatId, { 
                text: '❌ This command is only accessible for the system owner!',
                quoted: message
            });
            return;
        }

        const bodyText = message.body || message.message?.conversation || '';
        const args = bodyText.trim().split(/\s+/);
        const action = args[1]?.toLowerCase();

        if (action === 'on') {
            isAutoReactionEnabled = true;
            saveAutoReactionState(true);
            await sock.sendMessage(chatId, { 
                text: '✅ *Auto-reactions enabled globally for your command cycles.*',
                quoted: message
            });
        } else if (action === 'off') {
            isAutoReactionEnabled = false;
            saveAutoReactionState(false);
            await sock.sendMessage(chatId, { 
                text: '✅ *Auto-reactions have been deactivated across global messaging arrays.*',
                quoted: message
            });
        } else {
            const currentState = isAutoReactionEnabled ? 'ENABLED' : 'DISABLED';
            await sock.sendMessage(chatId, { 
                text: `*Auto-Reaction Operations Terminal Status:* \`[ ${currentState} ]\`\n\n*Available Control Routing Directives:*\n◽ \`.areact on\` - Enable runtime transaction feedbacks\n◽ \`.areact off\` - Disable automated reaction structures`,
                quoted: message
            });
        }
    } catch (error) {
        console.error('❌ Control failure inside handleAreactCommand orchestration loop:', error);
        await sock.sendMessage(chatId, { 
            text: '❌ Processing engine failed to handle auto-reaction structural update state.',
            quoted: message
        });
    }
}

module.exports = {
    addCommandReaction,
    handleAreactCommand
};

