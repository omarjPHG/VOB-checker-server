const { getApp, getApps, initializeApp } = require('firebase/app');
const { getFirestore } = require('firebase/firestore')
const {
    FB_API_KEY,
    FB_APP_ID,
    FB_AUTH_DOMAIN,
    FB_MEASUREMENT_ID,
    FB_MESSAGING_SENDER_ID,
    FB_PROJECT_ID,
    FB_STORAGE_BUCKET
} = require('./FirebaseConfig')

const firebaseConfig = {
  apiKey: FB_API_KEY,
  authDomain: FB_AUTH_DOMAIN,
  projectId: FB_PROJECT_ID,
  storageBucket: FB_STORAGE_BUCKET,
  messagingSenderId: FB_MESSAGING_SENDER_ID,
  appId: FB_APP_ID,
  measurementId: FB_MEASUREMENT_ID
};

let firebaseApp

if(!getApps().length){
    firebaseApp = initializeApp(firebaseConfig)
} else {
    firebaseApp = getApp()
}

const db = getFirestore()

const app = initializeApp(firebaseConfig);

module.exports = {
    db,
    app
}