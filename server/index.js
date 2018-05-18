import express from 'express';
import bodyParser from 'body-parser';

import cluster from 'cluster';

import config from './common/config';
const log = require('./common/log')(module);
import sessionStore from './common/sessionStore';
import session from 'express-session';

import renderHtml from './common/renderHtml';
import { renderToString } from 'react-dom/server';

import App from '../client/components/App/App';
import NotFoundPage from '../client/components/404/404';

// ****************** Import routes *************
import auth from './routes/auth';
import api from './routes/api';
import user from './routes/user';
//***********************************************
import Pair, { pairFields } from './models/pair';
import User  from './models/user';
import { percentFields }  from './models/reachedPercent';

const dev = process.env.NODE_ENV === 'development';
const test = process.env.NODE_ENV === 'test';
const prod = process.env.NODE_ENV === 'production';

export const app = express();
export const server = require('http').Server(app);

if(false) {

    let cpuCount = require('os').cpus().length;

    for (let i = 0; i < cpuCount; i += 1) {
        cluster.schedulingPolicy = cluster.SCHED_NONE;
        cluster.fork();
    }

    cluster.on('exit', function (worker) {
        console.log('Worker ' + worker.id + ' died :(');
        cluster.fork();
    });

} else {
    //******************************** Run server ***************************

    server.listen(config.PORT, () => console.log(`Server run on ${config.PORT} port`));

    // *******************************************************************
};

if(prod) {

    //************************* GARBAGE magic ***********************************

    // Для работы с garbage collector запустите проект с параметрами:
    // node --nouse-idle-notification --expose-gc app.js
    let gcInterval;

    function init() {
        gcInterval = setInterval(function () {
            gcDo();
        }, 60000);
    };

    function gcDo() {
        global.gc();
        clearInterval(gcInterval);
        init();
    };

    init();

    //************************************************************
}
    app.use(bodyParser.json());
    app.use(express.static('public/static'));
    app.use(session({
        secret: config.session.secret,
        saveUninitialized: false,
        resave: true,
        key: config.session.key,
        cookie: config.session.cookie,
        store: sessionStore
    }));

    //******************************** Routes ***************************
    app.use('/auth', auth);
    app.use('/api', api);
    app.use('/user', user);

    app.get('/', (req, res) => {
            res.send(renderHtml(req, <App />))
    });

    app.get('*', (req, res) => {
        res.send(renderHtml(req, <NotFoundPage />))
    });

//******************************** Uncaught Exception ***************************

process.on('uncaughtException', function (err) {
    log.error((new Date).toUTCString() + ' uncaughtException:', err.message);
    log.error(err.stack);
    process.exit(1);
});


const io = require('socket.io')(server);

io.on('connection', socket => {
    socket.on('room', room => {
        room = room.id;
        socket.join(room);

        socket.on('get_reached_percents', () => {
            User.findById(room).populate('percents')
                .then(user => {
                    if(user) io.to(room).emit('launch_reached_percents', { data: user.percents.map(item => percentFields(item)) });
                })
        });
        socket.on('gimme-the-data', () => {
            Pair.find({ owner: room }).then(pairs => Pair.populateByTitle(pairs.map(pair => pair._id)))
                .then(pairs => {
                    io.to(room).emit('update-price', { pairs })
                })
        });
        socket.on('disconnect', () => {
            console.log(`leave ${room} room`);
            socket.leave(room);
        })
    })
});






