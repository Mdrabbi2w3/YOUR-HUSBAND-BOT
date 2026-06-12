/**
 * Baileys Session & In-Memory Message Store Management Layer
 * Copyright (c) 2026
 */

const fs = require('fs');
const path = require('path');

const STORE_FILE = path.join(process.cwd(), 'baileys_store.json');

// Config: keep last 20 messages per chat (configurable) - More aggressive for lower RAM
let MAX_MESSAGES = 20;

// Try to read config from settings
try {
    const settings = require('../settings.js');
    if (settings.maxStoreMessages && typeof settings.maxStoreMessages === 'number') {
        MAX_MESSAGES = settings.maxStoreMessages;
    }
} catch (e) {
    // Use default if settings not available
}

const store = {
    messages: {},
    contacts: {},
    chats: {},

    readFromFile(filePath = STORE_FILE) {
        try {
            if (fs.existsSync(filePath)) {
                const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
                this.contacts = data.contacts || {};
                this.chats = data.chats || {};
                this.messages = data.messages || {};
                
                // Clean up any existing data to match new format
                this.cleanupData();
            }
        } catch (e) {
            console.warn('⚠️ Failed to read store file:', e.message);
        }
    },

    writeToFile(filePath = STORE_FILE) {
        try {
            const dir = path.dirname(filePath);
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
            const data = JSON.stringify({
                contacts: this.contacts,
                chats: this.chats,
                messages: this.messages
            }, null, 2);
            fs.writeFileSync(filePath, data, 'utf-8');
        } catch (e) {
            console.warn('⚠️ Failed to write store file:', e.message);
        }
    },

    cleanupData() {
        if (this.messages) {
            Object.keys(this.messages).forEach(jid => {
                if (this.messages[jid] && typeof this.messages[jid] === 'object' && !Array.isArray(this.messages[jid])) {
                    const messages = Object.values(this.messages[jid]);
                    this.messages[jid] = messages.slice(-MAX_MESSAGES);
                } else if (Array.isArray(this.messages[jid]) && this.messages[jid].length > MAX_MESSAGES) {
                    this.messages[jid] = this.messages[jid].slice(-MAX_MESSAGES);
                }
            });
        }
    },

    bind(ev) {
        ev.on('messages.upsert', ({ messages }) => {
            messages.forEach(msg => {
                if (!msg.key?.remoteJid) return;
                const jid = msg.key.remoteJid;
                this.messages[jid] = this.messages[jid] || [];

                // Push new message to storage tracking array matrix
                this.messages[jid].push(msg);

                // Trim old logs to maintain minimized footprint operations memory
                if (this.messages[jid].length > MAX_MESSAGES) {
                    this.messages[jid] = this.messages[jid].slice(-MAX_MESSAGES);
                }
            });
        });

        ev.on('contacts.update', (contacts) => {
            contacts.forEach(contact => {
                if (contact.id) {
                    this.contacts[contact.id] = {
                        id: contact.id,
                        name: contact.notify || contact.name || this.contacts[contact.id]?.name || ''
                    };
                }
            });
        });

        ev.on('chats.set', (chats) => {
            this.chats = {};
            chats.forEach(chat => {
                if (chat.id) {
                    this.chats[chat.id] = { id: chat.id, subject: chat.subject || '' };
                }
            });
        });
    },

    async loadMessage(jid, id) {
        if (!jid || !id) return null;
        return this.messages[jid]?.find(m => m.key?.id === id) || null;
    },

    getStats() {
        let totalMessages = 0;
        const totalContacts = Object.keys(this.contacts).length;
        const totalChats = Object.keys(this.chats).length;
        
        Object.values(this.messages).forEach(chatMessages => {
            if (Array.isArray(chatMessages)) {
                totalMessages += chatMessages.length;
            }
        });
        
        return {
            messages: totalMessages,
            contacts: totalContacts,
            chats: totalChats,
            maxMessagesPerChat: MAX_MESSAGES
        };
    }
};

module.exports = store;

