import * as yup from 'yup';
import _ from 'lodash';
import axios from 'axios';
import parse from './parser';
import { addProxy } from './rss';

const createSchema = (feeds) => yup.object().shape({
  url: yup.string().url().required().notOneOf(
    feeds.map((feed) => feed.url),
    'alreadyInList',
  ),
});

const fetchRssFeed = (url) => axios.get(addProxy(url))
  .then((response) => {
    const data = parse(response.data.contents, url);
    return data;
  })
  .catch((error) => {
    console.error('Fetch RSS Feed Error:', error);
    throw error;
  });

const handleSubmit = (watchedState) => (event) => {
  event.preventDefault();
  const formData = new FormData(event.target);
  const url = formData.get('url').trim();

  const schema = createSchema(watchedState.feeds);

  schema.validate({ url })
    .then(() => {
      const tempState = {
        ...watchedState,
        error: null,
        formState: 'sending',
      };

      return fetchRssFeed(url).then((data) => {
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
          description: post.description,
          link: post.link,
        }));

        tempState.feeds = [...watchedState.feeds, feed];
        tempState.posts = [...watchedState.posts, ...posts];
        tempState.formState = 'added';
        Object.assign(watchedState, tempState);
      });
    })
    .catch((error) => {
      console.error('Handle Submit Error:', error);
      let errorMsg;
      if (error.name === 'ValidationError') {
        errorMsg = error.errors[0] === 'alreadyInList' ? 'alreadyInList' : 'notUrl';
      } else if (error.isParsingError) {
        errorMsg = 'notRss';
      } else if (axios.isAxiosError(error)) {
        errorMsg = 'networkError';
      } else {
        errorMsg = 'unknown';
      }

      const tempState = {
        ...watchedState,
        error: errorMsg,
        formState: 'invalid',
      };
      Object.assign(watchedState, tempState);
    });
};

export default handleSubmit;
