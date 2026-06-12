const insults = [
    "You're like a cloud. When you disappear, it's a beautiful day!",
    "I'd agree with you, but then we'd both be wrong.",
    "You're not stupid; you just have bad luck thinking.",
    "You're like a software update. Nobody wants you but you still show up.",
    "You're like a broken pencil—pointless.",
    "You're proof that even mistakes can become something.",
    "Your Wi-Fi signal energy is very weak.",
    "You're like a speed bump—annoying but unavoidable.",
    "You bring people together… to complain about you."
];

async function insultCommand(sock, chatId, message) {
    try {

        const ctx = message.message?.extendedTextMessage?.contextInfo;

        let user =
            ctx?.mentionedJid?.[0] ||
            ctx?.participant;

        if (!user) {
            return await sock.sendMessage(chatId, {
                text: "❌ Mention someone or reply to a message."
            }, { quoted: message });
        }

        const insult = insults[Math.floor(Math.random() * insults.length)];

        await sock.sendMessage(chatId, {
            text: `😂 @${user.split("@")[0]}, ${insult}`,
            mentions: [user]
        }, { quoted: message });

    } catch (err) {
        console.error("Insult error:", err);

        await sock.sendMessage(chatId, {
            text: "❌ Failed to send insult. Try again later."
        }, { quoted: message });
    }
}

module.exports = { insultCommand };
