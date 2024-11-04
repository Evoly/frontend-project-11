
const createEl = (el, props = {}) => Object.assign(document.createElement(el), props);

const createLi = (data, i18n, visitedLinkIds) => {
  const li = createEl('li', { className: 'd-flex justify-content-between mb-3 gap-2' });
  const a = createEl('a', {
    href: `${data.link}`, className: 'fw-bold', target: '_blank', rel: 'noopener noreferrer'
  });
  a.dataset.id = data.id;
  
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
  const link = document.querySelector(`[data-id="${id}"]`);
  link.classList.remove('fw-bold');
  link.classList.add('fw-normal', 'link-secondary');
};

export const renderFeeds = (data, i18n, container) => {
  const feedHeader = createEl('h2', { className: 'text-center' });
  feedHeader.textContent = i18n.t('content.feedHeader');

  const ul = createEl('ul', { className: 'list-unstyled' });
  const lines = data.map((item) => {
    const li = createEl('li');
    const header = createEl('h3');
    header.textContent = item.title;
    const descr = createEl('p');
    descr.textContent = item.description;
    li.append(header);
    li.append(descr);
    return li;
  });
  ul.append(...lines);
  container.replaceChildren(feedHeader, ul);
  return container;
};

export const renderPosts = (data, i18n, container, visitedLinkIds) => {
  console.log('data', data)
  const postHeader = createEl('h2', { className: 'text-center' });
  postHeader.textContent = i18n.t('content.postHeader');

  const ul = createEl('ul', { className: 'list-unstyled' });
  const lines = data.map((item) => createLi(item, i18n, visitedLinkIds));
  ul.append(...lines);
  container.replaceChildren(postHeader, ul);
};

export const renderModal = (el, post) => {
  const modalTitle = el.querySelector('.modal-title');
  modalTitle.textContent = post.title;
  const modalBody = el.querySelector('.modal-body');
  modalBody.textContent = post.description;
  const link = el.querySelector('.full-article');
  link.href = post.link;
}