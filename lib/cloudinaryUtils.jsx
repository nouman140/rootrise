import { CldImage } from "next-cloudinary";

/**
 * CloudinaryImage component for optimized image display
 * @param {string} publicId - Cloudinary public ID or full URL
 * @param {string} alt - Alt text for accessibility
 * @param {object} options - Additional options (width, height, crop, gravity, etc.)
 */
export function CloudinaryImage({
  publicId,
  alt,
  width = 500,
  height = 500,
  crop = "fill",
  gravity = "auto",
  quality = "auto",
  fetch_format = "auto",
  className = "",
  ...props
}) {
  // If it's a full URL, extract the public ID
  let id = publicId;
  if (publicId?.includes("/")) {
    // Extract public ID from URL like: https://res.cloudinary.com/cloud/image/upload/v123/folder/id
    id = publicId.split("/upload/")[1]?.split("?")[0] || publicId;
  }

  return (
    <CldImage
      src={id}
      alt={alt}
      width={width}
      height={height}
      crop={crop}
      gravity={gravity}
      quality={quality}
      fetchFormat={fetch_format}
      className={className}
      {...props}
    />
  );
}

/**
 * Get optimized Cloudinary URL
 * @param {string} publicId - Cloudinary public ID
 * @param {number} width - Image width
 * @param {number} height - Image height
 * @param {string} crop - Crop mode
 */
export function getCloudinaryUrl(
  publicId,
  {
    width = 500,
    height = 500,
    sizes = "10",
    crop = "fill",
    quality = "auto",
  } = {},
) {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

  if (!publicId || !cloudName) return null;

  // If it's already a full URL, return it as is
  if (publicId.startsWith("http")) {
    return publicId;
  }

  return `https://res.cloudinary.com/${cloudName}/image/upload/w_${width},h_${height},c_${crop},q_${quality}/${publicId}`;
}
