
const fetch = require('node-fetch');

const BASE = 'https://api.shizo.top/pies';
const VALID_COUNTRIES = [
    'india',
    'malaysia',
    'thailand',
    'china',
    'indonesia',
    'japan',
    'korea',
    'vietnam'
];

async function fetchPiesImageBuffer(country) {
    const url = `${BASE}/${country}?apikey=shizo`;

    const res = await fetch(url);

    if (!res.ok) {
        throw new Error(`HTTP Error: ${res.status}`);
    }

    const contentType = res.headers.get('content-type') || '';

    if (!contentType.includes('image')) {
        throw new Error('Invalid image response from API');
    }

    return Buffer.from(await res.arrayBuffer());
}

async function piesCommand(sock, chatId, message, args) {
    try {
        const country = (args?.[0] || '').toLowerCase();

        if (!country) {
            return await sock.sendMessage(chatId, {
                text: `📌 Usage: .pies <country>\n\n🌍 Countries: ${VALID_COUNTRIES.join(', ')}`
            }, { quoted: message });
        }

        if (!VALID_COUNTRIES.includes(country)) {
            return await sock.sendMessage(chatId, {
                text: `❌ Unsupported country: ${country}\n\n✔️ Try: ${VALID_COUNTRIES.join(', ')}`
            }, { quoted: message });
        }

        const imageBuffer = await fetchPiesImageBuffer(country);

        return await sock.sendMessage(chatId, {
            image: imageBuffer,
            caption: `🥧 Pies result: *${country.toUpperCase()}*`
        }, { quoted: message });

    } catch (err) {
        console.error('piesCommand error:', err);

        return await sock.sendMessage(chatId, {
            text: '❌ Failed to fetch pies image. Try again later.'
        }, { quoted: message });
    }
}

async function piesAlias(sock, chatId, message, country) {
    try {
        const c = country?.toLowerCase();

        if (!VALID_COUNTRIES.includes(c)) {
            return await sock.sendMessage(chatId, {
                text: `❌ Invalid country.`
            }, { quoted: message });
        }

        const imageBuffer = await fetchPiesImageBuffer(c);

        return await sock.sendMessage(chatId, {
            image: imageBuffer,
            caption: `🥧 Pies: ${c}`
        }, { quoted: message });

    } catch (err) {
        console.error(`piesAlias error (${country}):`, err);

        return await sock.sendMessage(chatId, {
            text: '❌ Failed to fetch image.'
        }, { quoted: message });
    }
}

module.exports = { piesCommand, piesAlias, VALID_COUNTRIES };
