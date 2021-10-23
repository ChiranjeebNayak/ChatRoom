import { React, useState, useEffect } from 'react'
import { getAuth, signOut } from "firebase/auth";
import { useHistory } from 'react-router';
import { getDatabase, ref, set } from "firebase/database";
import FirebaseConfig from "./FirebaseConfig";
import { initializeApp } from "firebase/app";
import uuidv4 from 'uuid/dist/v4'


function Home() {
    const [email, setEmail] = useState(null);
    const [uid, setUid] = useState(null);
    const [password, setPassword] = useState(null);
    const [roomname, setRoomname] = useState(null);
    const [roomlist, setRoomlist] = useState([]);

    const history = useHistory();
    useEffect(() => {
        const FireConfig = initializeApp(FirebaseConfig);
        const auth = getAuth();
        const user = auth.currentUser;
        if (user !== null) {
            // The user object has basic properties such as display name, email, etc.
            setEmail(user.email);
            setUid(user.uid);
            const db = getDatabase();
            const msgListRef = ref(db, 'users');
            console.log(msgListRef);

        } else {
            history.push("/");
        }
    });



    const passwordHandler = (e) => {
        setPassword(e.target.value);
    }
    const roomnameHandler = (e) => {
        setRoomname(e.target.value)
    }
    const logout = () => {
        const auth = getAuth();
        signOut(auth).then(() => {
            // Sign-out successful.
            localStorage.removeItem('uid');
            alert('signout sucessful');
            history.push('/');
        }).catch((error) => {
            // An error happened.
            alert(error);
        });
    }


    const createRoom = (e) => {
        e.preventDefault();
        const db = getDatabase();
        var roomId = uuidv4();
        const userRef = ref(db, "ChatRoom/" + roomId);
        set(userRef, {
            RoomName:roomname,
            Password: password,
        });
        
        const userRef1 = ref(db, "ChatRoom/" + roomId + "/Admin");
        set(userRef1, {
            uid: uid,
        });

        const userRef2 = ref(db, "users/" + uid +"/ChartRoom/"+roomId);
        set(userRef2, {
            RoomName:roomname,
        });
        var chartRoomUrl=`https://chat-application-841a0.web.app/#/chat/room/${roomId}`
        alert('ChartRoom Created');
        alert('and link:- '+chartRoomUrl+ "room code - "+ roomId + "password= "+password)
    }
    
    return (
        <div>
            <div className="container px-5">
                <div className="mt-4 px-5">
                    <button className="btn btn-primary" onClick={logout}>Log out</button>
                    <p>{email}</p>
                </div>
                <form onSubmit={createRoom} className="mb-md-5 mt-md-4 pb-5 px-5">

                    <h2 className="fw-bold mb-2 text-uppercase">Create Room</h2>
                    <div className="form-outline form-white mb-4">
                        <label className="form-label" >Room Name</label>
                        <input type="text" id="roomname" className="form-control form-control-lg" onChange={roomnameHandler} />
                    </div>

                    <div className="form-outline form-white mb-4">
                        <label className="form-label" >Password</label>
                        <input type="password" id="password" className="form-control form-control-lg" onChange={passwordHandler} />

                    </div>

                    <button className="btn  btn-primary btn-lg px-5" type="submit">Create Chat Room</button>


                </form>
                <div className="mt-3 px-5">
                    <h2 className="fw-bold mb-2 text-uppercase">Chat Room List</h2>
                    {/* <h3>{roomlist}</h3> */}

                </div>
            </div>
        </div>
    )
}

export default Home
