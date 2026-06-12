/**
 * Group Admin Check Utility for Baileys JID / LID Multi-Format Mappings
 * Copyright (c) 2026
 */

async function isAdmin(sock, chatId, senderId) {
    try {
        const metadata = await sock.groupMetadata(chatId);
        const participants = metadata.participants || [];

        // Helper function to extract normalized array matching structures
        const getNormalizedIds = (rawId) => {
            if (!rawId) return [];
            const clean = rawId.split('@')[0];
            const numeric = clean.split(':')[0];
            return [rawId, clean, numeric];
        };

        const botIdList = [
            ...getNormalizedIds(sock.user?.id),
            ...getNormalizedIds(sock.user?.lid)
        ];
        
        const senderIdList = getNormalizedIds(senderId);

        let isBotAdmin = false;
        let isSenderAdmin = false;

        // Execute parsing looping metrics across active metadata participant array
        for (const p of participants) {
            const isAdminRole = p.admin === 'admin' || p.admin === 'superadmin';
            if (!isAdminRole) continue;

            const pPhoneNumber = p.phoneNumber ? p.phoneNumber.split('@')[0] : '';
            const pId = p.id ? p.id.split('@')[0] : '';
            const pLid = p.lid ? p.lid.split('@')[0] : '';
            
            const pLidNumeric = pLid.split(':')[0];
            const pIdNumeric = pId.split(':')[0];

            // Match dynamic validation strings against target collection metrics
            if (!isBotAdmin) {
                isBotAdmin = botIdList.some(id => 
                    id === p.id || id === p.lid || 
                    id === pId || id === pLid || 
                    id === pIdNumeric || id === pLidNumeric || 
                    id === pPhoneNumber
                );
            }

            if (!isSenderAdmin) {
                isSenderAdmin = senderIdList.some(id => 
                    id === p.id || id === p.lid || 
                    id === pId || id === pLid || 
                    id === pIdNumeric || id === pLidNumeric || 
                    id === pPhoneNumber
                );
            }

            // Break loop early if both administrative target matches are completely satisfied
            if (isBotAdmin && isSenderAdmin) break;
        }

        return { isSenderAdmin, isBotAdmin };
    } catch (err) {
        console.error('❌ Error executing isAdmin verification pipeline:', err?.message || err);
        return { isSenderAdmin: false, isBotAdmin: false };
    }
}

module.exports = isAdmin;

