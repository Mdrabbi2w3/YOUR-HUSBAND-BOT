const axios = require('axios');

let triviaGames = {};

async function startTrivia(sock, chatId) {
    if (triviaGames[chatId]) {
        sock.sendMessage(chatId, { text: '❌ *YOUR HUSBAND TRIVIA* ❌\n\nA trivia quiz game is already in progress in this chat!' });
        return;
    }

    try {
        const response = await axios.get('https://opentdb.com/api.php?amount=1&type=multiple');
        const questionData = response.data.results[0];

        // Clean up HTML entities from API response if any
        const cleanString = (str) => str
            .replace(/&quot;/g, '"')
            .replace(/&#039;/g, "'")
            .replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>');

        const question = cleanString(questionData.question);
        const correctAnswer = cleanString(questionData.correct_answer);
        const options = [...questionData.incorrect_answers, questionData.correct_answer]
            .map(opt => cleanString(opt))
            .sort();

        triviaGames[chatId] = {
            question: question,
            correctAnswer: correctAnswer,
            options: options,
        };

        let optionsText = options.map((opt, index) => `${index + 1}️⃣ ${opt}`).join('\n');

        sock.sendMessage(chatId, {
            text: `🧠 *YOUR HUSBAND TRIVIA TIME* 🧠\n\n📝 *Question:*\n${question}\n\n🔢 *Options:*\n${optionsText}\n\n👉 _Type the exact correct answer to reply!_`
        });
    } catch (error) {
        console.error('Trivia fetch error:', error);
        sock.sendMessage(chatId, { text: '❌ *YOUR HUSBAND* \n\nError fetching trivia question. Please try again later.' });
    }
}

function answerTrivia(sock, chatId, answer) {
    if (!triviaGames[chatId]) {
        sock.sendMessage(chatId, { text: '❌ *YOUR HUSBAND* \n\nNo trivia game is active right now. Type *!trivia* to start one!' });
        return;
    }

    const game = triviaGames[chatId];

    if (answer.toLowerCase().trim() === game.correctAnswer.toLowerCase().trim()) {
        sock.sendMessage(chatId, { text: `🎉 *YOUR HUSBAND TRIVIA* 🎉\n\n✅ *Correct!* Excellent job. The answer is indeed: *${game.correctAnswer}*` });
    } else {
        sock.sendMessage(chatId, { text: `❌ *YOUR HUSBAND TRIVIA* ❌\n\n*Wrong Answer!* Better luck next time.\n🏁 The correct answer was: *${game.correctAnswer}*` });
    }

    delete triviaGames[chatId];
}

module.exports = { startTrivia, answerTrivia };
