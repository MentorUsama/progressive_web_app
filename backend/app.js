const express = require("express");
const bodyParser = require("body-parser");
var admin = require("firebase-admin");
const path = require("path");
var serviceAccount = require(path.join(__dirname,"service_account.json"));
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://practise-c4216-default-rtdb.firebaseio.com",
});
var ad = admin.database();

const app = express();
app.use(bodyParser.json()); // application/json
app.use(bodyParser.urlencoded({ extended: true }));
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "OPTIONS, GET, POST, PUT, PATCH, DELETE"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

app.post("/post", (request, response, next) => {
  admin.database()
    .ref("posts")
    .push({
      id: request.body.id,
      title: request.body.title,
      location: request.body.location,
      image: request.body.image,
    })
    .then(function () {
      response
        .status(201)
        .json({ message: "Data stored", id: request.body.id });
    })
    .catch(function (err) {
      response.status(500).json({ error: err });
    });
});

const server = app.listen(8080);
