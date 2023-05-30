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
    return shouldCompressSmallImage(req); // Call a separate function to handle small images
  }

  return true; // Compress other image formats by default
}

function shouldCompressSmallImage(req) {
  const { originType, originSize } = req.params;

  // Determine your criteria for compressing small images
  // Example: Compress GIFs with size less than 10KB
  if (originType.endsWith('gif') && originSize < 10240) {
    return true;
  }

  // Example: Compress transparent PNGs with size less than 20KB
  if (originType.endsWith('png') && originSize < 20480) {
    return true;
  }

  return false; // Do not compress if criteria are not met
}

module.exports = shouldCompress;
