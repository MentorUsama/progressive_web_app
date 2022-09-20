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

// ============ Displaying Notification by javascript ============
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
  navigator.serviceWorker.ready.then(function (swreg) {
    swreg.showNotification("Successfully subscribed (FROM SW!!)", options);
  });
}
function configurePushSub() {
  if (!("serviceWorker" in navigator)) {
    return;
  }
  var reg;
  navigator.serviceWorker.ready
    .then(function (swreg) {
      reg = swreg;
      return swreg.pushManager.getSubscription();
    })
    .then(function (sub) {
      if (sub == null) {
        // Create a new subscription
        var vapidPublicKey =
          "BBo-u3rf39PHr7FZM4P5Mm795QXaGsTnTL5DnCn9Drij5DBZctiMeMmniez9ldSQehR6hcK_zYOrtr1WSmELEZY";
        var convertedVapidPublicKey = urlBase64ToUint8Array(vapidPublicKey);
        return reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: convertedVapidPublicKey,
        });
      } else {
        // We have a subscription
      }
    })
    .then(function (newSub) {
      fetch(
        "https://practise-c4216-default-rtdb.firebaseio.com/subscriptions.json",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(newSub),
        }
      )
        .then(function (res) {
          if(res.ok)
            displayConfirmNotification();
        })
        .catch((err) => {
          console.log(err);
        });
    });
}
function askForNotificationPermission() {
  Notification.requestPermission(function (result) {
    console.log("User Choice", result);
    if (result != "granted") {
      console.log("Permission Is Not Granted");
    } else {
      configurePushSub();
    }
  });
}
if ("Notification" in window && "serviceWorker" in navigator) {
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
