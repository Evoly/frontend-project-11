import onChange from 'on-change';
import * as yup from 'yup';
import uniqueId from 'lodash.uniqueid'
import i18next from 'i18next';
import Modal from 'bootstrap/js/dist/modal.js'
import axios from 'axios';

import addProxy from './proxy.js';
import parse from './parese.js';
import resources from './locales/index.js';
import { renderFeeds, renderVisitedlink, renderModal, renderPosts } from './render.js';

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
    loadingProcess:{
      status: 'filling',
      error: null,
    },
    ui: {
      visitedLinkIds: new Set(),
    },
  };

  const i18n = i18next.createInstance();
  i18n.init({
    lng: state.currentLang,
    fallbackLng: 'ru',
    debug: true,
    resources,
  });

  const btn = document.querySelector('button');
  btn.textContent = i18n.t('add');

  yup.setLocale({
    string: {
      url: () => ({ key: 'badUrl' }),      
    },
    mixed: {
      required: () => ({ key: 'emptyField' }),
      notOneOf: () => ({ key: 'duplicate' }),
    }
  })
  const elements = {
    form: document.querySelector('form'),
    input: document.querySelector('#url-input'),
    feedbackElement: document.querySelector('.feedback'),
    postsContainer: document.querySelector('.posts'),
    feedsContainer: document.querySelector('.feeds'),
    submitBtn: document.querySelector('[type="submit"]'),
    modal: document.querySelector('#modal'),
  }

  const setDisable = (elements, sending=true) => {
    console.log('sending:', sending)
    elements.submitBtn.disabled = sending;
    elements.input.readonly = sending; 
  }

  const loadingProcess = (val, elements) => {
    console.log('loadingProcess val:', val)
    switch (val.status) {
      case 'sending':
        setDisable(elements, true);
        break;
      case 'success':
        console.log('success!')
        setDisable(elements, false);
        renderError(elements.input, elements.feedbackElement, val);
        break;
      case 'fail':
        setDisable(elements, false);
        renderError(elements.input, elements.feedbackElement, val);
        break;    
      default:
        break;
    }
  }

  const watchedState = onChange(state, (path, val) => {
    console.log('path:', path)
    console.log('val state:', val)
    switch (path) {
      case 'form':
        if (!state.form.valid) {          
          renderError(elements.input, elements.feedbackElement, val);
        }        
        break;
      case 'loadingProcess':
        console.log('hello loadingProcess.status')
        loadingProcess(val, elements, i18n);
        break;
      case 'posts':
        renderPosts(val, i18n, elements.postsContainer);
        break
      case 'feeds':
        renderFeeds(val, i18n, elements.feedsContainer);
        break;
      case 'ui.visitedLinkIds': 
        renderVisitedlink([...val].at(-1));
        break
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
        console.log('val errors:', error)
        watchedState.loadingProcess = {...watchedState.loadingProcess, status: 'fail', error: error.code };
        break;
      case 'parseError':
        console.log('val errors:', error)
        watchedState.loadingProcess = { ...watchedState.loadingProcess, status: 'fail', error: error.name };
        break;    
      default:
        watchedState.error = error;
    }
  };
  const renderError = (input, feedbackElement, val) => {
    console.log('renderError:', val)
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
          i18Key = `unknownErr`;
      }
    } else {
      i18Key = `validation.${val.error}`;
    }
    if (!val.error) {
      input.classList.remove('is-invalid');      
      feedbackElement.classList.remove('text-danger');
      feedbackElement.classList.add('text-success');
    } else {
      input.classList.add('is-invalid');
      feedbackElement.classList.add('text-danger');
      feedbackElement.classList.remove('text-success');
    }
    feedbackElement.textContent = i18n.t(i18Key) ;
  };

  elements.form.addEventListener('submit', (e) => {
    e.preventDefault();

    const data = new FormData(e.target);
    const currentUrl = data.get('url');
    const schema = yup.object({
      url: yup.string()
        .url()
        .required()
        .notOneOf(state.urls)
    });

    /* const validateSchema = (schema, data) => {
      return schema.validate(data);
    }
      */
    //validateSchema(schema, { 'url': currentUrl })
      schema.validate({ 'url': currentUrl })
      .then(() => {
        watchedState.form = { ...watchedState.form, valid: true, error: null };
        watchedState.loadingProcess = { ...watchedState.loadingProcess, status: 'sending', error: null };
        return currentUrl;
      })
        .then((url) => axios.get(addProxy(url), { timeout: 15000 }))
      .then((response) => {
        console.log(response)
        watchedState.loadingProcess = { ...watchedState.loadingProcess, status: 'success', error: null };
        return response.data})
      .then((data) => {        
        const parsedData = parse(data);
        const feed = {
          title: parsedData.title,
          description: parsedData.description,
        };
        watchedState.feeds = [...watchedState.feeds, ...[feed]];
        const posts = parsedData.items.map((item) => ({...item, id: `${uniqueId()}`}));
        watchedState.posts = [...watchedState.posts, ...posts];
      })
      .then(() => watchedState.urls = [...watchedState.urls, currentUrl])
      .catch((e) => {
        console.log('Errors!',e, e.errors,'name:', e.name)
        handleErrors(e)
      }).then(() => console.log('state:', state));
  });

  elements.postsContainer.addEventListener('click', ({ target }) => {
    const id = target.dataset.id
    if (!id) return;

    watchedState.ui.visitedLinkIds = watchedState.ui.visitedLinkIds.add(id);
    if (target instanceof HTMLButtonElement) {
      const post = state.posts.find((item) => item.id === id);
      const modal = new Modal(elements.modal);
      renderModal(elements.modal, post);
      modal.show();
    }
  });
};

app();

// https://api.github.com/repos/javascript-tutorial/en.javascript.info/commits
