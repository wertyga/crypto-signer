import http from 'chai-http';
import chai from 'chai';

import User from '../server/models/user';

import { server } from '../server/index';

chai.use(http);

describe('#LoginScreen data testing', () => {
    beforeAll(done => {
        User.deleteMany({})
            .then(() => done());

    });
    it('Check that new user registration saved with needs fields', done => {
            chai.request(server)
                .post('/auth/sign-up')
                .send({
                    username: 'some_user',
                    password: 'some_pass'
                })
                .end((err, res) => {
                    const body = res.body;
                    expect(res.status).toBe(200);
                    expect(typeof body).toBe('object');
                    expect(body).toHaveProperty('user');
                    expect(body).toHaveProperty('pairs');
                    expect(body.user).toHaveProperty('_id');
                    expect(body.user).toHaveProperty('username', 'some_user');
                    expect(body.user).toHaveProperty('password');
                    expect(body.user.password).not.toEqual('some_pass');
                    expect(body.pairs).toEqual([]);

                    done();
                })
    });
    it('Throw error if require fields will be an empty', done => {
        chai.request(server)
            .post('/auth/sign-up')
            .send({})
            .end((err, res) => {
                const body = res.body;
                expect(res.status).toBe(400);
                expect(typeof body).toBe('object');
                expect(body.errors).toHaveProperty('username', 'Field can not be blank');
                expect(body.errors).toHaveProperty('password', 'Field can not be blank');

                done();
            });
    });
    it('Throw error if user is already exist', done => {
        chai.request(server)
            .post('/auth/sign-up')
            .send({
                username: 'some_user',
                password: 'some_pass'
            })
            .end((err, res) => {
                const body = res.body;
                expect(res.status).toBe(500);
                expect(typeof body).toBe('object');
                expect(body.errors).toHaveProperty('globalError', 'User is already exist')

                done();
            })
    });
    it('Throw error if while login incorrect password', done => {
        chai.request(server)
            .post('/auth/login')
            .send({
                username: 'some_user',
                password: 'wrong_some_pass'
            })
            .end((err, res) => {
                const body = res.body;
                expect(res.status).toBe(500);
                expect(typeof body).toBe('object');
                expect(body.errors).toHaveProperty('globalError', 'Password is incorrect')

                done();
            })
    });
    it('Login with correct fields', done => {
        chai.request(server)
            .post('/auth/login')
            .send({
                username: 'some_user',
                password: 'some_pass'
            })
            .end((err, res) => {
                const body = res.body;
                expect(res.status).toBe(200);
                expect(typeof body).toBe('object');
                expect(body).toHaveProperty('user');
                expect(body).toHaveProperty('pairs');
                expect(body.user).toHaveProperty('_id');
                expect(body.user).toHaveProperty('username', 'some_user');
                expect(body.user).toHaveProperty('password');
                expect(body.user.password).not.toEqual('some_pass');
                expect(body.pairs).toEqual([]);

                done();
            })
    });

});