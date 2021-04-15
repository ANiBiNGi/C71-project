import firebase from 'firebase'
require('@firebase/firestore')

var firebaseConfig = {
  apiKey: "AIzaSyAOcJxNXnlyhqEL4sqNFWTbCeoSJbzhq_4",
  authDomain: "storyhub-d4ca8.firebaseapp.com",
  projectId: "storyhub-d4ca8",
  databaseURL: "https://storyhub-d4ca8.firebaseio.com",
  storageBucket: "storyhub-d4ca8.appspot.com",
  messagingSenderId: "609019817612",
  appId: "1:609019817612:web:974745d59a5a66baa1d5a9"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

  export default firebase.firestore()