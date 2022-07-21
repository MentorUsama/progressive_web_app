self.addEventListener('install',(event)=>{
    console.log("[Service worker] Installing service worker ...",event)
})

self.addEventListener('activate',(event)=>{
    console.log("[Service worker] activating service worker ...",event)
    return self.clients.claim()
})

// Trigger when something is fetched or we manually send fetched event
self.addEventListener('fetch',(event)=>{
    console.log("[Service worker] fetching....",event)
    event.respondWith(fetch(event.request)) // Overwrite data that is get back
})