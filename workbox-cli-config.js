 module.exports = {
  "globDirectory": "public\\",
  "globPatterns": [
    "**/*.{ico,html,json,css,js}",
    "src/images/*.{jpg,png}"
  ],
  "swDest": "public/service-worker.js",
  "globIgnores": [
    "..\\workbox-cli-config.js",
    "help/**"
  ]
};
