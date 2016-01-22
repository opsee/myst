'use strict';

const config = require('config');
const supertest = require('supertest');
const assert = require('chai').assert;
const URL = require('url');
const sinon = require('sinon');

const googleAnalytics = require('../lib/google-analytics');
const intercom = require('../lib/intercom');
const server = require('../server');

function noop() {
  return Promise.resolve();
}

describe('server', () => {
  let request;

  before(() => {
    // Stub out to avoid network requests
    // FIXME it is lame to do this one-by-one ??? (also: I would rather mock
    // the npm libs themselves as opposed to the Myst libs)
    sinon.stub(googleAnalytics, 'pageview',  noop);
    sinon.stub(googleAnalytics, 'track', noop);
    sinon.stub(intercom, 'updateUser',  noop);
    sinon.stub(intercom, 'track', noop);

    request = supertest(URL.format({
      protocol: config.server.protocol,
      hostname: config.server.hostname,
      port: config.server.port
    }));
    server.start();
  });

  describe('POST /health', () => {
    it('returns 200', (done) => {
      request
        .get('/health')
        .expect(200, '', done);
    });
  });

  describe('POST /event', () => {
    it('returns 200', (done) => {
      request
        .post('/event')
        .send({
          category: 'test',
          user: { id: 123 }
        })
        .expect(200, '', done);
    });

    it('returns error if user missing', (done) => {
      request
        .post('/event')
        .send({
          category: 'test',
        })
        .expect(409, {
          code: 'InvalidArgument',
          message: 'Missing user.id parameter'
        })
        .end(done);
    });

    it('returns error if user.id missing', (done) => {
      request
        .post('/event')
        .send({
          category: 'test',
          user: { email: 'foo@bar.com' }
        })
        .expect(409, {
          code: 'InvalidArgument',
          message: 'Missing user.id parameter'
        })
        .end(done);
    });

    it('returns error if category missing', (done) => {
      request
        .post('/event')
        .send({
          user: { id: 123 }
        })
        .expect(409, {
          code: 'InvalidArgument',
          message: 'Missing category parameter'
        })
        .end(done);
    });
  });

  describe('POST /pageview', () => {
    it('returns 200', (done) => {
      request
        .post('/pageview')
        .send({
          path: '/test',
          name: 'testing',
          user: { id: 123 }
        })
        .expect(200, '', done);
    });

    it('returns success if user missing', (done) => {
      request
        .post('/pageview')
        .send({
          path: '/test',
          name: 'testing',
        })
        .expect(200, '', done);
    });

    it('returns success if user.id missing', (done) => {
      request
        .post('/pageview')
        .send({
          path: '/test',
          name: 'testing',
          user: { email: 'foo@bar.com' }
        })
        .expect(200, '', done);
    });

    it('returns error if path missing', (done) => {
      request
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
      request
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
  });

  describe('POST /user', () => {
    it('returns 200', (done) => {
      request
        .post('/user')
        .send({
          user: { id: 123 }
        })
        .expect(200, '', done);
    });

    it('returns error if user missing', (done) => {
      request
        .post('/user')
        .send({})
        .expect(409, {
          code: 'InvalidArgument',
          message: 'Missing user.id parameter'
        })
        .end(done);
    });

    it('returns error if user.id missing', (done) => {
      request
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