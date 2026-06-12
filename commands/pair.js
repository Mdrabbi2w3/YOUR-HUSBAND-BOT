const axios = require('axios');
const { sleep } = require('../lib/myfunc');

async function pairCommand(sock, chatId, message, q) {
    try {
        if (!q) {
            return sock.sendMessage(chatId, {
                text: "📌 Example: .pair 8801761554035"
            }, { quoted: message });
        }

        // normalize number (Bangladesh support + remove + sign)
        const number = q.replace(/[^0-9]/g, '');

        if (number.length < 10 || number.length > 15) {
            return sock.sendMessage(chatId, {
                text: "❌ Invalid number format!\nExample: 8801761554035"
            }, { quoted: message });
        }

        const whatsappID = `${number}@s.whatsapp.net`;

        const result = await sock.onWhatsApp(whatsappID);

        if (!result?.[0]?.exists) {
            return sock.sendMessage(chatId, {
                text: "❌ This number is not registered on WhatsApp."
            }, { quoted: message });
        }

        await sock.sendMessage(chatId, {
            text: "⏳ Generating pairing code..."
        }, { quoted: message });

        try {
            const response = await axios.get(
                `https://knight-bot-paircode.onrender.com/code?number=${number}`
            );

            const code = response.data?.code;

            if (!code || code === "Service Unavailable") {
                throw new Error("Service Unavailable");
            }

            await sleep(5000);

            await sock.sendMessage(chatId, {
                text: `🔑 Your pairing code: *${code}*`
            }, { quoted: message });

        } catch (apiError) {
            console.error('API Error:', apiError.message);

            await sock.sendMessage(chatId, {
                text: "❌ Failed to generate pairing code. Try again later."
            }, { quoted: message });
        }

    } catch (error) {
        console.error('Pair command error:', error);

        await sock.sendMessage(chatId, {
            text: "❌ Something went wrong. Please try again."
        }, { quoted: message });
    }
}

module.exports = pairCommand;
