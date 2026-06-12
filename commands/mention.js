const fs = require('fs');
const path = require('path');
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');

function loadState() {
	try {
		const raw = fs.readFileSync(path.join(__dirname, '..', 'data', 'mention.json'), 'utf8');
		const state = JSON.parse(raw);

		if (
			state &&
			typeof state.assetPath === 'string' &&
			state.assetPath.endsWith('assets/mention_default.webp')
		) {
			return { enabled: !!state.enabled, assetPath: '', type: 'text' };
		}

		return state;
	} catch {
		return { enabled: false, assetPath: '', type: 'text' };
	}
}

function saveState(state) {
	fs.writeFileSync(
		path.join(__dirname, '..', 'data', 'mention.json'),
		JSON.stringify(state, null, 2)
	);
}

async function ensureDefaultSticker(state) {
	try {
		if (!state?.assetPath) return;

		const assetPath = path.join(__dirname, '..', state.assetPath);

		if (state.assetPath.endsWith('mention_default.webp') && !fs.existsSync(assetPath)) {
			const defaultStickerPath = path.join(__dirname, '..', 'assets', 'stickintro.webp');

			if (fs.existsSync(defaultStickerPath)) {
				fs.copyFileSync(defaultStickerPath, assetPath);
			} else {
				const assetsDir = path.dirname(assetPath);
				if (!fs.existsSync(assetsDir)) {
					fs.mkdirSync(assetsDir, { recursive: true });
				}
				fs.writeFileSync(assetPath.replace('.webp', '.txt'), 'Default mention sticker not available');
			}
		}
	} catch (e) {
		console.warn('ensureDefaultSticker failed:', e?.message || e);
	}
}

async function handleMentionDetection(sock, chatId, message) {
	try {
		if (message.key?.fromMe) return;

		const state = loadState();
		await ensureDefaultSticker(state);
		if (!state.enabled) return;

		const rawId = sock.user?.id || sock.user?.jid || '';
		if (!rawId) return;

		const botNum = rawId.split('@')[0].split(':')[0];

		const botJids = [
			`${botNum}@s.whatsapp.net`,
			`${botNum}@whatsapp.net`,
			rawId
		];

		const msg = message.message || {};

		const contexts = [
			msg.extendedTextMessage?.contextInfo,
			msg.imageMessage?.contextInfo,
			msg.videoMessage?.contextInfo,
			msg.documentMessage?.contextInfo,
			msg.stickerMessage?.contextInfo,
			msg.buttonsResponseMessage?.contextInfo,
			msg.listResponseMessage?.contextInfo
		].filter(Boolean);

		let mentioned = [];
		for (const c of contexts) {
			if (Array.isArray(c.mentionedJid)) {
				mentioned = mentioned.concat(c.mentionedJid);
			}
		}

		const directMentionLists = [
			msg.extendedTextMessage?.mentionedJid,
			msg.mentionedJid
		].filter(Array.isArray);

		for (const arr of directMentionLists) {
			mentioned = mentioned.concat(arr);
		}

		if (!mentioned.length) {
			const rawText = (
				msg.conversation ||
				msg.extendedTextMessage?.text ||
				msg.imageMessage?.caption ||
				msg.videoMessage?.caption ||
				''
			).toString();

			if (rawText) {
				const safeBot = botNum.replace(/[-\s]/g, '');

				// ✅ FIXED: regex bug (\b must be escaped properly)
				const re = new RegExp(`@?${safeBot}\\b`);

				if (!re.test(rawText.replace(/\s+/g, ''))) return;
			} else {
				return;
			}
		}

		const isBotMentioned = mentioned.some(j => botJids.includes(j));
		if (!isBotMentioned && mentioned.length) return;

		if (!state.assetPath) {
			await sock.sendMessage(chatId, { text: 'Hi' }, { quoted: message });
			return;
		}

		const assetPath = path.join(__dirname, '..', state.assetPath);

		if (!fs.existsSync(assetPath)) {
			await sock.sendMessage(chatId, { text: 'Hi' }, { quoted: message });
			return;
		}

		try {
			if (state.type === 'sticker') {
				return sock.sendMessage(chatId, {
					sticker: fs.readFileSync(assetPath)
				}, { quoted: message });
			}

			const payload = {};

			if (state.type === 'image') {
				payload.image = fs.readFileSync(assetPath);
			} else if (state.type === 'video') {
				payload.video = fs.readFileSync(assetPath);
				if (state.gifPlayback) payload.gifPlayback = true;
			} else if (state.type === 'audio') {
				payload.audio = fs.readFileSync(assetPath);
				payload.mimetype = state.mimetype || 'audio/mpeg';
				if (typeof state.ptt === 'boolean') payload.ptt = state.ptt;
			} else if (state.type === 'text') {
				payload.text = fs.readFileSync(assetPath, 'utf8');
			} else {
				payload.text = 'Hi';
			}

			await sock.sendMessage(chatId, payload, { quoted: message });
		} catch {
			await sock.sendMessage(chatId, { text: 'Hi' }, { quoted: message });
		}
	} catch (err) {
		console.error('handleMentionDetection error:', err);
	}
}

module.exports = { handleMentionDetection };
