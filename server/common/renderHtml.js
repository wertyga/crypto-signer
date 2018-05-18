import { renderToString } from 'react-dom/server';
import { Provider } from 'react-redux';
import { StaticRouter } from 'react-router-dom';

import configureStore from '../../client/common/functions/configureStore';

export default (req, Component, state) => {
    const store = configureStore(state);
    const html = renderToString(
        <StaticRouter context={{}} location={req.url}>
            <Provider store={store}>

                    {Component}

            </Provider>
        </StaticRouter>
    );

    return (`
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <title>Crypto signer</title>
                <link rel="stylesheet" href="/css/main.css">
                <link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.0.12/css/all.css" integrity="sha384-G0fIWCsCzJIMAVNQPfjH08cyYaUtMwjJwqiRKxxE/rx96Uroj1BtIQ6MLJuheaO9" crossorigin="anonymous">
                <script>
                    window.__PRELOADED_STATE__ = ${JSON.stringify(store.getState()).replace(/</g, '\\u003c')}
                </script>
               <script src="/bundle.js" defer></script>
            </head>
            <body>
            
                <div id="app">${html}</div>
            
            </body>
            </html>
        `);
};