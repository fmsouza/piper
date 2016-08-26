# Piper (pre-alpha)
Node.js Middleware to provide pipelining procedures for each URL segment

## Example

```javascript
const http = require('http');
const piper = require('piper');
const request = require('request-promise');

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
server.listen(8080, 'localhost');

http.get(`http://localhost:8080/multiply/increment/?a=5&b=7`, (res) => {
    var body = '';
    res.on('data', (chunk) => body += chunk);
    res.on('end', function() {
        // body === "{ 'value': 36 }"
    });
});
```

> Currently it's under heavy development and is completely unstable.