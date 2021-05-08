import React, { useRef, useState } from 'react';
import './App.css';

import firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/auth';
import 'firebase/analytics';

import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';

import styled,{ ThemeProvider } from "styled-components";
import { lightTheme, darkTheme, GlobalStyles  } from "./Themes.js";

firebase.initializeApp({
    apiKey: "AIzaSyBt2huVc8hv28JXMsnFNWjyrlMd3FQhDAY",
    authDomain: "chatbox-3d0d9.firebaseapp.com",
    projectId: "chatbox-3d0d9",
    storageBucket: "chatbox-3d0d9.appspot.com",
    messagingSenderId: "1041700957283",
    appId: "1:1041700957283:web:d8f8c0ba78baff96fd9c56"
})

const auth = firebase.auth();
const firestore = firebase.firestore();
const analytics = firebase.analytics();

 const StyledApp = styled.div`
  color: ${(props) => props.theme.fontColor};
 `;


function App() {

  const [user] = useAuthState(auth);

  const [ theme, setTheme ] = useState("light");
  const themeToggler = () => {
  theme === "light" ? setTheme("dark") : setTheme("light");
  }

  return (
    <ThemeProvider theme={ theme === "light" ? lightTheme : darkTheme }>
    <GlobalStyles/>
    <StyledApp className="App">
    <header>
      <button onClick={() => themeToggler()}>Change Mode</button>
      <h1>⚛️🔥💬</h1>
      <SignOut />
    </header>

      <section>
        {user ? <ChatRoom /> : <SignIn />}
      </section>

    </StyledApp>
    </ThemeProvider>
  );
}

function SignIn() {

  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
  }

  return (
    <div>
      <button className="sign-in" onClick={signInWithGoogle}>Sign in with Google</button>
    </div>
  )

}

function SignOut() {
  return auth.currentUser && (
    <button className="sign-out" onClick={() => auth.signOut()}>Sign Out</button>
  )
}


function ChatRoom() {
  const dummy = useRef();
  const messagesRef = firestore.collection('messages');
  const query = messagesRef.orderBy('createdAt').limit(25);

  const [messages] = useCollectionData(query, { idField: 'id' });

  const [formValue, setFormValue] = useState('');


  const sendMessage = async (e) => {
    e.preventDefault();

    const { uid, photoURL } = auth.currentUser;

    await messagesRef.add({
      text: formValue,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid,
      photoURL
    })

    setFormValue('');
    dummy.current.scrollIntoView({ behavior: 'smooth' });
  }

  return (<StyledApp>
    <main>

      {messages && messages.map(msg => <ChatMessage key={msg.id} message={msg} />)}

      <span ref={dummy}></span>

    </main>

    <form onSubmit={sendMessage}>

      <input value={formValue} onChange={(e) => setFormValue(e.target.value)} placeholder="say something nice" />

      <button type="submit" disabled={!formValue}>🕊️</button>

    </form>
  </StyledApp>)
}


function ChatMessage(props) {
  const { text, uid, photoURL } = props.message;

  const messageClass = uid === auth.currentUser.uid ? 'sent' : 'received';

  return (<StyledApp>
    <div className={`message ${messageClass}`}>
      <img src={photoURL || 'https://api.adorable.io/avatars/23/abott@adorable.png'} />
      <p>{text}</p>
    </div>
  </StyledApp>)
}


export default App;
