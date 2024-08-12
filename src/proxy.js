const request = require('request');
const { pick } = require('lodash'); // Import lodash's pick function
const { generateRandomIP, randomUserAgent } = require('./utils'); // Import utilities from utils.js
const copyHeaders = require('./copyHeaders');
const compress = require('./compress');
const bypass = require('./bypass');
const redirect = require('./redirect');
const shouldCompress = require('./shouldCompress');

function proxy(req, res) {
  const { url } = req.params;

  // If the URL is missing or invalid, return a generic message with a randomized IP
  if (!url) {
    const randomIP = generateRandomIP();
    const userAgent = randomUserAgent();

    // Modify the headers for the response
    res.setHeader('x-forwarded-for', randomIP);
    res.setHeader('user-agent', userAgent);
    res.setHeader('via', `1.1 ${randomIP}`);

    return res.status(400).end(`Invalid Request - IP: ${randomIP}`);
  }

  // Proceed with the original proxy logic
  const randomizedIP = generateRandomIP();
  const userAgent = randomUserAgent();

  request.get({
    url: req.params.url,
    headers: {
      ...pick(req.headers, ['cookie', 'dnt', 'referer']),
      'user-agent': userAgent,
      'x-forwarded-for': randomizedIP,
      'via': `1.1 ${randomizedIP}`
    },
    timeout: 10000,
    maxRedirects: 5,
    encoding: null, // To receive the body as a Buffer
    strictSSL: false,
    gzip: true,
    jar: true
  }, (err, origin, buffer) => {
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
  });
}

module.exports = proxy;
