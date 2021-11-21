var express = require('express')
var cors = require('cors')
var app = express()
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());
const { initializeApp } = require("firebase/app");
const { getAuth } = require("firebase/auth");
const { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } = require('firebase/auth');
const { onAuthStateChanged } = require('firebase/auth')
const { getDatabase, ref, set, onValue } = require("firebase/database");
const firebaseConfig = require('./config');
initializeApp(firebaseConfig);
// import uuidv4 from 'uuid/dist/v4'
const { v4: uuidv4 } = require('uuid');
var randomstring = require("randomstring");
/* ********************************************Signup API ***********************************/

app.post('/api/signup', function (req, res) {

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

// /* ********************************************Signup API END ***********************************/






// /* ********************************************Signin API ***********************************/

app.post('/api/signin', function (req, res) {

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

/* ********************************************Signin API END ***********************************/




// /* ********************************************Signout API ***********************************/

app.get('/api/signout', function (req, res) {
  const auth = getAuth();
  signOut(auth).then(() => {
    // Sign-out successful.
    res.send({
      status: 200,
      message: `signout done`,
    })
  }).catch((error) => {
    // An error happened.
    res.send({
      status: 404,
      message: error,
    })
  });
});



// /* ********************************************Signout API END ***********************************/





// /* ********************************************CreateRoom API ***********************************/

app.post('/api/createChatroom', function (req, res) {

  const params = req.body;
  //const auth = getAuth();
  var roomId = randomstring.generate({
    length: 6,
    charset: 'alphanumeric'
  });
  var roomName = params.roomName;
  var password = params.password;
  var uid = params.uid;

  //console.log(`create room details = ${roomName} ${password} ${roomId} ${uid}`);
  const db = getDatabase();

  const userRef = ref(db, "ChatRoom/" + roomId);

  set(userRef, {
    RoomName: roomName,
    Password: password,
  });
  const userRef1 = ref(db, "ChatRoom/" + roomId + "/Admins/" +uid);
  set(userRef1, {
    
  });
  const userRef2 = ref(db, "users/" + uid + "/ChatRoom/" + roomId);
  set(userRef2, {
    RoomName: roomName,
  });
  console.log(`Chartroom link = https://chat-application-841a0.web.app/#/chat/room/${roomId}`);
  res.send({
    status: 202,
    message: `https://chat-application-841a0.web.app/#/chat/room/${roomId}`,
  })


})

/* ********************************************Createroom API END ***********************************/







/* ********************************************Add Admin API END ***********************************/
app.post('api/addadmin', (req, res) => {
  const params = req.body;
  // var email = params.email;
  // var chatroom = params.chatroom;
  // var roomId;
  // var userUid;
  const db = getDatabase();
  var roomId = "LoLp4Q";
  const database = ref(db, 'ChatRoom/' + roomId + '/Admins');
  onValue(database, (snapshot) => {
    const data = snapshot.val();
    res.send({
      status: 202,
      message: data,
    })
  });


});



/* ********************************************Add Admin API END ***********************************/

// app.get('/api/getuid', (req, res) => {
//  const auth = getAuth();
//     onAuthStateChanged(auth, (user) => {
//       if (user) {
//         // User is signed in, see docs for a list of available properties
//         // https://firebase.google.com/docs/reference/js/firebase.User
//         const uid = user.uid;
//         res.send({
//           status: 202,
//           message: uid,
//         })
//         // ...
//       } else {
//         // User is signed out
//         // ...
//         res.send({
//           status: 404,
//           message: "signout already",
//         })
//       }
//   })

// });



/* ********************************************read API ***********************************/

app.get('/api/read', (req, res) => {
  const db = getDatabase();
  var roomId = "LoLp4Q";
  const database = ref(db, 'ChatRoom/' + roomId + '/Admins');
  onValue(database, (snapshot) => {
    const data = snapshot.val();
    res.send({
      status: 202,
      message: data,
    })
  });

})


/* ********************************************read API END ***********************************/


app.listen(5000, () => {
  console.log(`server is running on 5000`);
})