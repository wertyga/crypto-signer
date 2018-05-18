import http from 'chai-http';
import chai from 'chai';

import Pair from '../server/models/pair';

import { server } from '../server/index';

chai.use(http);

describe('# Adding_pair api', () => {
    it.skip('Throw error if user is not exist', done => {
        chai.request(server)
            .post('/api/set-sign')
            .send({})
            .end((err, res) => {
                console.log(res.body)
                done();
            })
    });
});