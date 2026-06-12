const axios = require('axios');

module.exports = async function (sock, chatId) {
    try {
        const apiKey = process.env.NEWS_API_KEY; // better than hardcoding

        const response = await axios.get(
            `https://newsapi.org/v2/top-headlines?country=us&apiKey=${apiKey}`
        );

        const articles = response.data?.articles || [];

        if (!articles.length) {
            return sock.sendMessage(chatId, {
                text: '❌ No news found right now.'
            });
        }

        const news = articles.slice(0, 5);

        let newsMessage = '📰 *Latest News*\n\n';

        news.forEach((article, i) => {
            const title = article?.title || 'No title';
            const desc = article?.description || 'No description available';

            newsMessage += `${i + 1}. *${title}*\n${desc}\n\n`;
        });

        // WhatsApp safe limit
        if (newsMessage.length > 3500) {
            newsMessage = newsMessage.slice(0, 3500) + '...';
        }

        await sock.sendMessage(chatId, {
            text: newsMessage
        });

    } catch (error) {
        console.error('Error fetching news:', error);

        await sock.sendMessage(chatId, {
            text: '❌ Sorry, I could not fetch news right now.'
        });
    }
};
