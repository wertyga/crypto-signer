import { connect } from 'react-redux';

import collectPairs from '../../common/functions/collectPairs';

import { updatePrice } from '../../actions/api';

import './Pair.sass';

class Pair extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            name: collectPairs({ symbol: this.props.symbol })[0].name,
            diffPrice: 0,
            errors: '',
            loading: false
        };
    };

    componentDidMount() {
        this.comparePriceDifferent();
    };

    componentWillUnmount() {

    };

    componentDidUpdate(prevProps) {
        if(this.props.price !== prevProps.price) {
            this.comparePriceDifferent();
        };
    };

    launchComparePrice = () => {
        this.props.updatePrice(this.props._id)
            .catch(err => {
                this.setState({
                    errors: err.response ? err.response.data.errors : err.message
                });
            })
    };

    comparePriceDifferent = () => { // Compare different between current - and previous price
        const diffPrice = (this.props.price - this.props.prevPrice).toFixed(8);
        if(diffPrice < 0) {
            this.setState({
                diffPrice
            });
        } else {
            this.setState({
                diffPrice: `+${diffPrice}`
            });
        }
    };

    onClose = () => {
        this.setState({ loading: true });
        this.props.onClose(this.props._id)
            .catch(err => this.setState({ errors: err.response ? err.response.data : err.message}))
    };

    render() {

        const downStyle = {
            color: 'red',
            transform: 'rotate(180deg)'
        };
        const upStyle = {
            color: 'green',
        };

        return (
            <div className="Pair" style={{ backgroundColor: this.props.sign && 'rgba(7, 183, 37, 0.74)'}}>
                <p className="title">{this.state.name}</p>
                {this.state.errors && <div className="error">{this.state.errors}</div>}
                <div className="content">
                    <p className="price">Purpose price: {this.props.signPrice.toFixed(8)}</p>
                    <p className="price">Current price: {this.props.price.toFixed(8)}</p>

                    <p className={this.state.diffPrice > 0 ? 'arrow green' : 'arrow red'}>
                        {this.state.diffPrice}
                        <i className="fas fa-arrow-alt-circle-up" style={this.state.diffPrice > 0 ? upStyle : downStyle}></i>
                    </p>


                    <p className="price">Previous price: {this.props.prevPrice}</p>

                    {this.props.sign && <div className="signTime">Reached time: <strong>{this.props.updatedAt}</strong></div>}
                </div>

                <button className="close danger" onClick={this.onClose} disabled={this.state.loading}>Delete</button>
            </div>
        );
    };
};

export default connect(null, { updatePrice })(Pair);