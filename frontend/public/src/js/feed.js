var shareImageButton = document.querySelector("#share-image-button");
var createPostArea = document.querySelector("#create-post");
var closeCreatePostModalButton = document.querySelector(
  "#close-create-post-modal-btn"
);
var sharedMomentsArea = document.querySelector("#shared-moments");
var form = document.querySelector("form");
var titleInput = document.querySelector("#title");
var locationInput = document.querySelector("#location");
var videoPlayer = document.querySelector("#player");
var canvasElement = document.querySelector("#canvas");
var captureButton = document.querySelector("#capture-btn");
var imagePicker = document.querySelector("#image-picker");
var imagePickerArea = document.querySelector("#pick-image");
var picture = null;
var locationBtn = document.querySelector("#location-btn");
var locationLoader = document.querySelector("#location-loader");
var fetchedLocation = { lat: 0, lng: 0 };

function initializeMedia() {
  if (!("mediaDevices" in navigator)) {
    navigator.mediaDevices = {};
  }

  if (!("getUserMedia" in navigator.mediaDevices)) {
    navigator.mediaDevices.getUserMedia = function (constraints) {
      var getUserMedia =
        navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

      if (!getUserMedia) {
        return Promise.reject(new Error("getUserMedia is not implemented!"));
      }

      return new Promise(function (resolve, reject) {
        getUserMedia.call(navigator, constraints, resolve, reject);
      });
    };
  }

  navigator.mediaDevices
    .getUserMedia({ video: true })
    .then(function (stream) {
      videoPlayer.srcObject = stream;
      videoPlayer.style.display = "block";
    })
    .catch(function (err) {
      imagePickerArea.style.display = "block";
    });
}
function initilizeLocation() {
  if (!"geolocation" in navigator) {
    locationBtn.style.display = "none";
    return;
  }
}
locationBtn.addEventListener("click", (event) => {
  if (!"geolocation" in navigator) {
    locationBtn.style.display = "none";
    return;
  }

  locationBtn.style.display = "none";
  locationLoader.style.display = "block";
  navigator.geolocation.getCurrentPosition(
    function (position) {
      locationBtn.style.display = "inline";
      locationLoader.style.display = "none";
      fetchedLocation = { lat: position.coords.latitude, lng: 0 };
      locationInput.value = "In Pakistan (hard coded)";
      document.querySelector("#manual-location").classList.add("is-focused");
    },
    function (error) {
      locationBtn.style.display = "inline";
      locationLoader.style.display = "none";
      fetchedLocation = { lat: 0, lng: 0 };
      alert("Couldn't fetch location please enter manually!!");
      console.log(error);
    },
    {
      timeout: 7000,
    }
  );
});
captureButton.addEventListener("click", function (event) {
  canvasElement.style.display = "block";
  videoPlayer.style.display = "none";
  captureButton.style.display = "none";
  var context = canvasElement.getContext("2d");
  context.drawImage(
    videoPlayer,
    0,
    0,
    canvas.width,
    videoPlayer.videoHeight / (videoPlayer.videoWidth / canvas.width)
  );
  videoPlayer.srcObject.getVideoTracks().forEach(function (track) {
    track.stop();
  });

  videoPlayer.srcObject.getAudioTracks().forEach(function (audio) {
    audio.stop();
  });

  picture = dataURItoBlob(canvasElement.toDataURL());
});

imagePicker.addEventListener("change", function (event) {
  picture = event.target.files[0];
});
function openCreatePostModal() {
  setTimeout(function(){
    createPostArea.style.transform = "translateY(0vh)";
  },10)
  initializeMedia();
  initilizeLocation();
  if (deferredPrompt) {
    deferredPrompt.prompt();

    deferredPrompt.userChoice.then(function (choiceResult) {
      console.log(choiceResult.outcome);

      if (choiceResult.outcome === "dismissed") {
        console.log("User cancelled installation");
      } else {
        console.log("User added to home screen");
      }
    });

    deferredPrompt = null;
  }

  // if ('serviceWorker' in navigator) {
  //   navigator.serviceWorker.getRegistrations()
  //     .then(function(registrations) {
  //       for (var i = 0; i < registrations.length; i++) {
  //         registrations[i].unregister();
  //       }
  //     })
  // }
}

function closeCreatePostModal() {
  imagePickerArea.style.display = "none";
  videoPlayer.style.display = "none";
  canvasElement.style.display = "none";
  locationBtn.style.display = "inline";
  locationLoader.style.display = "none";
  captureButton.style.display='inline'

  if (videoPlayer.srcObject) {
    videoPlayer.srcObject.getVideoTracks().forEach(function (track) {
      track.stop();
    });
    videoPlayer.srcObject.getAudioTracks().forEach(function (audio) {
      audio.stop();
    });
  }

  setTimeout(() => {
    createPostArea.style.transform = "translateY(100vh)";
  }, 10);
}

shareImageButton.addEventListener("click", openCreatePostModal);

closeCreatePostModalButton.addEventListener("click", closeCreatePostModal);

// Function to add cache on user demand (not in use right now)
function onSaveButtonClicked(event) {
  console.log("clicked");
  if (!("caches" in window)) return;
  caches.open("user-requested").then(function (cache) {
    cache.add("https://httpbin.org/get");
    cache.add("../images/sf-boat.jpg");
  });
}
function clearCards() {
  while (sharedMomentsArea.hasChildNodes()) {
    sharedMomentsArea.removeChild(sharedMomentsArea.lastChild);
  }
}
function clearCards() {
  while (sharedMomentsArea.hasChildNodes()) {
    sharedMomentsArea.removeChild(sharedMomentsArea.lastChild);
  }
}

function createCard(data) {
  var cardWrapper = document.createElement("div");
  cardWrapper.className = "shared-moment-card mdl-card mdl-shadow--2dp";
  var cardTitle = document.createElement("div");
  cardTitle.className = "mdl-card__title";
  cardTitle.style.backgroundImage = "url(" + data.image + ")";
  cardTitle.style.backgroundSize = "cover";
  cardTitle.style.height = "180px";
  cardWrapper.appendChild(cardTitle);
  var cardTitleTextElement = document.createElement("h2");
  cardTitleTextElement.style.color = "white";
  cardTitleTextElement.className = "mdl-card__title-text";
  cardTitleTextElement.textContent = data.title;
  cardTitle.appendChild(cardTitleTextElement);
  var cardSupportingText = document.createElement("div");
  cardSupportingText.className = "mdl-card__supporting-text";
  cardSupportingText.textContent = data.location;
  cardSupportingText.style.textAlign = "center";
  // var cardSaveButton = document.createElement('button');
  // cardSaveButton.textContent = 'Save';
  // cardSaveButton.addEventListener('click', onSaveButtonClicked);
  // cardSupportingText.appendChild(cardSaveButton);
  cardWrapper.appendChild(cardSupportingText);
  componentHandler.upgradeElement(cardWrapper);
  sharedMomentsArea.appendChild(cardWrapper);
}

function updateUI(data) {
  clearCards();
  for (var i = 0; i < data.length; i++) {
    createCard(data[i]);
  }
}
// =========== Sending request to get card ===========
const url = "https://practise-c4216-default-rtdb.firebaseio.com/posts.json";
var networkDataReceived = false;
fetch(url)
  .then(function (res) {
    return res.json();
  })
  .then(function (data) {
    networkDataReceived = true;
    console.log("From web data");
    clearCards();
    var dataArray = [];
    for (var key in data) {
      dataArray.push(data[key]);
    }
    updateUI(dataArray);
  })
  .catch((e) => {
    console.log(e);
  });

if ("indexedDB" in window) {
  // caches.match(url)
  //   .then(response=>{
  //     if(response) return response.json()
  //   })
  //   .then((data)=>{
  //     console.log("From cache")
  //     if(!networkDataReceived)
  //     {
  //       clearCards()
  //       var dataArray=[]
  //       for(var key in data)
  //       {
  //         dataArray.push(data[key])
  //       }
  //       updateUI(dataArray);
  //     }
  //   })
  //   .catch(error=>{

  //   })
  readAllData("posts").then((data) => {
    if (!networkDataReceived) {
      console.log("From Cache", data);
      updateUI(data);
    }
  });
}
function sendData() {
  var postData = new FormData();
  const id = new Date().toISOString();
  postData.append("id", id);
  postData.append("title", titleInput.value);
  postData.append("location", locationInput.value);
  postData.append("file", picture, id + ".png");
  postData.append("rawLocationLat", fetchedLocation.lat);
  postData.append("rawLocationLng", fetchedLocation.lng);

  fetch("http://localhost:8080/post", {
    method: "POST",
    body: postData,
  }).then(function (res) {
    console.log("sendded data", res);
    updateUI();
  });
}
form.addEventListener("submit", function (event) {
  event.preventDefault();

  if (titleInput.value.trim() === "" || locationInput.value.trim() === "") {
    alert("Please enter valid data!");
    return;
  }

  closeCreatePostModal();
  if ("serviceWorker" in navigator && "SyncManager" in window) {
    navigator.serviceWorker.ready.then(function (sw) {
      var post = {
        title: titleInput.value,
        location: locationInput.value,
        id: new Date().toISOString(),
        file: picture,
        rawLocation: fetchedLocation,
      };
      writeDate("sync-posts", post)
        .then(() => {
          return sw.sync.register("sync-new-posts");
        })
        .then(function () {
          console.log("Post Saved For Syncing");
          // var snackbarContainer = document.querySelector("#confirmation-toast");
          // var data = { message: "Your Post Was Saved For Synchrinizaion" };
          // snackbarContainer.MaterialSnackbar.showSnackBar(data);
        })
        .catch(function (error) {
          console.log("Error background sync ===>", error);
        });
    });
  } else {
    sendData();
  }
});
