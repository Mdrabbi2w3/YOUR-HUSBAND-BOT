const fs = require('fs');
const path = require('path');
const isOwnerOrSudo = require('../lib/isOwner');

// Function to clear a single directory
function clearDirectory(dirPath) {
    try {
        if (!fs.existsSync(dirPath)) {
            return { success: false, message: `Directory does not exist: ${dirPath}` };
        }

        const files = fs.readdirSync(dirPath);
        let deletedCount = 0;

        for (const file of files) {
            try {
                const filePath = path.join(dirPath, file);
                const stat = fs.lstatSync(filePath);

                if (stat.isDirectory()) {
                    fs.rmSync(filePath, { recursive: true, force: true });
                } else {
                    fs.unlinkSync(filePath);
                }

                deletedCount++;
            } catch (err) {
                console.error(`Error deleting file ${file}:`, err);
            }
        }

        return {
            success: true,
            message: `Cleared ${deletedCount} files in ${path.basename(dirPath)}`,
            count: deletedCount
        };

    } catch (error) {
        console.error('Error in clearDirectory:', error);
        return {
            success: false,
            message: `Failed to clear files in ${path.basename(dirPath)}`,
            error: error.message
        };
    }
}

// Function to clear both tmp and temp directories
async function clearTmpDirectory() {
    const tmpDir = path.join(process.cwd(), 'tmp');
    const tempDir = path.join(process.cwd(), 'temp');

    const results = [
        clearDirectory(tmpDir),
        clearDirectory(tempDir)
    ];

    const success = results.every(r => r.success);
    const totalDeleted = results.reduce((sum, r) => sum + (r.count || 0), 0);
    const message = results.map(r => r.message).join(' | ');

    return { success, message, count: totalDeleted };
}

// Command handler
async function clearTmpCommand(sock, chatId, msg) {
    try {
        const senderId = msg.key.participant || msg.key.remoteJid;
        const isOwner = await isOwnerOrSudo(senderId, sock, chatId);

        if (!msg.key.fromMe && !isOwner) {
            await sock.sendMessage(chatId, {
                text: '❌ This command is only available for the owner!'
            });
            return;
        }

        const result = await clearTmpDirectory();

        await sock.sendMessage(chatId, {
            text: result.success
                ? `✅ ${result.message}`
                : `❌ ${result.message}`
        });

    } catch (error) {
        console.error('Error in cleartmp command:', error);
        await sock.sendMessage(chatId, {
            text: '❌ Failed to clear temporary files!'
        });
    }
}

// Auto clear every 6 hours
function startAutoClear() {
    clearTmpDirectory().catch(console.error);

    setInterval(async () => {
        try {
            const result = await clearTmpDirectory();
            if (!result.success) {
                console.error(`[Auto Clear] ${result.message}`);
            }
        } catch (err) {
            console.error('[Auto Clear Error]', err);
        }
    }, 6 * 60 * 60 * 1000);
}

startAutoClear();

module.exports = clearTmpCommand;
