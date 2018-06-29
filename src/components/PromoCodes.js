import React, {Component} from 'react';
import '../App.css';
import 'bootstrap/dist/css/bootstrap.css';
import * as firebase from 'firebase';
import * as _ from 'lodash';
import PromoCode from "./PromoCode";


const fireStore = firebase.firestore();
const settings = {/* your settings... */ timestampsInSnapshots: true};
fireStore.settings(settings);


export default class PromoCodes extends Component {

    state = {
        uniquePromoCodes: [],
        registeredDevices: {},
        currentScreenOrSelectedPromo: 'promoCodes',
        filteredPromo: [],
        filteredText: '',
    };


    componentWillMount() {
        let myList = this.state.registeredDevices;
        let uniquePromoList = this.state.uniquePromoCodes;
        fireStore.collection('PromoCodes').orderBy('promo')
            .onSnapshot(snapshot => {
                snapshot.docChanges().forEach(change => {
                    let id = change.doc.data().deviceId;
                    let device = change.doc.data();
                    myList[id] = device;
                    if (uniquePromoList.indexOf(change.doc.data().promo) === -1) {
                            uniquePromoList.push(change.doc.data().promo)
                    }
                });
                this.setState({registeredDevices: myList, uniquePromoCodes: uniquePromoList})
                if (!this.state.filteredText) {
                    this.setState({filteredPromo: uniquePromoList})
                }
                console.log(uniquePromoList,"UN")
            });

    }


    signOutButton() {
        return <button className='btn' onClick={e => {
            firebase.auth().signOut().then(e => {
                //......
            }).catch(error => {
                //......
            });
        }}>Sign-out</button>
    }


    goBackToPromoCodes() {
        this.setState({currentScreenOrSelectedPromo: 'promoCodes'})
    };


    filterPromos(value) {
        this.setState({filteredText: value});
        let f = value.toLowerCase();
        let filtered = _.filter(this.state.uniquePromoCodes, p => {
            return p.toLowerCase().includes(f);
        });
        this.setState({filteredPromo: filtered})
    }


    render() {
        return (
            this.state.currentScreenOrSelectedPromo === "promoCodes" ?
                <div style={{borderRadius: 5}} className="">
                    <table className="table">
                        <thead className="thead-dark ">
                        <tr className="bg-info">
                            <th scope="col">Promo Codes</th>
                            <th scope="col"><input onChange={e => this.filterPromos(e.target.value)} placeholder="Search" type="search"/></th>
                        </tr>
                        </thead>
                        <tbody>
                        {_.map(this.state.filteredPromo, e => {
                            return <tr key={e} className='bg-secondary'>
                                <th scope="row">{e}</th>
                                <td><a onClick={event => this.setState({currentScreenOrSelectedPromo: e})}
                                       style={{color: 'purple'}} href="#">List of devices</a></td>
                            </tr>
                        })
                        }
                        </tbody>
                    </table>
                    {this.signOutButton()}
                </div>

                :

                <PromoCode selectedPromo={this.state.currentScreenOrSelectedPromo}
                           registeredDevices={this.state.registeredDevices}
                           goBackToPromoCodes={e => this.goBackToPromoCodes()}

                />
        )
    }


    styles = {
        header: {
            width: '50&'
        },
        table2: {
            tableLayout: 'fixed',
        }
    };


}
