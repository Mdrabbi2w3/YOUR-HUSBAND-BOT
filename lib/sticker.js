/**
 * YOUR HUSBAND BOT - Advanced Sticker Generation Platform Engine
 * Copyright (c) 2026 Professor
 * * This program is free software: you can redistribute it and/or modify
 * it under the terms of the MIT License.
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { spawn } = require('child_process');
const webp = require('node-webpmux');
const fetch = require('node-fetch');
const fluent_ffmpeg = require('fluent-ffmpeg');
const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);
const { writeExifImg } = require('./exif');

// Cross-Platform absolute directory orchestration fallback tracking paths
const tmp = path.join(process.cwd(), 'tmp');
if (!fs.existsSync(tmp)) {
    fs.mkdirSync(tmp, { recursive: true });
}

/**
 * Image to Sticker Pipeline (FFmpeg and GraphicsMagick Fallback Mode)
 * @param {Buffer} img Image Buffer
 * @param {String} url Image URL
 */
function sticker2(img, url) {
  return new Promise(async (resolve, reject) => {
    try {
      if (url) {
        let res = await fetch(url);
        if (res.status !== 200) throw new Error(await res.text());
        img = await res.buffer();
      }
      let inp = path.join(tmp, `${Date.now()}_s2.jpeg`);
      await fs.promises.writeFile(inp, img);
      
      let ff = spawn('ffmpeg', [
        '-y',
        '-i', inp,
        '-vf', 'scale=512:512:flags=lanczos:force_original_aspect_ratio=decrease,format=rgba,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=#00000000,setsar=1',
        '-f', 'png',
        '-'
      ]);
      
      ff.on('error', reject);
      ff.on('close', async () => {
        try { if (fs.existsSync(inp)) await fs.promises.unlink(inp); } catch (e) {}
      });
      
      let bufs = [];
      const [_spawnprocess, ..._spawnargs] = [...(module.exports.support.gm ? ['gm'] : module.exports.magick ? ['magick'] : []), 'convert', 'png:-', 'webp:-'];
      let im = spawn(_spawnprocess, _spawnargs);
      
      im.stdout.on('data', chunk => bufs.push(chunk));
      ff.stdout.pipe(im.stdin);
      
      im.on('exit', () => {
        resolve(Buffer.concat(bufs));
      });
      im.on('error', reject);
    } catch (e) {
      reject(e);
    }
  });
}

/**
 * Image/Video to Sticker (External Service Integration Mapping API fallback)
 * @param {Buffer} img Image/Video Buffer
 * @param {String} url Image/Video URL
 * @param {String} packname EXIF Packname
 * @param {String} author EXIF Author
 */
async function sticker3(img, url, packname, author) {
  try {
    url = url ? url : '';
    let res = await fetch('https://api.xteam.xyz/sticker/wm?' + new URLSearchParams(Object.entries({
      url,
      packname,
      author
    })));
    return await res.buffer();
  } catch (err) {
    console.error('❌ Service API Error in sticker3 layer:', err.message);
    return img;
  }
}

/**
 * Image to Sticker (Inline Native FFmpeg Stream Configuration Router)
 * @param {Buffer} img Image/Video Buffer
 * @param {String} url Image/Video URL
 */
async function sticker4(img, url) {
  if (url) {
    let res = await fetch(url);
    if (res.status !== 200) throw new Error(await res.text());
    img = await res.buffer();
  }
  return new Promise((resolve, reject) => {
    const inputPath = path.join(tmp, `${Date.now()}_s4.jpg`);
    const outputPath = path.join(tmp, `${Date.now()}_s4.webp`);
    
    fs.writeFileSync(inputPath, img);
    
    fluent_ffmpeg(inputPath)
      .outputOptions([
        '-vf', 'scale=512:512:flags=lanczos:force_original_aspect_ratio=decrease,format=rgba,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=#00000000,setsar=1'
      ])
      .toFormat('webp')
      .on('end', async () => {
        let result = fs.readFileSync(outputPath);
        try {
          if (fs.existsSync(inputPath)) await fs.promises.unlink(inputPath);
          if (fs.existsSync(outputPath)) await fs.promises.unlink(outputPath);
        } catch (e) {}
        resolve(result);
      })
      .on('error', async (err) => {
        try { if (fs.existsSync(inputPath)) await fs.promises.unlink(inputPath); } catch (e) {}
        reject(err);
      })
      .save(outputPath);
  });
}

/**
 * Dynamic Format Media Sticker Generation Processing Mapping
 * @param {string} img 
 * @param {string} url 
 */
function sticker6(img, url) {
  return new Promise(async (resolve, reject) => {
    try {
      if (url) {
        let res = await fetch(url);
        if (res.status !== 200) throw new Error(await res.text());
        img = await res.buffer();
      }
      
      // Fallback evaluation array mechanism for mime checks tracking
      let ext = 'png';
      let isVideo = false;
      
      if (img && img.length > 4) {
        if (img[0] === 0x1F && img[1] === 0x8B) ext = 'gz';
        else if (img[0] === 0x47 && img[1] === 0x49) ext = 'gif';
        else if (img[0] === 0xFF && img[1] === 0xD8) ext = 'jpg';
        else if (img[0] === 0x89 && img[1] === 0x50) ext = 'png';
        else if (img.toString('utf8', 8, 12) === 'WEBP') ext = 'webp';
        else if (img.toString('utf8', 4, 8) === 'ftyp') { ext = 'mp4'; isVideo = true; }
      }
      
      const tmpFile = path.join(tmp, `${Date.now()}_s6.${ext}`);
      const out = path.join(tmp, `${Date.now()}_s6_out.webp`);
      await fs.promises.writeFile(tmpFile, img);
      
      let Fffmpeg = isVideo ? fluent_ffmpeg(tmpFile).inputFormat(ext) : fluent_ffmpeg(tmpFile).input(tmpFile);
      Fffmpeg
        .on('error', async function (err) {
          try { if (fs.existsSync(tmpFile)) await fs.promises.unlink(tmpFile); } catch (e) {}
          reject(img);
        })
        .on('end', async function () {
          try {
            let bufferResult = await fs.promises.readFile(out);
            if (fs.existsSync(tmpFile)) await fs.promises.unlink(tmpFile);
            if (fs.existsSync(out)) await fs.promises.unlink(out);
            resolve(bufferResult);
          } catch (err) {
            reject(img);
          }
        })
        .addOutputOptions([
          `-vcodec`, `libwebp`, `-vf`,
          `scale='min(320,iw)':min'(320,ih)':force_original_aspect_ratio=decrease,fps=15, pad=320:320:-1:-1:color=white@0.0, split [a][b]; [a] palettegen=reserve_transparent=on:transparency_color=ffffff [p]; [b][p] paletteuse`
        ])
        .toFormat('webp')
        .save(out);
    } catch (e) {
      reject(img);
    }
  });
}

/**
 * Add WhatsApp Specific JSON Exif Structural Metadata Object
 */
async function addExif(webpSticker, packname, author, categories = [''], extra = {}) {
  try {
    const img = new webp.Image();
    const stickerPackId = crypto.randomBytes(32).toString('hex');
    const json = { 'sticker-pack-id': stickerPackId, 'sticker-pack-name': packname, 'sticker-pack-publisher': author, 'emojis': categories, ...extra };
    let exifAttr = Buffer.from([0x49, 0x49, 0x2A, 0x00, 0x08, 0x00, 0x00, 0x00, 0x01, 0x00, 0x41, 0x57, 0x07, 0x00, 0x00, 0x00, 0x00, 0x00, 0x16, 0x00, 0x00, 0x00]);
    let jsonBuffer = Buffer.from(JSON.stringify(json), 'utf8');
    let exif = Buffer.concat([exifAttr, jsonBuffer]);
    exif.writeUIntLE(jsonBuffer.length, 14, 4);
    await img.load(webpSticker);
    img.exif = exif;
    return await img.save(null);
  } catch (error) {
    console.error('❌ Exif Injection sequence validation error:', error.message);
    return webpSticker;
  }
}

/**
 * Convert media to WebP via localized fallback image processor mapping
 */
async function sticker(isImage, url, packname, author) {
    try {
        const response = await fetch(url);
        const buffer = await response.buffer();
        
        const stickerBuffer = await writeExifImg(buffer, {
            packname: packname || 'YOUR HUSBAND BOT',
            author: author || '@bot'
        });
        
        return stickerBuffer;
    } catch (error) {
        console.error('❌ Error executing root sticker creation pipeline processing:', error);
        return null;
    }
}

const support = {
  ffmpeg: true,
  ffprobe: true,
  ffmpegWebp: true,
  convert: true,
  magick: false,
  gm: false,
  find: false
};

module.exports = {
  sticker,
  sticker2,
  sticker3,
  sticker4,
  sticker6,
  addExif,
  support
};

