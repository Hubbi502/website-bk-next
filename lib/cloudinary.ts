import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default cloudinary;

/**
 * Extract Cloudinary public_id from a Cloudinary URL.
 * Example: https://res.cloudinary.com/xxx/image/upload/v123/website-bk/articles/abc.jpg
 * Returns: website-bk/articles/abc
 */
export function getPublicIdFromUrl(url: string): string | null {
  try {
    // Only process Cloudinary URLs
    if (!url.includes("res.cloudinary.com")) {
      return null;
    }
    // Match pattern: /upload/v{number}/{public_id}.{ext}
    const match = url.match(/\/upload\/v\d+\/(.+)\.\w+$/);
    return match ? match[1] : null;
  } catch {
    return null;
  }
}
