const express = require("express");
const bodyParser = require("body-parser");
const webpush = require("web-push");
var admin = require("firebase-admin");
const path = require("path");
const multer = require("multer");
var UUID = require("uuid-v4");
var fs = require('fs');

// ====== Environment Variable ======
require("dotenv").config();

// ====== Multer Initilizing =====
const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "file");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + file.originalname);
  },
});
const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

// ===== Initilizing Firebase =====
var serviceAccount = require(path.join(__dirname, "service_account.json"));
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://practise-c4216-default-rtdb.firebaseio.com",
  storageBucket: "gs://practise-c4216.appspot.com",
});
var ad = admin.database();

// ====== Initilizing Heders For APIS ======
const app = express();
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "OPTIONS, GET, POST, PUT, PATCH, DELETE"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

// ====== Initilizing global middleware ======
app.use(
  multer({
    dest: "file",
    storage: fileStorage,
    fileFilter: fileFilter,
  }).single("file")
);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// ====== Post Routes ======
app.post("/post", async (request, response, next) => {
  // =============== Uploading Image on firebase ===============
  var uuid = UUID();
  const bucket = admin.storage().bucket();
  var uploadedFile;
  try {
    uploadedFile = await bucket.upload(`${request.file.path}`, {
      uploadType: "media",
      metadata: {
        metadata: {
          contentType: request.file.mimetype,
          firebaseStorageDownloadTokens: uuid,
        },
      },
    });
  } catch (error) {
    console.log(error);
    return response.status(500).json({ error: error });
  }
  // =============== Storung Data into database ===============
  try {
    await admin
      .database()
      .ref("posts")
      .push({
        id: request.body.id,
        title: request.body.title,
        location: request.body.location,
        image:
          "https://firebasestorage.googleapis.com/v0/b/" +
          bucket.name +
          "/o/" +
          encodeURIComponent(uploadedFile[0].name) +
          "?alt=media&token=" +
          uuid,
          rawLocationLat:request.body.rawLocationLat,
          rawLocationLng:request.body.rawLocationLng
      });
  } catch (error) {
    return response.status(500).json({ error: error });
  }
  // =============== Getting Subscriptions ===============
  webpush.setVapidDetails(
    "mailto:usama.farhat.99@gmail.com",
    "BBo-u3rf39PHr7FZM4P5Mm795QXaGsTnTL5DnCn9Drij5DBZctiMeMmniez9ldSQehR6hcK_zYOrtr1WSmELEZY",
    process.env.PRIVATE_KEY
  );
  var subcriptions;
  try {
    subcriptions = await admin.database().ref("subscriptions").once("value");
  } catch (error) {
    return response.status(500).json({ error: error });
  }
  // =============== Sending Notifications ===============
  subcriptions.forEach(function (sub) {
    var pushConfig = {
      endpoint: sub.val().endpoint,
      keys: {
        auth: sub.val().keys.auth,
        p256dh: sub.val().keys.p256dh,
      },
    };
    webpush
      .sendNotification(
        pushConfig,
        JSON.stringify({
          title: "New Post",
          content: "New Post Added",
          openUrl: "/help",
        })
      )
      .catch((err) => {
        console.log(err);
      });
  });
  // =============== Deleting temp images ==========
  fs.unlinkSync(request.file.path);

  // =============== Sending Response ===============
  response.status(201).json({ message: "Data stored", id: request.body.id });
});

const server = app.listen(8080);
