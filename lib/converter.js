const fs = require('fs');
const path = require('path');

const databaseDir = path.join(process.cwd(), 'data');
const antilinkFilePath = path.join(databaseDir, 'antilinkSettings.json');

function loadAntilinkSettings() {
    if (!fs.existsSync(databaseDir)) {
        fs.mkdirSync(databaseDir, { recursive: true });
    }
    if (!fs.existsSync(antilinkFilePath)) {
        fs.writeFileSync(antilinkFilePath, JSON.stringify({}), 'utf8');
        return {};
    }
    try {
        const data = fs.readFileSync(antilinkFilePath, 'utf8');
        return JSON.parse(data) || {};
    } catch (error) {
        console.error('❌ Error loading antilink settings:', error.message);
        return {};
    }
}

function saveAntilinkSettings(settings) {
    try {
        fs.writeFileSync(antilinkFilePath, JSON.stringify(settings, null, 2), 'utf8');
    } catch (error) {
        console.error('❌ Error saving antilink settings:', error.message);
    }
}

/**
 * Sets or updates the antilink configuration parameters for a group
 * @param {string} groupId - The remote group JID
 * @param {string} status - 'on' or 'off'
 * @param {string} action - 'delete', 'kick', or 'warn'
 */
function setAntilinkSetting(groupId, status, action = 'delete') {
    const settings = loadAntilinkSettings();
    
    if (status === 'off') {
        delete settings[groupId];
    } else {
        settings[groupId] = {
            enabled: true,
            action: action
        };
    }
    
    saveAntilinkSettings(settings);
}

/**
 * Gets the custom antilink action and configuration metrics for a group
 * @param {string} groupId - The remote group JID
 * @returns {object|null} - Configuration object or null if disabled
 */
function getAntilinkSetting(groupId) {
    const settings = loadAntilinkSettings();
    return settings[groupId] || null;
}

module.exports = {
    setAntilinkSetting,
    getAntilinkSetting
};

