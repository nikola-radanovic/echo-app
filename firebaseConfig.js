import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import 'firebase/compat/auth';
import { initializeApp } from 'firebase/app';

const firebaseConfig = {
  apiKey: "AIzaSyDZ8oZ5pQhkGrVOkDPDdG6JLnid228VQBo",
  authDomain: "echoapp-1a8c7.firebaseapp.com",
  projectId: "echoapp-1a8c7",
  storageBucket: "echoapp-1a8c7.appspot.com",
  messagingSenderId: "367889829704",
  appId: "1:367889829704:web:21d3ea039710ed7b2ead7d"
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const app = initializeApp(firebaseConfig);

const firestore = firebase.firestore();
const auth = firebase.auth();

export { firebase, firestore, auth, app };
