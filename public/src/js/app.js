deferredPrompt=null

if (!window.Promise) {
    window.Promise = Promise;
  }
  
if('serviceWorker' in navigator)
{
    navigator.serviceWorker.register('../../sw.js')
    .then(()=>{
        console.log("Service Worker Is Register")
    })
}

window.addEventListener("beforeinstallprompt",(event)=>{
    console.log("beforeinstallprompt is fired")
    event.preventDefault()
    deferredPrompt=event
    return false
})