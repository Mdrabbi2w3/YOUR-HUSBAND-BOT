// 🧹 Fix for ENOSPC / temp overflow in hosted panels
const fs = require('fs');
const path = require('path');

// Redirect temp storage away from system /tmp
const customTemp = path.join(process.cwd(), 'temp');
if (!fs.existsSync(customTemp)) fs.mkdirSync(customTemp, { recursive: true });
process.env.TMPDIR = customTemp;
process.env.TEMP = customTemp;
process.env.TMP = customTemp;

// Auto-cleaner every 3 hours
setInterval(() => {
    fs.readdir(customTemp, (err, files) => {
        if (err) return;
        for (const file of files) {
            const filePath = path.join(customTemp, file);
            fs.stat(filePath, (err, stats) => {
                if (!err && Date.now() - stats.mtimeMs > 3 * 60 * 60 * 1000) {
                    fs.unlink(filePath, () => { });
                }
            });
        }
    });
    console.log('🧹 Temp folder auto-cleaned');
}, 3 * 60 * 60 * 1000);

const settings = require('./settings');
require('./config.js');
const { isBanned } = require('./lib/isBanned');
const yts = require('yt-search');
const { fetchBuffer } = require('./lib/myfunc');
const fetch = require('node-fetch');
const ytdl = require('ytdl-core');
const axios = require('axios');
const ffmpeg = require('fluent-ffmpeg');
const { isSudo } = require('./lib/index');
const isOwnerOrSudo = require('./lib/isOwner');
const { autotypingCommand, isAutotypingEnabled, handleAutotypingForMessage, handleAutotypingForCommand, showTypingAfterCommand } = require('./commands/autotyping');
const { autoreadCommand, isAutoreadEnabled, handleAutoread } = require('./commands/autoread');

// Command imports
const tagAllCommand = require('./commands/tagall');
const helpCommand = require('./commands/help');
const banCommand = require('./commands/ban');
const { promoteCommand, handlePromotionEvent } = require('./commands/promote');
const { demoteCommand, handleDemotionEvent } = require('./commands/demote');
const muteCommand = require('./commands/mute');
const unmuteCommand = require('./commands/unmute');
const stickerCommand = require('./commands/sticker');
const isAdmin = require('./lib/isAdmin');
const warnCommand = require('./commands/warn');
const warningsCommand = require('./commands/warnings');
const ttsCommand = require('./commands/tts');
const { tictactoeCommand, handleTicTacToeMove } = require('./commands/tictactoe');
const { incrementMessageCount, topMembers } = require('./commands/topmembers');
const ownerCommand = require('./commands/owner');
const deleteCommand = require('./commands/delete');
const { handleAntilinkCommand, handleLinkDetection } = require('./commands/antilink');
const { handleAntitagCommand, handleTagDetection } = require('./commands/antitag');
const { Antilink } = require('./lib/antilink');
const { handleMentionDetection } = require('./commands/mention');
const memeCommand = require('./commands/meme');
const tagCommand = require('./commands/tag');
const tagNotAdminCommand = require('./commands/tagnotadmin');
const hideTagCommand = require('./commands/hidetag');
const jokeCommand = require('./commands/joke');
const quoteCommand = require('./commands/quote');
const factCommand = require('./commands/fact');
const weatherCommand = require('./commands/weather');
const newsCommand = require('./commands/news');
const kickCommand = require('./commands/kick');
const simageCommand = require('./commands/simage');
const attpCommand = require('./commands/attp');
const { startHangman, guessLetter } = require('./commands/hangman');
const { startTrivia, answerTrivia } = require('./commands/trivia');
const { complimentCommand } = require('./commands/compliment');
const { insultCommand } = require('./commands/insult');
const { eightBallCommand } = require('./commands/eightball');
const { lyricsCommand } = require('./commands/lyrics');
const { dareCommand } = require('./commands/dare');
const { truthCommand } = require('./commands/truth');
const { clearCommand } = require('./commands/clear');
const pingCommand = require('./commands/ping');
const aliveCommand = require('./commands/alive');
const blurCommand = require('./commands/img-blur');
const { welcomeCommand, handleJoinEvent } = require('./commands/welcome');
const { goodbyeCommand, handleLeaveEvent } = require('./commands/goodbye');
const githubCommand = require('./commands/github');
const { handleAntiBadwordCommand, handleBadwordDetection } = require('./lib/antibadword');
const antibadwordCommand = require('./commands/antibadword');
const { handleChatbotCommand, handleChatbotResponse } = require('./commands/chatbot');
const takeCommand = require('./commands/take');
const { flirtCommand } = require('./commands/flirt');
const characterCommand = require('./commands/character');
const wastedCommand = require('./commands/wasted');
const shipCommand = require('./commands/ship');
const groupInfoCommand = require('./commands/groupinfo');
const resetlinkCommand = require('./commands/resetlink');
const staffCommand = require('./commands/staff');
const unbanCommand = require('./commands/unban');
const emojimixCommand = require('./commands/emojimix');
const viewOnceCommand = require('./commands/viewonce');
const clearSessionCommand = require('./commands/clearsession');
const { autoStatusCommand, handleStatusUpdate } = require('./commands/autostatus');
const { simpCommand } = require('./commands/simp');
const { stupidCommand } = require('./commands/stupid');
const stickerTelegramCommand = require('./commands/stickertelegram');
const textmakerCommand = require('./commands/textmaker');
const { handleAntideleteCommand, handleMessageRevocation, storeMessage } = require('./commands/antidelete');
const clearTmpCommand = require('./commands/cleartmp');
const setProfilePicture = require('./commands/setpp');
const { setGroupDescription, setGroupName, setGroupPhoto } = require('./commands/groupmanage');
const instagramCommand = require('./commands/instagram');
const facebookCommand = require('./commands/facebook');
const spotifyCommand = require('./commands/spotify');
const playCommand = require('./commands/play');
const tiktokCommand = require('./commands/tiktok');
const songCommand = require('./commands/song');
const aiCommand = require('./commands/ai');
const urlCommand = require('./commands/url');
const { handleTranslateCommand } = require('./commands/translate');
const { handleSsCommand } = require('./commands/ss');
const { addCommandReaction, handleAreactCommand } = require('./lib/reactions');
const { goodnightCommand } = require('./commands/goodnight');
const { shayariCommand } = require('./commands/shayari');
const { rosedayCommand } = require('./commands/roseday');
const imagineCommand = require('./commands/imagine');
const videoCommand = require('./commands/video');
const sudoCommand = require('./commands/sudo');
const { miscCommand, handleHeart } = require('./commands/misc');
const { animeCommand } = require('./commands/anime');
const { piesCommand, piesAlias } = require('./commands/pies');
const stickercropCommand = require('./commands/stickercrop');
const updateCommand = require('./commands/update');
const removebgCommand = require('./commands/removebg');
const { reminiCommand } = require('./commands/remini');
const { igsCommand } = require('./commands/igs');
const { anticallCommand, readState: readAnticallState } = require('./commands/anticall');
const { pmblockerCommand, readState: readPmBlockerState } = require('./commands/pmblocker');
const settingsCommand = require('./commands/settings');
const soraCommand = require('./commands/sora');

// Global settings - Applied Custom Identity
global.packname = "YOUR HUSBAND";
global.author = "RABBI";
global.channelLink = "https://whatsapp.com/channel/0029Va90zAnIHphOuO8Msp3A";
global.ytch = "Mr Unique Hacker";

const channelInfo = {
    contextInfo: {
        forwardingScore: 1,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
            newsletterJid: '120363161513685998@newsletter',
            newsletterName: 'YOUR HUSBAND',
            serverMessageId: -1
        }
    }
};

async function groupJidCommand(sock, chatId, message) {
    const groupJid = message.key.remoteJid;
    if (!groupJid.endsWith('@g.us')) {
        return await sock.sendMessage(chatId, { text: "❌ This command can only be used in a group." });
    }
    await sock.sendMessage(chatId, { text: `✅ Group JID: ${groupJid}` }, { quoted: message });
}

async function handleMessages(sock, messageUpdate, printLog) {
    try {
        const { messages, type } = messageUpdate;
        if (type !== 'notify') return;

        const message = messages[0];
        if (!message?.message) return;

        await handleAutoread(sock, message);

        if (message.message) {
            storeMessage(sock, message);
        }

        if (message.message?.protocolMessage?.type === 0) {
            await handleMessageRevocation(sock, message);
            return;
        }

        const chatId = message.key.remoteJid;
        const senderId = message.key.participant || message.key.remoteJid;
        const isGroup = chatId.endsWith('@g.us');
        const senderIsSudo = await isSudo(senderId);
        const senderIsOwnerOrSudo = await isOwnerOrSudo(senderId, sock, chatId);

        if (message.message?.buttonsResponseMessage) {
            const buttonId = message.message.buttonsResponseMessage.selectedButtonId;
            if (buttonId === 'channel') {
                await sock.sendMessage(chatId, { text: '📢 *Join our Channel:*\nhttps://whatsapp.com/channel/0029Va90zAnIHphOuO8Msp3A' }, { quoted: message });
                return;
            } else if (buttonId === 'owner') {
                await ownerCommand(sock, chatId);
                return;
            } else if (buttonId === 'support') {
                await sock.sendMessage(chatId, { text: `🔗 *Support*\n\nhttps://chat.whatsapp.com/GA4WrOFythU6g3BFVubYM7?mode=wwt` }, { quoted: message });
                return;
            }
        }

        const userMessage = (
            message.message?.conversation?.trim() ||
            message.message?.extendedTextMessage?.text?.trim() ||
            message.message?.imageMessage?.caption?.trim() ||
            message.message?.videoMessage?.caption?.trim() ||
            message.message?.buttonsResponseMessage?.selectedButtonId?.trim() ||
            ''
        ).toLowerCase().replace(/\!\s+/g, '!').trim(); // Prefix set to !

        const rawText = message.message?.conversation?.trim() ||
            message.message?.extendedTextMessage?.text?.trim() ||
            message.message?.imageMessage?.caption?.trim() ||
            message.message?.videoMessage?.caption?.trim() ||
            '';

        if (userMessage.startsWith('!')) {
            console.log(`📝 Command used in ${isGroup ? 'group' : 'private'}: ${userMessage}`);
        }

        let isPublic = true;
        try {
            const data = JSON.parse(fs.readFileSync('./data/messageCount.json'));
            if (typeof data.isPublic === 'boolean') isPublic = data.isPublic;
        } catch (error) {
            console.error('Error checking access mode:', error);
        }

        const isOwnerOrSudoCheck = message.key.fromMe || senderIsOwnerOrSudo;

        if (isBanned(senderId) && !userMessage.startsWith('!unban')) {
            if (Math.random() < 0.1) {
                await sock.sendMessage(chatId, { text: '❌ You are banned from using the bot. Contact RABBI to get unbanned.', ...channelInfo });
            }
            return;
        }

        if (/^[1-9]$/.test(userMessage) || userMessage.toLowerCase() === 'surrender') {
            await handleTicTacToeMove(sock, chatId, senderId, userMessage);
            return;
        }

        if (!message.key.fromMe) incrementMessageCount(chatId, senderId);

        if (isGroup) {
            if (userMessage) {
                await handleBadwordDetection(sock, chatId, message, userMessage, senderId);
            }
            await Antilink(message, sock);
        }

        if (!isGroup && !message.key.fromMe && !senderIsSudo) {
            try {
                const pmState = readPmBlockerState();
                if (pmState.enabled) {
                    await sock.sendMessage(chatId, { text: pmState.message || 'Private messages are blocked. Please contact RABBI in groups only.' });
                    await new Promise(r => setTimeout(r, 1500));
                    try { await sock.updateBlockStatus(chatId, 'block'); } catch (e) { }
                    return;
                }
            } catch (e) { }
        }

        if (!userMessage.startsWith('!')) {
            await handleAutotypingForMessage(sock, chatId, userMessage);
            if (isGroup) {
                await handleTagDetection(sock, chatId, message, senderId);
                await handleMentionDetection(sock, chatId, message);
                if (isPublic || isOwnerOrSudoCheck) {
                    await handleChatbotResponse(sock, chatId, message, userMessage, senderId);
                }
            }
            return;
        }

        if (!isPublic && !isOwnerOrSudoCheck) {
            return;
        }

        const adminCommands = ['!mute', '!unmute', '!ban', '!unban', '!promote', '!demote', '!kick', '!tagall', '!tagnotadmin', '!hidetag', '!antilink', '!antitag', '!setgdesc', '!setgname', '!setgpp'];
        const isAdminCommand = adminCommands.some(cmd => userMessage.startsWith(cmd));

        const ownerCommands = ['!mode', '!autostatus', '!antidelete', '!cleartmp', '!setpp', '!clearsession', '!areact', '!autoreact', '!autotyping', '!autoread', '!pmblocker'];
        const isOwnerCommand = ownerCommands.some(cmd => userMessage.startsWith(cmd));

        let isSenderAdmin = false;
        let isBotAdmin = false;

        if (isGroup && isAdminCommand) {
            const adminStatus = await isAdmin(sock, chatId, senderId);
            isSenderAdmin = adminStatus.isSenderAdmin;
            isBotAdmin = adminStatus.isBotAdmin;

            if (!isBotAdmin) {
                await sock.sendMessage(chatId, { text: 'Please make YOUR HUSBAND an admin to use admin commands.', ...channelInfo }, { quoted: message });
                return;
            }

            if (
                userMessage.startsWith('!mute') ||
                userMessage === '!unmute' ||
                userMessage.startsWith('!ban') ||
                userMessage.startsWith('!unban') ||
                userMessage.startsWith('!promote') ||
                userMessage.startsWith('!demote')
            ) {
                if (!isSenderAdmin && !message.key.fromMe) {
                    await sock.sendMessage(chatId, { text: 'Sorry, only group admins can use this command.', ...channelInfo }, { quoted: message });
                    return;
                }
            }
        }

        if (isOwnerCommand) {
            if (!message.key.fromMe && !senderIsOwnerOrSudo) {
                await sock.sendMessage(chatId, { text: '❌ This command is only available for RABBI!' }, { quoted: message });
                return;
            }
        }

        let commandExecuted = false;

        switch (true) {
            case userMessage === '!simage': {
                const quotedMessage = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
                if (quotedMessage?.stickerMessage) {
                    await simageCommand(sock, quotedMessage, chatId);
                } else {
                    await sock.sendMessage(chatId, { text: 'Please reply to a sticker with the !simage command to convert it.', ...channelInfo }, { quoted: message });
                }
                commandExecuted = true;
                break;
            }
            case userMessage.startsWith('!kick'):
                const mentionedJidListKick = message.message.extendedTextMessage?.contextInfo?.mentionedJid || [];
                await kickCommand(sock, chatId, senderId, mentionedJidListKick, message);
                break;
            case userMessage.startsWith('!mute'):
                {
                    const parts = userMessage.trim().split(/\s+/);
                    const muteArg = parts[1];
                    const muteDuration = muteArg !== undefined ? parseInt(muteArg, 10) : undefined;
                    if (muteArg !== undefined && (isNaN(muteDuration) || muteDuration <= 0)) {
                        await sock.sendMessage(chatId, { text: 'Please provide a valid number of minutes or use !mute with no number to mute immediately.', ...channelInfo }, { quoted: message });
                    } else {
                        await muteCommand(sock, chatId, senderId, message, muteDuration);
                    }
                }
                break;
            case userMessage === '!unmute':
                await unmuteCommand(sock, chatId, senderId);
                break;
            case userMessage.startsWith('!ban'):
                if (!isGroup && !message.key.fromMe && !senderIsSudo) {
                    await sock.sendMessage(chatId, { text: 'Only RABBI can use !ban in private chat.' });
                    break;
                }
                await banCommand(sock, chatId, message);
                break;
            case userMessage.startsWith('!unban'):
                if (!isGroup && !message.key.fromMe && !senderIsSudo) {
                    await sock.sendMessage(chatId, { text: 'Only RABBI can use !unban in private chat.' });
                    break;
                }
                await unbanCommand(sock, chatId, message);
                break;
            case userMessage === '!help' || userMessage === '!menu' || userMessage === '!bot' || userMessage === '!list':
                await helpCommand(sock, chatId, message, global.channelLink);
                commandExecuted = true;
                break;
            case userMessage === '!sticker' || userMessage === '!s':
                await stickerCommand(sock, chatId, message);
                commandExecuted = true;
                break;
            case userMessage.startsWith('!warnings'):
                const mentionedJidListWarnings = message.message.extendedTextMessage?.contextInfo?.mentionedJid || [];
                await warningsCommand(sock, chatId, mentionedJidListWarnings);
                break;
            case userMessage.startsWith('!warn'):
                const mentionedJidListWarn = message.message.extendedTextMessage?.contextInfo?.mentionedJid || [];
                await warnCommand(sock, chatId, senderId, mentionedJidListWarn, message);
                break;
            case userMessage.startsWith('!tts'):
                const text = userMessage.slice(4).trim();
                await ttsCommand(sock, chatId, text, message);
                break;
            case userMessage.startsWith('!delete') || userMessage.startsWith('!del'):
                await deleteCommand(sock, chatId, message, senderId);
                break;
            case userMessage.startsWith('!attp'):
                await attpCommand(sock, chatId, message);
                break;
            case userMessage === '!settings':
                await settingsCommand(sock, chatId, message);
                break;
            case userMessage.startsWith('!mode'):
                if (!message.key.fromMe && !senderIsOwnerOrSudo) {
                    await sock.sendMessage(chatId, { text: 'Only RABBI can use this command!', ...channelInfo }, { quoted: message });
                    return;
                }
                let dataMode;
                try {
                    dataMode = JSON.parse(fs.readFileSync('./data/messageCount.json'));
                } catch (error) {
                    await sock.sendMessage(chatId, { text: 'Failed to read bot mode status', ...channelInfo });
                    return;
                }
                const action = userMessage.split(' ')[1]?.toLowerCase();
                if (!action) {
                    const currentMode = dataMode.isPublic ? 'public' : 'private';
                    await sock.sendMessage(chatId, { text: `Current bot mode: *${currentMode}*\n\nUsage: !mode public/private`, ...channelInfo }, { quoted: message });
                    return;
                }
                if (action !== 'public' && action !== 'private') {
                    await sock.sendMessage(chatId, { text: 'Usage: !mode public/private', ...channelInfo }, { quoted: message });
                    return;
                }
                try {
                    dataMode.isPublic = action === 'public';
                    fs.writeFileSync('./data/messageCount.json', JSON.stringify(dataMode, null, 2));
                    await sock.sendMessage(chatId, { text: `Bot is now in *${action}* mode`, ...channelInfo });
                } catch (error) {
                    await sock.sendMessage(chatId, { text: 'Failed to update bot access mode', ...channelInfo });
                }
                break;
            case userMessage.startsWith('!anticall'):
                if (!message.key.fromMe && !senderIsOwnerOrSudo) {
                    await sock.sendMessage(chatId, { text: 'Only RABBI can use anticall.' });
                    break;
                }
                await anticallCommand(sock, chatId, message, userMessage.split(' ').slice(1).join(' '));
                break;
            case userMessage.startsWith('!pmblocker'):
                await pmblockerCommand(sock, chatId, message, userMessage.split(' ').slice(1).join(' '));
                commandExecuted = true;
                break;
            case userMessage === '!owner':
                await ownerCommand(sock, chatId);
                break;
            case userMessage === '!tagall':
                await tagAllCommand(sock, chatId, senderId, message);
                break;
            case userMessage === '!tagnotadmin':
                await tagNotAdminCommand(sock, chatId, senderId, message);
                break;
            case userMessage.startsWith('!hidetag'):
                await hideTagCommand(sock, chatId, senderId, rawText.slice(8).trim(), message.message?.extendedTextMessage?.contextInfo?.quotedMessage || null, message);
                break;
            case userMessage.startsWith('!tag'):
                await tagCommand(sock, chatId, senderId, rawText.slice(4).trim(), message.message?.extendedTextMessage?.contextInfo?.quotedMessage || null, message);
                break;
            case userMessage.startsWith('!antilink'):
                if (!isGroup) {
                    await sock.sendMessage(chatId, { text: 'This command can only be used in groups.', ...channelInfo }, { quoted: message });
                    return;
                }
                if (!isBotAdmin) {
                    await sock.sendMessage(chatId, { text: 'Please make YOUR HUSBAND an admin first.', ...channelInfo }, { quoted: message });
                    return;
                }
                await handleAntilinkCommand(sock, chatId, userMessage, senderId, isSenderAdmin, message);
                break;
            case userMessage.startsWith('!antitag'):
                if (!isGroup) {
                    await sock.sendMessage(chatId, { text: 'This command can only be used in groups.', ...channelInfo }, { quoted: message });
                    return;
                }
                if (!isBotAdmin) {
                    await sock.sendMessage(chatId, { text: 'Please make YOUR HUSBAND an admin first.', ...channelInfo }, { quoted: message });
                    return;
                }
                await handleAntitagCommand(sock, chatId, userMessage, senderId, isSenderAdmin, message);
                break;
            case userMessage === '!meme':
                await memeCommand(sock, chatId, message);
                break;
            case userMessage === '!joke':
                await jokeCommand(sock, chatId, message);
                break;
            case userMessage === '!quote':
                await quoteCommand(sock, chatId, message);
                break;
            case userMessage === '!fact':
                await factCommand(sock, chatId, message, message);
                break;
            case userMessage.startsWith('!weather'):
                const city = userMessage.slice(9).trim();
                if (city) await weatherCommand(sock, chatId, message, city);
                else await sock.sendMessage(chatId, { text: 'Please specify a city, e.g., !weather London', ...channelInfo }, { quoted: message });
                break;
            case userMessage === '!news':
                await newsCommand(sock, chatId);
                break;
            case userMessage.startsWith('!ttt') || userMessage.startsWith('!tictactoe'):
                await tictactoeCommand(sock, chatId, senderId, userMessage.split(' ').slice(1).join(' '));
                break;
            case userMessage === '!topmembers':
                topMembers(sock, chatId, isGroup);
                break;
            case userMessage.startsWith('!hangman'):
                startHangman(sock, chatId);
                break;
            case userMessage.startsWith('!guess'):
                const guessedLetter = userMessage.split(' ')[1];
                if (guessedLetter) guessLetter(sock, chatId, guessedLetter);
                else sock.sendMessage(chatId, { text: 'Please guess a letter using !guess <letter>', ...channelInfo }, { quoted: message });
                break;
            case userMessage.startsWith('!trivia'):
                startTrivia(sock, chatId);
                break;
            case userMessage.startsWith('!answer'):
                const answer = userMessage.split(' ').slice(1).join(' ');
                if (answer) answerTrivia(sock, chatId, answer);
                else sock.sendMessage(chatId, { text: 'Please provide an answer using !answer <answer>', ...channelInfo }, { quoted: message });
                break;
            case userMessage.startsWith('!compliment'):
                await complimentCommand(sock, chatId, message);
                break;
            case userMessage.startsWith('!insult'):
                await insultCommand(sock, chatId, message);
                break;
            case userMessage.startsWith('!8ball'):
                await eightBallCommand(sock, chatId, userMessage.split(' ').slice(1).join(' '));
                break;
            case userMessage.startsWith('!lyrics'):
                await lyricsCommand(sock, chatId, userMessage.split(' ').slice(1).join(' '), message);
                break;
            case userMessage.startsWith('!simp'):
                await simpCommand(sock, chatId, message);
                break;
            case userMessage.startsWith('!stupid') || userMessage.startsWith('!itssostupid') || userMessage.startsWith('!iss'):
                await stupidCommand(sock, chatId, message.message?.extendedTextMessage?.contextInfo?.quotedMessage, message.message?.extendedTextMessage?.contextInfo?.mentionedJid || [], senderId, userMessage.split(' ').slice(1));
                break;
            case userMessage === '!dare':
                await dareCommand(sock, chatId, message);
                break;
            case userMessage === '!truth':
                await truthCommand(sock, chatId, message);
                break;
            case userMessage === '!clear':
                if (isGroup) await clearCommand(sock, chatId);
                break;
            case userMessage.startsWith('!promote'):
                await promoteCommand(sock, chatId, message.message.extendedTextMessage?.contextInfo?.mentionedJid || [], message);
                break;
            case userMessage.startsWith('!demote'):
                await demoteCommand(sock, chatId, message.message.extendedTextMessage?.contextInfo?.mentionedJid || [], message);
                break;
            case userMessage === '!ping':
                await pingCommand(sock, chatId, message);
                break;
            case userMessage === '!alive':
                await aliveCommand(sock, chatId, message);
                break;
            case userMessage.startsWith('!blur'):
                await blurCommand(sock, chatId, message, message.message?.extendedTextMessage?.contextInfo?.quotedMessage);
                break;
            case userMessage.startsWith('!welcome'):
                if (isGroup) {
                    if (!isSenderAdmin) {
                        const adminStatus = await isAdmin(sock, chatId, senderId);
                        isSenderAdmin = adminStatus.isSenderAdmin;
                    }
                    if (isSenderAdmin || message.key.fromMe) await welcomeCommand(sock, chatId, message);
                    else await sock.sendMessage(chatId, { text: 'Sorry, only group admins can use this command.', ...channelInfo }, { quoted: message });
                } else {
                    await sock.sendMessage(chatId, { text: 'This command can only be used in groups.', ...channelInfo }, { quoted: message });
                }
                break;
            case userMessage.startsWith('!goodbye'):
                if (isGroup) {
                    if (!isSenderAdmin) {
                        const adminStatus = await isAdmin(sock, chatId, senderId);
                        isSenderAdmin = adminStatus.isSenderAdmin;
                    }
                    if (isSenderAdmin || message.key.fromMe) await goodbyeCommand(sock, chatId, message);
                    else await sock.sendMessage(chatId, { text: 'Sorry, only group admins can use this command.', ...channelInfo }, { quoted: message });
                } else {
                    await sock.sendMessage(chatId, { text: 'This command can only be used in groups.', ...channelInfo }, { quoted: message });
                }
                break;
            case userMessage === '!git':
            case userMessage === '!github':
            case userMessage === '!sc':
            case userMessage === '!script':
            case userMessage === '!repo':
                await githubCommand(sock, chatId, message);
                break;
            case userMessage.startsWith('!antibadword'):
                if (!isGroup) {
                    await sock.sendMessage(chatId, { text: 'This command can only be used in groups.', ...channelInfo }, { quoted: message });
                    return;
                }
                const badwordAdminStatus = await isAdmin(sock, chatId, senderId);
                if (!badwordAdminStatus.isBotAdmin) {
                    await sock.sendMessage(chatId, { text: '*YOUR HUSBAND must be admin to use this feature*', ...channelInfo }, { quoted: message });
                    return;
                }
                await antibadwordCommand(sock, chatId, message, senderId, badwordAdminStatus.isSenderAdmin);
                break;
            case userMessage.startsWith('!chatbot'):
                if (!isGroup) {
                    await sock.sendMessage(chatId, { text: 'This command can only be used in groups.', ...channelInfo }, { quoted: message });
                    return;
                }
                const chatbotAdminStatus = await isAdmin(sock, chatId, senderId);
                if (!chatbotAdminStatus.isSenderAdmin && !message.key.fromMe) {
                    await sock.sendMessage(chatId, { text: '*Only admins or RABBI can use this command*', ...channelInfo }, { quoted: message });
                    return;
                }
                await handleChatbotCommand(sock, chatId, message, userMessage.slice(8).trim());
                break;
            case userMessage.startsWith('!take') || userMessage.startsWith('!steal'):
                await takeCommand(sock, chatId, message, rawText.slice(userMessage.startsWith('!steal') ? 6 : 5).trim().split(' '));
                break;
            case userMessage === '!flirt':
                await flirtCommand(sock, chatId, message);
                break;
            case userMessage.startsWith('!character'):
                await characterCommand(sock, chatId, message);
                break;
            case userMessage.startsWith('!waste'):
                await wastedCommand(sock, chatId, message);
                break;
            case userMessage === '!ship':
                if (!isGroup) {
                    await sock.sendMessage(chatId, { text: 'This command can only be used in groups!', ...channelInfo }, { quoted: message });
                    return;
                }
                await shipCommand(sock, chatId, message);
                break;
            case userMessage === '!groupinfo' || userMessage === '!infogp' || userMessage === '!infogrupo':
                if (!isGroup) {
                    await sock.sendMessage(chatId, { text: 'This command can only be used in groups!', ...channelInfo }, { quoted: message });
                    return;
                }
                await groupInfoCommand(sock, chatId, message);
                break;
            case userMessage === '!resetlink' || userMessage === '!revoke' || userMessage === '!anularlink':
                if (!isGroup) {
                    await sock.sendMessage(chatId, { text: 'This command can only be used in groups!', ...channelInfo }, { quoted: message });
                    return;
                }
                await resetlinkCommand(sock, chatId, senderId);
                break;
            case userMessage === '!staff' || userMessage === '!admins' || userMessage === '!listadmin':
                if (!isGroup) {
                    await sock.sendMessage(chatId, { text: 'This command can only be used in groups!', ...channelInfo }, { quoted: message });
                    return;
                }
                await staffCommand(sock, chatId, message);
                break;
            case userMessage.startsWith('!tourl') || userMessage.startsWith('!url'):
                await urlCommand(sock, chatId, message);
                break;
            case userMessage.startsWith('!emojimix') || userMessage.startsWith('!emix'):
                await emojimixCommand(sock, chatId, message);
                break;
            case userMessage.startsWith('!tg') || userMessage.startsWith('!stickertelegram') || userMessage.startsWith('!tgsticker') || userMessage.startsWith('!telesticker'):
                await stickerTelegramCommand(sock, chatId, message);
                break;
            case userMessage === '!vv':
                await viewOnceCommand(sock, chatId, message);
                break;
            case userMessage === '!clearsession' || userMessage === '!clearsesi':
                await clearSessionCommand(sock, chatId, message);
                break;
            case userMessage.startsWith('!autostatus'):
                await autoStatusCommand(sock, chatId, message, userMessage.split(' ').slice(1));
                break;
            case userMessage.startsWith('!metallic'):
            case userMessage.startsWith('!ice'):
            case userMessage.startsWith('!snow'):
            case userMessage.startsWith('!impressive'):
            case userMessage.startsWith('!matrix'):
            case userMessage.startsWith('!light'):
            case userMessage.startsWith('!neon'):
            case userMessage.startsWith('!devil'):
            case userMessage.startsWith('!purple'):
            case userMessage.startsWith('!thunder'):
            case userMessage.startsWith('!leaves'):
            case userMessage.startsWith('!1917'):
            case userMessage.startsWith('!arena'):
            case userMessage.startsWith('!hacker'):
            case userMessage.startsWith('!sand'):
            case userMessage.startsWith('!blackpink'):
            case userMessage.startsWith('!glitch'):
            case userMessage.startsWith('!fire'):
                await textmakerCommand(sock, chatId, message, userMessage, userMessage.slice(1).split(' ')[0]);
                break;
            case userMessage.startsWith('!antidelete'):
                await handleAntideleteCommand(sock, chatId, message, userMessage.slice(11).trim());
                break;
            case userMessage === '!cleartmp':
                await clearTmpCommand(sock, chatId, message);
                break;
            case userMessage === '!setpp':
                await setProfilePicture(sock, chatId, message);
                break;
            case userMessage.startsWith('!setgdesc'):
                await setGroupDescription(sock, chatId, senderId, rawText.slice(9).trim(), message);
                break;
            case userMessage.startsWith('!setgname'):
                await setGroupName(sock, chatId, senderId, rawText.slice(9).trim(), message);
                break;
            case userMessage.startsWith('!setgpp'):
                await setGroupPhoto(sock, chatId, senderId, message);
                break;
            case userMessage.startsWith('!instagram') || userMessage.startsWith('!insta') || userMessage === '!ig' || userMessage.startsWith('!ig '):
                await instagramCommand(sock, chatId, message);
                break;
            case userMessage.startsWith('!igsc'):
                await igsCommand(sock, chatId, message, true);
                break;
            case userMessage.startsWith('!igs'):
                await igsCommand(sock, chatId, message, false);
                break;
            case userMessage.startsWith('!fb') || userMessage.startsWith('!facebook'):
                await facebookCommand(sock, chatId, message);
                break;
            case userMessage.startsWith('!music'):
                await playCommand(sock, chatId, message);
                break;
            case userMessage.startsWith('!spotify'):
                await spotifyCommand(sock, chatId, message);
                break;
            case userMessage.startsWith('!play') || userMessage.startsWith('!mp3') || userMessage.startsWith('!ytmp3') || userMessage.startsWith('!song'):
                await songCommand(sock, chatId, message);
                break;
            case userMessage.startsWith('!video') || userMessage.startsWith('!ytmp4'):
                await videoCommand(sock, chatId, message);
                break;
            case userMessage.startsWith('!tiktok') || userMessage.startsWith('!tt'):
                await tiktokCommand(sock, chatId, message);
                break;
            case userMessage.startsWith('!gpt') || userMessage.startsWith('!gemini'):
                await aiCommand(sock, chatId, message);
                break;
            case userMessage.startsWith('!translate') || userMessage.startsWith('!trt'):
                await handleTranslateCommand(sock, chatId, message, userMessage.slice(userMessage.startsWith('!translate') ? 10 : 4));
                return;
            case userMessage.startsWith('!ss') || userMessage.startsWith('!ssweb') || userMessage.startsWith('!screenshot'):
                await handleSsCommand(sock, chatId, message, userMessage.slice(userMessage.startsWith('!screenshot') ? 11 : (userMessage.startsWith('!ssweb') ? 6 : 3)).trim());
                break;
            case userMessage.startsWith('!areact') || userMessage.startsWith('!autoreact') || userMessage.startsWith('!autoreaction'):
                await handleAreactCommand(sock, chatId, message, isOwnerOrSudoCheck);
                break;
            case userMessage.startsWith('!sudo'):
                await sudoCommand(sock, chatId, message);
                break;
            case userMessage === '!goodnight' || userMessage === '!lovenight' || userMessage === '!gn':
                await goodnightCommand(sock, chatId, message);
                break;
            case userMessage === '!shayari' || userMessage === '!shayri':
                await shayariCommand(sock, chatId, message);
                break;
            case userMessage === '!roseday':
                await rosedayCommand(sock, chatId, message);
                break;
            case userMessage.startsWith('!imagine') || userMessage.startsWith('!flux') || userMessage.startsWith('!dalle'):
                await imagineCommand(sock, chatId, message);
                break;
            case userMessage === '!jid':
                await groupJidCommand(sock, chatId, message);
                break;
            case userMessage.startsWith('!autotyping'):
                await autotypingCommand(sock, chatId, message);
                commandExecuted = true;
                break;
            case userMessage.startsWith('!autoread'):
                await autoreadCommand(sock, chatId, message);
                commandExecuted = true;
                break;
            case userMessage.startsWith('!heart'):
                await handleHeart(sock, chatId, message);
                break;
            case userMessage.startsWith('!horny'):
            case userMessage.startsWith('!circle'):
            case userMessage.startsWith('!lgbt'):
            case userMessage.startsWith('!lolice'):
            case userMessage.startsWith('!simpcard'):
            case userMessage.startsWith('!tonikawa'):
            case userMessage.startsWith('!its-so-stupid'):
            case userMessage.startsWith('!namecard'):
            case userMessage.startsWith('!tweet'):
            case userMessage.startsWith('!ytcomment'):
            case userMessage.startsWith('!comrade'):
            case userMessage.startsWith('!gay'):
            case userMessage.startsWith('!glass'):
            case userMessage.startsWith('!jail'):
            case userMessage.startsWith('!passed'):
            case userMessage.startsWith('!triggered'):
                await miscCommand(sock, chatId, message, [userMessage.slice(1).split(' ')[0], ...userMessage.trim().split(/\s+/).slice(1)]);
                break;
            case userMessage.startsWith('!oogway2'):
            case userMessage.startsWith('!oogway'):
                await miscCommand(sock, chatId, message, [userMessage.startsWith('!oogway2') ? 'oogway2' : 'oogway', ...userMessage.trim().split(/\s+/).slice(1)]);
                break;
            case userMessage.startsWith('!animu'):
                await animeCommand(sock, chatId, message, userMessage.trim().split(/\s+/).slice(1));
                break;
            case userMessage.startsWith('!nom'):
            case userMessage.startsWith('!poke'):
            case userMessage.startsWith('!cry'):
            case userMessage.startsWith('!kiss'):
            case userMessage.startsWith('!pat'):
            case userMessage.startsWith('!hug'):
            case userMessage.startsWith('!wink'):
            case userMessage.startsWith('!facepalm'):
            case userMessage.startsWith('!face-palm'):
            case userMessage.startsWith('!animuquote'):
            case userMessage.startsWith('!quote'):
            case userMessage.startsWith('!loli'):
                let subAnimu = userMessage.trim().split(/\s+/)[0].slice(1);
                if (subAnimu === 'facepalm') subAnimu = 'face-palm';
                if (subAnimu === 'animuquote') subAnimu = 'quote';
                await animeCommand(sock, chatId, message, [subAnimu]);
                break;
            case userMessage === '!crop':
                await stickercropCommand(sock, chatId, message);
                commandExecuted = true;
                break;
            case userMessage.startsWith('!pies'):
                await piesCommand(sock, chatId, message, rawText.trim().split(/\s+/).slice(1));
                commandExecuted = true;
                break;
            case userMessage === '!china':
            case userMessage === '!indonesia':
            case userMessage === '!japan':
            case userMessage === '!korea':
            case userMessage === '!india':
            case userMessage === '!malaysia':
            case userMessage === '!thailand':
                await piesAlias(sock, chatId, message, userMessage.slice(1));
                commandExecuted = true;
                break;
            case userMessage.startsWith('!update'):
                await updateCommand(sock, chatId, message, rawText.trim().split(/\s+/)[1]?.startsWith('http') ? rawText.trim().split(/\s+/)[1] : '');
                commandExecuted = true;
                break;
            case userMessage.startsWith('!removebg') || userMessage.startsWith('!rmbg') || userMessage.startsWith('!nobg'):
                await removebgCommand.exec(sock, message, userMessage.split(' ').slice(1));
                break;
            case userMessage.startsWith('!remini') || userMessage.startsWith('!enhance') || userMessage.startsWith('!upscale'):
                await reminiCommand(sock, chatId, message, userMessage.split(' ').slice(1));
                break;
            case userMessage.startsWith('!sora'):
                await soraCommand(sock, chatId, message);
                break;
            default:
                if (isGroup) {
                    if (userMessage) {
                        await handleChatbotResponse(sock, chatId, message, userMessage, senderId);
                    }
                    await handleTagDetection(sock, chatId, message, senderId);
                    await handleMentionDetection(sock, chatId, message);
                }
                commandExecuted = false;
                break;
        }

        if (commandExecuted !== false) {
            await showTypingAfterCommand(sock, chatId);
        }

        if (userMessage.startsWith('!')) {
            await addCommandReaction(sock, message);
        }
    } catch (error) {
        console.error('❌ Error in message handler:', error.message);
        if (chatId) {
            await sock.sendMessage(chatId, { text: '❌ Failed to process command!', ...channelInfo });
        }
    }
}

async function handleGroupParticipantUpdate(sock, update) {
    try {
        const { id, participants, action, author } = update;
        if (!id.endsWith('@g.us')) return;

        let isPublic = true;
        try {
            const modeData = JSON.parse(fs.readFileSync('./data/messageCount.json'));
            if (typeof modeData.isPublic === 'boolean') isPublic = modeData.isPublic;
        } catch (e) {}

        if (action === 'promote') {
            if (!isPublic) return;
            await handlePromotionEvent(sock, id, participants, author);
            return;
        }

        if (action === 'demote') {
            if (!isPublic) return;
            await handleDemotionEvent(sock, id, participants, author);
            return;
        }

        if (action === 'add') {
            await handleJoinEvent(sock, id, participants);
        }

        if (action === 'remove') {
            await handleLeaveEvent(sock, id, participants);
        }
    } catch (error) {
        console.error('Error in handleGroupParticipantUpdate:', error);
    }
}

module.exports = {
    handleMessages,
    handleGroupParticipantUpdate,
    handleStatus: async (sock, status) => {
        const { handleStatusUpdate } = require('./commands/autostatus');
        await handleStatusUpdate(sock, status);
    }
};
