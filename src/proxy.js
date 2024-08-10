const request = require('request');
const pick = require('lodash').pick;
const shouldCompress = require('./shouldCompress');
const redirect = require('./redirect');
const compress = require('./compress');
const bypass = require('./bypass');
const copyHeaders = require('./copyHeaders');

// Function to introduce a delay
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Pool of IP addresses for rotation
const ipPool = [
  '203.0.113.195', // Example IP 1
  '198.51.100.23',  // Example IP 2
  '192.0.2.44',     // Example IP 3
  // Add more IPs as needed
];

async function proxy(req, res) {
  const userAgentPool = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:74.0) Gecko/20100101 Firefox/74.0',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.103 Safari/537.36',
    'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15A372 Safari/604.1'
  ];

  const randomUserAgent = userAgentPool[Math.floor(Math.random() * userAgentPool.length)];
  const randomIp = ipPool[Math.floor(Math.random() * ipPool.length)];

  await delay(Math.floor(Math.random() * 500) + 500); // Random delay between 500ms and 1s

  request.get(
    req.params.url,
    {
      headers: {
        ...pick(req.headers, ['cookie', 'dnt', 'referer']),
        'user-agent': req.headers['user-agent'] || randomUserAgent,
        'x-forwarded-for': randomIp, // Rotate IP addresses
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
        console.log(`Request failed: ${err ? err.message : 'Status code ' + origin.statusCode}`);
        return redirect(req, res);
      }

      console.log('Response headers:', origin.headers);
      console.log('Response status code:', origin.statusCode);

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
