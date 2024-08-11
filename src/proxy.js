const axios = require('axios');
const pick = require('lodash').pick;
const shouldCompress = require('./shouldCompress');
const redirect = require('./redirect');
const compress = require('./compress');
const bypass = require('./bypass');
const copyHeaders = require('./copyHeaders');

// List of common user agents and headers
const userAgents = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36',
    // Add more user agents
];

const viaHeaders = [
    '1.1 proxy1',
    '1.1 proxy2',
    '1.0 gateway',
    '1.1 load-balancer'
];

// Function to generate a random IP address
function generateRandomIP() {
    return `${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}`;
}

async function proxy(req, res) {
    const randomUserAgent = userAgents[Math.floor(Math.random() * userAgents.length)];
    const randomIP = generateRandomIP();
    const randomVia = viaHeaders[Math.floor(Math.random() * viaHeaders.length)];

    
        const response = await axios.get(req.params.url, {
            headers: {
                ...pick(req.headers, ['cookie', 'dnt', 'referer']),
                'user-agent': randomUserAgent,
                'x-forwarded-for': randomIP,
                'x-real-ip': randomIP,
                'via': randomVia
            },
            timeout: 10000,
            responseType: 'arraybuffer',
            maxRedirects: 5,
            validateStatus: status => status < 500 // Reject if the status code is greater than or equal to 500
        });

        copyHeaders(response.headers, res);
        res.setHeader('content-encoding', 'identity');
        req.params.originType = response.headers['content-type'] || '';
        req.params.originSize = response.data.length;

        if (shouldCompress(req)) {
            compress(req, res, response.data);
        } else {
            bypass(req, res, response.data);
        }
    
}

module.exports = proxy;
