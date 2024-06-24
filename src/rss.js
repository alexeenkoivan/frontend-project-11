import axios from 'axios';
import parse from './parser';
import { i18n } from './i18n';

const addProxy = (url) => {
  const proxyUrl = new URL('/get', 'https://allorigins.hexlet.app');
  proxyUrl.searchParams.append('disableCache', 'true');
  proxyUrl.searchParams.append('url', url);
  return proxyUrl.toString();
};

async function fetchRSS(url) {
  try {
    const response = await axios.get(addProxy(url));
    const { feed, posts } = parse(response.data.contents, url);
    return { feed, posts };
  } catch (error) {
    console.error('Ошибка при скачивании RSS:', error.message);
    throw new Error(i18n.t('errors.networkError'));
  }
}

export { addProxy, fetchRSS };
export default fetchRSS;
