/* jshint esversion: 6 */
const url = require("url");

const router = {};

function doRouting(url, req, res, body) {
    const apis = url.pathname.split('/');
    for (let api of apis) {
        const middleware = router[`/${api}`];
        if (middleware) body = middleware(req, res, body);
    }
    return body;
}

function prepareBody(req, url) {
    let body = '';
    switch (req.method) {
        case 'GET': default:
            body = url.query || {};
    }
    return body;
}

const Segserver = function(req, res) {
    const parsedUrl = url.parse(req.url, true);
    let body = prepareBody(req, parsedUrl);
    body = doRouting(parsedUrl, req, res, body);
    res.end(JSON.stringify(body));
};

Segserver.pipe = function(route, fn) {
    router[route] = fn;
};

module.exports = Segserver;