import { connect } from 'react-redux';
import io from 'socket.io-client';
import axios from 'axios';

import isEmpty from 'lodash/isEmpty';

import collectPairs from '../../common/functions/collectPairs';

import { getUserData, clearUser } from '../../actions/auth';
import { getActualPairs, updatePairsPrice, deletePair, getWhaleOrders } from '../../actions/api';

import Loading from '../common/Loading/Loading';
import Option from '../common/Option/Option';
import Toggle from '../common/Toggle/Toggle';
import AddingPair from '../AddingPair/AddingPair';
import Pair from '../Pair/Pair';
import PercentPair from '../PercentPair/PercentPair';

import './UserScreen.sass';

class UserScreen extends React.Component {
    constructor(props) {
        super(props);

        this.signTimer = null;
        this.percentTimer = null;

        this.state = {
            addingPairs: false,
            optionItems: this.props.pairs.length < 1 ? [] : collectPairs(this.props.pairs),
            optionValue: '',
            loading: false,
            percentPairs: [],
            errors: ''
        }
    };

    componentDidMount() {
        this.setupSocket();
    };

    componentDidUpdate(prevProps) {
        if(this.props.pairs !== prevProps.pairs) { // Update trade pairs
            const optionItems = collectPairs(this.props.pairs);
            this.setState({
                optionItems
            });
        };

        if(this.props.tradePairs !== prevProps.tradePairs) {
            if(this.props.tradePairs.length < 1) {
                clearInterval(this.signTimer);
                this.signTimer = null;
            } else {
                this.launchSocketInterval();
            };
        };

    };

    componentWillUnmount() {
        clearInterval(this.signTimer);
        clearInterval(this.percentTimer);
        this.percentTimer = null;
        this.signTimer = null;
    };

    setupSocket = () => { // Setup socket communicate
        this.socket = io(`/`);
        this.socket.on('connect', () => {
            this.socket.emit('room', { id: this.props.user._id})
        });

        this.socket.on('update-price', pairs => {
            this.props.updatePairsPrice(pairs.pairs)
        });

        this.socket.on('launch_reached_percents', data => {
            this.setState({
                percentPairs: data.data
            });
        });

        this.launchSocketInterval();
    };

    launchSocketInterval = () => {
        if(!this.signTimer && this.props.tradePairs.length > 0) {
            this.signTimer = setInterval(() => { // Launch sign price fetching
                this.socket.emit('gimme-the-data', {});
            }, 10000);
        };
        this.percentTimer = setInterval(() => { // Launch percent fetching
            this.socket.emit('get_reached_percents', {})
        }, 10000);
    };

    changeOptionValue = title => { //Option changing between pairs
        const pair = this.state.optionItems.find(item => item.title === title);

        this.setState({
            optionValue: pair.name
        });
    };

    onChangeOption = e => { // Searching option value
        const value = e.target.value;

        this.setState({
            optionValue: value,
            optionItems: collectPairs(
                this.props.pairs.filter(item => {
                    return item.symbol.toUpperCase().indexOf(value.replace('/', '').toUpperCase()) === 0
                })
            ),
            errors: ''
        })
    };

    addPair = () => { // Show dialog window to set sign price
        if(true) {
            this.setState({
                addingPair: true,
                errors: ''
            })
        } else {
            this.setState({
                errors: 'Incorrect pair input'
            })
        }
    };

    deletePair = id => { // Delete pair
        return this.props.deletePair(id)
    };

    onClose = () => { // Close modal window when setting sign price
        this.setState({
            optionValue: '',
            addingPair: false,
            optionItems: collectPairs(this.props.pairs)
        })
    };

    logout = () => { // Logout user
        setTimeout(() => {
            this.props.clearUser();
            this.props.history.push('/')
        }, 350)
    };

    deletePercentPair = percentPairId => { // Delete percent pair from state list
        axios.post('/api/delete-percent-pair', {
            userId: this.props.user._id,
            percentPairId
        })
            .then(() => this.setState({ percentPairs: this.state.percentPairs.filter(item => item._id !== percentPairId) }))
            .catch(err => this.setState({ errors: err.response ? err.response.data : err.message }))
    };

    goToWhales = () => { // Fetch whales orders book
        this.setState({ loading: true });
        this.props.getWhaleOrders()
            .then(() => {
                this.props.history.push(`/user/${this.props.user.username}/whales-orders`);
            })
            .catch(err => {
                this.setState({
                    errors: err.response ? err.response.data.errors : err.message
                });
            })
    };

    render() {

        const dataPercent = Object.keys(this.state.percentPairs);

        const main = (
            <React.Fragment>
                <div className="options">
                    <div className="left-content">
                        <Option
                            value={this.state.optionValue}
                            items={this.state.optionItems}
                            onClick={this.changeOptionValue}
                            emptyValue='--No pairs--'
                            disable={this.state.loading || this.state.optionItems.length < 1}
                            onChange={this.onChangeOption}
                            label="Choose pair:"
                        />
                        <button className="primary" onClick={this.addPair} disabled={!this.state.optionValue}>Add pair</button>
                    </div>

                    {this.state.addingPair &&
                    <AddingPair
                        onClose={this.onClose}
                        pair={this.state.optionItems.find(item => item.name === this.state.optionValue)}
                        userId={this.props.user._id}
                    />
                    }

                </div>
                {this.props.tradePairs.map((pair, i) => (
                    <Pair
                        key={pair._id}
                        onClose={this.deletePair}
                        { ...pair }
                    />
                ))}
            </React.Fragment>
        );

        return (
            <div className="UserScreen">
                <div className="upper_bar">
                    <div className="left">
                        <Toggle
                            open={true}
                            onChange={this.logout}
                            label="Logged"
                        />
                        <div className="upper_name">{this.props.user.username}</div>
                        <div className="email">{this.props.user.email}</div>
                    </div>

                    <button
                        className="primary"
                        onClick={this.goToWhales}
                    >
                        See whale orders
                    </button>
                </div>
                {dataPercent.length > 0 &&
                <div className="percentPairs">
                    {dataPercent.map(item => {
                        const pairObj = this.state.percentPairs[item];
                        return <PercentPair  key={pairObj.symbol} { ...pairObj } onDelete={this.deletePercentPair}/>
                    })}
                </div>
                }
                {this.state.errors && <div className="error">{this.state.errors}</div>}
                {this.state.loading ? <Loading /> : main}
            </div>
        );
    }
};

UserScreen.propTypes = {
    getUserData: PropTypes.func.isRequired, //Fetch user data when reload/refresh page
    getActualPairs: PropTypes.func.isRequired, //Update actual trade pairs
    updatePairsPrice: PropTypes.func.isRequired, //Update price of all pairs
    deletePair: PropTypes.func.isRequired, //Delete pair bu id
    user: PropTypes.object.isRequired, //User data object
    pairs: PropTypes.array.isRequired, //All available trade pairs
};

const mapState = state => {
    return {
        user: state.user,
        tradePairs: state.tradePairs,
        pairs: state.pairs
    };
};

export default connect(mapState, { getUserData, getActualPairs, updatePairsPrice, deletePair, clearUser, getWhaleOrders })(UserScreen);