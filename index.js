// File: index.js
const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Base URL untuk Otakudesu
const BASE_URL = 'https://otakudesu.cloud';

app.use(cors());

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    status: true,
    creator: "SiputzX",
    message: "Selamat datang di Anime API",
    endpoints: {
      ongoing: "/api/anime/otakudesu/ongoing",
      complete: "/api/anime/otakudesu/complete",
      search: "/api/anime/otakudesu/search/:query",
      detail: "/api/anime/otakudesu/detail/:endpoint"
    }
  });
});

// Ongoing anime endpoint
app.get('/api/anime/otakudesu/ongoing', async (req, res) => {
  try {
    const response = await axios.get(`${BASE_URL}/ongoing-anime/`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    const $ = cheerio.load(response.data);
    const animeList = [];

    $('.venz > ul > li').each((i, el) => {
      const title = $(el).find('h2.jdlflm').text().trim();
      const linkElement = $(el).find('.detpost .thumb a');
      const link = linkElement.attr('href');
      const endpoint = link ? link.replace(`${BASE_URL}/anime/`, '').replace('/', '') : '';
      
      const thumbnailElement = $(el).find('.detpost .thumb img');
      const thumbnail = thumbnailElement.attr('src');
      
      const episodeElement = $(el).find('.epz');
      const episode = episodeElement.text().trim();
      
      const dateElement = $(el).find('.newnime');
      const release_date = dateElement.text().trim();
      
      const genreElement = $(el).find('.genre');
      const genres_html = genreElement.html() || '';
      const genres = genres_html
        .replace(/<span>/g, '')
        .replace(/<\/span>/g, '')
        .replace(/&nbsp;/g, '')
        .split(',')
        .map(g => g.trim())
        .filter(g => g !== '');
      
      animeList.push({
        title,
        episode,
        thumbnail,
        endpoint,
        genres,
        release_date
      });
    });

    res.json({
      status: true,
      message: "success",
      result: animeList
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({
      status: false,
      message: "Failed to fetch data",
      error: error.message
    });
  }
});

// Complete anime endpoint
app.get('/api/anime/otakudesu/complete', async (req, res) => {
  try {
    const response = await axios.get(`${BASE_URL}/complete-anime/`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    const $ = cheerio.load(response.data);
    const animeList = [];

    $('.venz > ul > li').each((i, el) => {
      const title = $(el).find('h2.jdlflm').text().trim();
      const linkElement = $(el).find('.detpost .thumb a');
      const link = linkElement.attr('href');
      const endpoint = link ? link.replace(`${BASE_URL}/anime/`, '').replace('/', '') : '';
      
      const thumbnailElement = $(el).find('.detpost .thumb img');
      const thumbnail = thumbnailElement.attr('src');
      
      const episodeElement = $(el).find('.epz');
      const episode = episodeElement.text().trim();
      
      const dateElement = $(el).find('.newnime');
      const release_date = dateElement.text().trim();
      
      const genreElement = $(el).find('.genre');
      const genres_html = genreElement.html() || '';
      const genres = genres_html
        .replace(/<span>/g, '')
        .replace(/<\/span>/g, '')
        .replace(/&nbsp;/g, '')
        .split(',')
        .map(g => g.trim())
        .filter(g => g !== '');
      
      animeList.push({
        title,
        episode,
        thumbnail,
        endpoint,
        genres,
        release_date
      });
    });

    res.json({
      status: true,
      message: "success",
      result: animeList
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({
      status: false,
      message: "Failed to fetch data",
      error: error.message
    });
  }
});

// Search anime endpoint
app.get('/api/anime/otakudesu/search/:query', async (req, res) => {
  try {
    const query = req.params.query;
    const response = await axios.get(`${BASE_URL}/?s=${query}&post_type=anime`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    const $ = cheerio.load(response.data);
    const animeList = [];

    $('.chivsrc > li').each((i, el) => {
      const title = $(el).find('h2').text().trim();
      const linkElement = $(el).find('h2 a');
      const link = linkElement.attr('href');
      const endpoint = link ? link.replace(`${BASE_URL}/anime/`, '').replace('/', '') : '';
      
      const thumbnailElement = $(el).find('img');
      const thumbnail = thumbnailElement.attr('src');
      
      const genreElement = $(el).find('.set:contains("Genres")');
      const genreText = genreElement.text().replace('Genres:', '').trim();
      const genres = genreText.split(',').map(g => g.trim()).filter(g => g !== '');
      
      const statusElement = $(el).find('.set:contains("Status")');
      const status = statusElement.text().replace('Status:', '').trim();
      
      animeList.push({
        title,
        thumbnail,
        endpoint,
        genres,
        status
      });
    });

    res.json({
      status: true,
      message: "success",
      result: animeList
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({
      status: false,
      message: "Failed to fetch data",
      error: error.message
    });
  }
});

// Detail anime endpoint
app.get('/api/anime/otakudesu/detail/:endpoint', async (req, res) => {
  try {
    const endpoint = req.params.endpoint;
    const response = await axios.get(`${BASE_URL}/anime/${endpoint}/`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    const $ = cheerio.load(response.data);
    const animeDetail = {};
    const episodeList = [];

    // Detail anime
    animeDetail.title = $('.infozingle p:contains("Judul")').text().replace('Judul:', '').trim();
    animeDetail.japanese = $('.infozingle p:contains("Japanese")').text().replace('Japanese:', '').trim();
    animeDetail.score = $('.infozingle p:contains("Skor")').text().replace('Skor:', '').trim();
    animeDetail.producer = $('.infozingle p:contains("Produser")').text().replace('Produser:', '').trim();
    animeDetail.type = $('.infozingle p:contains("Tipe")').text().replace('Tipe:', '').trim();
    animeDetail.status = $('.infozingle p:contains("Status")').text().replace('Status:', '').trim();
    animeDetail.total_episode = $('.infozingle p:contains("Total Episode")').text().replace('Total Episode:', '').trim();
    animeDetail.duration = $('.infozingle p:contains("Durasi")').text().replace('Durasi:', '').trim();
    animeDetail.release_date = $('.infozingle p:contains("Tanggal Rilis")').text().replace('Tanggal Rilis:', '').trim();
    animeDetail.studio = $('.infozingle p:contains("Studio")').text().replace('Studio:', '').trim();
    animeDetail.genre = $('.infozingle p:contains("Genre")').text().replace('Genre:', '').trim()
      .split(',').map(g => g.trim()).filter(g => g !== '');
    animeDetail.synopsis = $('.sinopc').text().trim();
    animeDetail.thumbnail = $('.wp-post-image').attr('src');

    // Episode list
    $('.episodelist ul li').each((i, el) => {
      const episodeTitle = $(el).find('span:first-child').text().trim();
      const episodeLink = $(el).find('a').attr('href');
      const episodeEndpoint = episodeLink ? episodeLink.replace(`${BASE_URL}/episode/`, '').replace('/', '') : '';
      const episodeDate = $(el).find('span:last-child').text().trim();
      
      episodeList.push({
        title: episodeTitle,
        endpoint: episodeEndpoint,
        date: episodeDate
      });
    });

    animeDetail.episode_list = episodeList;

    res.json({
      status: true,
      message: "success",
      result: animeDetail
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({
      status: false,
      message: "Failed to fetch data",
      error: error.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
