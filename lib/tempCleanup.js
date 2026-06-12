/**
 * YOUR HUSBAND BOT - Automated Storage Temp Garbage Collector Utility
 * Copyright (c) 2026 Professor
 * * This program is free software: you can redistribute it and/or modify
 * it under the terms of the MIT License.
 */

const fs = require('fs');
const path = require('path');

/**
 * Utility function to recursively clean processing artifacts from temp folder
 */
function cleanupTempFiles() {
    const tempDir = path.join(process.cwd(), 'temp');
    
    if (!fs.existsSync(tempDir)) {
        try {
            fs.mkdirSync(tempDir, { recursive: true });
        } catch (e) {}
        return;
    }
    
    fs.readdir(tempDir, (err, files) => {
        if (err) {
            console.error('❌ [Garbage Collector] Error reading cache directory:', err.message);
            return;
        }
        
        if (files.length === 0) return;

        const now = Date.now();
        const maxAge = 3 * 60 * 60 * 1000; // 3 hours validation threshold tracking metrics
        let evaluatedFiles = 0;
        let deletedFilesCount = 0;
        
        files.forEach(file => {
            const filePath = path.join(tempDir, file);
            
            fs.stat(filePath, (statErr, stats) => {
                evaluatedFiles++;
                if (statErr) return;
                
                // Delete active target files older than defined expiry parameter
                if (now - stats.mtimeMs > maxAge) {
                    fs.unlink(filePath, (unlinkErr) => {
                        if (!unlinkErr) {
                            deletedFilesCount++;
                            console.log(`🧹 [Garbage Collector] Cleaned temp file: ${file}`);
                        }
                        
                        // Terminal diagnostic status summary update notification logging
                        if (evaluatedFiles === files.length && deletedFilesCount > 0) {
                            console.log(`✨ [Garbage Collector] Automated run completed. Disposed of ${deletedFilesCount} stale asset buffers.`);
                        }
                    });
                }
            });
        });
    });
}

// Execute inline memory purification script on service instantiation lifecycle routine
cleanupTempFiles();

// Establish asynchronous orchestration interval looping sequence every 1 hour
setInterval(cleanupTempFiles, 60 * 60 * 1000);

module.exports = { cleanupTempFiles };

