const request = require('request');
const { pick } = require('lodash'); // Import pick from lodash
const { generateRandomIP, randomUserAgent } = require('./utils'); 
const copyHeaders = require('./copyHeaders');
const compress = require('./compress');
const bypass = require('./bypass');
const redirect = require('./redirect');
const shouldCompress = require('./shouldCompress');


// Array of predefined Via header values
const viaOptions = [
    '1.1 my-proxy-service.com (MyProxy/1.0)',
    '1.0 my-other-proxy.net (AnotherProxy/2.0)',
    '1.1 custom-proxy-system.org (CustomProxy/3.1)',
    '1.1 some-other-proxy.com (DynamicProxy/4.0)',
];

// Function to get a random Via header
function getRandomViaHeader() {
    const randomIndex = Math.floor(Math.random() * viaOptions.length);
    return viaOptions[randomIndex];
}

// Random delay function (500 to 1000 ms)
function getRandomDelay() {
    return Math.floor(Math.random() * 501) + 500; // Delay between 500-1000 ms
}

// Proxy handler function
function proxy(req, res) {
    const { url, jpeg, bw, l } = req.query;

    if (!url) {
        const randomIP = generateRandomIP();
        const userAgent = randomUserAgent();
        const headers = {
            ...pick(req.headers, ['cookie', 'dnt', 'referer']),
            'x-forwarded-for': randomIP,
            'user-agent': userAgent,
            'via': getRandomViaHeader(),
            'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'accept-encoding': 'gzip, deflate, br',
            'accept-language': 'en-US,en;q=0.5',
        };

        Object.keys(headers).forEach(key => res.setHeader(key, headers[key]));
        return res.status(400).end('Invalid Request');
    }

    // Process the URL with a random delay
    const urls = Array.isArray(url) ? url.join('&url=') : url;
    const cleanedUrl = urls.replace(/http:\/\/1\.1\.\d\.\d\/bmi\/(https?:\/\/)?/i, 'http://');

    // Add random query parameter noise
    const noiseQuery = `&_=${Date.now() + Math.floor(Math.random() * 100000)}`;
    const finalUrl = cleanedUrl + noiseQuery;

    req.params.url = finalUrl;
    req.params.webp = !jpeg;
    req.params.grayscale = bw !== '0';
    req.params.quality = parseInt(l, 10) || 40;

    const randomizedIP = generateRandomIP();
    const userAgent = randomUserAgent();

    // Set up the request with noise and a random delay
    setTimeout(() => {
        request.get({
            url: req.params.url,
            headers: {
                ...pick(req.headers, ['cookie', 'dnt', 'referer']),
                'user-agent': userAgent,
                'x-forwarded-for': randomizedIP,
                'via': getRandomViaHeader(),
                'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                'accept-encoding': 'gzip, deflate, br',
                'accept-language': 'en-US,en;q=0.5',
            },
            timeout: 3000,
            maxRedirects: 1,
            encoding: null,
            strictSSL: true,
            gzip: true,
            jar: true,
        }, (err, origin, buffer) => {
            if (err || origin.statusCode >= 400) {
                return redirect(req, res);
            }

            copyHeaders(origin, res);
            res.setHeader('content-encoding', 'identity');
            req.params.originType = origin.headers['content-type'] || '';
            req.params.originSize = buffer.length;

            // Randomly add noise to the response (e.g., add a comment or log entry)
            const noiseResponse = Buffer.concat([
                Buffer.from(`<!-- Random noise added by the proxy -->\n`),
                buffer
            ]);

            if (shouldCompress(req)) {
                compress(req, res, noiseResponse);
            } else {
                bypass(req, res, noiseResponse);
            }
        });
    }, getRandomDelay()); // Now using the 500 to 1000 ms delay
}

module.exports = proxy;
