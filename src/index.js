import './styles.scss';
import 'bootstrap';
import handleSubmit from './formHandler';
import i18n from './i18n';
import state from './state';
import render from './render';

document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('form');
  form.addEventListener('submit', handleSubmit);

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

  render(state, elements, i18n)('feeds', state.feeds);
  render(state, elements, i18n)('posts', state.posts);

  elements.postsList.addEventListener('click', (event) => {
    const postId = event.target.dataset.id;
    if (postId) {
      state.uiState.displayedPost = postId;
      state.readPosts.add(postId);
      render(state, elements, i18n)('uiState.displayedPost', postId);
      render(state, elements, i18n)('uiState.viewedPostIds', state.uiState.viewedPostIds);
    }
  });
});
