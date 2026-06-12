const { channelInfo } = require('../lib/messageConfig');

async function characterCommand(sock, chatId, message) {
    try {
        let userToAnalyze;

        const context = message.message?.extendedTextMessage?.contextInfo;

        userToAnalyze =
            context?.mentionedJid?.[0] ||
            context?.participant;

        if (!userToAnalyze) {
            return await sock.sendMessage(chatId, {
                text: '⚠️ Mention or reply to someone to analyze!',
                ...channelInfo
            }, { quoted: message });
        }

        /* ---------------- PROFILE PIC ---------------- */

        let profilePic;
        try {
            profilePic = await sock.profilePictureUrl(userToAnalyze, 'image');
        } catch {
            profilePic = 'https://i.imgur.com/2wzGhpF.jpeg';
        }

        /* ---------------- TRAITS ---------------- */

        const traits = [
            "Intelligent", "Creative", "Determined", "Ambitious", "Caring",
            "Charismatic", "Confident", "Empathetic", "Energetic", "Friendly",
            "Generous", "Honest", "Humorous", "Imaginative", "Independent",
            "Intuitive", "Kind", "Logical", "Loyal", "Optimistic",
            "Passionate", "Patient", "Persistent", "Reliable", "Resourceful",
            "Sincere", "Thoughtful", "Understanding", "Versatile", "Wise"
        ];

        /* ---------------- UNIQUE RANDOM PICK ---------------- */

        const shuffled = traits.sort(() => 0.5 - Math.random());
        const selectedTraits = shuffled.slice(0, Math.floor(Math.random() * 3) + 3);

        const traitText = selectedTraits.map(t => {
            const percent = Math.floor(Math.random() * 31) + 70; // 70–100
            return `• ${t}: ${percent}%`;
        }).join('\n');

        /* ---------------- RESULT ---------------- */

        const overall = Math.floor(Math.random() * 21) + 80;

        const caption =
`🔮 *Character Analysis*

👤 User: @${userToAnalyze.split('@')[0]}

✨ Traits:
${traitText}

🎯 Overall: ${overall}%

⚠️ This is just for fun 😄`;

        await sock.sendMessage(chatId, {
            image: { url: profilePic },
            caption,
            mentions: [userToAnalyze],
            ...channelInfo
        });

    } catch (err) {
        console.error('[CHARACTER ERROR]', err);
        await sock.sendMessage(chatId, {
            text: '❌ Failed to analyze character',
            ...channelInfo
        });
    }
}

module.exports = characterCommand;
