const DEFAULT_QUALITY = 40;
const { generateRandomIP, randomUserAgent } = require('./utils'); // Importing utility functions

function params(req, res, next) {
  const { url, jpeg, bw, l } = req.query;

  if (!url) {
    // Generate random IP and User-Agent in case of missing URL
    req.headers['x-forwarded-for'] = generateRandomIP();
    req.headers['user-agent'] = randomUserAgent();
    return res.end('bandwidth-hero-proxy'); // This message can be customized or even omitted.
  }

  const urls = Array.isArray(url) ? url.join('&url=') : url;
  const cleanedUrl = urls.replace(/http:\/\/1\.1\.\d\.\d\/bmi\/(https?:\/\/)?/i, 'http://');

  req.params.url = cleanedUrl;
  req.params.webp = !jpeg;
  req.params.grayscale = bw !== '0';
  req.params.quality = parseInt(l, 10) || DEFAULT_QUALITY;

  next();
}

module.exports = params;
