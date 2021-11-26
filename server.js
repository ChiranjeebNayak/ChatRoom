var express = require('express')
var cors = require('cors')
var app = express()
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());
const { initializeApp } = require("firebase/app");
const { getAuth } = require("firebase/auth");
const { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, sendPasswordResetEmail } = require('firebase/auth');
const { getDatabase, ref, set, onValue, remove, get, child } = require("firebase/database");
const firebaseConfig = require('./config');
initializeApp(firebaseConfig);
var randomstring = require("randomstring");
const geolib = require('geolib');

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
      const db = getDatabase();


      const userRef = ref(db, "users/" + uid);
      set(userRef, {
        name: name,
        email: email,
        phone: phone,
        uid: uid
      })

      res.status(202).send({
        message: `signup done`,
      })

      // ...
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      if (errorCode === "auth/email-already-in-use") {
        res.status(400).send({
          message: `email already exists`,
        })
      }
      else if (errorCode === "auth/invalid-email") {
        res.status(400).send({
          message: `Invalid Email`,
        })
      }
      else {
        res.status(400).send({
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

  signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      const user = userCredential.user;
      const uid = user.uid;
      const db = getDatabase();
      const userRef = ref(db, "users/" + uid);
      onValue(userRef, (snapshot) => {
        const data = snapshot.val();
        res.status(202).send({
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
      if (errorCode === "auth/email-already-in-use")
        alert("email already exists");
      else if (errorCode === "auth/invalid-email") {

        res.status(400).send({
          message: `Invalid Email`,
        })
      }
      else if (errorCode === "auth/wrong-password") {
        res.status(400).send({
          message: `Wrong Password`,
        })
      }
      else {
        res.status(404).send({
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
      message: `signout done`,
    })
  }).catch((error) => {
    // An error happened.
    res.status(404).send({
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
      // Password reset email sent!
      res.status(200).send({
        message: 'Password reset email sent!'
      })
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      res.status(500).send({
        message: `${errorCode} : ${errorMessage}`
      })
      // ..
    });
})


/* ********************************************Forgot Password API END***********************************/





/* ********************************************Get User Details API***********************************/

app.get('/api/getUser', (req, res) => {
  const params = req.body;
  const uid = params.uid;
  const dbRef = ref(getDatabase());
  get(child(dbRef, `users/${uid}`)).then((snapshot) => {
    if (snapshot.exists()) {
      var data = snapshot.val();
      res.status(200).send({
        message: data
      })
    } else {
      res.status(404).send({
        message: `user not found`
      })
    }
  }).catch((error) => {
    res.status(404).send({
      message: error
    })
  });
})


/* ********************************************Get User Details API END***********************************/





/* ********************************************CreateRoom API ***********************************/

app.post('/api/createChatroom', function (req, res) {

  const params = req.body;
  var roomId = randomstring.generate({
    length: 6,
    charset: 'alphanumeric'
  });
  var roomName = params.roomName;
  var password = params.password;
  var uid = params.uid;

  const db = getDatabase();
  const dbRef = ref(getDatabase());
  let userData = {};
  get(child(dbRef, `users/${uid}`)).then((snapshot) => {
    if (snapshot.exists()) {
      userData = snapshot.val();

      const userRef = ref(db, "ChatRoom/" + roomId);

      set(userRef, {
        RoomName: roomName,
        Password: password,
      }).then(() => {
        const uids = [uid];
        const userRef1 = ref(db, "ChatRoom/" + roomId);
        set(userRef1, {
          Admins: uids,
          password: password,
          roomName: roomName
        })
          .then(() => {

            const userRef2 = ref(db, "users/" + uid + "/ChatRoom/" + roomId);
            set(userRef2, {
              RoomName: roomName,
            })
              .then(() => {
                const userRef3 = ref(db, "ChatRoom/" + roomId + "/users/" + uid);
                set(userRef3, {
                  isAdmin: true,
                  name: userData.name,
                  email: userData.email,
                  uid: userData.uid
                })
                  .then(() => {
                    var chatRoomLink = `http://localhost:8080/#/chatroom/${roomId}`
                    res.status(202).send({
                      link: chatRoomLink,
                      roomId: roomId
                    })

                  }).catch((error) => {
                    res.status(500).send({
                      message: error
                    })
                  });

              }).catch((error) => {
                res.status(500).send({
                  message: error
                })
              });


          }).catch((error) => {
            res.status(500).send({
              message: error
            })
          });

      }).catch((error) => {
        res.status(500).send({
          message: error
        })
      });
    }
  }).catch((error) => {
    res.status(500).send({
      message: error
    })
  });



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
        details: data
      })
    } else {
      res.status(404).send({
        message: `chatRoom not found`
      })
    }
  }).catch((error) => {
    res.status(500).send({
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
  const db = getDatabase();
  const database = ref(db, 'ChatRoom/' + roomId + '/Admins');
  onValue(database, (snapshot) => {
    var data = snapshot.val();
    data.push(uid);
    const adminDatabase = ref(db, 'ChatRoom/' + roomId);
    set(adminDatabase, {
      Admins: data
    })
      .then(() => {
        res.status(202).send({
          message: data,
        })
      })
      .catch((err) => {
        res.status(400).send({
          message: err,
        })
      })

  });


});


/* ********************************************Add Admin API END ***********************************/



/* ********************************************Remove Admin API***********************************/
app.post('/api/removeAdmin', (req, res) => {
  const params = req.body;
  var roomId = params.roomId;
  var uid = params.uid;
  var adminUid = params.adminUid;
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
    if (flag) {
      for (let i = 0; i < data.length; i++) {
        if (data[i] === uid) {
          data.splice(i, 1);
        }
      }
      const adminDatabase = ref(db, 'ChatRoom/' + roomId);
      set(adminDatabase, {
        Admins: data
      })
        .then(() => {
          res.status(200).send({
            message: `admin removed`,
          })
        })
        .catch((err) => {
          res.status(400).send({
            message: err,
          })
        });
    }
    else {
      res.status(500).send({
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
  const pass = params.password;
  const dbRef = ref(getDatabase());

  const db = ref(getDatabase(), `ChatRoom/${roomId}`);
  const adminRef = ref(getDatabase(), `ChatRoom/${roomId}/Admins`)
  const userRef = ref(getDatabase(), `ChatRoom/${roomId}/users/${uid}`);
  let userData;
  get(child(dbRef, `users/${uid}`)).then((snapshot) => {
    if (snapshot.exists()) {
      userData = snapshot.val();
      console.log(userData);
      onValue(db, (snapshot) => {
        let chatroomData = snapshot.val();
        if (chatroomData.password === pass) {
          onValue(adminRef, (snapshot2) => {
            var data = snapshot2.val();
            if (data) {
              data.forEach(element => {
                if (element === uid) {
                  set(userRef, {
                    isAdmin: true,
                    name: userData.name,
                    email: userData.email,
                    uid: userData.uid
                  })
                    .then(() => {
                      res.status(200).send({
                        message: 'User added'
                      })
                    }).catch(err => {
                      res.status(400).send({
                        message: err,
                      })
                    })
                }
                else {
                  set(userRef, {
                    isAdmin: false,
                    name: userData.name,
                    email: userData.email,
                    uid: userData.uid
                  })
                    .then(() => {
                      res.status(200).send({
                        message: 'User added'
                      })
                    })
                    .catch(err => {
                      res.status(400).send({
                        message: err
                      })
                    })
                }
              });
            }
            else {
              res.status(404).send({
                message: 'chatroom not found',
              })
            }

          });
        }
        else {
          res.status(400).send({
            message: 'password mismatch',
          })
        }
      })
    }
  }).catch((error) => {
    res.status(500).send({
      message: error
    })
  });


})

/* ********************************************Add User API END**********************************/




/* ********************************************Remove User API**********************************/
app.post('/api/removeUser', (req, res) => {
  const params = req.body;
  var roomId = params.roomId;
  var uid = params.uid;

  const userRef = ref(getDatabase(), `ChatRoom/${roomId}/users/${uid}`)
  remove(userRef).then(() => {

    res.status(200).send({
      message: 'User removed'
    })
  })
    .catch((error) => {
      res.status(500).send({
        message: error
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
        if (data[key].email.toLowerCase() === text.toLowerCase() || data[key].name.toLowerCase() === text.toLowerCase() || data[key].phone.toLowerCase() == text.toLowerCase())
          results.push(data[key]);
      }
      res.status(200).send({
        message: results
      })
    } else {
      res.status(404).send({
        message: `user not found`
      })
    }
  }).catch((error) => {
    res.status(400).send({
      message: error
    })
  });
})


/* ********************************************Search API END***********************************/

/* ********************************************DeleteChatRoom API ***********************************/
app.post(`/api/deleteChatroom`, (req, res) => {
  const params = req.body;
  const roomId = params.roomId;
  const db = getDatabase();
  const databaseRef = ref(db, 'ChatRoom/' + roomId);
  //delete chatroom
  remove(databaseRef).then(() => {
    res.status(200).send({
      message: 'Chatroom Deleted'
    })
  })
    .catch(error => {
      res.status(500).send({
        message: error
      })
    })
})

/* ********************************************DeleteChatRoom API END***********************************/


const nodemailer = require('nodemailer')
const cron = require('node-cron')
/* ********************************************Schedule API ***********************************/
app.post('/api/schedule', (req, res) => {
  var params = req.body;
  var text = params.text;
console.log('start print');
 

  cron.schedule(`32,33 * * * *`, () => {
    console.log(text);

  });

  

})

/* ********************************************Schedule API END ***********************************/


/* ********************************************geostore API ***********************************/
app.post('/api/geostore', (req, res) => {
  var params = req.body;
  const lat = params.lat;
  const lng = params.lng;
  const uid = params.uid;
  const db = getDatabase();
  const userRef = ref(db, `location/${uid}`);
  set(userRef, {
    lat: lat,
    lng: lng
  }).then(() => {
    res.status(200).send({
      message: 'location stored',
      lat: lat,
      lng: lng
    })
  })
    .catch(err => {
      res.status(500).send({
        message: err,
      })
    })
})

/* ********************************************geostore API END ***********************************/



/* ********************************************geoquery API ***********************************/
app.post('/api/geoquery', (req, res) => {
  var params = req.body;

  const lat = params.lat;
  const lng = params.lng;
  var coords = { latitude: lat, longitude: lng }
  var uid = params.uid;
  var nearbyUsers = [];
  const dbRef = ref(getDatabase());
  get(child(dbRef, `location`)).then((snapshot) => {
    if (snapshot.exists()) {
      var data = snapshot.val();
      var results = [];
      for (var key of Object.keys(data)) {
        var userLat = data[key].lat;
        var userLng = data[key].lng;
        var distance = geolib.getDistance(coords, {
          latitude: userLat,
          longitude: userLng,
        })
        distance = distance / 1000;
        if (distance <= 50 && key !== uid) {
          results.push(key);
        }
      }

      for (var i = 0; i < results.length; i++) {
        get(child(dbRef, `users/${results[i]}`)).then((snapshot) => {
          if (snapshot.exists()) {
            var details = snapshot.val();
            nearbyUsers.unshift(details);
          } else {
            res.status(404).send({
              message: `user not found from results`
            })
          }
        }).catch((error) => {
          res.status(500).send({
            message: error
          })
        });
      }
      setTimeout(() => {
        res.status(200).send({
          message: nearbyUsers
        })
      }, 2000)

    } else {
      res.status(404).send({
        message: `users not found`
      })
    }
  }).catch((error) => {
    res.status(500).send({
      message: error
    })
  });
})

/* ********************************************geoquery API END***********************************/



/* ********************************************All Users API***********************************/

app.get('/api/allUsers', (req, res) => {
  const dbRef = ref(getDatabase());
  get(child(dbRef, `users/`)).then((snapshot) => {
    if (snapshot.exists()) {
      var data = snapshot.val();
      res.status(200).send({
        message: data
      })
    } else {
      res.status(404).send({
        message: `users not found`
      })
    }
  }).catch((error) => {
    res.status(400).send({
      message: error
    })
  });

})

/* ********************************************All Users  API END***********************************/



/* ********************************************START SERVER ON PORT 5000***********************************/

app.listen(5000, () => {
  console.log(`server is running on 5000`);
})