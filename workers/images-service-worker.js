// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles
parcelRequire = (function (modules, cache, entry, globalName) {
  // Save the require from previous bundle to this closure if any
  var previousRequire = typeof parcelRequire === 'function' && parcelRequire;
  var nodeRequire = typeof require === 'function' && require;

  function newRequire(name, jumped) {
    if (!cache[name]) {
      if (!modules[name]) {
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire = typeof parcelRequire === 'function' && parcelRequire;
        if (!jumped && currentRequire) {
          return currentRequire(name, true);
        }

        // If there are other bundles on this page the require from the
        // previous one is saved to 'previousRequire'. Repeat this as
        // many times as there are bundles until the module is found or
        // we exhaust the require chain.
        if (previousRequire) {
          return previousRequire(name, true);
        }

        // Try the node require function if it exists.
        if (nodeRequire && typeof name === 'string') {
          return nodeRequire(name);
        }

        var err = new Error('Cannot find module \'' + name + '\'');
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }

      localRequire.resolve = resolve;
      localRequire.cache = {};

      var module = cache[name] = new newRequire.Module(name);

      modules[name][0].call(module.exports, localRequire, module, module.exports, this);
    }

    return cache[name].exports;

    function localRequire(x){
      return newRequire(localRequire.resolve(x));
    }

    function resolve(x){
      return modules[name][1][x] || x;
    }
  }

  function Module(moduleName) {
    this.id = moduleName;
    this.bundle = newRequire;
    this.exports = {};
  }

  newRequire.isParcelRequire = true;
  newRequire.Module = Module;
  newRequire.modules = modules;
  newRequire.cache = cache;
  newRequire.parent = previousRequire;
  newRequire.register = function (id, exports) {
    modules[id] = [function (require, module) {
      module.exports = exports;
    }, {}];
  };

  var error;
  for (var i = 0; i < entry.length; i++) {
    try {
      newRequire(entry[i]);
    } catch (e) {
      // Save first error but execute all entries
      if (!error) {
        error = e;
      }
    }
  }

  if (entry.length) {
    // Expose entry point to Node, AMD or browser globals
    // Based on https://github.com/ForbesLindesay/umd/blob/master/template.js
    var mainExports = newRequire(entry[entry.length - 1]);

    // CommonJS
    if (typeof exports === "object" && typeof module !== "undefined") {
      module.exports = mainExports;

    // RequireJS
    } else if (typeof define === "function" && define.amd) {
     define(function () {
       return mainExports;
     });

    // <script>
    } else if (globalName) {
      this[globalName] = mainExports;
    }
  }

  // Override the current require with this new one
  parcelRequire = newRequire;

  if (error) {
    // throw error from earlier, _after updating parcelRequire_
    throw error;
  }

  return newRequire;
})({"workers/images-service-worker.js":[function(require,module,exports) {
const FILES_TO_CACHE = ["/", "/index.html", "/assets/css/style.css", "/assets/js/loadPosts.js", "/assets/images/Angular-icon.png", "/assets/images/React-icon.png", "/assets/images/Vue.js-icon.png", "/manifest.webmanifest", "/favicon.ico", "/assets/images/icons/icon-72x72.png", "/assets/images/icons/icon-96x96.png", "/assets/images/icons/icon-128x128.png", "/assets/images/icons/icon-144x144.png", "/assets/images/icons/icon-152x152.png", "/assets/images/icons/icon-192x192.png", "/assets/images/icons/icon-384x384.png", "/assets/images/icons/icon-512x512.png"];
const CACHE_NAME = "static-cache-v2";
const DATA_CACHE_NAME = "data-cache-v1"; // install

self.addEventListener("install", function (evt) {
  evt.waitUntil(caches.open(CACHE_NAME).then(cache => {
    console.log("Your files were pre-cached successfully!");
    return cache.addAll(FILES_TO_CACHE);
  }));
  self.skipWaiting();
});
self.addEventListener("activate", function (evt) {
  evt.waitUntil(caches.keys().then(keyList => {
    return Promise.all(keyList.map(key => {
      if (key !== CACHE_NAME && key !== DATA_CACHE_NAME) {
        console.log("Removing old cache data", key);
        return caches.delete(key);
      }
    }));
  }));
  self.clients.claim();
}); // fetch

self.addEventListener("fetch", function (evt) {
  console.log('fetch'); // cache successful requests to the API

  if (evt.request.url.includes(".jpg")) {
    evt.respondWith(caches.open(DATA_CACHE_NAME).then(cache => {
      console.log('getting', evt.request.url);
      return fetch(evt.request).then(response => {
        // If the response was good, clone it and store it in the cache.
        if (response.status === 200) {
          cache.put(evt.request.url, response.clone());
        }

        return response;
      }).catch(err => {
        // Network request failed, try to get it from the cache.
        return cache.match(evt.request);
      });
    }).catch(err => console.log(err)));
    return;
  } // if the request is not for the API, serve static assets using "offline-first" approach.
  // see https://developers.google.com/web/fundamentals/instant-and-offline/offline-cookbook#cache-falling-back-to-network


  evt.respondWith(caches.match(evt.request).then(function (response) {
    console.log('respond with ', evt.request.url);
    return response || fetch(evt.request);
  }));
}); // in the service worker

self.addEventListener('message', event => {// event is an ExtendableMessageEvent object
  // console.log(`client sent to worker: ${event.data}`);
});
},{}]},{},["workers/images-service-worker.js"], null)
//# sourceMappingURL=/workers/images-service-worker.js.map