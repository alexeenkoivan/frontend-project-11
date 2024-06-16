import './styles.scss';
import 'bootstrap';
import 'bootstrap/dist/js/bootstrap.bundle.min';
import onChange from 'on-change';
import handleSubmit from './formHandler';
import initI18n, { i18n } from './i18n';
import state from './state';
import render from './render';
import fetchRSS from './rss';

const elements = {
  submit: document.querySelector('button[type="submit"]'),
  urlInput: document.querySelector('input[name="url"]'),
  feedback: document.querySelector('.feedback'),
  form: document.querySelector('form'),
  feedsList: document.querySelector('.feeds'),
  postsList: document.querySelector('.posts'),
  modalHeader: document.querySelector('.modal-title'),
  modalBody: document.querySelector('.modal-body'),
  modalHref: document.querySelector('.full-article'),
};

const updatePosts = async () => {
  const promises = state.feeds.map(async (feed) => {
    try {
      const { posts } = await fetchRSS(feed.url);
      const newPosts = posts.filter(
        (post) => !state.posts.some((existingPost) => existingPost.link === post.link),
      );
      if (newPosts.length > 0) {
        state.posts = [...newPosts, ...state.posts];
      }
    } catch (error) {
      console.error('Error updating posts:', error);
    }
  });

  await Promise.all(promises);
};

const init = async () => {
  await initI18n();

  const form = document.querySelector('form');
  form.addEventListener('submit', handleSubmit);

  elements.postsList.addEventListener('click', (event) => {
    const postId = event.target.dataset.id;
    if (postId) {
      state.uiState.displayedPost = postId;
      state.readPosts.add(postId);
      render(state, elements, i18n)('uiState.displayedPost', postId);
    }
  });

  const watchedState = onChange(state, (path, value) => {
    render(watchedState, elements, i18n)(path, value);
  });

  const renderFeedsAndPosts = render(watchedState, elements, i18n);

  renderFeedsAndPosts('feeds', watchedState.feeds);
  renderFeedsAndPosts('posts', watchedState.posts);

  setInterval(updatePosts, 5000);
};

document.addEventListener('DOMContentLoaded', init);
