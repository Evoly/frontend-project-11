import onChange from 'on-change';
import * as yup from 'yup';
import uniqueId from 'lodash.uniqueid';
import i18next from 'i18next';
import Modal from 'bootstrap/js/dist/modal.js';
import axios from 'axios';

import addProxy from './proxy.js';
import parse from './parse.js';
import resources from './locales/index.js';
import {
  renderFeeds, renderVisitedlink, renderModal, renderPosts, renderError,
} from './render.js';

const getData = (data, state) => {
  const parsedData = parse(data);
  let feed = state.feeds.find((item) => item.title === parsedData.title);

  if (!feed) {
    feed = {
      title: parsedData.title,
      description: parsedData.description,
      id: `${uniqueId()}`,
    };
    // eslint-disable-next-line no-param-reassign
    state.feeds = [...state.feeds, ...[feed]];
  }
  const filteredPosts = state.posts.filter((item) => item.feedid === feed.id);

  const posts = parsedData.items.map((item) => ({ ...item, id: `${uniqueId()}`, feedid: feed.id }));
  const newPosts = posts.filter((post) => !filteredPosts.some((el) => el.title === post.title));

  // eslint-disable-next-line no-param-reassign
  state.posts = [...newPosts, ...state.posts];
};

const app = () => {
  const state = {
    feeds: [],
    posts: [],
    urls: [],

    form: {
      valid: false,
      error: null,
    },
    currentLang: navigator.language,
    loadingProcess: {
      status: 'filling',
      error: null,
    },
    ui: {
      visitedLinkIds: new Set(),
      modalContent: null,
    },
  };

  const i18n = i18next.createInstance();
  i18n.init({
    lng: state.currentLang,
    fallbackLng: 'ru',
    debug: true,
    resources,
  });

  yup.setLocale({
    string: {
      url: () => ({ key: 'badUrl' }),
    },
    mixed: {
      required: () => ({ key: 'emptyField' }),
      notOneOf: () => ({ key: 'duplicate' }),
    },
  });
  const elements = {
    form: document.querySelector('form'),
    input: document.querySelector('#url-input'),
    feedbackElement: document.querySelector('.feedback'),
    postsContainer: document.querySelector('.posts'),
    feedsContainer: document.querySelector('.feeds'),
    submitBtn: document.querySelector('[type="submit"]'),
    modal: document.querySelector('#modal'),
  };

  const updateFormState = (sending = true, loading = '') => {
    elements.submitBtn.disabled = sending;
    elements.input.readonly = sending;
    if (loading === 'filling') {
      elements.input.value = '';
    }
  };

  const showModal = (post) => {
    if (post) {
      const modal = new Modal(elements.modal);
      renderModal(elements.modal, post);
      modal.show();
    }
  };

  const processLoadingState = (val) => {
    switch (val.status) {
      case 'sending':
        updateFormState(true);
        break;
      case 'success':
        renderError(elements.input, elements.feedbackElement, val, i18n);
        break;
      case 'fail':
        updateFormState(false);
        renderError(elements.input, elements.feedbackElement, val, i18n);
        break;
      case 'filling':
        updateFormState(false, val.status);
        break;
      default:
        break;
    }
  };

  const watchedState = onChange(state, (path, val) => {
    switch (path) {
      case 'form':
        if (!state.form.valid) {
          renderError(elements.input, elements.feedbackElement, val, i18n);
        }
        break;
      case 'loadingProcess':
        processLoadingState(val, elements, i18n);
        break;
      case 'posts':
        renderPosts(watchedState, i18n, elements.postsContainer);
        break;
      case 'feeds':
        renderFeeds(watchedState, i18n, elements.feedsContainer);
        break;
      case 'ui.visitedLinkIds':
        renderVisitedlink([...val].at(-1));
        break;
      case 'ui.modalContent':
        showModal(val);
        break;
      default:
        break;
    }
  });

  const handleErrors = (error) => {
    switch (error.name) {
      case 'ValidationError':
        watchedState.form = { ...watchedState.form, valid: false, error: error.errors[0].key };
        break;
      case 'AxiosError':
        watchedState.loadingProcess = { ...watchedState.loadingProcess, status: 'fail', error: error.code };
        break;
      case 'parseError':
        watchedState.loadingProcess = { ...watchedState.loadingProcess, status: 'fail', error: error.name };
        break;
      default:
        watchedState.error = error;
    }
  };

  const updateFeeds = (urls) => {
    const promises = urls.map((url) => axios.get(addProxy(url), { timeout: 15000 }));
    Promise.all(promises)
      .then((response) => {
        const data = response.map((item) => item.data);
        return data;
      })
      .then((data) => data.map((item) => getData(item, watchedState)));

    return setTimeout(() => updateFeeds(urls), 5000);
  };

  elements.form.addEventListener('submit', (event) => {
    event.preventDefault();

    const data = new FormData(event.target);
    const currentUrl = data.get('url');
    const schema = yup.object({
      url: yup.string()
        .url()
        .required()
        .notOneOf(state.urls),
    });
    schema.validate({ url: currentUrl })
      .then(() => {
        watchedState.form = { ...watchedState.form, valid: true, error: null };
        watchedState.loadingProcess = { ...watchedState.loadingProcess, status: 'sending', error: null };
        return axios.get(addProxy(currentUrl), { timeout: 15000 });
      })
      .then((response) => {
        watchedState.loadingProcess = { ...watchedState.loadingProcess, status: 'success', error: null };
        getData(response.data, watchedState);
        watchedState.loadingProcess = { ...watchedState.loadingProcess, status: 'filling', error: null };
        watchedState.urls = [...watchedState.urls, currentUrl];
        updateFeeds(watchedState.urls);
      })
      .catch((e) => handleErrors(e));
  });

  elements.postsContainer.addEventListener('click', ({ target }) => {
    const { id } = target.dataset;
    if (!id) return;
    watchedState.ui.modalContent = null;
    watchedState.ui.visitedLinkIds = watchedState.ui.visitedLinkIds.add(id);

    if (target instanceof HTMLButtonElement) {
      const post = state.posts.find((item) => item.id === id);
      watchedState.ui.modalContent = post;
    }
  });
};

app();
