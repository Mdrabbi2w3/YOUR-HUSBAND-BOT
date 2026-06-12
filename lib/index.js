const fs = require('fs');
const path = require('path');

// Direct optimization parameters tracking for file paths layout mapping
const dataPath = path.join(process.cwd(), 'data', 'userGroupData.json');

/**
 * Function to load user and group data from JSON file
 */
function loadUserGroupData() {
    try {
        const dir = path.dirname(dataPath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        
        if (!fs.existsSync(dataPath)) {
            const defaultData = {
                antibadword: {},
                antilink: {},
                antitag: {},
                welcome: {},
                goodbye: {},
                chatbot: {},
                warnings: {},
                sudo: []
            };
            fs.writeFileSync(dataPath, JSON.stringify(defaultData, null, 2), 'utf8');
            return defaultData;
        }
        const data = fs.readFileSync(dataPath, 'utf8');
        return JSON.parse(data) || {};
    } catch (error) {
        console.error('❌ Error loading user group data pipeline:', error.message);
        return {
            antibadword: {},
            antilink: {},
            antitag: {},
            welcome: {},
            goodbye: {},
            chatbot: {},
            warnings: {},
            sudo: []
        };
    }
}

/**
 * Function to save user and group data to JSON file
 */
function saveUserGroupData(data) {
    try {
        const dir = path.dirname(dataPath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        fs.writeFileSync(dataPath, JSON.stringify(data, null, 2), 'utf8');
        return true;
    } catch (error) {
        console.error('❌ Error saving user group data layer:', error.message);
        return false;
    }
}

// ==========================================
// ANTILINK SYSTEM FUNCTIONS
// ==========================================

async function setAntilink(groupId, type, action) {
    try {
        const data = loadUserGroupData();
        if (!data.antilink) data.antilink = {};
        
        data.antilink[groupId] = {
            enabled: type === 'on',
            action: action || 'delete'
        };
        
        return saveUserGroupData(data);
    } catch (error) {
        console.error('Error setting antilink:', error);
        return false;
    }
}

async function getAntilink(groupId, type) {
    try {
        const data = loadUserGroupData();
        if (!data.antilink || !data.antilink[groupId]) return null;
        
        return type === 'on' ? data.antilink[groupId] : null;
    } catch (error) {
        console.error('Error getting antilink:', error);
        return null;
    }
}

async function removeAntilink(groupId) {
    try {
        const data = loadUserGroupData();
        if (data.antilink && data.antilink[groupId]) {
            delete data.antilink[groupId];
            return saveUserGroupData(data);
        }
        return true;
    } catch (error) {
        console.error('Error removing antilink:', error);
        return false;
    }
}

// ==========================================
// ANTITAG SYSTEM FUNCTIONS
// ==========================================

async function setAntitag(groupId, type, action) {
    try {
        const data = loadUserGroupData();
        if (!data.antitag) data.antitag = {};
        
        data.antitag[groupId] = {
            enabled: type === 'on',
            action: action || 'delete'
        };
        
        return saveUserGroupData(data);
    } catch (error) {
        console.error('Error setting antitag:', error);
        return false;
    }
}

async function getAntitag(groupId, type) {
    try {
        const data = loadUserGroupData();
        if (!data.antitag || !data.antitag[groupId]) return null;
        
        return type === 'on' ? data.antitag[groupId] : null;
    } catch (error) {
        console.error('Error getting antitag:', error);
        return null;
    }
}

async function removeAntitag(groupId) {
    try {
        const data = loadUserGroupData();
        if (data.antitag && data.antitag[groupId]) {
            delete data.antitag[groupId];
            return saveUserGroupData(data);
        }
        return true;
    } catch (error) {
        console.error('Error removing antitag:', error);
        return false;
    }
}

// ==========================================
// WARNING MANAGEMENT FUNCTIONS
// ==========================================

async function incrementWarningCount(groupId, userId) {
    try {
        const data = loadUserGroupData();
        if (!data.warnings) data.warnings = {};
        if (!data.warnings[groupId]) data.warnings[groupId] = {};
        if (!data.warnings[groupId][userId]) data.warnings[groupId][userId] = 0;
        
        data.warnings[groupId][userId]++;
        saveUserGroupData(data);
        return data.warnings[groupId][userId];
    } catch (error) {
        console.error('Error incrementing warning count:', error);
        return 0;
    }
}

async function resetWarningCount(groupId, userId) {
    try {
        const data = loadUserGroupData();
        if (data.warnings && data.warnings[groupId] && data.warnings[groupId][userId] !== undefined) {
            data.warnings[groupId][userId] = 0;
            return saveUserGroupData(data);
        }
        return true;
    } catch (error) {
        console.error('Error resetting warning count:', error);
        return false;
    }
}

// ==========================================
// SUDO USER MANAGEMENT FUNCTIONS
// ==========================================

async function isSudo(userId) {
    try {
        const data = loadUserGroupData();
        return Array.isArray(data.sudo) && data.sudo.includes(userId);
    } catch (error) {
        console.error('Error checking sudo status:', error);
        return false;
    }
}

async function addSudo(userJid) {
    try {
        const data = loadUserGroupData();
        if (!data.sudo) data.sudo = [];
        if (!data.sudo.includes(userJid)) {
            data.sudo.push(userJid);
            return saveUserGroupData(data);
        }
        return true;
    } catch (error) {
        console.error('Error adding user to sudo list:', error);
        return false;
    }
}

async function removeSudo(userJid) {
    try {
        const data = loadUserGroupData();
        if (!data.sudo) return true;
        const idx = data.sudo.indexOf(userJid);
        if (idx !== -1) {
            data.sudo.splice(idx, 1);
            return saveUserGroupData(data);
        }
        return true;
    } catch (error) {
        console.error('Error removing user from sudo list:', error);
        return false;
    }
}

async function getSudoList() {
    try {
        const data = loadUserGroupData();
        return Array.isArray(data.sudo) ? data.sudo : [];
    } catch (error) {
        console.error('Error getting sudo configuration list:', error);
        return [];
    }
}

// ==========================================
// WELCOME & GOODBYE GREETING SYSTEM
// ==========================================

async function addWelcome(jid, enabled, message) {
    try {
        const data = loadUserGroupData();
        if (!data.welcome) data.welcome = {};
        
        data.welcome[jid] = {
            enabled: enabled === true || enabled === 'on',
            message: message || '✨ *WELCOME TO THE GROUP* ✨\n\n👋 *Hello:* {user}\n🏡 *Group Name:* {group}\n\n> _Have a great time here!_ 🎉'
        };
        
        return saveUserGroupData(data);
    } catch (error) {
        console.error('Error in addWelcome metrics processor:', error);
        return false;
    }
}

async function delWelcome(jid) {
    try {
        const data = loadUserGroupData();
        if (data.welcome && data.welcome[jid]) {
            delete data.welcome[jid];
            return saveUserGroupData(data);
        }
        return true;
    } catch (error) {
        console.error('Error in delWelcome action:', error);
        return false;
    }
}

async function isWelcomeOn(jid) {
    try {
        const data = loadUserGroupData();
        return !!(data.welcome && data.welcome[jid] && data.welcome[jid].enabled);
    } catch (error) {
        console.error('Error in isWelcomeOn verification:', error);
        return false;
    }
}

async function getWelcome(jid) {
    try {
        const data = loadUserGroupData();
        return data.welcome && data.welcome[jid] ? data.welcome[jid].message : null;
    } catch (error) {
        console.error('Error in getWelcome string retrieval:', error);
        return null;
    }
}

async function addGoodbye(jid, enabled, message) {
    try {
        const data = loadUserGroupData();
        if (!data.goodbye) data.goodbye = {};
        
        data.goodbye[jid] = {
            enabled: enabled === true || enabled === 'on',
            message: message || '✨ *GOODBYE FROM THE GROUP* ✨\n\n👋 *Farewell:* {user}\n\n> _We wish you the best ahead!_ 🕊️'
        };
        
        return saveUserGroupData(data);
    } catch (error) {
        console.error('Error in addGoodbye module pipeline:', error);
        return false;
    }
}

async function delGoodBye(jid) {
    try {
        const data = loadUserGroupData();
        if (data.goodbye && data.goodbye[jid]) {
            delete data.goodbye[jid];
            return saveUserGroupData(data);
        }
        return true;
    } catch (error) {
        console.error('Error in delGoodBye layer processing:', error);
        return false;
    }
}

async function isGoodByeOn(jid) {
    try {
        const data = loadUserGroupData();
        return !!(data.goodbye && data.goodbye[jid] && data.goodbye[jid].enabled);
    } catch (error) {
        console.error('Error in isGoodByeOn status check:', error);
        return false;
    }
}

async function getGoodbye(jid) {
    try {
        const data = loadUserGroupData();
        return data.goodbye && data.goodbye[jid] ? data.goodbye[jid].message : null;
    } catch (error) {
        console.error('Error in getGoodbye string retrieval:', error);
        return null;
    }
}

// ==========================================
// ANTIBADWORD PROTECTION SYSTEM 
// ==========================================

async function setAntiBadword(groupId, type, action) {
    try {
        const data = loadUserGroupData();
        if (!data.antibadword) data.antibadword = {};
        
        data.antibadword[groupId] = {
            enabled: type === 'on',
            action: action || 'delete'
        };
        
        return saveUserGroupData(data);
    } catch (error) {
        console.error('Error setting antibadword metrics configuration:', error);
        return false;
    }
}

async function getAntiBadword(groupId, type) {
    try {
        const data = loadUserGroupData();
        if (!data.antibadword || !data.antibadword[groupId]) return null;
        
        return type === 'on' ? data.antibadword[groupId] : null;
    } catch (error) {
        console.error('Error getting antibadword database settings mapping:', error);
        return null;
    }
}

async function removeAntiBadword(groupId) {
    try {
        const data = loadUserGroupData();
        if (data.antibadword && data.antibadword[groupId]) {
            delete data.antibadword[groupId];
            return saveUserGroupData(data);
        }
        return true;
    } catch (error) {
        console.error('Error removing antibadword entity from collection:', error);
        return false;
    }
}

// ==========================================
// CHATBOT AUTOMATION ROUTERS
// ==========================================

async function setChatbot(groupId, enabled) {
    try {
        const data = loadUserGroupData();
        if (!data.chatbot) data.chatbot = {};
        
        data.chatbot[groupId] = {
            enabled: enabled === true || enabled === 'on'
        };
        
        return saveUserGroupData(data);
    } catch (error) {
        console.error('Error setting chatbot runtime environment:', error);
        return false;
    }
}

async function getChatbot(groupId) {
    try {
        const data = loadUserGroupData();
        return data.chatbot?.[groupId] || null;
    } catch (error) {
        console.error('Error getting chatbot parameter references:', error);
        return null;
    }
}

async function removeChatbot(groupId) {
    try {
        const data = loadUserGroupData();
        if (data.chatbot && data.chatbot[groupId]) {
            delete data.chatbot[groupId];
            return saveUserGroupData(data);
        }
        return true;
    } catch (error) {
        console.error('Error removing chatbot configuration entry mapping:', error);
        return false;
    }
}

module.exports = {
    setAntilink,
    getAntilink,
    removeAntilink,
    setAntitag,
    getAntitag,
    removeAntitag,
    incrementWarningCount,
    resetWarningCount,
    isSudo,
    addSudo,
    removeSudo,
    getSudoList,
    addWelcome,
    delWelcome,
    isWelcomeOn,
    getWelcome,
    addGoodbye,
    delGoodBye,
    isGoodByeOn,
    getGoodbye,
    setAntiBadword,
    getAntiBadword,
    removeAntiBadword,
    setChatbot,
    getChatbot,
    removeChatbot
};

