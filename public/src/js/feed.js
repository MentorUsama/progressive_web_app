var shareImageButton = document.querySelector("#share-image-button");
var createPostArea = document.querySelector("#create-post");
var closeCreatePostModalButton = document.querySelector(
  "#close-create-post-modal-btn"
);
var sharedMomentsArea = document.querySelector("#shared-moments");
var form = document.querySelector("form");
var titleInput = document.querySelector("#title");
var locationInput = document.querySelector("#location");

function openCreatePostModal() {
  createPostArea.style.display = "block";
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
  createPostArea.style.display = "none";
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
function sendData(){
  fetch('https://practise-c4216-default-rtdb.firebaseio.com/posts.json',{
    method:"POST",
    headers:{
      'Content-Type':'application/json',
      'Accept':'application/json'
    },
    body:JSON.stringify({
      id:new Date().toISOString(),
      title:titleInput.value,
      location:locationInput.value,
      image:'https://images.pexels.com/photos/15286/pexels-photo.jpg?auto=compress&cs=tinysrgb&w=600'
    })
  }).then(function(res){
    console.log('sendded data',res)
    updateUI()
  })
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
      };
      writeDate("sync-posts", post)
        .then(() => {
          return sw.sync.register("sync-new-posts");
        })
        .then(function () {
          console.log("Post Saved For Syncing")
          // var snackbarContainer = document.querySelector("#confirmation-toast");
          // var data = { message: "Your Post Was Saved For Synchrinizaion" };
          // snackbarContainer.MaterialSnackbar.showSnackBar(data);
        })
        .catch(function (error) {
          console.log("Error background sync ===>",error);
        });
    });
  } else {
    sendData()
  }
});
