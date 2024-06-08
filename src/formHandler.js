import * as yup from 'yup';
import axios from 'axios';
import _ from 'lodash';
import i18n from 'i18next';
import parse from './parser';
import state from './state';

const schema = yup.object().shape({
  url: yup.string().url().required(),
});

const renderError = (message) => {
  const feedbackElement = document.querySelector('.feedback');
  feedbackElement.textContent = message;
  feedbackElement.classList.add('text-danger');
  feedbackElement.classList.remove('text-success');
};

const renderSuccess = (message) => {
  const feedbackElement = document.querySelector('.feedback');
  feedbackElement.textContent = message;
  feedbackElement.classList.add('text-success');
  feedbackElement.classList.remove('text-danger');
};

const renderFeeds = (feeds) => {
  const feedsContainer = document.querySelector('.feeds');
  feedsContainer.innerHTML = '';
  feeds.forEach((feed) => {
    const feedElement = document.createElement('div');
    feedElement.classList.add('card', 'border-0');
    feedElement.innerHTML = `
      <div class="card-body">
        <h2 class="card-title h4">${feed.title}</h2>
        <p class="card-text">${feed.description}</p>
      </div>
    `;
    feedsContainer.appendChild(feedElement);
  });
};

const renderPosts = (posts) => {
  const postsContainer = document.querySelector('.posts');
  postsContainer.innerHTML = '';
  posts.forEach((post) => {
    const postElement = document.createElement('li');
    postElement.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start', 'border-0', 'border-end-0');
    postElement.innerHTML = `
      <a href="${post.link}" class="fw-bold" data-id="${post.id}" target="_blank" rel="noopener noreferrer">${post.title}</a>
      <button type="button" class="btn btn-primary btn-sm" data-id="${post.id}" data-bs-toggle="modal" data-bs-target="#modal">Просмотр</button>
    `;
    postsContainer.appendChild(postElement);
  });
};

const fetchRssFeed = (url) => {
  const corsProxy = 'https://allorigins.hexlet.app/get?disableCache=true&url=';
  return axios.get(`${corsProxy}${encodeURIComponent(url)}`)
    .then((response) => {
      const data = parse(response.data.contents);
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
        throw new Error(i18n.t('errors.duplicate'));
      }

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

      renderFeeds(state.feeds);
      renderPosts(state.posts);
      renderSuccess('RSS успешно загружен');
    })
    .catch((error) => {
      if (error.name === 'ValidationError') {
        renderError(i18n.t('errors.invalidUrl'));
      } else if (error.message === i18n.t('errors.duplicate')) {
        renderError(i18n.t('errors.duplicate'));
      } else {
        renderError(i18n.t('errors.network'));
      }
    });
};

const form = document.querySelector('form');
form.addEventListener('submit', handleSubmit);

export default handleSubmit;
