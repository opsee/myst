const request = require('supertest');
const server = require('../server');
const assert = require('chai').assert;

describe('server', () => {
  before(() => {
    server.start();
  });

  describe('POST /health', () => {
    it('returns 200', (done) => {
      request('http://localhost:9098')
        .get('/health')
        .expect(200, '', done);
    });
  });

  describe('POST /pageview', () => {
    it('returns 200', (done) => {
      request('http://localhost:9098')
        .post('/pageview')
        .send({
          path: '/test',
          name: 'testing',
          user: { id: 123 }
        })
        .expect(200, '', done);
    });

    it('returns error if path missing', (done) => {
      request('http://localhost:9098')
        .post('/pageview')
        .send({
          name: 'testing',
          user: { id: 123 }
        })
        .expect(409, {
          code: 'InvalidArgument',
          message: 'Missing path parameter'
        })
        .end(done);
    });

    it('returns error if name missing', (done) => {
      request('http://localhost:9098')
        .post('/pageview')
        .send({
          path: '/test',
          user: { id: 123 }
        })
        .expect(409, {
          code: 'InvalidArgument',
          message: 'Missing name parameter'
        })
        .end(done);
    });

    it('returns error if user missing', (done) => {
      request('http://localhost:9098')
        .post('/pageview')
        .send({
          path: '/test',
          name: 'testing',
        })
        .expect(409, {
          code: 'InvalidArgument',
          message: 'Missing user.id parameter'
        })
        .end(done);
    });

    it('returns error if user.id missing', (done) => {
      request('http://localhost:9098')
        .post('/pageview')
        .send({
          path: '/test',
          name: 'testing',
          user: { email: 'foo@bar.com' }
        })
        .expect(409, {
          code: 'InvalidArgument',
          message: 'Missing user.id parameter'
        })
        .end(done);
    });
  });

  describe('POST /user', () => {
    it('returns 200', (done) => {
      request('http://localhost:9098')
        .post('/user')
        .send({
          user: { id: 123 }
        })
        .expect(200, '', done);
    });

    it('returns error if user missing', (done) => {
      request('http://localhost:9098')
        .post('/user')
        .send({})
        .expect(409, {
          code: 'InvalidArgument',
          message: 'Missing user.id parameter'
        })
        .end(done);
    });

    it('returns error if user.id missing', (done) => {
      request('http://localhost:9098')
        .post('/user')
        .send({
          user: { email: 'foo@bar.com' }
        })
        .expect(409, {
          code: 'InvalidArgument',
          message: 'Missing user.id parameter'
        })
        .end(done);
    });
  });
});