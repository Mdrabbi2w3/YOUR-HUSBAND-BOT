const settings = require('../settings');
const fs = require('fs');
const path = require('path');

async function helpCommand(sock, chatId, message) {

    const helpMessage = `
╭━━━〔 🤖 *YOUR HUSBAND BOT* 〕━━━╮
┃ ✦ Version : ${settings.version || '3.0.0'}
┃ ✦ Owner   : RABBI
┃ ✦ Prefix  : !
╰━━━━━━━━━━━━━━━━━━━━━━╯

🔥 *MAIN MENU*

┏━━ 🌐 General ━━┓
┃ !help | !menu
┃ !ping | !alive
┃ !owner | !fact
┃ !joke | !quote
┃ !weather | !news
┃ !8ball | !groupinfo
┗━━━━━━━━━━━━━━━┛

┏━━ 👮 Admin ━━┓
┃ !promote | !demote
┃ !kick | !ban
┃ !warn | !delete
┃ !mute | !unmute
┃ !antilink | !antibadword
┃ !welcome | !goodbye
┗━━━━━━━━━━━━━━━┛

┏━━ 🎮 Games ━━┓
┃ !hangman
┃ !guess
┃ !tictactoe
┃ !truth | !dare
┗━━━━━━━━━━━━━━━┛

┏━━ 🎨 Media ━━┓
┃ !sticker
┃ !emojimix
┃ !removebg
┃ !meme
┃ !instagram
┃ !facebook
┗━━━━━━━━━━━━━━━┛

┏━━ 🤖 AI ━━┓
┃ !gpt
┃ !gemini
┃ !imagine
┃ !flux
┗━━━━━━━━━━━━━━━┛

┏━━ 🎯 Fun ━━┓
┃ !compliment
┃ !flirt
┃ !shayari
┃ !goodnight
┃ !insult
┗━━━━━━━━━━━━━━━┛

╭━━━━━━━━━━━━━━━━━━━━━━╮
┃ 🔗 GitHub:
┃ ${settings.github || 'https://github.com/Mdrabbi2w3/YOUR-HUSBAND-BOT.git'}
╰━━━━━━━━━━━━━━━━━━━━━━╯

💥 *Made with love by RABBI*
`;

    try {
        const imagePath = path.join(__dirname, '../assets/bot_image.jpg');

        if (fs.existsSync(imagePath)) {
            const imageBuffer = fs.readFileSync(imagePath);

            await sock.sendMessage(chatId, {
                image: imageBuffer,
                caption: helpMessage
            }, { quoted: message });

        } else {
            await sock.sendMessage(chatId, {
                text: helpMessage
            }, { quoted: message });
        }

    } catch (error) {
        console.error('Error in help command:', error);
        await sock.sendMessage(chatId, {
            text: helpMessage
        });
    }
}

module.exports = helpCommand;
