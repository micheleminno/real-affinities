require('express');
const request = require('supertest');

const OK = 200;
const NOK = 404;

var app = require('../server/server.js');

describe("Interests", function() {

		it("should return the list of interests", function(done) {

			 request(app)
                          .get('/interests')
                          .set('Accept', /json/)
                          .expect('Content-Type', /json/)
													.expect(OK)
													.expect(function(res) {

														res.body.interests != null;
													})
                        .end(done);
		});

		it("add an interest", function(done) {

			 request(app)
                          .get('/interests/add')
                          .query({name: 'int', query: 'all'})
                          .set('Accept', /json/)
                          .expect('Content-Type', /json/)
                          .expect(NOK)
													.end(done);
		});

		it("remove an interest", function(done) {

			 request(app)
													.get('/interests/remove')
													.query({name: 'int'})
													.set('Accept', /json/)
													.expect('Content-Type', /json/)
													.expect(OK)
													.end(done);
		});
});
