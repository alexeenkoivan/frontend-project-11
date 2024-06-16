import * as yup from 'yup';
import _ from 'lodash';
import axios from 'axios';
import i18n from 'i18next';
import state from './state';
import render from './render';
import parse from './parser';

const schema = yup.object().shape({
  url: yup.string().url().required().test(
    'is-already-in-list',
    'alreadyInList',
    (value) => !state.feeds.some((feed) => feed.url === value),
  ),
});

const addProxy = (url) => {
  const proxyUrl = new URL('/get', 'https://allorigins.hexlet.app');
  proxyUrl.searchParams.append('disableCache', 'true');
  proxyUrl.searchParams.append('url', url);
  return proxyUrl.toString();
};

const fetchRssFeed = (url) => axios.get(addProxy(url))
  .then((response) => {
    const data = parse(response.data.contents, url);
    return data;
  })
  .catch((error) => {
    console.error('Fetch RSS Feed Error:', error);
    throw error;
  });

const handleSubmit = (event) => {
  event.preventDefault();
  const formData = new FormData(event.target);
  const url = formData.get('url').trim();

  schema.validate({ url })
    .then(() => {
      state.error = null;
      state.formState = 'sending';
      render(state, {
        submit: document.querySelector('button[type="submit"]'),
        urlInput: document.querySelector('input[name="url"]'),
        feedback: document.querySelector('.feedback'),
        form: event.target,
      }, i18n)('formState', state.formState);

      return fetchRssFeed(url);
    })
    .then((data) => {
      const feed = {
        id: _.uniqueId(),
        title: data.feed.title,
        description: data.feed.description,
        url,
      };
      const posts = data.posts.map((post) => ({
        id: _.uniqueId(),
        feedId: feed.id,
        title: post.title,
        description: post.description,
        link: post.link,
      }));

      state.feeds.push(feed);
      state.posts = [...state.posts, ...posts];

      state.formState = 'added';
      render(state, {
        submit: document.querySelector('button[type="submit"]'),
        urlInput: document.querySelector('input[name="url"]'),
        feedback: document.querySelector('.feedback'),
        form: event.target,
      }, i18n)('formState', state.formState);
      render(state, {
        feedsList: document.querySelector('.feeds'),
        postsList: document.querySelector('.posts'),
      }, i18n)('feeds', state.feeds);
      render(state, {
        feedsList: document.querySelector('.feeds'),
        postsList: document.querySelector('.posts'),
      }, i18n)('posts', state.posts);
    })
    .catch((error) => {
      console.error('Handle Submit Error:', error);
      if (error.name === 'ValidationError') {
        state.error = error.errors[0] === 'alreadyInList' ? 'alreadyInList' : 'notUrl';
      } else if (error.isParsingError) {
        state.error = 'notRss';
      } else if (axios.isAxiosError(error)) {
        state.error = 'networkError';
      } else {
        state.error = 'unknown';
      }
      state.formState = 'invalid';
      render(state, {
        feedback: document.querySelector('.feedback'),
      }, i18n)('error', state.error);
    });
};

const form = document.querySelector('form');
form.addEventListener('submit', handleSubmit);

export default handleSubmit;
