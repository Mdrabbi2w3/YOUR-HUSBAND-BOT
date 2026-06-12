/**
 * YOUR HUSBAND BOT - Web Scraper & Media Utilities
 * Copyright (c) 2026 Professor
 * * This program is free software: you can redistribute it and/or modify
 * it under the terms of the MIT License.
 * * Credits:
 * - Baileys Library by @adiwajshing
 * - Pair Code implementation inspired by TechGod143 & DGXEON
 */

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });

const axios = require("axios");
const cheerio = require("cheerio");
const { resolve } = require("path");
const util = require("util");
let BodyForm = require('form-data');
let { fromBuffer } = require('file-type');
let fs = require('fs');
const path = require('path');
const child_process = require('child_process');
const ffmpeg = require('fluent-ffmpeg');

const { unlink } = require('fs').promises;

exports.sleep = async (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
};

exports.fetchJson = async (url, options = {}) => {
    try {
        const res = await axios({
            method: 'GET',
            url: url,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.4638.69 Safari/537.36'
            },
            ...options
        });
        return res.data;
    } catch (err) {
        return err;
    }
};

exports.fetchBuffer = async (url, options = {}) => {
    try {
        const res = await axios({
            method: "GET",
            url,
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.70 Safari/537.36",
                'DNT': 1,
                'Upgrade-Insecure-Request': 1
            },
            ...options,
            responseType: 'arraybuffer'
        });
        return res.data;
    } catch (err) {
        return err;
    }
};

exports.webp2mp4File = async (filePath) => {
    return new Promise((resolve, reject) => {
        if (!fs.existsSync(filePath)) return reject(new Error("WebP File not Found"));
        const form = new BodyForm();
        form.append('new-image-url', '');
        form.append('new-image', fs.createReadStream(filePath));
        
        axios({
            method: 'post',
            url: 'https://s6.ezgif.com/webp-to-mp4',
            data: form,
            headers: {
                ...form.getHeaders()
            }
        }).then(({ data }) => {
            const bodyFormThen = new BodyForm();
            const $ = cheerio.load(data);
            const file = $('input[name="file"]').attr('value');
            if (!file) return reject(new Error("Conversion session token not found from Ezgif"));
            
            bodyFormThen.append('file', file);
            bodyFormThen.append('convert', "Convert WebP to MP4!");
            
            axios({
                method: 'post',
                url: 'https://ezgif.com/webp-to-mp4/' + file,
                data: bodyFormThen,
                headers: {
                    ...bodyFormThen.getHeaders()
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
};

exports.fetchUrl = async (url, options = {}) => {
    try {
        const res = await axios({
            method: 'GET',
            url: url,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.4638.69 Safari/537.36'
            },
            ...options
        });
        return res.data;
    } catch (err) {
        return err;
    }
};

exports.WAVersion = async () => {
    let get = await exports.fetchUrl("https://web.whatsapp.com/check-update?version=1&platform=web");
    let version = [get.currentVersion.replace(/[.]/g, ", ")];
    return version;
};

exports.getRandom = (ext) => {
    return `${Math.floor(Math.random() * 10000)}${ext}`;
};

exports.isUrl = (url) => {
    return url.match(new RegExp(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/, 'gi'));
};

exports.isNumber = (number) => {
    const int = parseInt(number);
    return typeof int === 'number' && !isNaN(int);
};

exports.TelegraPh = (Path) => {
    return new Promise(async (resolve, reject) => {
        if (!fs.existsSync(Path)) return reject(new Error("File not Found"));
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
};

const sleepy = async (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
};

exports.buffergif = async (image) => {
    const tempDir = path.join(process.cwd(), 'temp');
    if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
    }

    const filename = `${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const gifPath = path.join(tempDir, `${filename}.gif`);
    const mp4Path = path.join(tempDir, `${filename}.mp4`);

    await fs.writeFileSync(gifPath, image);
    
    child_process.execSync(
        `ffmpeg -y -i "${gifPath}" -movflags faststart -pix_fmt yuv420p -vf "scale=trunc(iw/2)*2:trunc(ih/2)*2" "${mp4Path}"`
    );
    
    await sleepy(2000);
    
    let buffer5 = await fs.readFileSync(mp4Path);
    
    try {
        if (fs.existsSync(gifPath)) await unlink(gifPath);
        if (fs.existsSync(mp4Path)) await unlink(mp4Path);
    } catch (e) {
        // Soft catch if files are locked during execution
    }
    
    return buffer5;
};

