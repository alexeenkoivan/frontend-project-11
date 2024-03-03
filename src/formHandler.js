import * as yup from 'yup';
import onChange from 'on-change';

const schema = yup.object().shape({
  rssInput: yup.string().url().required(),
});

export function handleSubmit(event) {
  event.preventDefault();

  const formData = new FormData(event.target);
  const data = Object.fromEntries(formData.entries());

  schema.validate(data)
    .then(() => {
      console.log('Данные валидны:', data);

      event.target.reset();
      event.target.querySelector('input').focus();
    })
    .catch((error) => {
      console.error('Ошибка валидации:', error.errors);

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
