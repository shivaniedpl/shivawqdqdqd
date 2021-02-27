define("@wsb/guac-widget-shared/lib/components/Recaptcha/recaptcha-loader-37e8eaaa.js", ['exports', "@wsb/guac-widget-shared/c/_rollupPluginBabelHelpers"], function (exports, _rollupPluginBabelHelpers) {
  'use strict';
  /* eslint-disable callback-return */
  // NOTE: Exported functions within this module expect to be executed within the
  // context of the browser.

  const URL = 'https://www.google.com/recaptcha/api.js';
  const RECAPTCHA_SCRIPT_ID = 'recaptcha-script';

  const initialRecaptchaState = () => ({
    siteKey: null,
    siteKeyRequested: false,
    siteKeyCallbacks: [],
    scriptCallbacks: []
  });

  function isScriptLoaded() {
    return typeof window.grecaptcha !== 'undefined' && window.grecaptcha.execute;
  }

  function getExistingScript() {
    return document.querySelector(`#${RECAPTCHA_SCRIPT_ID}`);
  }

  function addScriptLoadCallback(callback) {
    window.wsb.recaptcha.scriptCallbacks.push(callback);
  }

  function onScriptLoad() {
    window.grecaptcha.ready(() => {
      const callbacks = window.wsb.recaptcha.scriptCallbacks;

      while (callbacks.length) {
        const callback = callbacks.pop();
        callback();
      }
    });
  }

  function createScript(siteKey) {
    const script = document.createElement('script');
    script.setAttribute('src', `${URL}?render=${encodeURIComponent(siteKey)}`);
    script.setAttribute('id', RECAPTCHA_SCRIPT_ID);
    script.setAttribute('async', true);
    script.setAttribute('defer', true);
    script.onload = onScriptLoad;
    document.body.appendChild(script);
    return script;
  }

  function addOnSiteKeyLoadCallback(callback) {
    window.wsb.recaptcha.siteKeyCallbacks.push(callback);
  }

  function onSiteKeyLoad(xhr) {
    if (xhr.readyState !== 4 || !(global._ || guac.lodash).includes([200, 304], xhr.status)) {
      return;
    }

    const response = JSON.parse(xhr.responseText);
    const {
      recaptcha
    } = window.wsb;
    const callbacks = recaptcha.siteKeyCallbacks;

    if (!response.siteKey) {
      return;
    }

    recaptcha.siteKey = response.siteKey;

    while (callbacks.length) {
      const callback = callbacks.pop();
      callback(recaptcha.siteKey);
    }
  }

  function addRecaptchaToWindow() {
    if (window.wsb && window.wsb.recaptcha) {
      return;
    }

    window.wsb = window.wsb || {};
    window.wsb.recaptcha = initialRecaptchaState();
  } // Testing utility function that lets internal state to be reset.


  function loadSiteKey(url, callback) {
    addRecaptchaToWindow();
    const {
      recaptcha
    } = window.wsb;

    if (recaptcha.siteKey) {
      callback(recaptcha.siteKey);
      return;
    }

    addOnSiteKeyLoadCallback(callback);

    if (recaptcha.siteKeyRequested) {
      return;
    }

    recaptcha.siteKeyRequested = true;
    const xhr = new XMLHttpRequest();
    xhr.open('GET', url);
    xhr.send();

    xhr.onreadystatechange = () => onSiteKeyLoad(xhr);
  }

  function loadScript({
    siteKey
  }, onLoad) {
    addRecaptchaToWindow();

    if (isScriptLoaded()) {
      onLoad();
      return;
    }

    addScriptLoadCallback(onLoad);

    if (getExistingScript()) {
      return;
    }

    createScript(siteKey);
  }

  class RecaptchaLoader extends (global.React || guac.react).Component {
    constructor(...args) {
      super(...args);

      _rollupPluginBabelHelpers._defineProperty(this, "hideRecaptchaBadge", () => {
        const recaptcha = document.querySelector('.grecaptcha-badge');

        if (!recaptcha) {
          return;
        }

        recaptcha.setAttribute('hidden', true);
      });

      _rollupPluginBabelHelpers._defineProperty(this, "loadRecaptcha", siteKey => {
        loadScript({
          siteKey
        }, () => {
          this.execute = () => {
            window.grecaptcha.execute(siteKey, {
              action: 'formSubmit'
            }).then(this.props.onComplete);
          };

          this.hideRecaptchaBadge();
        });
      });
    }

    componentDidMount() {
      this.execute = this.props.onComplete;
      loadSiteKey(this.siteKeyUrl, this.loadRecaptcha);
    }

    get siteKeyUrl() {
      return `${this.props.formSubmitHost}${this.props.formSubmitEndpoint}`;
    }

    render() {
      return null;
    }

  }

  RecaptchaLoader.propTypes = {
    onComplete: (global.PropTypes || guac["prop-types"]).func.isRequired,
    formSubmitHost: (global.PropTypes || guac["prop-types"]).string.isRequired,
    formSubmitEndpoint: (global.PropTypes || guac["prop-types"]).string
  };
  RecaptchaLoader.defaultProps = {
    formSubmitEndpoint: '/v3/recaptcha'
  };
  exports.default = RecaptchaLoader;
  Object.defineProperty(exports, '__esModule', {
    value: true
  });
});
if (typeof window !== 'undefined') window.global = window;
