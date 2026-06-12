const fetch = require('node-fetch');

async function handleSsCommand(sock, chatId, message, match) {
    if (!match) {
        await sock.sendMessage(chatId, {
            text: `✨ *YOUR HUSBAND BOT* ✨\n\n*SCREENSHOT TOOL*\n\n*!ss <url>*\n*!ssweb <url>*\n*!screenshot <url>*\n\nTake a screenshot of any website\n\n*Example:*\n!ss https://google.com\n\n*Powered by RABBI*`,
            quoted: message
        });
        return;
    }

    try {
        // Show processing reaction
        await sock.sendMessage(chatId, { react: { text: '📸', key: message.key } });

        // Extract URL from command
        const url = match.trim();
        
        // Validate URL
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            return sock.sendMessage(chatId, {
                text: '❌ *YOUR HUSBAND BOT* ❌\n\nPlease provide a valid URL starting with http:// or https://',
                quoted: message
            });
        }

        // Call the API
        const apiUrl = `https://api.siputzx.my.id/api/tools/ssweb?url=${encodeURIComponent(url)}&theme=light&device=desktop`;
        const response = await fetch(apiUrl, { headers: { 'accept': '*/*' } });
        
        if (!response.ok) {
            throw new Error(`API responded with status: ${response.status}`);
        }

        // Get the image buffer
        const imageBuffer = await response.buffer();

        // Send the screenshot
        await sock.sendMessage(chatId, {
            image: imageBuffer,
            caption: `📸 *Screenshot Captured Successfully!*\n\n✨ *YOUR HUSBAND BOT* | *RABBI*`
        }, {
            quoted: message
        });

    } catch (error) {
        console.error('❌ Error in ss command:', error);
        await sock.sendMessage(chatId, {
            text: '❌ *YOUR HUSBAND BOT* ❌\n\nFailed to take screenshot. Please try again in a few minutes.\n\n*Possible reasons:*\n• Invalid URL\n• Website is down\n• API service error',
            quoted: message
        });
    }
}

module.exports = {
    handleSsCommand
};
