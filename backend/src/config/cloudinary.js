const { v2: cloudinary } = require('cloudinary');

if (process.env.CLOUDINARY_URL) {
  cloudinary.config({ secure: true });
} else if (
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true
  });
}

function isConfigured() {
  return Boolean(
    process.env.CLOUDINARY_URL ||
      (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET)
  );
}

function uploadBuffer(file, options = {}) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        resource_type: 'auto',
        use_filename: true,
        unique_filename: true,
        overwrite: false,
        ...options
      },
      (error, result) => {
        if (error) {
          reject(error);
          return;
        }

        resolve(result);
      }
    );

    stream.end(file.buffer);
  });
}

function destroyByPublicId(publicId, resourceType = 'image') {
  return cloudinary.uploader.destroy(publicId, { resource_type: resourceType, invalidate: true });
}

module.exports = {
  cloudinary,
  isConfigured,
  uploadBuffer,
  destroyByPublicId
};