var express = require('express')
var cors = require('cors')
var app = express()
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());
const { initializeApp } = require("firebase/app");
const { getAuth } = require("firebase/auth");
const { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, sendPasswordResetEmail } = require('firebase/auth');
const { onAuthStateChanged } = require('firebase/auth')
const { getDatabase, ref, set, onValue, remove, get, child } = require("firebase/database");
const { getFirestore } = require('firebase/firestore')
const firebaseConfig = require('./config');
initializeApp(firebaseConfig);
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
        res.status(202).send({
          // status: 202,
          message: `SignIn done`,
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

        res.status(400).send({
          // status: 404,
          message: `Invalid Email`,
        })
      }
      else if (errorCode === "auth/wrong-password") {
        res.status(400).send({
          // status: 404,
          message: `Wrong Password`,
        })
      }
      else {
        res.status(404).send({
          // status: 404,
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
    res.status(200).send({
      // status: 200,
      message: `signout done`,
    })
  }).catch((error) => {
    // An error happened.
    res.status(404).send({
      // status: 404,
      message: error,
    })
  });
});



// /* ********************************************Signout API END ***********************************/

/* ********************************************ForgotPasssword API ***********************************/
app.post('/api/forgotPassword', (req, res) => {
  const auth = getAuth();
  var params = req.body;
  var email = params.email;
  sendPasswordResetEmail(auth, email)
    .then(() => {
      // alert(`password sent to your mail id`)
      // Password reset email sent!
      res.status(202).send({
        // status:202,
        message: 'Password reset email sent!'
      })
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      res.status(404).send({
        message: `${errorCode} : ${errorMessage}`
      })
      // ..
    });
})





/* ********************************************ForgotPasssword API END***********************************/





/* ********************************************Get User Detais API***********************************/

app.get('/api/getUser', (req, res) => {
  const params = req.body;
  const uid = params.uid;
  const dbRef = ref(getDatabase());
  get(child(dbRef, `users/${uid}`)).then((snapshot) => {
    if (snapshot.exists()) {
      var data = snapshot.val();
      res.status(200).send({
        // status: 202,
        message: data
      })
    } else {
      console.log("No data available");
      res.status(404).send({
        // status: 404,
        message: `user not found`
      })
    }
  }).catch((error) => {
    res.status(404).send({
      // status: 404,
      message: error
    })
  });
})





/* ********************************************Get User Details API END***********************************/





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
  const uids = [uid];
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


  const userRef3 = ref(db,  "ChatRoom/" + roomId+"/users/" +uid);
  set(userRef3, {
    isAdmin: true
  });



  // console.log(`Chatroom link = https://chat-application-841a0.web.app/#/chat/room/${roomId}`);
  // var chatRoomLink = `https://chat-application-841a0.web.app/#/chat/room/${roomId}`
  var chatRoomLink = `http://localhost:8080/#/chat/room/${roomId}`
  res.status(202).send({
    // status: 202,
    link: chatRoomLink
  })
})

/* ********************************************Createroom API END ***********************************/



/* ********************************************Get chatRoom Detais API***********************************/

app.post('/api/chatroomDetails', (req, res) => {
  const params = req.body;
  const roomId = params.roomId;
  const dbRef = ref(getDatabase());
  get(child(dbRef, `ChatRoom/${roomId}`)).then((snapshot) => {
    if (snapshot.exists()) {
      var data = snapshot.val();
      res.status(200).send({
        // status: 202,
        details: data
      })
    } else {
      console.log("No data available");
      res.status(404).send({
        // status: 404,
        message: `chatRoom not found`
      })
    }
  }).catch((error) => {
    res.status(500).send({
      // status: 404,
      message: error
    })
  });
})





/* ********************************************Get chatRoom Details API END***********************************/





/* ********************************************Add Admin API END ***********************************/
app.post('/api/addAdmin', (req, res) => {
  const params = req.body;
  var roomId = params.roomId;
  var uid = params.uid;
  // var userUid;
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



/* ********************************************Remove Admin API***********************************/
app.delete('/api/removeAdmin', (req, res) => {
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
    for (let i = 0; i < data.length; i++) {
      if (data[i] === adminUid) {
        flag = true;
      }
    }

    console.log(`data = ${data}`);
    console.log(`flag = ${flag}`);
    if (flag) {
      for (let i = 0; i < data.length; i++) {
        if (data[i] === uid) {
          data.splice(i, 1);
        }
      }
      const adminDatabase = ref(db, 'ChatRoom/' + roomId);
      set(adminDatabase, {
        Admins: data
      });

      res.status(200).send({
        // status: 202,
        message: `admin removed`,
      })
    }
    else {
      res.status(400).send({
        // status: 404,
        message: `you are not an admin`,
      })
    }


  });


});



/* ********************************************Remove Admin API END ***********************************/

/* ********************************************Add User API**********************************/

app.post('/api/addUser', (req, res) => {
  const params = req.body;
  const roomId = params.roomId;
  const uid = params.uid;
  const db = ref(getDatabase());
  var data = [];
  
    const userRef = ref(getDatabase(), `ChatRoom/${roomId}/users/${uid}`);
    set(userRef, {
      isAdmin: false
    });

  res.status(200).send({
    // status: 202,
    message: 'User added'
  })


})



/* ********************************************Add User API END**********************************/




/* ********************************************Remove User API**********************************/
app.delete('/api/removeUser', (req, res) => {
  const params = req.body;

  var roomId = params.roomId;
  var uid = params.uid;
  //var adminUid = params.adminUid;


  const db = ref(getDatabase());
  const userRef = ref(getDatabase(), `ChatRoom/${roomId}/users/${uid}`)
  remove(userRef).then(()=>{
     res.status(200).send({
      // status: 202,
      message: 'User removed'
    })
  })
  .catch((error)=>{
    res.status(500).send({
      // status: 202,
      message:error
    })
  })



});



/* ********************************************Remove User API END***********************************/








/* ********************************************Search API END ***********************************/

app.post(`/api/search`, (req, res) => {
  const params = req.body;
  var text = params.text;
  const dbRef = ref(getDatabase());
  get(child(dbRef, `users/`)).then((snapshot) => {
    if (snapshot.exists()) {
      var data = snapshot.val();
      var results = [];
      for (var key of Object.keys(data)) {
        console.log(data[key].phone);
        if (data[key].email === text || data[key].name === text || data[key].phone == text)
          results.push(data[key]);
      }
      res.status(200).send({
        // status: 202,
        message: results
      })
    } else {
      console.log("No data available");
      res.status(404).send({
        // status: 404,
        message: `user not found`
      })
    }
  }).catch((error) => {
    res.status(400).send({
      // status: 404,
      message: error
    })
  });
})


/* ********************************************Search API END***********************************/

/* ********************************************DeleteChatRooom API ***********************************/
app.delete(`/api/deleteChatroom`, (req, res) => {
  const params = req.body;
  const roomId = params.roomId;
  const db = getDatabase();
  const databaseRef = ref(db, 'ChatRoom/' + roomId);
  //delete chatroom
  remove(databaseRef).then(()=>{

    res.status(200).send({
      // status: 202,
      message: 'Chatroom Deleted'
    })
  }).catch(error=>{
    res.status(500).send({
      // status: 202,
      message: error
    })
  }) 
})




/* ********************************************DeleteChatRooom API END***********************************/



/* ********************************************Schedule API ***********************************/
app.post('/api/schedule', (req, res) => {
  var params = req.body;
  var msg = params.msg;
  var email = params.email;
  var date = params.date;
  var time = params.time;

})



/* ********************************************Schedule API END ***********************************/



const geofire = require('geofire-common');
const { database } = require('firebase-admin');

/* ********************************************geoquery API END ***********************************/


/* ********************************************geostrore API ***********************************/
app.post('/api/geostore', (req, res) => {
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
    res.status(202).send({
      // status: 202,
      message: 'geo location stored'
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
    res.status(202).send({
      // status: 202,
      message: 'geo location stored'
    })
  });

})

/* ********************************************geoquery API END***********************************/

/* ********************************************Contacts API***********************************/




/* ********************************************Contacts API END***********************************/

app.post('/api/contacts',(req,res) =>{
  var params = req.body;
  var uid = params.uid;
  var contactUid = params.contactUid;
  const db = getDatabase();
  const userRef =  ref(db,`users/${uid}/contacts/${contactUid}`);
  set(ref,{
    lastsync:"12:00"
  });

  res.status(200).send({
    message:'contact details created'
  })
})




/* ********************************************read API***********************************/

app.get('/api/read', (req, res) => {
  const db = getDatabase();
  var roomId = "Aj6IeS";
  const database = ref(db, 'ChatRoom/' + roomId + '/Admins');
  onValue(database, (snapshot) => {
    const data = snapshot.val();
    res.status(200).send({
      // status: 202,
      message: data,
    })
  });

})


/* ********************************************read API END ***********************************/


app.listen(5000, () => {
  console.log(`server is running on 5000`);
})