import React, {Component} from 'react';
import '../App.css';
import 'bootstrap/dist/css/bootstrap.css';
import * as firebase from 'firebase';
import * as _ from "lodash";


const fireStore = firebase.firestore();
const settings = {timestampsInSnapshots: true};
fireStore.settings(settings);


export default class PromoCode extends Component {

    state = {
        devices: {},
        paidDevices: 0,
        unpaidDevices: 0,
        markedDevices: {},
        filteredText: '',
        filteredDevices: {},
        showUnpaidOnly: false,
        selectAll: false,
    };


    componentWillMount() {
        let paidDeviceCount = this.state.paidDevices;
        let unpaidDeviceCount = this.state.unpaidDevices;
        let deviceList = this.state.devices;
        _.forEach(this.props.registeredDevices, device => {
            if (device.promo === this.props.selectedPromo) {
                deviceList[device.deviceId] = device;
                device.isPaid ? paidDeviceCount++ : unpaidDeviceCount++;
            }
        });
        this.setState({devices: deviceList});
        this.setState({paidDevices: paidDeviceCount});
        this.setState({unpaidDevices: unpaidDeviceCount});
        if (!this.state.filteredText) {
            this.setState({filteredDevices: deviceList});
        }
    }


    changeToUnpaid(e) {
        let deviceList = this.state.devices;
        fireStore.collection("PromoCodes").doc(e.deviceId).update({
            isPaid: false
        }).then(ev => {
            if (this.state.devices[e.deviceId].isPaid) {
                this.setState({unpaidDevices: this.state.unpaidDevices + 1, paidDevices: this.state.paidDevices - 1})
            }
            deviceList[e.deviceId].isPaid = false;

            this.setState({devices: deviceList})
        })
    }

    changeToPaid(e) {
        let deviceList = this.state.devices;
        fireStore.collection("PromoCodes").doc(e.deviceId).update({
            isPaid: true
        }).then(ev => {
            if (!this.state.devices[e.deviceId].isPaid) {
                this.setState({unpaidDevices: this.state.unpaidDevices - 1, paidDevices: this.state.paidDevices + 1})
            }
            deviceList[e.deviceId].isPaid = true;

            this.setState({devices: deviceList})
        })
    }

    filterDeviceName(value) {
        this.setState({filteredText: value});
        let f = value.toLowerCase();
        let filteredDevices = _.filter(this.state.devices, d => {
            return d.deviceInfo.deviceName.toLowerCase().includes(f);
        });
        this.setState({filteredDevices: filteredDevices})
    }

    checkUncheckAll(checked) {
        if (checked) {
            this.setState({selectAll: true});
            if (this.state.showUnpaidOnly) {
                let checkedList = _.filter(this.state.devices, e => {
                    return !e.isPaid;
                });
                this.setState({markedDevices: checkedList})
            } else {
                this.setState({markedDevices: this.state.devices})
            }
        } else {
            this.setState({markedDevices: {}, selectAll: false})
        }
    }

    addOrRemoveMarkedDevices(checked, element) {
        let checkList = this.state.markedDevices;
        if (checked) {
            checkList[element.deviceId] = element;
        } else {
            delete checkList[element.deviceId];
        }
        this.setState({markedDevices: checkList})
    }

    markAsUnpaidButton() {
        _.forEach(this.state.markedDevices, e => {
            this.changeToUnpaid(e);
        });
        this.setState({markedDevices: {}, selectAll: false})
    }


    markAsPaidButton() {
        _.forEach(this.state.markedDevices, e => {
            this.changeToPaid(e);
        });
        this.setState({markedDevices: {}, selectAll: false})
    }


    render() {
        return (
            <div className="card   bg-secondary">

                <nav className="navbar navbar-dark bg-secondary">
                    <span style={{borderRadius: 2}} className='bg-secondary'>Code: <span
                        className='font-weight-bold'>{this.props.selectedPromo}</span></span>
                    <div className='font-weight-bold'>Paid: {this.state.paidDevices}</div>
                    <div className='font-weight-bold'>Unpaid: {this.state.unpaidDevices}</div>
                    <div className="form-check-inline" style={{borderRadius: 10}}>
                        <span style={{}} className="checkbox-inline font-weight-bold">
                            Show unpaid only
                        </span>
                        <input
                            onChange={e => this.setState({showUnpaidOnly: e.target.checked})}
                            className='form-check-input ml-1 mt-1'
                            type="checkbox"
                        />
                    </div>
                    <div className="btn-group" role="group" aria-label="Basic example">
                        <button onClick={event => this.markAsUnpaidButton()} style={styles.markButtons}
                                className='btn btn-sm  border-dark'>Mark as Unpaid
                        </button>
                        <button onClick={event => this.markAsPaidButton()} style={styles.markButtons}
                                className='btn btn-sm  border-dark ml-2'>Mark as Paid
                        </button>
                    </div>
                    <input onChange={e => this.filterDeviceName(e.target.value)} placeholder="Search" type="search"/>
                </nav>

                <div style={{borderRadius: 5}} className="b">
                    <table className="table">
                        <thead className="thead-dark ">
                        <tr className="bg-info">
                            <th scope="col"><input checked={this.state.selectAll}
                                                   onChange={e => this.checkUncheckAll(e.target.checked)}
                                                   type="checkbox"/></th>
                            <th scope="col">Device name</th>
                            <th scope="col">Install date</th>
                            <th scope="col">Type</th>
                            <th scope="col">Paid/Unpaid</th>
                        </tr>
                        </thead>
                        <tbody>
                        {_.map(_.sortBy(this.state.filteredDevices, ['isPaid']), e => {
                            if (this.state.showUnpaidOnly && e.isPaid) return false;
                            return <tr key={e.deviceId} className='bg-secondary'>
                                <th scope="row"><input
                                    onChange={event => this.addOrRemoveMarkedDevices(event.target.checked, e)}
                                    checked={this.state.markedDevices[e.deviceId]} type="checkbox"/></th>
                                <th scope="row">{e.deviceInfo.deviceName} </th>
                                <th scope="row">{new firebase.firestore.Timestamp(e.date.seconds, e.date.nanoseconds).toDate().toDateString()} </th>
                                <th scope="row">{e.deviceInfo.manufacturer.toLowerCase() === 'apple' ? 'IOS' : 'Android'} </th>
                                <td>{
                                    e.isPaid
                                        ?
                                        <button onClick={el => this.changeToUnpaid(e)}
                                                className='btn border-dark btn-sm bg-success text-center'>
                                            Paid
                                        </button>
                                        :
                                        <button onClick={el => this.changeToPaid(e)}
                                                className='btn border-dark btn-sm bg-danger text-center'>
                                            Unpaid
                                        </button>
                                }
                                </td>
                            </tr>
                        })
                        }
                        </tbody>
                    </table>
                </div>

                <button onClick={e => this.props.goBackToPromoCodes()} className="btn ">
                    Back to Promo Codes
                </button>

            </div>
        );
    }


}

const styles = {
    markButtons: {
        backgroundColor: 'darkgrey'
    },
    table2: {
        tableLayout: 'fixed',
    }
};

