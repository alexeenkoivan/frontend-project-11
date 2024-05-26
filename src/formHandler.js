import * as yup from 'yup';
import onChange from 'on-change';
import axios from 'axios';
import { uniqueId } from 'lodash';
import i18n from './i18n';
import fetchRSS from './rss';
import parse from './parser';

yup.setLocale({
  mixed: {
    default: i18n.t('errors.unknown'),
  },
  string: {
    url: i18n.t('errors.notUrl'),
    required: i18n.t('errors.empty'),
  },
});

const schema = yup.object().shape({
  rssInput: yup.string().url().required(),
});

const state = {
  feeds: [],
  posts: [],
  formState: 'filling',
  error: null,
};

const updateFeeds = () => {
  const promises = state.feeds.map((feed) => axios.get(`https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(feed.url)}`)
    .then((response) => {
      const { posts } = parse(response.data.contents);
      const newPosts = posts.filter((post) => !state.posts.find((p) => p.link === post.link));
      newPosts.forEach((newPost) => {
        const post = newPost;
        post.id = uniqueId();
        post.feedId = feed.id;
      });
      state.posts.push(...newPosts);
    })
    .catch((error) => {
      console.error('Ошибка при обновлении RSS:', error.message);
    }));

  Promise.all(promises).finally(() => {
    setTimeout(updateFeeds, 5000);
  });
};

export function handleSubmit(event) {
  event.preventDefault();

  const formData = new FormData(event.target);
  const data = Object.fromEntries(formData.entries());

  schema.validate(data)
    .then(() => {
      if (state.feeds.some((feed) => feed.url === data.rssInput)) {
        throw new Error('alreadyInList');
      }

      console.log('Данные валидны:', data);

      state.feeds.push(data.rssInput);

      event.target.reset();
      event.target.querySelector('input').focus();

      fetchRSS(data.rssInput)
        .then((rssData) => {
          console.log('Данные RSS:', rssData);

          state.feeds.push(rssData.feed);
          state.posts.push(...rssData.posts.map((post) => ({
            ...post,
            id: uniqueId(),
            feedId: state.feeds[state.feeds.length - 1].id,
          })));
        })
        .catch((error) => {
          console.error('Ошибка загрузки RSS:', error.message);
          state.error = 'networkError';
        });
    })
    .catch((error) => {
      console.error('Ошибка валидации:', i18n.t(`errors.${error.message}`));

      const input = event.target.querySelector('input');
      input.classList.add('error');
      input.addEventListener('input', () => {
        input.classList.remove('error');
      });
    });
}

export function watchForm(form) {
  const formData = {};

  const watchedFormData = onChange(formData, () => {
    schema.validate(watchedFormData)
      .then(() => {
        form.querySelector('input').classList.remove('error');
      })
      .catch(() => {
        form.querySelector('input').classList.add('error');
      });
  });

  form.querySelector('input').addEventListener('input', (event) => {
    watchedFormData.rssInput = event.target.value;
  });

  form.addEventListener('submit', handleSubmit);
}

document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('form');
  watchForm(form);
  updateFeeds();
});