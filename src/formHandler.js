import * as yup from 'yup';
import _ from 'lodash';
import axios from 'axios';
import i18n from 'i18next';
import state from './state';
import render from './render';
import parse from './parser';
import { addProxy } from './rss';

const schema = yup.object().shape({
  url: yup.string().url().required().notOneOf(
    state.feeds.map((feed) => feed.url),
    'alreadyInList',
  ),
});

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

      if (state.feeds.some((existingFeed) => existingFeed.url === url)) {
        state.formState = 'invalid';
        state.error = 'alreadyInList';
        render(state, {
          feedback: document.querySelector('.feedback'),
        }, i18n)('error', state.error);
        return;
      }

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

export default handleSubmit;
