# Piper (pre-alpha)
Node.js Middleware to provide pipelining procedures for each URL segment

## Example

```javascript
const http = require('http');
const piper = require('piper');

function incrementor(req, res, body) {
    body.value = parseInt(body.value) + 1;
    return body;
}

function multiplier(req, res, body) {
    body.value = parseInt(body.a) * parseInt(body.b);
    delete body.a; delete body.b;
    return body;
}

function decrementor(req, res, body) {
    body.value = parseInt(body.value) - 1;
    return body;
}

piper.pipe('/multiply', multiplier);
piper.pipe('/increment', incrementor, { depends: ['multiply'] });
piper.pipe('/decrement', decrementor, { depends: ['increment'] });

server = http.createServer(piper);
server.listen(8080, 'localhost');

http.get(`http://localhost:8080/multiply/increment/?a=5&b=7`, (res) => {
    var body = '';
    res.on('data', (chunk) => body += chunk);
    res.on('end', function() {
        // res.statusCode === 200
        // body === "{ 'value': 36 }"
    });
});

// '/increment' pipe depending on '/multiply'
http.get(`http://localhost:8080/increment/?value=20`, (res) => {
    var body = '';
    res.on('data', (chunk) => body += chunk);
    res.on('end', function() {
        // res.statusCode === 400
        // body === "{ 'status': 'PiperError', 'message': 'This URL is not allowed.' }"
    });
});

// '/decrement' pipe depending on '/increment' which depends on '/multiply'
http.get(`http://localhost:8080/multiply/increment/decrement/?a=5&b=4`, (res) => {
    var body = '';
    res.on('data', (chunk) => body += chunk);
    res.on('end', function() {
        // res.statusCode === 400
        // body === "{ 'value': 20 }"
    });
});
```

> Currently it's under heavy development and is completely unstable.