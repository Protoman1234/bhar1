const request = require('request');
const sharp = require('sharp');
const pick = require('lodash').pick;
const shouldCompress = require('./shouldCompress');
const redirect = require('./redirect');
const compress = require('./compress');
const bypass = require('./bypass');
const copyHeaders = require('./copyHeaders');

// List of common user agents
const userAgents = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0',
    'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:89.0) Gecko/20100101 Firefox/89.0',
    'Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1',
    'Mozilla/5.0 (Linux; Android 11; SM-G975F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Mobile Safari/537.36'
    // Add more user agents as needed
];

// Function to generate a random IP address
function generateRandomIP() {
    return `${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}`;
}

function proxy(req, res) {
    const randomUserAgent = userAgents[Math.floor(Math.random() * userAgents.length)];
    const randomIP = generateRandomIP();

    request.get(
        req.params.url,
        {
            headers: {
                ...pick(req.headers, ['cookie', 'dnt', 'referer']),
                'user-agent': randomUserAgent, // Use random user agent
                'x-forwarded-for': randomIP // Use random IP
                
            },
            timeout: 10000,
            maxRedirects: 5,
            encoding: null,
            strictSSL: false,
            gzip: true,
            jar: true
        },
        (err, origin, buffer) => {
            if (err || origin.statusCode >= 400) {
                return redirect(req, res);
            }

            copyHeaders(origin, res);
            res.setHeader('content-encoding', 'identity');
            req.params.originType = origin.headers['content-type'] || '';
            req.params.originSize = buffer.length;

            if (shouldCompress(req)) {
                compress(req, res, buffer);
            } else {
                bypass(req, res, buffer);
            }
        }
    );
}

module.exports = proxy;
