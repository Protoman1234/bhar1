const MIN_COMPRESS_LENGTH = 1024;
const MIN_TRANSPARENT_COMPRESS_LENGTH = MIN_COMPRESS_LENGTH * 2;

function shouldCompress(req) {
  const contentType = req.headers['content-type'] || '';
  const contentLength = parseInt(req.headers['content-length'], 10) || 0;
  const isImage = contentType.startsWith('image/');
  const isTransparentWebP = isImage && contentType.endsWith('webp') && req.params.webp && !req.params.grayscale;

  if (isTransparentWebP && contentLength >= MIN_TRANSPARENT_COMPRESS_LENGTH) {
    return true;
  }

  if (isImage && contentLength >= MIN_COMPRESS_LENGTH) {
    return true;
  }

  return false;
}

module.exports = shouldCompress;
