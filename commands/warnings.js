const fs = require('fs');
const path = require('path');

const databaseDir = path.join(process.cwd(), 'data');
const warningsFilePath = path.join(databaseDir, 'warnings.json');

function loadWarnings() {
    if (!fs.existsSync(databaseDir)) {
        fs.mkdirSync(databaseDir, { recursive: true });
    }
    if (!fs.existsSync(warningsFilePath)) {
        fs.writeFileSync(warningsFilePath, JSON.stringify({}), 'utf8');
        return {};
    }
    try {
        const data = fs.readFileSync(warningsFilePath, 'utf8');
        return JSON.parse(data) || {};
    } catch (error) {
        console.error('Error reading warnings file:', error);
        return {};
    }
}

async function warningsCommand(sock, chatId, mentionedJidList, message) {
    try {
        const warnings = loadWarnings();
        let userToCheck;

        // Check for mentioned users in the command
        if (mentionedJidList && mentionedJidList.length > 0) {
            userToCheck = mentionedJidList[0];
        }
        // Check if user replied to a message to check warnings
        else if (message.message?.extendedTextMessage?.contextInfo?.participant) {
            userToCheck = message.message.extendedTextMessage.contextInfo.participant;
        }

        if (!userToCheck) {
            await sock.sendMessage(chatId, { 
                text: '⚠️ Please mention a user or reply to their message to check their warning status.' 
            }, { quoted: message });
            return;
        }

        // Fetch nested warning counts matching the warn.js data configuration mapping structure
        const groupWarnings = warnings[chatId] || {};
        const warningCount = groupWarnings[userToCheck] || 0;

        const checkMessage = `*『 WARNING STATUS 』*\n\n` +
            `👤 *User:* @${userToCheck.split('@')[0]}\n` +
            `⚠️ *Active Warnings:* ${warningCount}/3\n\n` +
            `ℹ️ _If a user accumulates 3 warnings in this group, they will be auto-removed._`;

        await sock.sendMessage(chatId, { 
            text: checkMessage,
            mentions: [userToCheck]
        }, { quoted: message });

    } catch (error) {
        console.error('Error in warnings checking command:', error);
        await sock.sendMessage(chatId, { 
            text: '❌ Failed to fetch user warning log data.' 
        }, { quoted: message });
    }
}

module.exports = warningsCommand;
