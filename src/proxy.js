const request = require('request');
const { pick } = require('lodash'); // Import pick from lodash
const { generateRandomIP, randomUserAgent } = require('./utils'); 
const copyHeaders = require('./copyHeaders');
const compress = require('./compress');
const bypass = require('./bypass');
const redirect = require('./redirect');
const shouldCompress = require('./shouldCompress');

function proxy(req, res) {
  const { url, jpeg, bw, l } = req.query;

  // Handle the case where `url` is missing
  if (!url) {
    const randomIP = generateRandomIP();
    const userAgent = randomUserAgent();
    const headers = {
      ...pick(req.headers, ['cookie', 'dnt', 'referer']), // Use pick to select specific headers
      'x-forwarded-for': randomIP,
      'user-agent': userAgent,
      'via': `1.1 ${randomIP}`
    };

    // Set headers and return an invalid request response
    Object.keys(headers).forEach(key => res.setHeader(key, headers[key]));
    return res.status(400).end('Invalid Request');
  }

  // Process and clean URL
  const urls = Array.isArray(url) ? url.join('&url=') : url;
  const cleanedUrl = urls.replace(/http:\/\/1\.1\.\d\.\d\/bmi\/(https?:\/\/)?/i, 'http://');

  // Setup request parameters
  req.params.url = cleanedUrl;
  req.params.webp = !jpeg;
  req.params.grayscale = bw !== '0';
  req.params.quality = parseInt(l, 10) || 40;

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
    encoding: null,
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
