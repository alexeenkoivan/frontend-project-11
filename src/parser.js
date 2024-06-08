const parsePost = (post) => {
  const link = post.querySelector('link').textContent;
  const title = post.querySelector('title').textContent;
  const description = post.querySelector('description')?.textContent || 'Описание не найдено';
  const date = post.querySelector('pubDate').textContent;
  return {
    link,
    title,
    description,
    date,
  };
};

const parse = (rss, url) => {
  const parser = new DOMParser();
  const data = parser.parseFromString(rss, 'application/xml');
  const parseError = data.querySelector('parsererror');
  if (parseError) {
    const error = new Error('notRss');
    error.isParsingError = true;
    throw error;
  }

  const feedTitle = data.querySelector('title').textContent;
  const feedDescription = data.querySelector('description').textContent;
  const feed = {
    link: url,
    title: feedTitle,
    description: feedDescription,
  };

  const posts = [...data.querySelectorAll('item')].map(parsePost);
  return { feed, posts };
};

export default parse;
