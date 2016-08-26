const http = require('http');

module.exports = {

    get: function(options) {
        return new Promise((resolve, reject) => {
            let req = http.get(options, (res) => {
                var body = '';
                res.on('data', (chunk) => body += chunk);
                res.on('end', function() {
                    res.body = body;
                    resolve(res);
                });
            });
            req.on('error', reject);
        });
    }
};