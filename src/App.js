import './App.css';
import firebase from "firebase/app";
import "firebase/auth";
import firebaseConfig from './firebase-auth.config';
import { useState } from 'react';
firebase.initializeApp(firebaseConfig)

function App() {
  const [newUser, setNewUser] = useState(false)
  const [user, setUser] = useState({ 
    isSignedIn: false, 
    name: '',
    email: '',
    password: '',
    photo: '',
    error: '',
    success: false
  })
  const googleProvider = new firebase.auth.GoogleAuthProvider();
  const fbProvider = new firebase.auth.FacebookAuthProvider();
  const handleSignIn = () => {
    firebase.auth().signInWithPopup( googleProvider)
    .then((res) => {
      const {displayName, photoURL, email} = res.user;
      const signedInUser ={
        isSignedIn: true,
        name: displayName,
        email: email,
        photo: photoURL
      }
      setUser(signedInUser)
      console.log (displayName, email,photoURL)
          
    })
    .catch (err => {
      console.log(err)
      console.log (err.message)
    })
  }
  const handleSignOut = ()=> {
    firebase.auth().signOut()
    .then (res => {
      const signedOutUser = {
        isSignedIn: false,
        name: '',
        photoURL: '',
        email: ''
      }
      setUser (signedOutUser)
    })
    .catch (err => {

    })
  }

  const handleFbSignIn = () => {
    firebase.auth().signInWithPopup(fbProvider)
    .then((result) => {
      /** @type {firebase.auth.OAuthCredential} */
      var credential = result.credential;

      // The signed-in user info.
      var user = result.user;
      console.log ('fb user signed in' , user)

      // This gives you a Facebook Access Token. You can use it to access the Facebook API.
      var accessToken = credential.accessToken;

      // ...
  })
  .catch((error) => {
    // Handle Errors here.
    var errorCode = error.code;
    var errorMessage = error.message;
    // The email of the user's account used.
    var email = error.email;
    // The firebase.auth.AuthCredential type that was used.
    var credential = error.credential;
    console.log (errorCode, errorMessage)

    // ...
  });
  }

  const handleChange = (e) => {
    let isFieldValid = true
    // console.log(e.target.name, e.target.value)
    if (e.target.name==='email'){
       isFieldValid = /\S+@\S+\.\S+/.test (e.target.value)
      // console.log(isFieldValid)
    }
    if (e.target.name==='password'){
    const isPasswordValid = e.target.value.length > 6
    const passwordHasNumber = /\d{1}/.test(e.target.value)
    isFieldValid = isPasswordValid && passwordHasNumber
    }
    if (isFieldValid){
      const newUserInfo = {...user}
      newUserInfo[e.target.name] = e.target.value
      setUser(newUserInfo)
    }
  }
  const handleSubmit = (e) => {
    if( newUser && user.password && user.email){
      
      firebase.auth().createUserWithEmailAndPassword(user.email , user.password)
      // console.log("submitting")
      .then( (res) => {
      console.log (res.user)
      const newUserInfo = {...user}
      newUserInfo.error= ''
      newUserInfo.success = true
      setUser(newUserInfo)
      updateUserName(user.name)
      // Signed in 
      // var user = userCredential.user;
      // ...
    })
    .catch((error) => {
      const newUserInfo = {...user}
      newUserInfo.error = error.message 
      newUserInfo.success = false 
      setUser(newUserInfo)
      // var errorCode = error.code;
      // var errorMessage = error.message;
      // console.log (errorCode, errorMessage)
    });
    }
    if (!newUser && user.email && user.password){
      firebase.auth().signInWithEmailAndPassword(user.email, user.password)
      .then((res) => {
        console.log(res.user)
        const newUserInfo = {...user}
        newUserInfo.error= ''
        newUserInfo.success = true
        setUser(newUserInfo)
  })
  .catch((error) => {
      const newUserInfo = {...user}
      newUserInfo.error = error.message 
      newUserInfo.success = false 
      setUser(newUserInfo)
  });

    }
    e.preventDefault()   
  }
  const updateUserName = name => {
    var user = firebase.auth().currentUser;
    user.updateProfile({
      displayName: name
    })
    .then(() =>  {
      console.log ('user name updated  successfully')
    })
    .catch(error => {
      console.log (error)
    });
  }
  return (
    <div>
      {
        user.isSignedIn ?  <button onClick={handleSignOut}>Sign out</button> :
        <button onClick={handleSignIn}>Sign in using google</button>
      }
      <br />
      <button onClick={handleFbSignIn}>Sign in using facebook</button>
      {
        user.isSignedIn && 
        <div>  
            <p>Welcome, {user.name}</p>
            <p>Your email: {user.email}</p>
            <img style={{width:"25%"}} src={user.photo} alt="hello" />
        </div>
      }
      <h1>Our own authentication</h1>
      <p>Name: {user.name}</p> 
      <p>Email: {user.email}</p>
      <p>Password: {user.password}</p>

      <form onSubmit={handleSubmit}>
        <input type="checkbox" name="newUser" id="" onChange={()=> setNewUser(!newUser) } />
        <label htmlFor="newUser">New User Sign Up</label>
         <br />
        { newUser && <input type="text" name="name" onBlur={handleChange} placeholder="Your name" />}
        <br />
        <input type="text" onBlur={handleChange} name="email" id=""  placeholder="Your Email address" required/>
        <br />
        <input type="password" onBlur={handleChange} name="password" id="" placeholder="Your Password" required/>
        <br /> 
        <input type="submit"  value={newUser ? 'Sign up' : 'Sign in'} />
      </form>
      <p style={{color:'red'}}>{user.error}</p>
      { user.success && <p style={{color:'green'}}>User {newUser ? 'created' : 'Logged in' } Successfully</p> }
      {/* { user.success && <p style={{color:'green'}}>User  'created' 'Logged in' Successfully</p>} */}
    </div>
  );
}

export default App;
