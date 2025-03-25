const createEl = (el, props = {}) => Object.assign(document.createElement(el), props);

const createLi = (data, i18n, ids) => {
  const li = createEl('li', { className: 'd-flex justify-content-between mb-3 gap-2' });
  const classes = [...ids].some((el) => data.id === el) ? ['fw-normal', 'link-secondary'] : ['fw-bold'];
  const a = createEl('a', {
    href: `${data.link}`, className: classes.join(' '), target: '_blank', rel: 'noopener noreferrer',
  });
  a.dataset.id = data.id;
  a.textContent = data.title;
  const btn = createEl('button', { type: 'button', className: 'btn btn-outline-primary btn-sm' });
  btn.textContent = i18n.t('content.btnShow');
  btn.dataset.bsTarget = '#modal';
  btn.dataset.id = data.id;
  li.append(a);
  li.append(btn);

  return li;
};
export const renderVisitedlink = (id) => {
  const link = document.querySelector(`[data-id="${id}"]`);
  link.classList.remove('fw-bold');
  link.classList.add('fw-normal', 'link-secondary');
};

export const renderFeeds = (state, i18n, container) => {
  const feedHeader = createEl('h2', { className: 'text-center' });
  feedHeader.textContent = i18n.t('content.feedHeader');

  const ul = createEl('ul', { className: 'list-unstyled' });
  const lines = state.feeds.map((item) => {
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

export const renderPosts = (state, i18n, container) => {
  const postHeader = createEl('h2', { className: 'text-center' });
  postHeader.textContent = i18n.t('content.postHeader');

  const ul = createEl('ul', { className: 'list-unstyled' });
  const lines = state.posts.map((item) => createLi(item, i18n, state.ui.visitedLinkIds));
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
};

export const renderError = (input, el, val, i18n) => {
  let i18Key;
  if (Object.hasOwn(val, 'status')) {
    switch (val.status) {
      case 'fail':
        i18Key = `loading.${val.error}`;
        break;
      case 'success':
        i18Key = `loading.${val.status}`;
        break;
      default:
        i18Key = 'unknownErr';
    }
  } else {
    i18Key = `validation.${val.error}`;
  }
  if (!val.error) {
    input.classList.remove('is-invalid');
    el.classList.remove('text-danger');
    el.classList.add('text-success');
  } else {
    input.classList.add('is-invalid');
    el.classList.add('text-danger');
    el.classList.remove('text-success');
  }
  // eslint-disable-next-line no-param-reassign
  el.textContent = i18n.t(i18Key);
};
