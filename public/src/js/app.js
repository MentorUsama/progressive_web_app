deferredPrompt = null;
var enableNotificationsButtons = document.querySelectorAll(
  ".enable-notifications"
);

if (!window.Promise) {
  window.Promise = Promise;
}

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("../../sw.js").then(() => {
    console.log("Service Worker Is Register");
  });
}

window.addEventListener("beforeinstallprompt", (event) => {
  console.log("beforeinstallprompt is fired");
  event.preventDefault();
  deferredPrompt = event;
  return false;
});

function displayConfirmNotification() {
  var options = {
    body: "You successfully subscribed to our Notification services ",
    icon: "/src/images/icons/app-icon-96x96.png",
    image: "/src/images/sf-boat.jpg",
    dir: "ltr",
    lang: "en-US", // BCP 47,
    vibrate: [100, 50, 200],
    badge: "/src/images/icons/app-icon-96x96.png", // In android
    tag: "confirm-notification", // For same notification they will replace each other if their is multiple one
    renotify: true, // New notification of same tag will vibrate,
    actions: [
      {
        action: "confirm",
        title: "Ok",
        icon: "/src/images/icons/app-icon-96x96.png",
      },
      {
        action: "cancel",
        title: "Cancel",
        icon: "/src/images/icons/app-icon-96x96.png",
      },
    ],
  };
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.ready.then(function (swreg) {
      swreg.showNotification("Successfully subscribed (FROM SW!!)", options);
    });
  } else {
    new Notification("Successfully subscribed", options);
  }
}
function askForNotificationPermission() {
  Notification.requestPermission(function (result) {
    console.log("User Choice", result);
    if (result != "granted") {
      console.log("Permission Is Not Granted");
    } else {
      displayConfirmNotification();
    }
  });
}
if ("Notification" in window) {
  for (var i = 0; i < enableNotificationsButtons.length; i++) {
    enableNotificationsButtons[i].style.display = "inline-block";
    enableNotificationsButtons[i].addEventListener(
      "click",
      askForNotificationPermission
    );
  }
} else {
  console.log("Notification Not Found");
}
