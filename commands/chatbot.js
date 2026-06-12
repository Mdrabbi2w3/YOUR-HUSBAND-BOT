const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');

const USER_GROUP_DATA = path.join(__dirname, '../data/userGroupData.json');

const chatMemory = {
    messages: new Map(),
    userInfo: new Map()
};

/* ---------------- FILE HELPERS ---------------- */

function loadData() {
    try {
        if (!fs.existsSync(USER_GROUP_DATA)) {
            fs.writeFileSync(USER_GROUP_DATA, JSON.stringify({ groups: [], chatbot: {} }, null, 2));
        }
        return JSON.parse(fs.readFileSync(USER_GROUP_DATA, 'utf8'));
    } catch {
        return { groups: [], chatbot: {} };
    }
}

function saveData(data) {
    fs.writeFileSync(USER_GROUP_DATA, JSON.stringify(data, null, 2));
}

/* ---------------- TYPING ---------------- */

async function showTyping(sock, chatId) {
    try {
        await sock.presenceSubscribe(chatId);
        await sock.sendPresenceUpdate('composing', chatId);
        await new Promise(r => setTimeout(r, 1500));
    } catch {}
}

/* ---------------- USER INFO ---------------- */

function extractUserInfo(text) {
    const info = {};

    if (text.toLowerCase().includes('my name is')) {
        info.name = text.split('my name is')[1]?.trim().split(' ')[0];
    }

    if (text.toLowerCase().includes('i am') && text.includes('years old')) {
        info.age = text.match(/\d+/)?.[0];
    }

    if (text.toLowerCase().includes('i live in') || text.toLowerCase().includes('i am from')) {
        info.location = text.split(/i live in|i am from/i)[1]?.trim();
    }

    return info;
}

/* ---------------- COMMAND ---------------- */

async function handleChatbotCommand(sock, chatId, message, match) {
    const data = loadData();
    const senderId = message.key.participant || message.key.remoteJid;

    const isOwner = senderId === sock.user.id.split(':')[0] + '@s.whatsapp.net';

    if (!match) {
        await showTyping(sock, chatId);
        return sock.sendMessage(chatId, {
            text: `*.chatbot on/off*`
        }, { quoted: message });
    }

    if (!isOwner && !chatId.endsWith('@g.us')) return;

    if (match === 'on') {
        data.chatbot[chatId] = true;
        saveData(data);

        return sock.sendMessage(chatId, {
            text: '✅ Chatbot ON'
        }, { quoted: message });
    }

    if (match === 'off') {
        delete data.chatbot[chatId];
        saveData(data);

        return sock.sendMessage(chatId, {
            text: '❌ Chatbot OFF'
        }, { quoted: message });
    }
}

/* ---------------- BOT TRIGGER ---------------- */

async function handleChatbotResponse(sock, chatId, message, text, senderId) {
    const data = loadData();
    if (!data.chatbot[chatId]) return;

    const botNumber = sock.user.id.split(':')[0];

    const context = message.message?.extendedTextMessage?.contextInfo;

    const mentioned = context?.mentionedJid || [];
    const quoted = context?.participant;

    let isTrigger =
        text.includes(`@${botNumber}`) ||
        mentioned.some(j => j.includes(botNumber)) ||
        quoted?.includes(botNumber);

    if (!isTrigger) return;

    let cleanText = text.replace(`@${botNumber}`, '').trim();

    /* ---------------- MEMORY ---------------- */

    if (!chatMemory.messages.has(senderId)) {
        chatMemory.messages.set(senderId, []);
        chatMemory.userInfo.set(senderId, {});
    }

    const history = chatMemory.messages.get(senderId);

    history.push(cleanText);
    if (history.length > 10) history.shift();

    chatMemory.messages.set(senderId, history);

    const userInfo = extractUserInfo(cleanText);

    chatMemory.userInfo.set(senderId, {
        ...chatMemory.userInfo.get(senderId),
        ...userInfo
    });

    await showTyping(sock, chatId);

    /* ---------------- AI ---------------- */

    try {
        const prompt = `
You are a casual WhatsApp human chat.

Keep replies short, funny, natural.

User: ${cleanText}
History: ${history.join('\n')}
Info: ${JSON.stringify(chatMemory.userInfo.get(senderId))}

Reply:
        `.trim();

        const res = await fetch("https://zellapi.autos/ai/chatbot?text=" + encodeURIComponent(prompt));
        const json = await res.json();

        if (!json?.status) return;

        const reply = json.result
            .replace(/Remember:.*/g, '')
            .trim();

        await sock.sendMessage(chatId, {
            text: reply
        }, { quoted: message });

    } catch (err) {
        console.error('[CHATBOT ERROR]', err);
    }
}

module.exports = {
    handleChatbotCommand,
    handleChatbotResponse
};
