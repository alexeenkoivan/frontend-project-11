import './styles.scss';
import 'bootstrap';
import 'bootstrap/dist/js/bootstrap.bundle.min';
import onChange from 'on-change';
import handleSubmit from './formHandler';
import initI18n, { i18n } from './i18n';
import state from './state';
import render from './render';
import fetchRss from './rss';

const UPDATE_INTERVAL = 5000;

const updatePosts = (watchedState) => {
  const promises = watchedState.feeds.map((feed) => fetchRss(feed.url)
    .then(({ posts }) => {
      const newPosts = posts.filter(
        (post) => !watchedState.posts.some((existingPost) => existingPost.link === post.link),
      );
      if (newPosts.length > 0) {
        watchedState.posts.push(...newPosts);
      }
    })
    .catch((error) => {
      console.error('Error updating posts:', error);
    }));

  return Promise.all(promises);
};

const startUpdatingPosts = (watchedState) => {
  updatePosts(watchedState).then(() => {
    setTimeout(() => startUpdatingPosts(watchedState), UPDATE_INTERVAL);
  });
};

const init = () => {
  initI18n().then(() => {
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

    const watchedState = onChange(state, (path, value) => {
      render(watchedState, elements, i18n)(path, value);
    });

    elements.form.addEventListener('submit', handleSubmit(watchedState));

    elements.postsList.addEventListener('click', (event) => {
      const postId = event.target.dataset.id;
      if (postId) {
        watchedState.uiState.displayedPost = postId;
        watchedState.uiState.viewedPostIds.add(postId);
      }
    });

    startUpdatingPosts(watchedState);
  });
};

document.addEventListener('DOMContentLoaded', init);
