import * as yup from 'yup';
import _ from 'lodash';
import axios from 'axios';
import i18n from 'i18next';
import state from './state';
import render from './render';
import parse from './parser';

const schema = yup.object().shape({
  url: yup.string().url().required(),
});

const fetchRssFeed = (url) => {
  const corsProxy = 'https://allorigins.hexlet.app/get?disableCache=true&url=';
  return axios.get(`${corsProxy}${encodeURIComponent(url)}`)
    .then((response) => {
      const data = parse(response.data.contents, url);
      return data;
    });
};

const handleSubmit = (event) => {
  event.preventDefault();
  const formData = new FormData(event.target);
  const url = formData.get('url').trim();

  schema.validate({ url })
    .then(() => {
      if (state.feeds.some((feed) => feed.url === url)) {
        throw new Error('alreadyInList');
      }

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
      if (error.name === 'ValidationError') {
        state.error = 'notUrl';
      } else if (error.isParsingError) {
        state.error = 'notRss';
      } else {
        state.error = error.message;
      }
      render(state, {
        feedback: document.querySelector('.feedback'),
      }, i18n)('error', state.error);
    });
};

const form = document.querySelector('form');
form.addEventListener('submit', handleSubmit);

export default handleSubmit;
