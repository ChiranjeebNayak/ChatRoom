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
const { getDatabase, ref, set, onValue, remove, get, child } = require("firebase/database");
const { getFirestore } = require('firebase/firestore')
const firebaseConfig = require('./config');
initializeApp(firebaseConfig);
// import uuidv4 from 'uuid/dist/v4'
const { v4: uuidv4 } = require('uuid');
var randomstring = require("randomstring");
const { apiKey } = require('./config');
/* ********************************************Signup API ***********************************/

app.post('/api/signup', function (req, res) {

  const params = req.body;
  var email = params.email;
  var name = params.name;
  var password = params.password;
  var phone = params.phone;

  // console.log(`${email} ${password} ${name} ${phone}`);

  const auth = getAuth();
  createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      // Signed in
      const user = userCredential.user;
      const uid = user.uid;
      console.log(user.uid);
      const db = getDatabase();


      const userRef = ref(db, "users/" + uid);
      set(userRef, {
        name: name,
        email: email,
        phone: phone
      })
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
      const user = userCredential.user;
      const uid = user.uid;
      console.log(uid);
      const db = getDatabase();
      const userRef = ref(db, "users/" + uid);
      onValue(userRef, (snapshot) => {
        const data = snapshot.val();
        console.log(data);
        res.send({
          status: 202,
          message: `signin done`,
          email: data.email,
          name: data.name,
          phone: data.phone,
          uid: uid
        })
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
  console.log(`Chatroom link = https://chat-application-841a0.web.app/#/chat/room/${roomId}`);
  var chatRoomLink = `https://chat-application-841a0.web.app/#/chat/room/${roomId}`
  res.send({
    status: 202,
    message: chatRoomLink,
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
    const adminDatabase = ref(db, 'ChatRoom/' + roomId);
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
    if (flag) {
      for (var i = 0; i < data.length; i++) {
        if (data[i] === uid) {
          data.splice(i, 1);
        }
      }
      const adminDatabase = ref(db, 'ChatRoom/' + roomId);
      set(adminDatabase, {
        Admins: data
      });

      res.send({
        status: 202,
        message: `admin removed`,
      })
    }
    else {
      res.send({
        status: 404,
        message: `you are not an admin`,
      })
    }


  });


});



/* ********************************************Remove Admin API END ***********************************/



/* ********************************************Search API END ***********************************/

app.post(`/api/search`, (req, res) => {
  const params = req.body;
  var email = params.email;
  var name = params.name;
  var phone = params.phone;
  const dbRef = ref(getDatabase());
  get(child(dbRef, `users/`)).then((snapshot) => {
    if (snapshot.exists()) {
      // console.log(snapshot.val());
      var data = snapshot.val();
      var results = [];
      for (var key of Object.keys(data)) {
        //console.log(data[key].email);
        console.log(data[key].phone);
        if (data[key].email === email || data[key].name === name || data[key].phone == phone)
          results.push(data[key]);
      }
      // console.log(results);
      res.send({
        status: 202,
        message: results
      })
    } else {
      console.log("No data available");
      res.send({
        status: 404,
        message: `user not found`
      })
    }
  }).catch((error) => {
    res.send({
      status: 404,
      message: error
    })
  });
})


/* ********************************************Search API END***********************************/





/* ********************************************Schedule API ***********************************/
app.post('/api/schedule', (req, res) => {
  var params = req.body;
  var msg = params.msg;
  var email = params.email;

})



/* ********************************************Schedule API END ***********************************/



const geofire = require('geofire-common');

/* ********************************************geoquery API END ***********************************/


/* ********************************************geostrore API ***********************************/
app.post('/api/geostrore', (req, res) => {
  var params = req.body;
  const lat = 51.5074;
  const lng = 0.1278;
  const hash = geofire.geohashForLocation([lat, lng]);
  const db = getFirestore();
  // Add the hash and the lat/lng to the document. We will use the hash
  // for queries and the lat/lng for distance comparisons.
  const londonRef = db.collection('cities').doc('LON');
  londonRef.update({
    geohash: hash,
    lat: lat,
    lng: lng
  }).then(() => {
    // ...
    res.send({
      status: 202,
      message: 'geo location strored'
    })
  });
})



/* ********************************************geostore API END ***********************************/

/* ********************************************geoquery API ***********************************/
app.post('/api/geoquery', (req, res) => {
  var params = req.body;
  
  const lat = 51.5074;
  const lng = 0.1278;
  const hash = geofire.geohashForLocation([lat, lng]);
  // Add the hash and the lat/lng to the document. We will use the hash
  // for queries and the lat/lng for distance comparisons.
  const db = getFirestore();
  const londonRef = db.collection('cities').doc('LON');
  londonRef.set({
    geohash: hash,
    lat: lat,
    lng: lng
  }).then(() => {
    // ...
    res.send({
      status: 202,
      message: 'geo location strored'
    })
  });

})








/* ********************************************read API***********************************/

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