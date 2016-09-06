/* jshint esversion: 6 */
const http = require('http');
const expect = require('expect');
const querystring = require('querystring');

module.exports = function(hostname, port, piper, request) {

    describe('test/depends', () => {

        before(() => {

            function incrementor(req, res, body) {
                body.value = parseInt(body.value) + 1;
                return body;
            }

            function multiplier(req, res, body) {
                body.value = parseInt(body.a) * parseInt(body.b);
                delete body.a; delete body.b;
                return body;
            }

            piper.pipe('/incrementor', incrementor, { depends: ['multiplier'] });
            piper.pipe('/multiplier', multiplier);

            server = http.createServer(piper);
            server.listen(port, hostname);
        });

        it('should fail to increment without dealing with /multiplier before', (done) => {
            const query = querystring.stringify({ 'value': 2 });
            request.get(`http://${hostname}:${port}/incrementor/?${query}`)
            .then((res) => {
                expect(res.statusCode).toBe(400);
                let body = JSON.parse(res.body);
                expect(body.status).toBe('PiperError');
                expect(body.message).toBe('This URL is not allowed.');
                done();
            });
        });

        it('should increment the product between 5 and 4 by 1 and become 21', (done) => {
            const query = querystring.stringify({ 'a': 5, 'b': 4 });
            request.get(`http://${hostname}:${port}/multiplier/incrementor/?${query}`)
            .then((res) => {
                expect(res.statusCode).toBe(200);
                let body = JSON.parse(res.body);
                expect(body.value).toBe(21);
                done();
            });
        });

        after(() => {
            server.close();
        });
    });
}
