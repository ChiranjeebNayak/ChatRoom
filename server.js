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
const { getDatabase, ref, set, onValue,remove } = require("firebase/database");
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
  // var currentdate = new Date(); 
  // var dateTime = currentdate.getDate() + "/"
  //               + (currentdate.getMonth()+1)  + "/" 
  //               + currentdate.getFullYear() + " @ "  
  //               + currentdate.getHours() + ":"  
  //               + currentdate.getMinutes() + ":" 
  //               + currentdate.getSeconds();
  const uids = ["Saab", "Volvo", "BMW"];
  const userRef1 = ref(db, "ChatRoom/" + roomId);
  set(userRef1, {
    Admins: uids,
    password: password,
    roomName: roomName
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
app.post('/api/addadmin', (req, res) => {
  const params = req.body;
  var roomId = params.roomId;
  var uid = params.uid;
  var userUid;
  const db = getDatabase();
  const database = ref(db, 'ChatRoom/' + roomId + '/Admins');
  onValue(database, (snapshot) => {
    var data = snapshot.val();
    console.log(data);
    data.push(uid);
    const adminDatabase = ref(db, 'ChatRoom/' + roomId );
    set(adminDatabase, {
      Admins: data
    });

    res.send({
      status: 202,
      message: data,
    })
  });


});



/* ********************************************Add Admin API END ***********************************/



/* ********************************************Remove Admin API END ***********************************/
app.delete('/api/removeadmin', (req, res) => {
  console.log(`1`);
  const params = req.body;
  var roomId = params.roomId;
  var uid = params.uid;
  var adminUid = params.adminUid;
  console.log(`${roomId} ${uid} ${adminUid}`);
  const db = getDatabase();
  const database = ref(db, 'ChatRoom/' + roomId + '/Admins');
  onValue(database, (snapshot) => {
    const data = snapshot.val();
    var flag = false;
    for (var i = 0; i < data.length; i++) {
      if (data[i] === adminUid) {
        flag = true;
      }
    }

    console.log(`data = ${data}`);
    console.log(`flag = ${flag}`);
    if(flag){
      for (var i = 0; i < data.length; i++) {
        if (data[i] === uid) {
          data.splice(i, 1);
        }
      }
      const adminDatabase = ref(db, 'ChatRoom/' + roomId );
      set(adminDatabase, {
        Admins: data
      });
  
      res.send({
        status: 202,
        message: `admin removed`,
      })
    }
    else{
      res.send({
        status: 404,
        message: `you are not an admin`,
      })
    }
   

  });


});



/* ********************************************Remove Admin API END ***********************************/

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
  var roomId = "Aj6IeS";
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