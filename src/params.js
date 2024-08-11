const { generateRandomIP } = require('./utils'); // Adjust the path as necessary
const DEFAULT_QUALITY = 40;

function params(req, res, next) {
  const { url, jpeg, bw, l } = req.query;

/*  if (!url) {
    // Randomize IP and send a generic message to avoid detection.
    req.params.randomIP = generateRandomIP();
    return res.end(`Image Compression Service - IP: ${req.params.randomIP}`);
  }*/

  const urls = Array.isArray(url) ? url.join('&url=') : url;
  const cleanedUrl = urls.replace(/http:\/\/1\.1\.\d\.\d\/bmi\/(https?:\/\/)?/i, 'http://');

  req.params.url = cleanedUrl;
  req.params.webp = !jpeg;
  req.params.grayscale = bw !== '0';
  req.params.quality = parseInt(l, 10) || DEFAULT_QUALITY;

  next();
}

module.exports = params;
