export default (rssData) => {
  const parser = new DOMParser();
  const xml = parser.parseFromString(rssData, 'application/xml');
  const items = Array.from(xml.querySelectorAll('item'));
  const posts = items.map((item) => ({
    title: item.querySelector('title').textContent,
    description: item.querySelector('description').textContent,
    link: item.querySelector('link').textContent,
  }));
  return { posts };
};
