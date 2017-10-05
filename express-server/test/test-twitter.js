const request = require('supertest');

const OK = 200;
const NOK = 404;

var app = require('../server/server.js');

describe("Twitter", function() {

		it("should return the list of Twitter users matching search keywords", function(done) {

			  request(app)
                          .get('/twitter/search/users')
													.query({q: 'funk', page: 1})
                          .set('Accept', /json/)
                          .expect('Content-Type', /json/)
													.expect(OK)
													.expect(function(res) {

														res.body.interests != null;
													})
                        .end(done);
		});
});
