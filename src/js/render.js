
const createEl = (el, props = {}) => Object.assign(document.createElement(el), props);

const createLi = (data, i18n) => {
  const li = createEl('li', { className: 'd-flex justify-content-between mb-3 gap-2' });
  const a = createEl('a', {
    href: `${data.link}`, className: 'fw-bold', target: '_blank', rel: 'noopener noreferrer'
  });
  a.dataset.id = data.id
  a.textContent = data.title;
  const btn = createEl('button', { type: 'button', className: 'btn btn-outline-primary btn-sm' });
  btn.textContent = i18n.t('content.btnShow');
  btn.dataset.bsToggle = 'modal';
  btn.dataset.bsTarget = '#modal';
  btn.dataset.id = data.id
  li.append(a);
  li.append(btn);

  return li;
}
export const renderVisitedlink = (id) => {
  const link = document.querySelector(`[data-id="${id}"]`)
  console.log('link:', link)
  link.classList.remove('fw-bold');
  link.classList.add('fw-normal', 'link-secondary');
};

export const renderFeeds = (data, i18n, container) => {
  console.log('feeds', data);
  if (!container.hasChildNodes()) {
    const feedHeader = createEl('h2', { className: 'text-center' });
    feedHeader.textContent = i18n.t('content.feedHeader');
    container.append(feedHeader);
  };
  const header = createEl('h3');
  header.textContent = data[0].title;
  const descr = createEl('p');
  descr.textContent = data[0].description;
  container.append(header);
  container.append(descr);

  return container;
}

export const renderPosts = (data, i18n, container) => {
  if (!container.hasChildNodes()) {
    const postHeader = createEl('h2', { className: 'text-center' });
    postHeader.textContent = i18n.t('content.postHeader');
    container.append(postHeader);
  };
  const ul = createEl('ul', { className: '' });
  const lines = data.map((item) => createLi(item, i18n));
  ul.append(...lines);
  container.append(ul);
};

export const renderModal = (el, post) => {
  const modalTitle = el.querySelector('.modal-title');
  modalTitle.textContent = post.title;
  const modalBody = el.querySelector('.modal-body');
  modalBody.textContent = post.description;
  const link = el.querySelector('.full-article');
  link.href = post.link;
}