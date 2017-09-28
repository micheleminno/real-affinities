const request = require('supertest');
require('express');


var OK = 200;
var NOK = 404;

var app = require('../server/server.js');

describe("Target", function() {

		it("should return the list of target ids", function(done) {

			 request(app)
                          .get('/target')
                          .set('Accept', /json/)
                          .expect('Content-Type', /json/)
													.expect(OK)
													.expect(function(res) {

														res.body.targetsIds != null;
													})
                        .end(done);
		});

		it("add a fake target id", function(done) {

			 request(app)
                          .get('/target/add')
                          .query({id: '123'})
                          .set('Accept', /json/)
                          .expect('Content-Type', /json/)
                          .expect(NOK)
													.end(done);
		});

		it("add a real target id", function(done) {

			 request(app)
													.get('/target/add')
													.query({id: '586565407'})
													.set('Accept', /json/)
													.expect('Content-Type', /json/)
													.expect(OK)
													.end(done);
		});

		it("remove a real target id", function(done) {

			 request(app)
													.get('/target/remove')
													.query({id: '586565407'})
													.set('Accept', /json/)
													.expect('Content-Type', /json/)
													.expect(OK)
													.end(done);
		});
});
