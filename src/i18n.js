import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import ru from '../locales/ru';

const initI18n = async () => {
  await i18n
    .use(initReactI18next)
    .init({
      resources: {
        ru: {
          translation: ru.translation,
        },
      },
      lng: 'ru',
      fallbackLng: 'ru',
      interpolation: {
        escapeValue: false,
      },
    });
};

export { i18n };
export default initI18n;
