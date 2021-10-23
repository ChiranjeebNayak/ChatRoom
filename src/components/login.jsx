import { React, useState } from 'react'
import { Redirect } from 'react-router-dom'
import { getAuth, signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import FirebaseConfig from "./FirebaseConfig";
import { initializeApp } from "firebase/app";
import { useHistory } from 'react-router';

function Login() {
  const history = useHistory();
  const [currentUser, setCurrentUser] = useState(null);
  const [email, setEmail] = useState(null);
  const [password, setPassword] = useState(null);
  const emailHandler = (e) => {
    setEmail(e.target.value);
  }
  const passwordHandler = (e) => {
    setPassword(e.target.value);
  }
  const formHandler = (e) => {
    e.preventDefault();
    console.log(`${email}  ${password}`);
    const FireConfig = initializeApp(FirebaseConfig);
    const auth = getAuth();
    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        // Signed in
        const user = userCredential.user;
        console.log(userCredential.user);
        console.log(userCredential.user.uid);
        localStorage.setItem('uid', user.uid);
        history.push("/home");
        // ...
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.log(errorCode);
        if (errorCode === "auth/email-already-in-use")
          alert("email already exists");
        else if (errorCode === "auth/invalid-email") alert("Invalid Email");
        else if (errorCode === "auth/wrong-password") alert("Wrong Password");
        else alert(`${errorCode} : ${errorMessage}`);

      });
  }
  const forgetPasssword = () => {
    const FireConfig = initializeApp(FirebaseConfig);
    const auth = getAuth();
    sendPasswordResetEmail(auth, email)
      .then(() => {
        alert(`password sent to your mail id`)
        // Password reset email sent!
        // ..
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        alert(`${errorCode} : ${errorMessage}`);
        // ..
      });
  }
  return (
    <section className="vh-100 gradient-custom">
      <div className="container py-5 h-100">
        <div className="row d-flex justify-content-center align-items-center h-100">
          <div className="col-12 col-md-8 col-lg-6 col-xl-5">
            <div className="card bg-dark text-white" style={{ borderRadius: "1rem" }}>
              <div className="card-body p-5 text-center">

                <form onSubmit={formHandler} className="mb-md-5 mt-md-4 pb-5">

                  <h2 className="fw-bold mb-2 text-uppercase">Login</h2>
                  <p className="text-white-50 mb-5">Please enter your login and password!</p>

                  <div className="form-outline form-white mb-4">
                    <label className="form-label" >Email</label>
                    <input type="email" id="email" className="form-control form-control-lg" onChange={emailHandler} />

                  </div>

                  <div className="form-outline form-white mb-4">
                    <label className="form-label" >Password</label>
                    <input type="password" id="password" className="form-control form-control-lg" onChange={passwordHandler} />

                  </div>

                  <p className="small mb-5 pb-lg-2"><a className="text-white-50" onClick={forgetPasssword} href="/#">Forgot password?</a></p>

                  <button className="btn btn-outline-light btn-lg px-5" type="submit">Login</button>


                </form>

                <div>
                  <p className="mb-0">Don't have an account? <a href="/signup" className="text-white-50 fw-bold">Sign Up</a></p>
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Login
