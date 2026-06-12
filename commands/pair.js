const axios = require('axios');
const { sleep } = require('../lib/myfunc');

const BOT_NAME = 'YOUR HUSBAND';
const OWNER_NAME = 'RABBI';

async function pairCommand(sock, chatId, message, q) {
    try {
        if (!q) {
            return await sock.sendMessage(chatId, {
                text: `Please provide valid WhatsApp number\nExample: .pair 88017XXXXXXXX`,
                contextInfo: {
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: '120363161513685998@newsletter',
                        newsletterName: BOT_NAME,
                        serverMessageId: -1
                    }
                }
            });
        }

        const numbers = q.split(',')
            .map(v => v.replace(/[^0-9]/g, ''))
            .filter(v => v.length > 5 && v.length < 20);

        if (numbers.length === 0) {
            return await sock.sendMessage(chatId, {
                text: "❌ Invalid number! Please check format.",
                contextInfo: {
                    forwardedNewsletterMessageInfo: {
                        newsletterName: BOT_NAME
                    }
                }
            });
        }

        for (const number of numbers) {
            const jid = number + '@s.whatsapp.net';
            const result = await sock.onWhatsApp(jid);

            if (!result[0]?.exists) {
                return await sock.sendMessage(chatId, {
                    text: "❌ This number is not registered on WhatsApp!",
                    contextInfo: {
                        forwardedNewsletterMessageInfo: {
                            newsletterName: BOT_NAME
                        }
                    }
                });
            }

            await sock.sendMessage(chatId, {
                text: "⏳ Generating pairing code...",
                contextInfo: {
                    forwardedNewsletterMessageInfo: {
                        newsletterName: BOT_NAME
                    }
                }
            });

            const response = await axios.get(
                `https://github.com/Mdrabbi2w3/YOUR-HUSBAND-BOT.git}`
            );

            if (response.data?.code) {
                const code = response.data.code;

                if (code === "Service Unavailable") {
                    throw new Error("Service Unavailable");
                }

                await sleep(5000);

                await sock.sendMessage(chatId, {
                    text:
`🔑 Pairing Code: ${code}

🤖 Bot: ${BOT_NAME}
👤 Owner: ${OWNER_NAME}`,
                    contextInfo: {
                        forwardedNewsletterMessageInfo: {
                            newsletterName: BOT_NAME
                        }
                    }
                });
            } else {
                throw new Error("Invalid response");
            }
        }

    } catch (error) {
        console.error(error);
        await sock.sendMessage(chatId, {
            text: "❌ Failed to generate pairing code. Try again later.",
            contextInfo: {
                forwardedNewsletterMessageInfo: {
                    newsletterName: BOT_NAME
                }
            }
        });
    }
}

module.exports = pairCommand;
