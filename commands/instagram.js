const { igdl } = require("ruhend-scraper");

// memory cleanup safe cache
const processedMessages = new Set();

function extractUniqueMedia(mediaData) {
    const seen = new Set();
    return mediaData.filter(m => {
        if (!m?.url) return false;
        if (seen.has(m.url)) return false;
        seen.add(m.url);
        return true;
    });
}

function isValidInstagramUrl(text = '') {
    return /https?:\/\/(www\.)?instagram\.com\//.test(text);
}

async function instagramCommand(sock, chatId, message) {
    try {

        // prevent duplicate processing
        const msgId = message.key?.id;
        if (processedMessages.has(msgId)) return;

        processedMessages.add(msgId);
        setTimeout(() => processedMessages.delete(msgId), 5 * 60 * 1000);

        const text =
            message.message?.conversation ||
            message.message?.extendedTextMessage?.text ||
            '';

        if (!text) {
            return await sock.sendMessage(chatId, {
                text: "❌ Please provide an Instagram link."
            }, { quoted: message });
        }

        if (!isValidInstagramUrl(text)) {
            return await sock.sendMessage(chatId, {
                text: "❌ Invalid Instagram link."
            }, { quoted: message });
        }

        await sock.sendMessage(chatId, {
            react: { text: "🔄", key: message.key }
        });

        const data = await igdl(text);

        if (!data?.data?.length) {
            return await sock.sendMessage(chatId, {
                text: "❌ No media found or post is private."
            }, { quoted: message });
        }

        const mediaList = extractUniqueMedia(data.data).slice(0, 15);

        for (const media of mediaList) {
            try {

                const url = media.url;
                const isVideo =
                    media.type === "video" ||
                    /\.(mp4|mov|mkv|webm)$/i.test(url);

                await sock.sendMessage(chatId, {
                    ...(isVideo
                        ? { video: { url }, mimetype: "video/mp4" }
                        : { image: { url } }
                    ),
                    caption: "📥 𝗗𝗢𝗪𝗡𝗟𝗢𝗔𝗗𝗘𝗗 𝗕𝗬 𝗬𝗢𝗨𝗥 𝗛𝗨𝗦𝗕𝗔𝗡𝗗 🤍"
                }, { quoted: message });

                await new Promise(r => setTimeout(r, 800));

            } catch (e) {
                console.error("Media error:", e);
            }
        }

    } catch (err) {
        console.error("Instagram command error:", err);
        await sock.sendMessage(chatId, {
            text: "❌ Failed to process Instagram link."
        }, { quoted: message });
    }
}

module.exports = instagramCommand;
