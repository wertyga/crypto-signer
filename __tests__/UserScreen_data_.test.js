import http from 'chai-http';
import chai from 'chai';

import User from '../server/models/user';

import { server } from '../server/index';

chai.use(http);
// 'User is not exist!'

describe('#Userscreen data', () => {
    beforeAll(done => {
        User.deleteMany({})
            .then(() => done())
    });
    it('Fetch user and receive data with correct fields', done => {
        chai.request(server)
            .post('/auth/sign-up')
            .send({
                username: 'some_user',
                password: 'some_pass'
            })
            .end((err, res) => {
                const body = res.body;
                chai.request(server)
                    .get(`/api/user/${body._id}`)
                    .end((err, res) => {
                        console.log(res.body)
                        expect(res.body.user).toHaveProperty('username', 'some_user');
                        expect(res.body.user).toHaveProperty('password');
                        expect(res.body.user).toHaveProperty('_id');
                        expect(res.body.user).toHaveProperty('tradePairs', []);
                        expect(res.body.pairs).toEqual([]);

                        done();
                    })
            })
    });
    it.skip('Login and receive correct data', done => {
        chai.request(server)
            .post('/auth/login')
            .send({
                username: 'some_user',
                password: 'some_pass'
            })
            .end((err, res) => {
                const body = res.body;
                chai.request(server)
                    .get(`/api/user/${body._id}`)
                    .end((err, res) => {
                        expect(res.body.user).toHaveProperty('username', 'some_user');
                        expect(res.body.user).toHaveProperty('password');
                        expect(res.body.user).toHaveProperty('_id');
                        expect(res.body.user).toHaveProperty('tradePairs', []);
                        expect(res.body.pairs).toEqual([]);

                        done();
                    })
            })
    });
});

