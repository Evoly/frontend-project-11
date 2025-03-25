const parse = (data) => {
  const parser = new DOMParser();
  const content = parser.parseFromString(data.contents, 'text/xml');
  const error = content.querySelector('parsererror');
  if (error) {
    const parseError = new Error();
    parseError.name = 'parseError';
    throw parseError;
  }
  const items = content.querySelectorAll('item');
  const itmesList = [...items].map((item) => ({
    title: item.querySelector('title').textContent,
    description: item.querySelector('description').textContent,
    link: item.querySelector('link').textContent,
  }));
  return {
    title: content.querySelector('title').textContent,
    description: content.querySelector('description').textContent,
    items: itmesList,
  };
};

export default parse;
