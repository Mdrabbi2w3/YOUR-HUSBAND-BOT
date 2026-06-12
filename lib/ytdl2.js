/ * YOUR HUSBAND BOT - Advanced Resilient YouTube Audio/Video Downloader Pipeline
 * Copyright (c) 2026 Professor
 * * This program is free software: you can redistribute it and/or modify
 * it under the terms of the MIT License.
 * * Credits:
 * - Baileys Library by @adiwajshing
 * - Pair Code implementation inspired by TechGod143 & DGXEON
 */

const ytdl = require('@distube/ytdl-core');
const yts = require('youtube-yts');
const readline = require('readline');
const ffmpeg = require('fluent-ffmpeg');
const NodeID3 = require('node-id3');
const fs = require('fs');
const { fetchBuffer } = require("./myfunc2");
const ytM = require('node-youtube-music');
const { randomBytes } = require('crypto');
const path = require('path');

const ytIdRegex = /(?:youtube\.com\/\S*(?:(?:\/e(?:mbed))?\/|watch\?(?:\S*?&?v\=))|youtu\.be\/)([a-zA-Z0-9_-]{6,11})/;

class YTDownloader {
    constructor() {
        // Uniform workspace asset extraction configuration layer initialization
        this.tmpDir = path.join(process.cwd(), 'temp');
        this.audioDir = path.join(process.cwd(), 'temp', 'audio');
        
        if (!fs.existsSync(this.tmpDir)) fs.mkdirSync(this.tmpDir, { recursive: true });
        if (!fs.existsSync(this.audioDir)) fs.mkdirSync(this.audioDir, { recursive: true });
    }

    /**
     * Checks if target string passes standard YouTube regex assertions
     * @param {string|URL} url target url
     * @returns {boolean}
     */
    isYTUrl(url) {
        return typeof url === 'string' && ytIdRegex.test(url);
    }

    /**
     * Extracts safe unique character alphanumeric resource ID mapping components
     * @param {string|URL} url 
     * @returns {string}
     */
    getVideoID(url) {
        if (!this.isYTUrl(url)) throw new Error('Input parameter structure is not a valid YouTube URL platform endpoint.');
        const match = ytIdRegex.exec(url);
        return match ? match[1] : '';
    }

    /**
     * High fidelity native multi-frame binary tag injector automation helper
     * @param {string} filePath 
     * @param {Object} Metadata 
     */
    async WriteTags(filePath, Metadata) {
        try {
            const bufferPayload = await fetchBuffer(Metadata.Image);
            const coverBuffer = bufferPayload?.buffer || bufferPayload;
            
            NodeID3.write(
                {
                    title: Metadata.Title,
                    artist: Metadata.Artist,
                    originalArtist: Metadata.Artist,
                    image: {
                        mime: 'image/jpeg',
                        type: { id: 3, name: 'front cover' },
                        imageBuffer: coverBuffer,
                        description: `Cover Art tracking for ${Metadata.Title}`,
                    },
                    album: Metadata.Album || 'YouTube Downloads',
                    year: Metadata.Year || String(new Date().getFullYear())
                },
                filePath
            );
        } catch (e) {
            console.warn('⚠️ [ID3 Tagger] Non-blocking metadata attribute insertion warning:', e.message);
        }
    }

    /**
     * Standard internal content engine tracking lookup arrays query method
     */
    async search(query, options = {}) {
        const search = await yts.search({ query, hl: 'id', gl: 'ID', ...options });
        return search?.videos || [];
    }

    /**
     * Comprehensive query platform extractor mappings for catalog arrays parsing
     * @param {string} query 
     */
    async searchTrack(query) {
        try {
            let ytMusic = await ytM.searchMusics(query);
            let result = [];
            for (let i = 0; i < ytMusic.length; i++) {
                const track = ytMusic[i];
                const artistList = track.artists?.map(x => x.name).join(', ') || 'Unknown Artist';
                result.push({
                    isYtMusic: true,
                    title: `${track.title} - ${artistList}`,
                    artist: artistList,
                    id: track.youtubeId,
                    url: 'https://youtu.be/' + track.youtubeId,
                    album: track.album || 'Single Track Release',
                    duration: {
                        seconds: track.duration?.totalSeconds || 0,
                        label: track.duration?.label || '0:00'
                    },
                    image: track.thumbnailUrl ? track.thumbnailUrl.replace('w120-h120', 'w600-h600') : ''
                });
            }
            return result;
        } catch (error) {
            console.error('❌ Error executing searchTrack sequence matrix:', error);
            // Dynamic operational extraction query mapping fallback routines
            const standardFallback = await this.search(query);
            return standardFallback.map(v => ({
                isYtMusic: false,
                title: v.title,
                artist: v.author.name,
                id: v.videoId,
                url: v.url,
                album: 'YouTube Media',
                duration: { seconds: v.seconds, label: v.timestamp },
                image: v.thumbnail
            }));
        }
    }

    /**
     * Integrated high definition media pipeline extractor parsing automation layout
     * @param {string|Array} query 
     */
    async downloadMusic(query) {
        const getTrack = Array.isArray(query) ? query : await this.searchTrack(query);
        if (!getTrack || getTrack.length === 0) throw new Error('Requested audio media entry catalog lookup yielded no targets.');
        
        const search = getTrack[0];
        const videoInfo = await ytdl.getInfo('https://www.youtube.com/watch?v=' + search.id);
        
        let stream = ytdl(search.id, { filter: 'audioonly', quality: 140 });
        let songPath = path.join(this.audioDir, `sync_${randomBytes(3).toString('hex')}.mp3`);

        const file = await new Promise((resolve, reject) => {
            ffmpeg(stream)
                .audioFrequency(44100)
                .audioChannels(2)
                .audioBitrate(128)
                .audioCodec('libmp3lame')
                .toFormat('mp3')
                .on('error', (err) => reject(err))
                .on('end', () => resolve(songPath))
                .save(songPath);
        });

        const releaseYear = videoInfo.videoDetails?.publishDate ? videoInfo.videoDetails.publishDate.split('-')[0] : '';
        await this.WriteTags(file, { 
            Title: search.title, 
            Artist: search.artist, 
            Image: search.image, 
            Album: search.album, 
            Year: releaseYear 
        });

        return {
            meta: search,
            path: file,
            size: fs.statSync(songPath).size
        };
    }

    /**
     * Resolves localized transport addresses rules matrix values maps
     */
    async mp4(query, quality = 134) {
        if (!query) throw new Error('Video identification parsing value parameters missing.');
        const videoId = this.isYTUrl(query) ? this.getVideoID(query) : query;
        
        const videoInfo = await ytdl.getInfo('https://www.youtube.com/watch?v=' + videoId);
        const format = ytdl.chooseFormat(videoInfo.formats, { format: quality, filter: 'videoandaudio' });
        
        return {
            title: videoInfo.videoDetails.title,
            thumb: videoInfo.videoDetails.thumbnails.slice(-1)[0],
            date: videoInfo.videoDetails.publishDate,
            duration: videoInfo.videoDetails.lengthSeconds,
            channel: videoInfo.videoDetails.ownerChannelName,
            quality: format.qualityLabel || 'Adaptive Quality Preset',
            contentLength: format.contentLength,
            description: videoInfo.videoDetails.description,
            videoUrl: format.url
        };
    }

    /**
     * Legacy terminal diagnostic tracker routing interface module parsing logic block
     */
    async mp3(url, metadata = {}, autoWriteTags = false) {
        if (!url) throw new Error('Target stream conversion address parameter missing.');
        const videoId = this.isYTUrl(url) ? this.getVideoID(url) : url;
        const completeUrl = 'https://www.youtube.com/watch?v=' + videoId;
        
        const { videoDetails } = await ytdl.getInfo(completeUrl);
        let stream = ytdl(completeUrl, { filter: 'audioonly', quality: 140 });
        let songPath = path.join(this.audioDir, `legacy_${randomBytes(3).toString('hex')}.mp3`);

        const file = await new Promise((resolve, reject) => {
            ffmpeg(stream)
                .audioFrequency(44100)
                .audioChannels(2)
                .audioBitrate(128)
                .audioCodec('libmp3lame')
                .toFormat('mp3')
                .on('error', (err) => reject(err))
                .on('end', () => resolve(songPath))
                .save(songPath);
        });

        if (Object.keys(metadata).length !== 0) {
            await this.WriteTags(file, metadata);
        } else if (autoWriteTags) {
            await this.WriteTags(file, { 
                Title: videoDetails.title, 
                Album: videoDetails.author?.name || 'YouTube Cloud', 
                Year: videoDetails.publishDate ? videoDetails.publishDate.split('-')[0] : '', 
                Image: videoDetails.thumbnails?.slice(-1)[0]?.url || '' 
            });
        }

        return {
            meta: {
                title: videoDetails.title,
                channel: videoDetails.author?.name || 'Unknown Channel Source',
                seconds: videoDetails.lengthSeconds,
                image: videoDetails.thumbnails?.slice(-1)[0]?.url || ''
            },
            path: file,
            size: fs.statSync(songPath).size
        };
    }

    /**
     * Encapsulated instance level alternative shortcut implementation
     * @param {string} url 
     */
    async fetchAudioInstance(url) {
        const info = await ytdl.getInfo(url);
        const fileName = `stream_${Date.now()}_out.mp3`;
        const filePath = path.join(this.tmpDir, fileName);

        return new Promise((resolve, reject) => {
            const stream = ytdl(url, { quality: 'highestaudio', filter: 'audioonly' });

            ffmpeg(stream)
                .audioBitrate(128)
                .toFormat('mp3')
                .on('error', (err) => reject(err))
                .on('end', () => {
                    resolve({
                        path: filePath,
                        meta: {
                            title: info.videoDetails.title,
                            thumbnail: info.videoDetails.thumbnails?.[0]?.url || ''
                        }
                    });
                })
                .save(filePath);
        });
    }
}

// Outbound system instantiation injection logic for YOUR HUSBAND BOT architectures
module.exports = new YTDownloader();

