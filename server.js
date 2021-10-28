var express = require('express')
var cors = require('cors')
var app = express()
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());
const { initializeApp } = require("firebase-admin/app");
const firebaseConfig=require('./config')
initializeApp(firebaseConfig);



// /* ********************************************SignUP API ***********************************/

// app.get('/api/signup', function (req, res) {

//     const params = req.body;

//     var email = params.email;
//     var password = params.password;
//     var name = params.name;
//     var phone = params.phone;

//     console.log(`${email} ${password} ${name} ${phone}`);

//     firebase.auth().createUserWithEmailAndPassword(email, password)
//         .then(userData => {
//             const user = firebase.userCredential.user;
//             console.log(user.user);
//             console.log(user.user.uid);
//             req.send({
//                 status:4202,
//                 message:"Sucessfully created"
//             })
//         })
//         .catch(error => {
//             req.send({
//                 status:404,
//                 message:error
//             })
//         })

// })

// // /* ********************************************SignUP API END ***********************************/

// /* ********************************************Login API ***********************************/

// app.get('/api/login', function (req, res) {

//     const params = req.body;

//     var email = params.email;
//     var password = params.password;

//     console.log(`${email} ${password}`);

//     firebase.auth().signInWithEmailAndPassword(auth, email, password)
//     .then((userCredential) => {
//       // Signed in
//       const user = userCredential.user;
//       console.log(userCredential.user);
//       console.log(userCredential.user.uid);
//       localStorage.setItem('uid', user.uid);
//       // ...
//     })
//     .catch((error) => {
//       const errorCode = error.code;
//       const errorMessage = error.message;
//       console.log(errorCode);
//       if (errorCode === "auth/email-already-in-use")
//         alert("email already exists");
//       else if (errorCode === "auth/invalid-email") alert("Invalid Email");
//       else if (errorCode === "auth/wrong-password") alert("Wrong Password");
//       else alert(`${errorCode} : ${errorMessage}`);

//     });

// })

 /* ********************************************Login API END ***********************************/

app.get("/", (req, res) => {
    console.log("api running");
    res.send({
        message: "sucess",
    })
})






app.listen(5000, () => {
    console.log(`server is running on 5000`);
})