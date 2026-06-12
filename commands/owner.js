const settings = require('../settings');

async function ownerCommand(sock, chatId) {
    const ownerName = "RABBI";
    const botName = "YOUR HUSBAND";

    const vcard = `
BEGIN:VCARD
VERSION:3.0
FN:${ownerName}
ORG:${botName}
TEL;waid=${settings.ownerNumber}:${settings.ownerNumber}
END:VCARD
`;

    await sock.sendMessage(chatId, {
        contacts: {
            displayName: ownerName,
            contacts: [{ vcard }]
        }
    });
}

module.exports = ownerCommand;
