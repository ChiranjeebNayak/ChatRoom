import { React, useState, useEffect } from 'react'
import { getDatabase, ref, set } from "firebase/database";
import FirebaseConfig from "./FirebaseConfig";
import { initializeApp } from "firebase/app";
import Cryptr from 'cryptr';
const cryptr = new Cryptr('123');
function Chartroom() {
    const FireConfig = initializeApp(FirebaseConfig);
    const [message, setMessage] = useState(null);
    
    const messageHandler = (e) => {
        setMessage(e.target.value);
    }
    const messageSent = (e) => {
        e.preventDefault();

        const db = getDatabase();
        const encryptedString = cryptr.encrypt(message);
        const decryptedString = cryptr.decrypt(encryptedString);
        console.log(encryptedString); 
        console.log(decryptedString);
        var roomId = "ec1443cf-beaf-4adb-8ef8-7f90e4e49cee";//gp1
        var uid = "qwfxYQ2UxQZEyejqdSXdMBxFVS12";//demo
        var today = new Date();
        var hours = (today.getHours() < 10) ? "0"+today.getHours():today.getHours();
        var minutes=(today.getMinutes()< 10) ? "0"+today.getMinutes():today.getMinutes();
        var time = hours + ":" + minutes;
        var messageId= Date.now();
        const userRef = ref(db, "ChatRoom/" + roomId + "/Messages/" + messageId+"/"+uid);
        set(userRef, {
            Message: encryptedString,
            Time:time,
        });
        var msgForm= document.getElementById('msgform');
        msgForm.reset();
    }
    return (
        <div className="container border border-primary">
            <div className="mt-5px-5">
                <div className="h1 text-capitalize text-center text-primary">
                    chartroom name
                </div>
                <div className="text-start border py-2">
                    <p>Hello!!</p>
                </div>
                <div className="text-end border py-2">
                    <p>Hello!!</p>
                </div>
                <form className="mt-5 text-center" id="msgform" onSubmit={messageSent}>
                    <input className="form-control-sm w-50" type="text"  onChange={messageHandler} placeholder="Enter Message"></input>
                    <button className="btn btn-primary">send</button>
                </form>
            </div>
        </div>
    )
}

export default Chartroom
