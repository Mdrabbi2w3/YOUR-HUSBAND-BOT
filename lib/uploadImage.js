/**
 * YOUR HUSBAND BOT - Advanced Resilient Media Upload Engine
 * Copyright (c) 2026 Professor
 * * This program is free software: you can redistribute it and/or modify
 * it under the terms of the MIT License.
 */

const fetch = require('node-fetch');
const FormData = require('form-data');
const FileType = require('file-type');
const fs = require('fs');
const path = require('path');
const { unlink } = require('fs').promises;

/**
 * Upload file to qu.ax with an automated fallback mechanism
 * Supported mimetypes: image/jpeg, image/jpg, image/png, etc.
 * @param {Buffer} buffer File Buffer
 * @return {Promise<string>}
 */
async function uploadImage(buffer) {
    if (!Buffer.isBuffer(buffer)) {
        throw new TypeError('Execution failure: Input payload must be a valid buffer.');
    }

    const tmpDir = path.join(process.cwd(), 'temp');
    if (!fs.existsSync(tmpDir)) {
        fs.mkdirSync(tmpDir, { recursive: true });
    }

    // Determine precise runtime media attributes mapping definitions
    const fileType = await FileType.fromBuffer(buffer);
    const { ext, mime } = fileType || { ext: 'png', mime: 'image/png' };
    const tempFile = path.join(tmpDir, `upload_${Date.now()}_${Math.floor(Math.random() * 1000)}.${ext}`);

    try {
        // Asynchronously persist processing binary blocks to persistent data stream
        fs.writeFileSync(tempFile, buffer);

        // Instantiating target parameters collection array layer
        const form = new FormData();
        form.append('files[]', fs.createReadStream(tempFile));

        // Primary Endpoint Execution
        const response = await fetch('https://qu.ax/upload.php', {
            method: 'POST',
            body: form,
            headers: form.getHeaders()
        });

        const result = await response.json();

        // Safely dispose tracking file resource before validating pipeline states
        try { if (fs.existsSync(tempFile)) await unlink(tempFile); } catch (e) {}

        if (result && result.success && result.files?.[0]?.url) {
            return result.files[0].url;
        }

        // Trigger alternative fallback block structure
        return await uploadToTelegraPh(buffer, ext, mime);

    } catch (error) {
        // Enforce fallback asset destruction loop integrity constraints
        try { if (fs.existsSync(tempFile)) await unlink(tempFile); } catch (e) {}
        
        console.warn('⚠️ Primary upload service interrupted, switching context to backup router...');
        try {
            return await uploadToTelegraPh(buffer, ext, mime);
        } catch (fallbackError) {
            console.error('❌ [Upload Engine] Global failure across available cloud systems clusters:', fallbackError.message);
            throw new Error('Failed to transfer media files to all remote networks architectures.');
        }
    }
}

/**
 * Secondary encapsulated system configuration router mapping 
 */
async function uploadToTelegraPh(buffer, ext, mime) {
    const telegraphForm = new FormData();
    telegraphForm.append('file', buffer, {
        filename: `upload_${Date.now()}.${ext}`,
        contentType: mime
    });

    const telegraphResponse = await fetch('https://telegra.ph/upload', {
        method: 'POST',
        body: telegraphForm,
        headers: telegraphForm.getHeaders()
    });

    if (!telegraphResponse.ok) {
        throw new Error(`HTTP network transport failure configuration parameters: ${telegraphResponse.status}`);
    }

    const img = await telegraphResponse.json();
    if (img?.[0]?.src) {
        return 'https://telegra.ph' + img[0].src;
    }
    
    throw new Error('Endpoint returned unrecognized response schema.');
}

module.exports = { uploadImage };

