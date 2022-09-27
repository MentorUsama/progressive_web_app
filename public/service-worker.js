importScripts("./src/js/idb.js");
importScripts("./src/js/utility.js");

importScripts("workbox-sw.prod.v2.1.3.js");
const workboxSW = new self.WorkboxSW();
workboxSW.router.registerRoute(
  /.*(?:googleapis|gstatic)\.com.*$/,
  workboxSW.strategies.staleWhileRevalidate({
    cacheName: "google-font",
    cacheExpiration: {
      maxEntries: 3,
      maxAgeSeconds: 60 * 60 * 24 * 30,
    },
  })
);
workboxSW.router.registerRoute(
  "https://cdnjs.cloudflare.com/ajax/libs/material-design-lite/1.3.0/material.indigo-pink.min.css",
  workboxSW.strategies.staleWhileRevalidate({
    cacheName: "material-css",
  })
);
workboxSW.router.registerRoute(
  /.*(?:firebasestorage\.googleapis)\.com.*$/,
  workboxSW.strategies.staleWhileRevalidate({
    cacheName: "post-images",
  })
);
workboxSW.router.registerRoute(
  "https://practise-c4216-default-rtdb.firebaseio.com/posts.json",
  function (args) {
    return fetch(args.event.request).then((res) => {
      var clonedRes = res.clone();
      clearAllData("posts")
        .then(function () {
          return clonedRes.json();
        })
        .then(function (data) {
          for (var key in data) {
            writeDate("posts", data[key]);
          }
        });
      return res;
    });
  }
);
workboxSW.precache([
  {
    "url": "favicon.ico",
    "revision": "2cab47d9e04d664d93c8d91aec59e812"
  },
  {
    "url": "index.html",
    "revision": "bcd6576d9dad76b70c74f629e38d4b0a"
  },
  {
    "url": "manifest.json",
    "revision": "442b7e9dbfd256ccf34df2869bd0e1d5"
  },
  {
    "url": "offline.html",
    "revision": "f17d802579bfd82b575131665881e829"
  },
  {
    "url": "service-worker.js",
    "revision": "163015518a533a5f3b3e18f23c38b11c"
  },
  {
    "url": "src/css/app.css",
    "revision": "6d09f74487baae2843eb6b8983064f6f"
  },
  {
    "url": "src/css/feed.css",
    "revision": "28a96e88dbdc5b72ff593a483fb4b014"
  },
  {
    "url": "src/css/help.css",
    "revision": "1c6d81b27c9d423bece9869b07a7bd73"
  },
  {
    "url": "src/js/app.js",
    "revision": "0d56f6cbdc0791ceb62c86e88663281c"
  },
  {
    "url": "src/js/feed.js",
    "revision": "1bdd757369d7b4a711f80ab9cdc62b2c"
  },
  {
    "url": "src/js/fetch.js",
    "revision": "6b82fbb55ae19be4935964ae8c338e92"
  },
  {
    "url": "src/js/idb.js",
    "revision": "017ced36d82bea1e08b08393361e354d"
  },
  {
    "url": "src/js/material.min.js",
    "revision": "713af0c6ce93dbbce2f00bf0a98d0541"
  },
  {
    "url": "src/js/promise.js",
    "revision": "10c2238dcd105eb23f703ee53067417f"
  },
  {
    "url": "src/js/utility.js",
    "revision": "2714964b1bcde7ce3e249c8ccbc12c9b"
  },
  {
    "url": "sw-base.js",
    "revision": "c08a3b9a197fd6ce81859a22817ffa51"
  },
  {
    "url": "sw.js",
    "revision": "022111720286ed9fedbdae35b48c8f9d"
  },
  {
    "url": "workbox-sw.prod.v2.1.3.js",
    "revision": "a9890beda9e5f17e4c68f42324217941"
  },
  {
    "url": "src/images/main-image-lg.jpg",
    "revision": "31b19bffae4ea13ca0f2178ddb639403"
  },
  {
    "url": "src/images/main-image-sm.jpg",
    "revision": "c6bb733c2f39c60e3c139f814d2d14bb"
  },
  {
    "url": "src/images/main-image.jpg",
    "revision": "5c66d091b0dc200e8e89e56c589821fb"
  },
  {
    "url": "src/images/sf-boat.jpg",
    "revision": "0f282d64b0fb306daf12050e812d6a19"
  }
]);
