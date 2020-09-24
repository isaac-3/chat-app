import firebase from 'firebase'

const firebaseConfig = {
    apiKey: "AIzaSyATNYInhvfAdVsacFvnjUW-jArxlg8hWNY",
    authDomain: "chat-app-35d89.firebaseapp.com",
    databaseURL: "https://chat-app-35d89.firebaseio.com",
    projectId: "chat-app-35d89",
    storageBucket: "chat-app-35d89.appspot.com",
    messagingSenderId: "1086707912278",
    appId: "1:1086707912278:web:d4975f21d05057684d35f7"
  };

  const firebaseApp = firebase.initializeApp(firebaseConfig)

  const db = firebaseApp.firestore()

  const auth = firebase.auth()

  const provider = new firebase.auth.GoogleAuthProvider()

  export {auth, provider}

  export default db