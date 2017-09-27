
const request = require('supertest');
var express = require('express');

var app = require('../server/Server.js');

describe("Server", function() {

		it("should respond", function(done) {

			 request(app)
                          .get('/')
                          .set('Accept', /text/)
                          .expect('Content-Type', /text/)
                          .expect(200, done);
		});
});
