var express = require('express')
var cors = require('cors')
var app = express()
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());
const { initializeApp } = require("firebase/app");
const { getAuth } = require("firebase/auth");
const { createUserWithEmailAndPassword } = require('firebase/auth');
const { signInWithEmailAndPassword } = require('firebase/auth');
const { getDatabase, ref, set } = require("firebase/database");
const firebaseConfig = require('./config');
initializeApp(firebaseConfig);


/* ********************************************SignUP API ***********************************/

app.get('/api/signup', function (req, res) {

  const params = req.body;
  var email = params.email;
  var password = params.password;
  var name = params.name;
  var phone = params.phone;

 // console.log(`${email} ${password} ${name} ${phone}`);

  const auth = getAuth();
  createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      // Signed in
      const user = userCredential.user;
      console.log(user.uid);
      res.send({
        status: 200,
        message: `signup done`,
      })

      // ...
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      if (errorCode === "auth/email-already-in-use") {
        res.send({
          status: 404,
          message: `email already exists`,
        })
      }
      else if (errorCode === "auth/invalid-email") {
        res.send({
          status: 404,
          message: `Invalid Email`,
        })
      }
      else {
        res.send({
          status: 404,
          message: errorMessage,
        })
      }
    });

})

// /* ********************************************SignUP API END ***********************************/

// /* ********************************************Login API ***********************************/

app.get('/api/login', function (req, res) {

  const params = req.body;
  const auth = getAuth();
  var email = params.email;
  var password = params.password;

 // console.log(`${email} ${password}`);

  signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      // Signed in
      // const user = userCredential.user;
      // console.log(userCredential.user);
      // console.log(userCredential.user.uid);
      // localStorage.setItem('uid', user.uid);
      // ...
      res.send({
        status: 202,
        message: `signin done`,
      })
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      console.log(errorCode);
      if (errorCode === "auth/email-already-in-use")
        alert("email already exists");
      else if (errorCode === "auth/invalid-email") {

        res.send({
          status: 404,
          message: `Invalid Email`,
        })
      }
      else if (errorCode === "auth/wrong-password") {
        res.send({
          status: 404,
          message: `Wrong Password`,
        })
      }
      else {
        res.send({
          status: 404,
          message: errorMessage,
        })
      }
    });

})

/* ********************************************Login API END ***********************************/



// /* ********************************************CreateRoom API ***********************************/

app.get('/api/createchatroom', function (req, res) {

  const params = req.body;
  //const auth = getAuth();
  var roomName = params.roomname;
  var password = params.password;
  var roomId = params.roomId;
  var uid = params.uid;

  //console.log(`create room details = ${roomName} ${password} ${roomId} ${uid}`);
  const db = getDatabase();

  const userRef = ref(db, "ChatRoom/" + roomId);

  set(userRef, {
    RoomName: roomName,
    Password: password,
  });
  const userRef1 = ref(db, "ChatRoom/" + roomId + "/Admin");
  set(userRef1, {
    uid: uid,
  });
  const userRef2 = ref(db, "users/" + uid + "/ChartRoom/" + roomId);
  set(userRef2, {
    RoomName: roomName,
  });
  console.log(`Chartroom link = https://chat-application-841a0.web.app/#/chat/room/${roomId}`);
  res.send({
    status: 202,
    message: `Room Created`,
  })


})

/* ********************************************Createroom API END ***********************************/


app.get("/", (req, res) => {
  console.log("api running");
  res.send({
    message: "sucess",
  })
})




app.listen(5000, () => {
  console.log(`server is running on 5000`);
})