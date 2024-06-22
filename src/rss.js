import axios from 'axios';
import parse from './parser';
import { i18n } from './i18n';

async function fetchRSS(url) {
  try {
    const response = await axios.get(`https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(url)}`);
    const { feed, posts } = parse(response.data.contents, url);
    return { feed, posts };
  } catch (error) {
    console.error('Ошибка при скачивании RSS:', error.message);
    throw new Error(i18n.t('errors.networkError'));
  }
}

export default fetchRSS;
