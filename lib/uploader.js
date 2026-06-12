
 * YOUR HUSBAND BOT - Multi-Provider File Upload & Conversion Utilities
 * Copyright (c) 2026 Professor
 * * This program is free software: you can redistribute it and/or modify
 * it under the terms of the MIT License.
 * * Credits:
 * - Baileys Library by @adiwajshing
 * - Pair Code implementation inspired by TechGod143 & DGXEON
 */

const axios = require('axios');
const BodyForm = require('form-data');
const { fromBuffer } = require('file-type');
const fetch = require('node-fetch');
const fs = require('fs');
const cheerio = require('cheerio');
const { unlink } = require('fs').promises;

/**
 * Upload local file asset to Telegra.ph storage layer
 * @param {String} Path Local file path
 */
function TelegraPh(Path) {
    return new Promise(async (resolve, reject) => {
        if (!fs.existsSync(Path)) return reject(new Error("File not Found on system storage"));
        try {
            const form = new BodyForm();
            form.append("file", fs.createReadStream(Path));
            const data = await axios({
                url: "https://telegra.ph/upload",
                method: "POST",
                headers: {
                    ...form.getHeaders()
                },
                data: form
            });
            return resolve("https://telegra.ph" + data.data[0].src);
        } catch (err) {
            return reject(new Error(String(err)));
        }
    });
}

/**
 * Upload local cache files to Uguu.se primary pipeline CDN
 * @param {String} input Local file path
 */
async function UploadFileUgu(input) {
    return new Promise(async (resolve, reject) => {
        if (!fs.existsSync(input)) return reject(new Error("Target asset not found for Uguu stream"));
        try {
            const form = new BodyForm();
            form.append("files[]", fs.createReadStream(input));
            const data = await axios({
                url: "https://uguu.se/upload.php",
                method: "POST",
                headers: {
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.212 Safari/537.36",
                    ...form.getHeaders()
                },
                data: form
            });
            resolve(data.data.files[0]);
        } catch (err) {
            reject(err);
        }
    });
}

/**
 * High-Performance WebP to MP4 multi-part remote scraper converter
 * @param {String} path Local path of the WebP asset file
 */
function webp2mp4File(path) {
    return new Promise((resolve, reject) => {
        if (!fs.existsSync(path)) return reject(new Error("WebP target missing for file transformation"));
        const form = new BodyForm();
        form.append('new-image-url', '');
        form.append('new-image', fs.createReadStream(path));
        
        axios({
            method: 'post',
            url: 'https://s6.ezgif.com/webp-to-mp4',
            data: form,
            headers: {
                'Content-Type': `multipart/form-data; boundary=${form._boundary}`
            }
        }).then(({ data }) => {
            const bodyFormThen = new BodyForm();
            const $ = cheerio.load(data);
            const file = $('input[name="file"]').attr('value');
            if (!file) return reject(new Error("Ezgif translation session failed to initialize token"));
            
            bodyFormThen.append('file', file);
            bodyFormThen.append('convert', "Convert WebP to MP4!");
            
            axios({
                method: 'post',
                url: 'https://ezgif.com/webp-to-mp4/' + file,
                data: bodyFormThen,
                headers: {
                    'Content-Type': `multipart/form-data; boundary=${bodyFormThen._boundary}`
                }
            }).then(({ data }) => {
                const $ = cheerio.load(data);
                const result = 'https:' + $('div#output > p.outfile > video > source').attr('src');
                resolve({
                    status: true,
                    message: "Created By YOUR HUSBAND BOT",
                    result: result
                });
            }).catch(reject);
        }).catch(reject);
    });
}

/**
 * Upload binary buffers to FloNime secondary cloud network
 * @param {Buffer} medianya File Buffer
 * @param {Object} options Configuration parameters overrides 
 */
async function floNime(medianya, options = {}) {
    try {
        const fileDetection = await fromBuffer(medianya);
        const ext = fileDetection?.ext || options.ext || 'bin';
        const form = new BodyForm();
        form.append('file', medianya, `tmp_${Date.now()}.${ext}`);
        
        let jsonnya = await fetch('https://flonime.my.id/upload', {
            method: 'POST',
            body: form,
            headers: form.getHeaders ? form.getHeaders() : undefined
        }).then((response) => response.json());
        
        return jsonnya;
    } catch (e) {
        console.error('❌ FloNime system upload runtime exception:', e.message);
        return { status: false, error: e.message };
    }
}

module.exports = { TelegraPh, UploadFileUgu, webp2mp4File, floNime };

