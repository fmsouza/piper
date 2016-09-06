/* jshint esversion: 6 */
const http = require('http');
const expect = require('expect');
const querystring = require('querystring');

module.exports = function(hostname, port, piper, request) {

    describe('test/default', () => {

        before(() => {

            function increment(req, res, body) {
            body.value = parseInt(body.value) + 1;
            return body;
            }

            function multiply(req, res, body) {
            body.value = parseInt(body.a) * parseInt(body.b);
            delete body.a; delete body.b;
            return body;
            }

            piper.pipe('/increment', increment);
            piper.pipe('/multiply', multiply);

            server = http.createServer(piper);
            server.listen(port, hostname);
        });

        it('should do nothing in base path and return "bar"', (done) => {
            const query = querystring.stringify({ 'foo': 'bar' });
            request.get(`http://${hostname}:${port}/?${query}`)
            .then((res) => {
            var body = JSON.parse(res.body);
            expect(res.statusCode).toBe(200);
            expect(body.foo).toBe('bar');
            done();
            });
        });

        it('should increment 2 by 1 and become 3', (done) => {
            const query = querystring.stringify({ 'value': 2 });
            request.get(`http://${hostname}:${port}/increment/?${query}`)
            .then((res) => {
            var body = JSON.parse(res.body);
            expect(res.statusCode).toBe(200);
            expect(body.value).toBe(3);
            done();
            });
        });

        it('should increment 2 by 2 and become 4 by pipelining "increment" twice', (done) => {
            const query = querystring.stringify({ 'value': 2 });
            request.get(`http://${hostname}:${port}/increment/increment/?${query}`)
            .then((res) => {
            var body = JSON.parse(res.body);
            expect(res.statusCode).toBe(200);
            expect(body.value).toBe(4);
            done();
            });
        });

        it('should multiply 5 with 7 and increment by 1 pipelining "increment" with "multiply"', (done) => {
            const query = querystring.stringify({ a: 5, b: 7 });
            request.get(`http://${hostname}:${port}/multiply/increment/?${query}`)
            .then((res) => {
            var body = JSON.parse(res.body);
            expect(res.statusCode).toBe(200);
            expect(body.value).toBe(36);
            done();
            });
        });

        after(() => {
            server.close();
        });
    });
}
