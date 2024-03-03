import './styles.scss';
import 'bootstrap';
import { handleSubmit } from './formHandler';

document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('form');
  form.addEventListener('submit', handleSubmit);
});
