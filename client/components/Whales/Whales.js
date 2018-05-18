import { connect } from 'react-redux';

import isEmpty from 'lodash/isEmpty';

import { getWhaleOrders } from '../../actions/api';

import Loading from '../common/Loading/Loading';

import './Whales.sass';

class Whales extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            orders: this.props.orders || [],
            loading: false,
            close: [],
            errors: ''
        };
    };

    // componentDidMount() {
    //     if(!isEmpty(this.state.user)) {
    //         this.props.getWhaleOrders()
    //             .then(() => this.setState({ loading: false }))
    //             .catch(err => {
    //                 this.setState({
    //                     errors: err.response ? err.response.data.errors : err.message
    //                 });
    //             })
    //     };
    // };

    componentDidUpdate(prevProps) {
        if(this.props.orders !== prevProps.orders) {
            this.setState({ orders: this.props.orders });
        };
    };

    closeClick = id => {
        const existItem = this.state.close.find(item => item === id);
        this.setState({
            close: !existItem ? [...this.state.close, id] : this.state.close.filter(item => item !== id)
        })
    };

    render() {

        const angleDown = <i className="fas fa-angle-down"></i>;
        const angleUp = <i className="fas fa-angle-up"></i>;

        return (
            <div className="Whales">
                {this.state.errors && <div className="error">{this.state.errors}</div>}
                {this.state.loading && <Loading />}
                {this.state.orders.map(item =>
                    <div className="order" key={item._id}>
                        <div className="symbol" onClick={() => this.closeClick(item._id)}>
                            <span>{item.symbol === 'BTCUSDT' ? 'BTC/USDT' : item.symbol.split('BTC').join('/BTC')}</span>
                            {!this.state.close.find(pair => pair === item._id) ? angleDown : angleUp}
                        </div>
                        <div className={this.state.close.find(pair => pair === item._id) ? 'data close' : 'data'}>
                            {item.orders.map((order, i) =>
                                <ul key={i}>
                                    <li>Price: {order.price}</li>
                                    <li>Amount: {order.amount}</li>
                                    <li>Total BTC: {order.totalBtc}</li>
                                </ul>
                            )}
                        </div>
                    </div>
                )}
            </div>
        );
    };
};

const mapState = state => {
    return {
        orders: state.whaleOrders,
        user: state.user
    };
};

export default connect(mapState, { getWhaleOrders })(Whales);