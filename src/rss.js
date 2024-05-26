import axios from 'axios';
import state from './state';
import parse from './parser';

async function fetchRSS(url) {
  try {
    const response = await axios.get(`https://hexlet-allorigins.herokuapp.com/get?disableCache=true&url=${encodeURIComponent(url)}`);
    const { feed, posts } = parse(response.data.contents, url);

    state.feeds.push(feed);
    state.posts.push(...posts);

    return { feed, posts };
  } catch (error) {
    console.error('Ошибка при скачивании RSS:', error.message);
    state.error = 'Ошибка при скачивании RSS';
    throw new Error('Ошибка при скачивании RSS');
  }
}

export default fetchRSS;
