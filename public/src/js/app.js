deferredPrompt=null
var enableNotificationsButtons=document.querySelectorAll('.enable-notifications')

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

function askForNotificationPermission(){
    Notification.requestPermission(function(result){
        console.log("User Choice",result)
        if(result!='granted'){
            console.log("Permission Is Not Granted")
        }
    })
}
if("Notification" in window){
    for(var i=0;i<enableNotificationsButtons.length;i++){
        enableNotificationsButtons[i].style.display='inline-block'
        enableNotificationsButtons[i].addEventListener('click',askForNotificationPermission)
    }
}
else{
    console.log("Notification Not Found")
}