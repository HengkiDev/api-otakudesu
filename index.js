const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;
const BASE_URL = 'https://otakudesu.cloud';
const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36';

// Disable JSON pretty printing
app.set('json spaces', 0);
app.use(cors());

// Helper functions
const fetchData = async (url) => {
  return await axios.get(url, {
    headers: { 'User-Agent': USER_AGENT }
  });
};

const handleApiError = (error, res) => {
  console.error('Error:', error);
  res.status(500).json({
    status: false,
    message: "Failed to fetch data",
    error: error.message
  });
};

const parseOngoingAndCompleteAnime = ($) => {
  const animeList = [];
  $('.venz > ul > li').each((i, el) => {
    const title = $(el).find('h2.jdlflm').text().trim();
    const link = $(el).find('.detpost .thumb a').attr('href');
    const endpoint = link ? link.replace(`${BASE_URL}/anime/`, '').replace('/', '') : '';
    const thumbnail = $(el).find('.detpost .thumb img').attr('src');
    const episode = $(el).find('.epz').text().trim();
    const release_date = $(el).find('.newnime').text().trim();
    
    const genres_html = $(el).find('.genre').html() || '';
    const genres = genres_html
      .replace(/<span>/g, '')
      .replace(/<\/span>/g, '')
      .replace(/&nbsp;/g, '')
      .split(',')
      .map(g => g.trim())
      .filter(g => g !== '');
    
    animeList.push({
      title, episode, thumbnail, endpoint, genres, release_date
    });
  });
  return animeList;
};

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    status: true,
    creator: "HengkiDev",
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
    const response = await fetchData(`${BASE_URL}/ongoing-anime/`);
    const $ = cheerio.load(response.data);
    const animeList = parseOngoingAndCompleteAnime($);
    
    res.json({
      status: true,
      message: "success",
      result: animeList
    });
  } catch (error) {
    handleApiError(error, res);
  }
});

// Complete anime endpoint
app.get('/api/anime/otakudesu/complete', async (req, res) => {
  try {
    const response = await fetchData(`${BASE_URL}/complete-anime/`);
    const $ = cheerio.load(response.data);
    const animeList = parseOngoingAndCompleteAnime($);
    
    res.json({
      status: true,
      message: "success",
      result: animeList
    });
  } catch (error) {
    handleApiError(error, res);
  }
});

// Search anime endpoint
app.get('/api/anime/otakudesu/search/:query', async (req, res) => {
  try {
    const query = req.params.query;
    const response = await fetchData(`${BASE_URL}/?s=${query}&post_type=anime`);
    const $ = cheerio.load(response.data);
    const animeList = [];

    $('.chivsrc > li').each((i, el) => {
      const title = $(el).find('h2').text().trim();
      const link = $(el).find('h2 a').attr('href');
      const endpoint = link ? link.replace(`${BASE_URL}/anime/`, '').replace('/', '') : '';
      const thumbnail = $(el).find('img').attr('src');
      
      const genreText = $(el).find('.set:contains("Genres")').text().replace('Genres:', '').trim();
      const genres = genreText.split(',').map(g => g.trim()).filter(g => g !== '');
      const status = $(el).find('.set:contains("Status")').text().replace('Status:', '').trim();
      
      animeList.push({
        title, thumbnail, endpoint, genres, status
      });
    });

    res.json({
      status: true,
      message: "success",
      result: animeList
    });
  } catch (error) {
    handleApiError(error, res);
  }
});

// Detail anime endpoint
app.get('/api/anime/otakudesu/detail/:endpoint', async (req, res) => {
  try {
    const endpoint = req.params.endpoint;
    const response = await fetchData(`${BASE_URL}/anime/${endpoint}/`);
    const $ = cheerio.load(response.data);
    
    const extractInfo = (selector) => $(selector).text().split(':')[1]?.trim() || '';
    
    const animeDetail = {
      title: extractInfo('.infozingle p:contains("Judul")'),
      japanese: extractInfo('.infozingle p:contains("Japanese")'),
      score: extractInfo('.infozingle p:contains("Skor")'),
      producer: extractInfo('.infozingle p:contains("Produser")'),
      type: extractInfo('.infozingle p:contains("Tipe")'),
      status: extractInfo('.infozingle p:contains("Status")'),
      total_episode: extractInfo('.infozingle p:contains("Total Episode")'),
      duration: extractInfo('.infozingle p:contains("Durasi")'),
      release_date: extractInfo('.infozingle p:contains("Tanggal Rilis")'),
      studio: extractInfo('.infozingle p:contains("Studio")'),
      genre: extractInfo('.infozingle p:contains("Genre")').split(',').map(g => g.trim()).filter(g => g !== ''),
      synopsis: $('.sinopc').text().trim(),
      thumbnail: $('.wp-post-image').attr('src'),
      episode_list: []
    };

    $('.episodelist ul li').each((i, el) => {
      animeDetail.episode_list.push({
        title: $(el).find('span:first-child').text().trim(),
        endpoint: $(el).find('a').attr('href')?.replace(`${BASE_URL}/episode/`, '').replace('/', '') || '',
        date: $(el).find('span:last-child').text().trim()
      });
    });

    res.json({
      status: true,
      message: "success",
      result: animeDetail
    });
  } catch (error) {
    handleApiError(error, res);
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
