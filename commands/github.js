const moment = require('moment-timezone');
const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');
const settings = require('../settings');

async function githubCommand(sock, chatId, message) {
  try {
    const res = await fetch('https://api.github.com/repos/Mdrabbi2w3/YOUR-HUSBAND-BOT');

    if (!res.ok) throw new Error('GitHub API error');

    const json = await res.json();

    const txt =
`*乂 ${settings.botName} 乂*

✩ *Repo Name* : ${json.name}
✩ *Watchers* : ${json.watchers_count}
✩ *Size* : ${(json.size / 1024).toFixed(2)} MB
✩ *Last Updated* : ${moment(json.updated_at).format('DD/MM/YY - HH:mm:ss')}
✩ *URL* : ${json.html_url}
✩ *Forks* : ${json.forks_count}
✩ *Stars* : ${json.stargazers_count}

💥 *Owner:* ${settings.ownerName}`;

    const imgPath = path.join(__dirname, '../assets/bot_image.jpg');
    const imgBuffer = fs.readFileSync(imgPath);

    await sock.sendMessage(chatId, {
      image: imgBuffer,
      caption: txt
    }, { quoted: message });

  } catch (error) {
    console.error(error);

    await sock.sendMessage(chatId, {
      text: '❌ Error fetching repository information.'
    }, { quoted: message });
  }
}

module.exports = githubCommand;
