/**
 * YOUR HUSBAND BOT - Security Access Control & Banned Users Verification Engine
 * Copyright (c) 2026 Professor
 * * This program is free software: you can redistribute it and/or modify
 * it under the terms of the MIT License.
 */

const fs = require('fs');
const path = require('path');

// Consolidated storage tracking file for user authorization layers
const BANNED_FILE_PATH = path.join(process.cwd(), 'data', 'banned.json');

/**
 * Validates if the target userId exists within the restricted profiles registry array
 * @param {String} userId - The unique remote identification string of the WhatsApp account
 * @returns {Boolean} - Returns true if account permissions are restricted globally
 */
function isBanned(userId) {
    if (!userId) return false;
    
    try {
        // Automatically check validation layers or instantiate empty structural arrays if missing
        if (!fs.existsSync(BANNED_FILE_PATH)) {
            const dir = path.dirname(BANNED_FILE_PATH);
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
            fs.writeFileSync(BANNED_FILE_PATH, JSON.stringify([], null, 2), 'utf8');
            return false;
        }

        const dataContent = fs.readFileSync(BANNED_FILE_PATH, 'utf8');
        const bannedUsers = JSON.parse(dataContent || '[]');
        
        // Return analytical boolean assertion check 
        return Array.isArray(bannedUsers) && bannedUsers.includes(String(userId));
    } catch (error) {
        console.error('❌ [Security Engine] Critical error inspecting profile ban state array parameters:', error.message);
        return false;
    }
}

module.exports = { isBanned };
