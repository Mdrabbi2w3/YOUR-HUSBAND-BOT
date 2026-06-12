const eightBallResponses = [
    "Yes, definitely!",
    "No way!",
    "Ask again later.",
    "It is certain.",
    "Very doubtful.",
    "Without a doubt.",
    "My reply is no.",
    "Signs point to yes.",
    "Absolutely yes!",
    "I don't think so."
];

async function eightBallCommand(sock, chatId, message) {
    try {
        const text =
            message.message?.conversation ||
            message.message?.extendedTextMessage?.text ||
            "";

        const question = text.split(" ").slice(1).join(" ").trim();

        if (!question) {
            await sock.sendMessage(chatId, {
                text: "🎱 Please ask a question!\nExample: .8ball will I be successful?"
            });
            return;
        }

        const randomResponse =
            eightBallResponses[Math.floor(Math.random() * eightBallResponses.length)];

        await sock.sendMessage(chatId, {
            text: `🎱 *Question:* ${question}\n\n💬 *Answer:* ${randomResponse}`
        });

    } catch (error) {
        console.error("8ball error:", error);
        await sock.sendMessage(chatId, {
            text: "❌ Error occurred. Try again!"
        });
    }
}

module.exports = { eightBallCommand };
