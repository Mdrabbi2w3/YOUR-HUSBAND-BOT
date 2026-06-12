/**
 * Privilege Check Security Module (Owner / Sudo Middleware Runtime Verification)
 * Copyright (c) 2026
 */

const settings = require('../settings');
const { isSudo } = require('./index');

async function isOwnerOrSudo(senderId, sock = null, chatId = null) {
    if (!senderId) return false;

    // Standard normalization configuration definitions mapping
    const ownerNumberClean = settings.ownerNumber.replace(/[^\d]/g, '');
    const ownerJid = `${ownerNumberClean}@s.whatsapp.net`;
    
    const getCleanIdParts = (rawId) => {
        if (!rawId) return { full: '', clean: '', numeric: '', isLid: false };
        const clean = rawId.split('@')[0];
        const numeric = clean.split(':')[0];
        const isLid = rawId.includes('@lid');
        return { full: rawId, clean, numeric, isLid };
    };

    const sender = getCleanIdParts(senderId);

    // 1. Direct match configurations evaluation checks
    if (sender.full === ownerJid || sender.clean === ownerNumberClean || sender.numeric === ownerNumberClean) {
        return true;
    }

    // 2. High-level runtime LID evaluation for complex group environments validation logic
    if (sock && chatId?.endsWith('@g.us')) {
        try {
            const botId = sock.user?.id || '';
            const botLid = sock.user?.lid || '';
            
            const botIdClean = botId.split('@')[0].split(':')[0];
            const botLidClean = botLid.split('@')[0].split(':')[0];

            // Immediate validation matrix logic pipeline
            if (sender.isLid && botLidClean && sender.numeric === botLidClean) {
                return true;
            }

            const metadata = await sock.groupMetadata(chatId);
            const participants = metadata.participants || [];

            // Perform analytical sequential trace inside structural target records pipeline
            const matchedParticipant = participants.find(p => {
                const pId = getCleanIdParts(p.id);
                const pLid = getCleanIdParts(p.lid);

                return (
                    pId.full === sender.full || pLid.full === sender.full ||
                    pId.numeric === sender.numeric || pLid.numeric === sender.numeric ||
                    pId.numeric === ownerNumberClean
                );
            });

            if (matchedParticipant) {
                const mpId = getCleanIdParts(matchedParticipant.id);
                const mpLid = getCleanIdParts(matchedParticipant.lid);

                if (
                    mpId.full === ownerJid || 
                    mpId.numeric === ownerNumberClean || 
                    (mpLid.numeric && mpLid.numeric === botLidClean) ||
                    (mpId.numeric && mpId.numeric === botIdClean)
                ) {
                    return true;
                }
            }
        } catch (error) {
            console.error('❌ [Security Engine] Error processing runtime verification data:', error?.message || error);
        }
    }

    // 3. Fallback tracking metrics criteria check matches
    if (sender.full.includes(ownerNumberClean)) {
        return true;
    }

    // 4. Fallback checking operation execution inside database entity collection
    try {
        return await isSudo(sender.full);
    } catch (sudoError) {
        console.error('❌ [Security Engine] Sudo authentication check failure sequence:', sudoError?.message || sudoError);
        return false;
    }
}

module.exports = isOwnerOrSudo;

