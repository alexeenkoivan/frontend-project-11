import * as yup from 'yup';
import onChange from 'on-change';
import i18n from './i18n';
import fetchRSS from './rss';

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

const feedList = [];

export function handleSubmit(event) {
  event.preventDefault();

  const formData = new FormData(event.target);
  const data = Object.fromEntries(formData.entries());

  schema.validate(data)
    .then(() => {
      if (feedList.includes(data.rssInput)) {
        throw new Error('duplicate');
      }

      console.log('Данные валидны:', data);

      feedList.push(data.rssInput);

      event.target.reset();
      event.target.querySelector('input').focus();

      fetchRSS(data.rssInput)
        .then((rssData) => {
          console.log('Данные RSS:', rssData);
        })
        .catch((error) => {
          console.error('Ошибка загрузки RSS:', error);
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
});
