/* jshint esversion: 6 */
const url = require("url");

const router = {}, rules = {};

function checkConfig(route, rule, apis) {
    if (rule && rule.depends) {
        let allowed = true;
        for (let dep of rule.depends) {
            // console.log(apis, apis.indexOf(dep), apis.indexOf(route), ((apis.indexOf(dep) > -1) && (apis.indexOf(dep) < apis.indexOf(route))));
            allowed = allowed && ((apis.indexOf(dep) > -1) && (apis.indexOf(dep) < apis.indexOf(route)));
        }
        if (!allowed) return 'This URL is not allowed.';
        return false;
    }
    return false;
}

function doRouting(url, req, res, body) {
    const apis = url.pathname.split('/');
    for (let api of apis) {
        const middleware = router[`/${api}`];
        let disallowed = checkConfig(api, rules[`/${api}`], apis);
        if (disallowed) {
            body = { status: 'PiperError', message: disallowed, code: 400 };
            break;
        }
        else if (middleware) body = middleware(req, res, body);
    }
    return body;
}

function prepareBody(req, url) {
    let body = '';
    switch (req.method) {
        case 'GET': default:
            body = url.query || {};
            break;
    }
    return body;
}

const Piper = function(req, res) {
    const parsedUrl = url.parse(req.url, true);
    let body = prepareBody(req, parsedUrl);
    body = doRouting(parsedUrl, req, res, body);
    if (body.status === 'PiperError') {
        res.statusCode = body.code;
        delete body.code;
    }
    res.end(JSON.stringify(body));
};

Piper.pipe = function(route, fn, config) {
    router[route] = fn;
    rules[route] = config || {};
};

module.exports = Piper;