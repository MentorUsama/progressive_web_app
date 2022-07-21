defferedPrompt=null
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
    defferedPrompt=event
    return false
})