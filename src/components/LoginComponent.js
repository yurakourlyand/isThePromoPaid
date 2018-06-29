import React, {Component} from 'react';
import '../App.css';
import 'bootstrap/dist/css/bootstrap.css';
import * as firebase from 'firebase';



const config = {
    apiKey: "AIzaSyDIdyWK7Q6crJ8kymiz4rm4RkabrLlNXxI",
    authDomain: "dont-bug-me-c93f1.firebaseapp.com",
    databaseURL: "https://dont-bug-me-c93f1.firebaseio.com",
    projectId: "dont-bug-me-c93f1",
    storageBucket: "dont-bug-me-c93f1.appspot.com",
    messagingSenderId: "159548134170"
};

if (!firebase.apps.length) {
    firebase.initializeApp(config);
}

export const auth = firebase.auth();


export default class LoginComponent extends Component {


    provider = new firebase.auth.GoogleAuthProvider();

    onLogin() {
        firebase.auth().signInWithPopup(this.provider).then(result => {
            //...
        }).catch(err => {
            console.log(err.message, "ERROR MESSAGE");
        })
    }


    render() {
        return (
            <div className="container-fluid  d-flex flex-column align-items-center bg-dark">
                <div style={styles.hightt} className="text-center my-5 ">
                    <h1 className="">Welcome To Promo Manager</h1>
                    <button onClick={e => this.onLogin()} className="btn btn-primary w-75">Login with Google</button>
                </div>
            </div>
        );
    }
}

const styles = {};


