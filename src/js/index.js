import onChange from 'on-change';
import * as yup from 'yup';
//  import validate from './validation.js';

import i18next from 'i18next';
import resources from './locales/index.js';

console.log('arr:', navigator.languages);
console.log('str:', navigator.language);

const renderError = (input, feedbackElement, error) => {
  if (!error) {
    input.classList.remove('is-invalid');
  } else {
    input.classList.add('is-invalid');
  }
  
  return feedbackElement.textContent = error;
};

/*const render = () => {
  console.log('render')
};
*/

const f = () => {
  const state = {
    urls: [],
    form: {
      valid: false,
      errors: [],
    },
    currentLang: navigator.language,
    processState: 'filling',
  };

    const i18n = i18next.createInstance();
    i18n.init({
      lng: state.currentLang,
      fallbackLng: 'en',
      debug: true,
      resources,
    });

  const btn = document.querySelector('button');
  btn.textContent = i18n.t('add');

  yup.setLocale({
    string: {
      url: () => ({ key: 'badUrl'}),
    },
    mixed: {      
      required: () => ({ key: 'emptyField' }),
    }
  })

  const schema = yup.object({
    url: yup.string()
      .url()
      .required(),
  });

  const form = document.querySelector('form');
  const input = document.querySelector('#url-input');
  const feedbackElement = document.querySelector('.feedback');


  const watchedState = onChange(state, (path, val) => {
    switch (path) {
      case 'form.errors':
        console.log(val)
        renderError(input, feedbackElement, val[0]);
        break;
    
      default:
        break;
    }
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const data = new FormData(e.target);
    const currentUrl = data.get('url');
    schema.validate({ 'url': currentUrl })
      .then(() => {
        watchedState.form.valid = true;
        watchedState.form.errors = [];
        fetch(currentUrl).then((response) => { console.log(response.json()) });
      })
      .catch((e) => {
        const errors = e.errors.map((err) => i18n.t(err.key));
        watchedState.form.errors = errors;
        watchedState.form.valid = false;        
      }).then(() => console.log('state async:', state));

    console.log('state:', state)
    console.log(state.form.valid)

    if (state.form.valid) {
      // fetch(currentUrl).then((response) => {console.log(response.json())});
    }
  });
};

f();

// https://api.github.com/repos/javascript-tutorial/en.javascript.info/commits