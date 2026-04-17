import { v2 as cloudinary } from 'cloudinary';

const hasUrl = !!process.env.CLOUDINARY_URL;
const hasIndividual = !!(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET);

if (!hasUrl && !hasIndividual) {
  throw new Error('Cloudinary configuration is missing. Please set CLOUDINARY_URL or individual credentials (NAME, KEY, SECRET) in your environment variables.');
}

cloudinary.config({
  ...(hasUrl ? {} : {
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  }),
  secure: true,
});

export default cloudinary;