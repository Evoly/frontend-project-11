export default (path) => {
  const proxy = 'https://allorigins.hexlet.app/';
  const url = new URL('/get', proxy);
  url.searchParams.append('disableCache', 'true');
  url.searchParams.append('url', path);
  return url;
};