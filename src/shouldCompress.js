const MIN_COMPRESS_LENGTH = 1024;

function shouldCompress(req) {
  const { originType, originSize, webp } = req.params;

  if (!originType.startsWith('image')) {
    return false;
  }
  if (originSize === 0) {
    return false;
  }
  if (webp && originSize < MIN_COMPRESS_LENGTH) {
    return false;
  }
  if (
    originType.endsWith('png') ||
    (originType.endsWith('gif') && originSize < MIN_TRANSPARENT_COMPRESS_LENGTH)
  ) {
    return shouldCompressSmallImage(req);
  }

  return true;
}

function shouldCompressSmallImage(req) {
  const { originType, originSize } = req.params;

  if (originType.endsWith('gif') && originSize < 10240) {
    return true;
  }
  if (originType.endsWith('png') && originSize < 20480) {
    return true;
  }

  return false;
}

module.exports = shouldCompress;
