// apps/api/src/config/cloudinary.js

import { v2 as cloudinary } from 'cloudinary';

const cloudinaryConfig = {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
};

// Validate that all required credentials are present
const missingKeys = Object.entries(cloudinaryConfig)
  .filter(([, value]) => !value)
  .map(([key]) => key);

if (missingKeys.length > 0) {
  console.error(
    `Cloudinary configuration missing required keys: ${missingKeys.join(', ')}. ` +
    'Image uploads will fail until these are configured.'
  );
}

cloudinary.config(cloudinaryConfig);

export default cloudinary;