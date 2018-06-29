import React, {Component} from 'react';
import '../App.css';
import 'bootstrap/dist/css/bootstrap.css';
import LoginComponent from "./LoginComponent";
import { auth } from "./LoginComponent";
import PromoCodes from "./PromoCodes";

class Main extends Component {

    state = {
        authUser: '',
    };

    componentDidMount() {
        auth.onAuthStateChanged(authUser => {
            authUser
                ? this.setState(() => ({authUser}))
                : this.setState(() => ({authUser: null}));
        });
    }

    render() {
        return (
            <div className="container-fluid bg-dark">
                {
                    this.state.authUser
                        ?
                        <PromoCodes/>
                        :
                        <LoginComponent/>
                }
            </div>
        );
    }
}


export default Main;
