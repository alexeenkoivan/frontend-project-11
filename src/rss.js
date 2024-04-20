import axios from 'axios';
import state from './state';

async function fetchRSS(url) {
  try {
    const response = await axios.get(`https://api.allorigins.win/get?url=${encodeURIComponent(url)}`);
    const parser = new DOMParser();
    const xml = parser.parseFromString(response.data.contents, 'text/xml');

    const title = xml.querySelector('channel > title').textContent;
    const description = xml.querySelector('channel > description').textContent;
    const items = Array.from(xml.querySelectorAll('item')).map((item) => ({
      title: item.querySelector('title').textContent,
      link: item.querySelector('link').textContent,
      description: item.querySelector('description').textContent,
    }));

    state.feeds.push({ title, description });
    state.posts.push(...items);

    return { title, description, items };
  } catch (error) {
    console.error('Ошибка при скачивании RSS:', error.message);
    state.error = 'Ошибка при скачивании RSS';
    throw new Error('Ошибка при скачивании RSS');
  }
}

export default fetchRSS;
