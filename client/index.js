import React from 'react';
import ReactDOM from 'react-dom';
import App from './components/App/App';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';

import configureStore from './common/functions/configureStore';

import './styles/index.sass';

const preloadState = window.__PRELOADED_STATE__;
delete window.__PRELOADED_STATE__;

const store = configureStore(preloadState);

ReactDOM.hydrate (
    <BrowserRouter>
        <Provider store={store}>
            <App />
        </Provider>
    </BrowserRouter>,
    document.getElementById('app')
);
